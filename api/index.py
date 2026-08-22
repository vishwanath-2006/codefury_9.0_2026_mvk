import os
import pyotp
import httpx
import json
import asyncio
import time
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Any

# Safe SmartConnect import fallback
try:
    from SmartApi import SmartConnect
except Exception:
    SmartConnect = None

app = FastAPI(
    title="Angel One SmartAPI Integration",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

# Enable CORS for local development testing and production web client
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Server-side Session Cache with Concurrency Lock
AUTH_LOCK = asyncio.Lock()
SESSION_CACHE = {
    "jwt_token": None,
    "expires_at": 0
}

@app.get("/api/health")
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "FinLabs Angel One Gateway",
        "has_smartapi_sdk": SmartConnect is not None,
        "has_env_creds": bool(os.getenv('ANGELONE_API_KEY') and os.getenv('ANGELONE_CLIENT_ID')),
        "has_cached_session": bool(SESSION_CACHE["jwt_token"] and time.time() < SESSION_CACHE["expires_at"])
    }

class SyncCredentials(BaseModel):
    apiKey: Optional[str] = None
    clientId: Optional[str] = None
    pin: Optional[str] = None
    totpSecret: Optional[str] = None
    demo: Optional[bool] = False

class QuoteRequest(BaseModel):
    symbol: str
    apiKey: Optional[str] = None
    clientId: Optional[str] = None
    pin: Optional[str] = None
    totpSecret: Optional[str] = None
    demo: Optional[bool] = False

class HistoricalCandleRequest(BaseModel):
    symbol: str
    interval: Optional[str] = "ONE_DAY"
    fromDate: Optional[str] = None
    toDate: Optional[str] = None
    apiKey: Optional[str] = None
    clientId: Optional[str] = None
    pin: Optional[str] = None
    totpSecret: Optional[str] = None
    demo: Optional[bool] = False

class TokenSyncRequest(BaseModel):
    auth_token: str
    apiKey: Optional[str] = None
    demo: Optional[bool] = False

# Verified NSE Instrument Tokens
NSE_TOKENS = {
    "TCS": "11536",
    "INFY": "1594",
    "RELIANCE": "2885",
    "HDFCBANK": "1333",
    "TATAMOTORS": "3456",
    "ITC": "1660",
    "SBIN": "3045",
    "ICICIBANK": "4963",
    "BHARTIARTL": "10604",
    "KOTAKBANK": "1922",
    "LT": "11483"
}

# Mock holdings fallback for demo purposes
MOCK_HOLDINGS = [
    {
        "symbol": "TCS",
        "quantity": 15,
        "averagePrice": 3850.50,
        "ltp": 4120.25,
        "investedValue": 57757.50,
        "currentValue": 61803.75,
        "pnl": 4046.25,
        "pnlPercentage": 7.01
    },
    {
        "symbol": "RELIANCE",
        "quantity": 25,
        "averagePrice": 2420.00,
        "ltp": 2580.40,
        "investedValue": 60500.00,
        "currentValue": 64510.00,
        "pnl": 4010.00,
        "pnlPercentage": 6.63
    },
    {
        "symbol": "INFY",
        "quantity": 40,
        "averagePrice": 1650.00,
        "ltp": 1590.80,
        "investedValue": 66000.00,
        "currentValue": 63632.00,
        "pnl": -2368.00,
        "pnlPercentage": -3.59
    },
    {
        "symbol": "HDFCBANK",
        "quantity": 50,
        "averagePrice": 1520.10,
        "ltp": 1610.50,
        "investedValue": 76005.00,
        "currentValue": 80525.00,
        "pnl": 4520.00,
        "pnlPercentage": 5.95
    }
]

def get_credentials(creds: Any = None):
    api_key = getattr(creds, 'apiKey', None)
    client_id = getattr(creds, 'clientId', None)
    pin = getattr(creds, 'pin', None)
    totp_secret = getattr(creds, 'totpSecret', None)

    # Fallback to environment variables
    if not api_key:
        api_key = os.getenv('ANGELONE_API_KEY')
    if not client_id:
        client_id = os.getenv('ANGELONE_CLIENT_ID')
    if not pin:
        pin = os.getenv('ANGELONE_PIN')
    if not totp_secret:
        totp_secret = os.getenv('ANGELONE_TOTP_SECRET')

    return api_key, client_id, pin, totp_secret

async def authenticate_smartapi_rest(api_key: str, client_id: str, pin: str, totp_secret: str):
    """
    Direct REST API authentication for Angel One SmartAPI over HTTP.
    """
    totp_token = pyotp.TOTP(totp_secret).now()
    url = "https://apiconnect.angelbroking.com/rest/auth/angelbroking/user/v1/loginByPassword"
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-UserType": "USER",
        "X-SourceID": "WEB",
        "X-ClientLocalIP": "127.0.0.1",
        "X-ClientPublicIP": "127.0.0.1",
        "X-MACAddress": "fe80::1",
        "X-PrivateKey": api_key
    }
    payload = {
        "clientcode": client_id,
        "password": pin,
        "totp": totp_token
    }

    async with httpx.AsyncClient(timeout=12.0) as client:
        res = await client.post(url, json=payload, headers=headers)
        if res.status_code != 200:
            return None, f"HTTP {res.status_code}: {res.text}"
        data = res.json()
        if not data.get("status"):
            return None, data.get("message", "Login rejected by SmartAPI")
        jwt_token = data.get("data", {}).get("jwtToken")
        return jwt_token, None

async def get_or_create_jwt_token(api_key: str, client_id: str, pin: str, totp_secret: str):
    """
    Retrieves cached session token or performs single concurrent login.
    Prevents concurrent login rate-limits when multi-asset queries are fired in parallel.
    """
    now_ts = time.time()
    if SESSION_CACHE["jwt_token"] and now_ts < SESSION_CACHE["expires_at"]:
        return SESSION_CACHE["jwt_token"], None

    async with AUTH_LOCK:
        now_ts = time.time()
        if SESSION_CACHE["jwt_token"] and now_ts < SESSION_CACHE["expires_at"]:
            return SESSION_CACHE["jwt_token"], None

        token, err = await authenticate_smartapi_rest(api_key, client_id, pin, totp_secret)
        if token:
            SESSION_CACHE["jwt_token"] = token
            SESSION_CACHE["expires_at"] = now_ts + 600  # 10 minute session TTL
            return token, None
        return None, err

@app.post("/api/broker/angelone/historical-candles")
async def get_historical_candles(payload: HistoricalCandleRequest):
    symbol = payload.symbol.upper()
    api_key, client_id, pin, totp_secret = get_credentials(payload)

    if payload.demo or not all([api_key, client_id, pin, totp_secret]):
        return {
            "status": "unavailable",
            "symbol": symbol,
            "source": "no_live_connection",
            "message": "Angel One broker credentials or active session are not configured.",
            "candles": []
        }

    # 1. Resolve token
    symbol_token = NSE_TOKENS.get(symbol, "11536")

    # 2. Format dates
    now = datetime.now()
    to_str = payload.toDate or now.strftime("%Y-%m-%d 15:30")
    from_str = payload.fromDate or (now - timedelta(days=365)).strftime("%Y-%m-%d 09:15")

    # Strategy A: REST API with Session Cache & Retry
    for attempt in range(2):
        try:
            jwt_token, auth_err = await get_or_create_jwt_token(api_key, client_id, pin, totp_secret)
            if not jwt_token:
                break

            candle_url = "https://apiconnect.angelbroking.com/rest/secure/angelbroking/historical/v1/getCandleData"
            headers = {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "X-UserType": "USER",
                "X-SourceID": "WEB",
                "X-ClientLocalIP": "127.0.0.1",
                "X-ClientPublicIP": "127.0.0.1",
                "X-MACAddress": "fe80::1",
                "X-PrivateKey": api_key,
                "Authorization": f"Bearer {jwt_token}"
            }
            candle_payload = {
                "exchange": "NSE",
                "symboltoken": str(symbol_token),
                "interval": payload.interval or "ONE_DAY",
                "fromdate": from_str,
                "todate": to_str
            }

            async with httpx.AsyncClient(timeout=15.0) as client:
                c_res = await client.post(candle_url, json=candle_payload, headers=headers)
                if c_res.status_code == 401 or (c_res.status_code == 200 and "Invalid Token" in c_res.text):
                    # Invalidate session cache and retry once
                    SESSION_CACHE["jwt_token"] = None
                    continue

                if c_res.status_code == 200:
                    c_data = c_res.json()
                    status_val = c_data.get("status")
                    is_ok = (status_val is True) or (isinstance(status_val, str) and status_val.lower() in ["true", "success"])
                    if is_ok and isinstance(c_data.get("data"), list):
                        raw_data = c_data.get("data", [])
                        candles = []
                        for c in raw_data:
                            if isinstance(c, (list, tuple)) and len(c) >= 5:
                                raw_ts = str(c[0])
                                date_str = raw_ts.split("T")[0] if "T" in raw_ts else raw_ts.split(" ")[0]
                                close_price = float(c[4])
                                candles.append({
                                    "date": date_str,
                                    "timestamp": raw_ts,
                                    "open": float(c[1]),
                                    "high": float(c[2]),
                                    "low": float(c[3]),
                                    "close": close_price,
                                    "price": close_price,
                                    "volume": int(c[5]) if len(c) > 5 else 0
                                })
                        return {
                            "status": "success",
                            "symbol": symbol,
                            "source": "live_angelone",
                            "candles": candles
                        }
        except Exception:
            pass

    # Strategy B: Fallback to SmartConnect SDK if available
    if SmartConnect is not None:
        try:
            totp_token = pyotp.TOTP(totp_secret).now()
            smart_api = SmartConnect(api_key=api_key)
            session_data = smart_api.generateSession(client_id, pin, totp_token)

            if session_data.get('status'):
                historic_param = {
                    "exchange": "NSE",
                    "symboltoken": str(symbol_token),
                    "interval": payload.interval or "ONE_DAY",
                    "fromdate": from_str,
                    "todate": to_str
                }
                candle_res = smart_api.getCandleData(historic_param)
                status_val = candle_res.get('status')
                is_ok = (status_val is True) or (isinstance(status_val, str) and status_val.lower() in ['true', 'success'])
                if is_ok and isinstance(candle_res.get('data'), list):
                    raw_data = candle_res.get('data', [])
                    candles = []
                    for c in raw_data:
                        if isinstance(c, (list, tuple)) and len(c) >= 5:
                            raw_ts = str(c[0])
                            date_str = raw_ts.split('T')[0] if 'T' in raw_ts else raw_ts.split(' ')[0]
                            close_price = float(c[4])
                            candles.append({
                                "date": date_str,
                                "timestamp": raw_ts,
                                "open": float(c[1]),
                                "high": float(c[2]),
                                "low": float(c[3]),
                                "close": close_price,
                                "price": close_price,
                                "volume": int(c[5]) if len(c) > 5 else 0
                            })
                    return {
                        "status": "success",
                        "symbol": symbol,
                        "source": "live_angelone",
                        "candles": candles
                    }
        except Exception:
            pass

    return {
        "status": "unavailable",
        "symbol": symbol,
        "source": "live_angelone_error",
        "message": "Unable to retrieve real candles from SmartAPI with current credentials.",
        "candles": []
    }

@app.get("/api/broker/angelone/historical-candles")
async def get_historical_candles_get(
    symbol: str,
    interval: Optional[str] = "ONE_DAY",
    fromDate: Optional[str] = None,
    toDate: Optional[str] = None,
    demo: Optional[bool] = False,
    apiKey: Optional[str] = None,
    clientId: Optional[str] = None,
    pin: Optional[str] = None,
    totpSecret: Optional[str] = None
):
    req = HistoricalCandleRequest(
        symbol=symbol,
        interval=interval,
        fromDate=fromDate,
        toDate=toDate,
        apiKey=apiKey,
        clientId=clientId,
        pin=pin,
        totpSecret=totpSecret,
        demo=demo
    )
    return await get_historical_candles(req)

@app.post("/api/broker/angelone/stock-quote")
async def get_stock_quote(payload: QuoteRequest):
    symbol = payload.symbol.upper()
    api_key, client_id, pin, totp_secret = get_credentials(payload)

    mock_dict = {h["symbol"]: h["ltp"] for h in MOCK_HOLDINGS}
    base_price = mock_dict.get(symbol, 1500.0)

    if payload.demo or not all([api_key, client_id, pin, totp_secret]):
        return {
            "symbol": symbol,
            "tradingSymbol": f"{symbol}-EQ",
            "ltp": round(base_price, 2),
            "status": "success",
            "source": "benchmark_reference"
        }

    try:
        jwt_token, _ = await get_or_create_jwt_token(api_key, client_id, pin, totp_secret)
        if jwt_token:
            symbol_token = NSE_TOKENS.get(symbol, "11536")
            quote_url = "https://apiconnect.angelbroking.com/rest/secure/angelbroking/market/v1/quote/"
            headers = {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "X-UserType": "USER",
                "X-SourceID": "WEB",
                "X-ClientLocalIP": "127.0.0.1",
                "X-ClientPublicIP": "127.0.0.1",
                "X-MACAddress": "fe80::1",
                "X-PrivateKey": api_key,
                "Authorization": f"Bearer {jwt_token}"
            }
            quote_payload = {
                "mode": "LTP",
                "exchangeTokens": {
                    "NSE": [str(symbol_token)]
                }
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                q_res = await client.post(quote_url, json=quote_payload, headers=headers)
                if q_res.status_code == 200:
                    q_data = q_res.json()
                    fetched_data = q_data.get("data", {}).get("fetched", [])
                    if fetched_data:
                        ltp = float(fetched_data[0].get("ltp", base_price))
                        return {
                            "symbol": symbol,
                            "tradingSymbol": f"{symbol}-EQ",
                            "ltp": round(ltp, 2),
                            "status": "success",
                            "source": "live_angelone"
                        }
    except Exception:
        pass

    return {
        "symbol": symbol,
        "tradingSymbol": f"{symbol}-EQ",
        "ltp": round(base_price, 2),
        "status": "success",
        "source": "benchmark_reference"
    }

@app.get("/api/broker/angelone/stock-quote")
async def get_stock_quote_get(
    symbol: str,
    demo: Optional[bool] = False,
    apiKey: Optional[str] = None,
    clientId: Optional[str] = None,
    pin: Optional[str] = None,
    totpSecret: Optional[str] = None
):
    req = QuoteRequest(symbol=symbol, apiKey=apiKey, clientId=clientId, pin=pin, totpSecret=totpSecret, demo=demo)
    return await get_stock_quote(req)

@app.post("/api/broker/angelone/sync")
async def sync_holdings(payload: Optional[SyncCredentials] = None):
    payload = payload or SyncCredentials()
    api_key, client_id, pin, totp_secret = get_credentials(payload)

    if payload.demo or not all([api_key, client_id, pin, totp_secret]):
        return {
            "status": "success",
            "source": "mock_demo",
            "holdings": MOCK_HOLDINGS
        }

    try:
        jwt_token, _ = await get_or_create_jwt_token(api_key, client_id, pin, totp_secret)
        if jwt_token:
            holding_url = "https://apiconnect.angelbroking.com/rest/secure/angelbroking/portfolio/v1/getHolding"
            headers = {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "X-UserType": "USER",
                "X-SourceID": "WEB",
                "X-ClientLocalIP": "127.0.0.1",
                "X-ClientPublicIP": "127.0.0.1",
                "X-MACAddress": "fe80::1",
                "X-PrivateKey": api_key,
                "Authorization": f"Bearer {jwt_token}"
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                h_res = await client.get(holding_url, headers=headers)
                if h_res.status_code == 200:
                    h_data = h_res.json()
                    raw_holdings = h_data.get("data", [])
                    processed = []
                    for stock in raw_holdings:
                        raw_symbol = stock.get("tradingsymbol", "UNKNOWN")
                        symbol = raw_symbol.split("-")[0]
                        quantity = float(stock.get("quantity", 0))
                        average_price = float(stock.get("averageprice", 0))
                        ltp = float(stock.get("ltp", 0))
                        invested_value = quantity * average_price
                        current_value = quantity * ltp
                        pnl = current_value - invested_value
                        pnl_pct = (pnl / invested_value * 100) if invested_value > 0 else 0.0
                        processed.append({
                            "symbol": symbol,
                            "quantity": quantity,
                            "averagePrice": round(average_price, 2),
                            "ltp": round(ltp, 2),
                            "investedValue": round(invested_value, 2),
                            "currentValue": round(current_value, 2),
                            "pnl": round(pnl, 2),
                            "pnlPercentage": round(pnl_pct, 2)
                        })
                    return {
                        "status": "success",
                        "source": "live_angelone",
                        "holdings": processed
                    }
    except Exception:
        pass

    return {
        "status": "success",
        "source": "mock_demo",
        "holdings": MOCK_HOLDINGS
    }

@app.get("/api/broker/angelone/sync")
async def sync_holdings_get(
    demo: Optional[bool] = False,
    apiKey: Optional[str] = None,
    clientId: Optional[str] = None,
    pin: Optional[str] = None,
    totpSecret: Optional[str] = None
):
    creds = SyncCredentials(apiKey=apiKey, clientId=clientId, pin=pin, totpSecret=totpSecret, demo=demo)
    return await sync_holdings(creds)

@app.post("/api/broker/angelone/holdings-by-token")
def get_holdings_by_token(payload: TokenSyncRequest):
    auth_token = payload.auth_token

    if payload.demo or auth_token == "demo":
        return {
            "status": "success",
            "source": "mock_demo",
            "holdings": MOCK_HOLDINGS
        }

    api_key = payload.apiKey or os.getenv('ANGELONE_API_KEY')

    import requests
    try:
        url = "https://apiconnect.angelbroking.com/rest/secure/angelbroking/portfolio/v1/getHolding"
        headers = {
            "Authorization": f"Bearer {auth_token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "X-UserType": "USER",
            "X-SourceID": "WEB",
            "X-ClientLocalIP": "127.0.0.1",
            "X-ClientPublicIP": "127.0.0.1",
            "X-MACAddress": "fe80::1",
            "X-PrivateKey": api_key
        }

        resp = requests.get(url, headers=headers, timeout=10)
        data = resp.json()

        if data.get('status'):
            holdings = data.get('data', [])
            processed = []
            for h in holdings:
                raw_sym = h.get('tradingsymbol', 'UNKNOWN')
                sym = raw_sym.split('-')[0]
                qty = float(h.get('quantity', 0))
                avg_price = float(h.get('averageprice', 0))
                ltp = float(h.get('ltp', 0))
                inv_val = qty * avg_price
                curr_val = qty * ltp
                pnl = curr_val - inv_val
                pnl_pct = (pnl / inv_val * 100) if inv_val > 0 else 0.0

                processed.append({
                    "symbol": sym,
                    "quantity": qty,
                    "averagePrice": round(avg_price, 2),
                    "ltp": round(ltp, 2),
                    "investedValue": round(inv_val, 2),
                    "currentValue": round(curr_val, 2),
                    "pnl": round(pnl, 2),
                    "pnlPercentage": round(pnl_pct, 2)
                })

            return {
                "status": "success",
                "source": "live_angelone",
                "holdings": processed
            }
        else:
            return {
                "status": "error",
                "message": data.get('message', 'Failed to retrieve holdings'),
                "holdings": []
            }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "holdings": []
        }

# ==========================================
# FINLABS AI COPILOT ENDPOINT
# ==========================================

class AiChatRequest(BaseModel):
    query: str
    conversationHistory: Optional[List[dict]] = None
    context: Optional[dict] = None

def generate_finlabs_ai_response(query: str, context: Optional[dict] = None, history: Optional[List[dict]] = None) -> str:
    import re
    ctx = context or {}
    q = query.lower().strip()
    name = (ctx.get("fullName") or "there").split()[0]
    monthly_income = float(ctx.get("monthlyIncome") or 0)
    total_expenses = float(ctx.get("totalExpenses") or 0)
    monthly_debt = float(ctx.get("monthlyDebtPayments") or 0)
    monthly_surplus = float(ctx.get("monthlySurplus") or max(0, monthly_income - total_expenses - monthly_debt))
    savings_rate = ctx.get("savingsRatePct") or (round((monthly_surplus / monthly_income) * 100) if monthly_income > 0 else 0)
    health_score = ctx.get("overallHealthScore") or 74
    prev_invest_amt = float(ctx.get("previousInvestmentAmount") or 0)
    prev_platforms = ctx.get("previousInvestmentPlatforms") or []
    risk_tolerance = ctx.get("riskTolerance") or "Moderate"
    time_horizon = ctx.get("timeHorizon") or "5–10 years"
    emergency_months = ctx.get("emergencyMonths") or (round(float(ctx.get("emergencyFund") or 0) / total_expenses, 1) if total_expenses > 0 else 0)

    def fmt_inr(val):
        try:
            return f"₹{int(val):,}"
        except Exception:
            return f"₹{val}"

    # 1. Greetings & Identity
    if any(q == greet or q.startswith(greet + " ") or q.startswith(greet + ",") or q.startswith(greet + "!") for greet in ["hello", "hi", "hey", "hola", "namaste", "good morning", "good evening", "who are you", "what is finlabs ai", "what can you do"]):
        return (
            f"Hello {name}! 👋 I am **FinLabs AI**, your personal financial planning and education copilot.\n\n"
            f"I help you understand financial concepts, analyze your cash flows, optimize monthly savings, manage debt, and build structured, long-term investment strategies aligned with your goals.\n\n"
            f"**How can I assist you today?**\n"
            f"- Ask about financial concepts (e.g. *What is a mutual fund?*, *Explain SIP*, *What is an ETF?*)\n"
            f"- Explore investment allocation (e.g. *I have ₹1,00,000 to invest*, *How should I allocate my monthly surplus?*)\n"
            f"- Review your personalized health diagnostics and goal milestones."
        )

    # 2. Concept: Mutual Funds
    if "mutual fund" in q and not ("difference between" in q or "compare" in q or "already invested" in q or "stocks" in q):
        return (
            f"**A Mutual Fund** is an investment vehicle that pools money from multiple investors to invest in a diversified portfolio of stocks, bonds, or money market instruments, professionally managed by an Asset Management Company (AMC).\n\n"
            f"**Core Principles:**\n"
            f"- **Diversification**: Spreads capital across dozens of companies, reducing single-stock default or downturn risk.\n"
            f"- **Professional Management**: Handled by SEBI-registered fund managers who conduct research and portfolio rebalancing.\n"
            f"- **Liquidity**: Open-ended funds allow you to redeem units at the daily Net Asset Value (NAV) on any business day.\n"
            f"- **Accessibility**: You can start investing via Systematic Investment Plans (SIP) with as little as ₹500/month.\n\n"
            f"**Primary Types in India:**\n"
            f"1. **Equity Funds** (Large Cap, Flexi Cap, Mid Cap): Aim for long-term wealth compounding (5+ years).\n"
            f"2. **Debt Funds** (Liquid, Short Duration): Prioritize capital stability and predictable yields.\n"
            f"3. **Hybrid Funds**: Blend equity and debt for balanced growth with controlled volatility."
        )

    # 3. Concept: SIP (Systematic Investment Plan)
    if ("explain sip" in q or "what is sip" in q or "how does sip work" in q) and not ("sip vs" in q or "lump sum" in q):
        return (
            f"**A Systematic Investment Plan (SIP)** is a disciplined method of investing a fixed sum of money into a mutual fund scheme at regular recurring intervals (typically monthly).\n\n"
            f"**Key Benefits:**\n"
            f"- **Rupee Cost Averaging**: You automatically buy more units when market prices/NAVs are lower and fewer units when prices are higher, averaging out purchase cost without needing to time the market.\n"
            f"- **Power of Compounding**: Investing recurring amounts month after month allows compounding to multiply returns exponentially over long horizons.\n"
            f"- **Financial Discipline**: Automates savings directly from your bank account before discretionary spending occurs.\n"
            f"- **Flexibility**: You can start, pause, increase (step-up SIP), or stop whenever your financial circumstances change without penalties."
        )

    # 4. Concept: ETF (Exchange Traded Fund)
    if "etf" in q and not ("already invested" in q):
        return (
            f"**An ETF (Exchange Traded Fund)** is a marketable security that tracks an underlying index, commodity, or basket of assets, but trades directly on stock exchanges (like NSE and BSE) just like an individual stock.\n\n"
            f"**Key Features:**\n"
            f"- **Real-Time Intraday Trading**: Unlike mutual funds which execute orders once a day at closing NAV, ETFs can be bought and sold throughout market trading hours at live market prices.\n"
            f"- **Ultra-Low Expense Ratios**: Because ETFs passively track indices (e.g. Nifty 50 ETF, Gold ETF), their annual management fees are typically between **0.05% and 0.25%**.\n"
            f"- **Transparency**: Portfolio holdings and underlying index compositions are published daily.\n"
            f"- **Requirement**: A Demat and trading account is required to buy and sell ETF units on the exchange."
        )

    # 5. Concept: P/E Ratio
    if "p/e" in q or "pe ratio" in q or "price to earnings" in q:
        return (
            f"**The Price-to-Earnings (P/E) Ratio** is a core valuation metric used to determine whether a stock is overvalued, undervalued, or fairly priced relative to its actual earnings.\n\n"
            f"**Formula:**\n"
            f"$$\\text{{P/E Ratio}} = \\frac{{\\text{{Current Market Price per Share}}}}{{\\text{{Earnings Per Share (EPS)}}}}$$\n\n"
            f"**How to Interpret:**\n"
            f"- **High P/E**: Investors anticipate high future earnings growth, or the stock is trading at a premium valuation.\n"
            f"- **Low P/E**: The stock may be undervalued (value opportunity), or the company is facing structural challenges.\n"
            f"- **Context Matters**: Always compare a company's P/E ratio against its **historical 5-year average** and **sector peers** rather than looking at the number in isolation."
        )

    # 6. Concept: Diversification
    if "diversification" in q or "diversify" in q:
        return (
            f"**Diversification** is the foundational risk-management strategy of spreading your capital across various asset classes, sectors, and instruments to reduce portfolio risk.\n\n"
            f"**Why Diversification Works:**\n"
            f"- **Minimizes Unsystematic Risk**: If one company, sector, or asset class underperforms, gains in other uncorrelated holdings cushion the downside.\n"
            f"- **Smoother Return Profile**: Combining equities, fixed income, and gold creates steady wealth creation without violent drawdowns.\n\n"
            f"**Practical Portfolio Allocation:**\n"
            f"1. **Core Equities (60%–70%)**: Broad-market Index Funds (Nifty 50) and Flexi Cap Mutual Funds.\n"
            f"2. **Fixed Income / Debt (20%–30%)**: PPF, Fixed Deposits, Liquid Funds for stability.\n"
            f"3. **Hedges (5%–10%)**: Sovereign Gold Bonds (SGBs) or Gold ETFs for inflation protection."
        )

    # 7. Concept: Compound Interest
    if "compound" in q or "compounding" in q:
        return (
            f"**Compound Interest** is the mathematical phenomenon where the returns earned on an investment begin generating returns of their own over time (\"interest on interest\").\n\n"
            f"**Formula:**\n"
            f"$$A = P \\left(1 + \\frac{{r}}{{n}}\\right)^{{nt}}$$\n"
            f"*(where $P$ = Principal, $r$ = Annual return rate, $n$ = Compounding frequency per year, $t$ = Time in years).*\n\n"
            f"**The Rule of Compounding:**\n"
            f"- **Time in the market beats timing the market**: The earlier you start investing, the larger the compounding multiplier.\n"
            f"- In a 20-year investment horizon, the compounding growth generated in years 15–20 often exceeds the total capital invested in years 1–10 combined."
        )

    # 8. Concept: Difference between SIP and Lump Sum
    if ("sip" in q and "lump sum" in q) or ("difference between sip and" in q):
        return (
            f"**SIP vs. Lump Sum Investment: Direct Comparison**\n\n"
            f"| Feature | SIP (Systematic Investment) | Lump Sum (One-Time) |\n"
            f"| :--- | :--- | :--- |\n"
            f"| **Mechanism** | Periodic monthly investments (e.g. ₹5,000/mo) | Single one-time investment (e.g. ₹2,00,000) |\n"
            f"| **Market Timing** | Eliminates market timing via Rupee-Cost Averaging | High sensitivity to market entry timing |\n"
            f"| **Best Suited For** | Regular salaried income & ongoing cash surplus | Windfalls, annual bonuses, or market corrections |\n"
            f"| **Volatility Impact** | Buffers volatility by buying on market dips | Vulnerable to near-term market corrections |\n\n"
            f"**Recommended Strategy**: If you have a large lump sum, consider parking it in a liquid fund and deploying it into equity funds via a **Systematic Transfer Plan (STP)** over 6–12 months to smooth entry risk."
        )

    # 9. Concept: Difference between Stocks and Mutual Funds
    if "stocks" in q and "mutual fund" in q and ("difference" in q or "vs" in q or "between" in q):
        return (
            f"**Direct Stocks vs. Mutual Funds: Core Differences**\n\n"
            f"| Dimension | Direct Stocks | Mutual Funds |\n"
            f"| :--- | :--- | :--- |\n"
            f"| **Management** | Self-managed (requires fundamental & technical analysis) | Managed by professional SEBI-registered fund managers |\n"
            f"| **Diversification** | High concentration risk unless owning 20+ stocks | Instant diversification across 40–80 companies |\n"
            f"| **Time Commitment** | High (quarterly results, corporate governance monitoring) | Low (automated monthly SIPs & periodic reviews) |\n"
            f"| **Risk Profile** | High volatility with single-company default risk | Moderated volatility across diversified sectors |\n\n"
            f"**Best Approach**: Use **Mutual Funds as your Core Portfolio (70%–80%)** for reliable wealth compounding, and allocate a **Satellite Portfolio (20%–30%)** to high-conviction Direct Stocks."
        )

    # 10. Question: Should I invest all my money in one stock?
    if "all my money in one stock" in q or "single stock" in q or "invest all in one" in q or "one stock" in q:
        return (
            f"**No, you should never invest all your capital into a single stock.**\n\n"
            f"**Why Single-Stock Concentration is Dangerous:**\n"
            f"1. **Unsystematic Risk**: Even industry-leading companies can suffer from regulatory shifts, management fraud, sector disruptions, or sudden market crashes. If 100% of your capital is in one stock, a 50% drop halves your entire net worth.\n"
            f"2. **Opportunity Cost**: You miss out on secular growth in other high-performing sectors (e.g. IT, Banking, Pharma, Manufacturing).\n"
            f"3. **Zero Safety Net**: Unlike a diversified index fund, individual equities offer no structural downside cushion.\n\n"
            f"**Prudent Allocation Rule:**\n"
            f"- No single equity stock should exceed **5% to 10%** of your total investment portfolio."
        )

    # 11. Question: What is TCS / Stock price today? (Live market safety guard)
    if ("price today" in q or "current price of" in q or "live price" in q or "stock price of" in q) and ("tcs" in q or "infy" in q or "reliance" in q or "stock" in q or "share" in q):
        return (
            f"I do not have a live streaming broker ticker connection in this chat window. To view real-time quotes and historical price charts, please navigate to our **Investment Comparison Tool** or connect your Angel One broker feed.\n\n"
            f"FinLabs AI provides educational guidance, cash flow analytics, and asset allocation strategies without fabricating unverified live market prices."
        )

    # 12. Question / Scenario: "I have ₹1,00,000 / ₹2 lakh to invest" or Conversational Follow-up "How should I allocate it?"
    amount_found = None
    q_clean = q.replace(",", "")
    amt_match = re.search(r'(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lac|l)\b', q_clean)
    if amt_match:
        amount_found = float(amt_match.group(1)) * 100000
    else:
        k_match = re.search(r'(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:k|thousand)\b', q_clean)
        if k_match:
            amount_found = float(k_match.group(1)) * 1000
        else:
            num_match = re.search(r'(?:₹|rs\.?|inr)?\s*(\d{4,9})', q_clean)
            if num_match:
                amount_found = float(num_match.group(1))

    # Contextual Memory: If no amount in current query, check previous messages in conversation history!
    if not amount_found and history:
        for prev_msg in reversed(history):
            if prev_msg.get("sender") == "user" or prev_msg.get("role") == "user":
                prev_text = (prev_msg.get("text") or prev_msg.get("content") or "").lower()
                prev_amt = re.search(r'(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lac|l)\b', prev_text)
                if prev_amt:
                    amount_found = float(prev_amt.group(1)) * 100000
                    break
                prev_k = re.search(r'(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:k|thousand)\b', prev_text)
                if prev_k:
                    amount_found = float(prev_k.group(1)) * 1000
                    break
                prev_num = re.search(r'(?:₹|rs\.?|inr)?\s*(\d{4,9})', prev_text)
                if prev_num:
                    amount_found = float(prev_num.group(1))
                    break

    # 12. Question: Existing investor with specific footprint (Check before generic new lump-sum)
    if ("already invested" in q or "already invest" in q or "previous" in q or "stocks and mutual funds" in q) and ("what next" in q or "consider" in q or "recommend" in q or "invested in" in q or "consider next" in q or "where to" in q or "next" in q):
        footprint_amt = fmt_inr(prev_invest_amt) if prev_invest_amt > 0 else (fmt_inr(500000) if "5,00,000" in q or "5 lakh" in q or "5lakh" in q else "your active portfolio")
        platforms = prev_platforms if prev_platforms else (["Stocks", "Mutual Funds"] if "stocks and mutual funds" in q else ["Direct Equity", "Mutual Funds"])
        platforms_str = ", ".join(platforms)

        return (
            f"Hi {name}! Since you already have an active investment footprint of **{footprint_amt}** across **{platforms_str}**, you have already established a solid foundation. Here is your tailored next-step roadmap:\n\n"
            f"**1. Portfolio Audit & Concentration Check:**\n"
            f"- Audit your direct stock holdings to ensure no single stock exceeds **10%** of your total portfolio value.\n"
            f"- Verify that your direct stock holdings do not heavily overlap with the top holdings in your mutual funds.\n\n"
            f"**2. Core vs Satellite Framework:**\n"
            f"- **Core (70%)**: Low-cost Nifty 50 Index Funds + Diversified Flexi Cap funds for automated compounding.\n"
            f"- **Satellite (30%)**: Quality growth stocks (e.g. TCS, HDFC Bank, Reliance) and sectoral/thematic growth bets.\n\n"
            f"**3. Asset Class Rebalancing:**\n"
            f"- Check if your equity-to-debt ratio matches your **{risk_tolerance}** risk profile and **{time_horizon}** horizon. Consider adding a 10% allocation in Gold ETFs or Debt Funds for downside protection.\n\n"
            f"**4. Monthly Surplus Deployment:**\n"
            f"- With your net monthly surplus of **{fmt_inr(monthly_surplus)}** ({savings_rate}% savings rate), automate step-up SIPs aligned with your specific financial goals."
        )

    # 13. Question / Scenario: "I have ₹1,00,000 / ₹2 lakh to invest" or Conversational Follow-up "How should I allocate it?"
    if (amount_found and ("invest" in q or "allocate" in q or "where should i" in q or "what should i do" in q or "how should i" in q or "available" in q)) or (("allocate it" in q or "invest it" in q or "what to do with it" in q) and amount_found):
        amt_str = fmt_inr(amount_found)
        res_emergency = fmt_inr(amount_found * 0.20)
        res_large_cap = fmt_inr(amount_found * 0.45)
        res_flexi_cap = fmt_inr(amount_found * 0.25)
        res_gold_fd = fmt_inr(amount_found * 0.10)

        return (
            f"Here is a disciplined, risk-adjusted allocation blueprint for your capital of **{amt_str}** based on your **{risk_tolerance}** profile and **{time_horizon}** horizon:\n\n"
            f"**1. Step 1: Safety Buffer & Debt Check (20% — {res_emergency})**\n"
            f"- Ensure your emergency reserve covers at least 3–6 months of essential living expenses (rent, bills, groceries, EMIs) in a liquid bank account or liquid fund.\n"
            f"- If you have high-interest debt (e.g. credit cards or personal loans > 12% p.a.), clear that first before equity investing.\n\n"
            f"**2. Step 2: Core Equity Index Allocation (45% — {res_large_cap})**\n"
            f"- Deploy into low-cost **Nifty 50 / Sensex Index Funds** (e.g. UTI Nifty 50 Index Fund) for stable, long-term wealth compounding across India's top 50 companies.\n\n"
            f"**3. Step 3: Active Growth & Flexi Cap Allocation (25% — {res_flexi_cap})**\n"
            f"- Allocate to a high-quality **Flexi Cap Mutual Fund** (e.g. Parag Parikh Flexi Cap Fund) allowing fund managers to navigate large, mid, and international opportunities dynamically.\n\n"
            f"**4. Step 4: Stability & Gold Hedge (10% — {res_gold_fd})**\n"
            f"- Allocate to Sovereign Gold Bonds (SGBs) or Gold ETFs / Short-Duration Debt to hedge against inflation and equity market downturns.\n\n"
            f"*Note: Rather than deploying 100% in a single day, consider deploying via a Systematic Transfer Plan (STP) over 3 to 6 months to reduce market timing risk.*"
        )

    # 14. Question: Financial health situation / score
    if "health situation" in q or "financial health" in q or "my score" in q or "my health score" in q:
        return (
            f"**Your Personalized FinLabs Financial Health Snapshot:**\n\n"
            f"- **Overall Health Score**: **{health_score}/100**\n"
            f"- **Monthly Inflow**: {fmt_inr(monthly_income)}\n"
            f"- **Monthly Expenses**: -{fmt_inr(total_expenses)}\n"
            f"- **Monthly Loan EMIs / Debt**: -{fmt_inr(monthly_debt)}\n"
            f"- **Net Monthly Recurring Surplus**: **{fmt_inr(monthly_surplus)}** ({savings_rate}% savings rate)\n"
            f"- **Emergency Reserve Runway**: **{emergency_months} months** of essential expenses (Target: 6 months)\n"
            f"- **Debt Status**: {'Active loans with ' + fmt_inr(monthly_debt) + '/mo EMI' if monthly_debt > 0 else 'Debt Free 🎉'}\n"
            f"- **Risk Persona**: **{risk_tolerance}** ({time_horizon} horizon)\n\n"
            f"**Recommended Action Plan:**\n"
            f"1. {'Build emergency buffer to 6 months of expenses.' if float(emergency_months or 0) < 6 else 'Maintain your healthy 6-month liquid buffer.'}\n"
            f"2. Automate your monthly surplus of **{fmt_inr(monthly_surplus)}** into diversified equity SIPs to compound wealth."
        )

    # 15. Question: What should I do with my monthly surplus?
    if "monthly surplus" in q or "do with my surplus" in q or "what should i do with my savings" in q:
        return (
            f"You have a net monthly surplus of **{fmt_inr(monthly_surplus)}** ({savings_rate}% savings rate) after accounting for expenses ({fmt_inr(total_expenses)}) and debt payments ({fmt_inr(monthly_debt)}).\n\n"
            f"**Optimal Surplus Deployment Blueprint:**\n\n"
            f"1. **Emergency Reserve ({fmt_inr(monthly_surplus * 0.20)}/mo)**: Allocate toward high-yield savings / liquid funds until you reach 6 months of living expenses.\n"
            f"2. **Goal-Targeted SIPs ({fmt_inr(monthly_surplus * 0.50)}/mo)**: Automate monthly SIPs in low-cost Nifty 50 Index and Flexi Cap Mutual Funds.\n"
            f"3. **Long-Term Growth & Satellite Stocks ({fmt_inr(monthly_surplus * 0.20)}/mo)**: Invest in high-conviction quality stocks or mid-cap funds.\n"
            f"4. **Liquid Buffer / Discretionary ({fmt_inr(monthly_surplus * 0.10)}/mo)**: Keep unallocated in your account for lifestyle flexibility."
        )

    # Fallback default response
    return (
        f"Hi {name}! As your FinLabs AI Copilot, I'm here to help you navigate financial decisions, asset allocation, and goal planning.\n\n"
        f"Based on your profile, you have a net monthly surplus of **{fmt_inr(monthly_surplus)}** and a risk tolerance of **{risk_tolerance}**.\n\n"
        f"You can ask me specific questions about:\n"
        f"- **Asset Allocation**: *How to invest ₹1,00,000*, *What to do with my monthly surplus*\n"
        f"- **Financial Concepts**: *What is a mutual fund?*, *Explain SIP*, *What is an ETF?*, *P/E ratio*\n"
        f"- **Portfolio Strategies**: *Difference between stocks and mutual funds*, *Diversification principles*\n\n"
        f"What would you like to explore?"
    )

@app.get("/api/ai/chat")
@app.get("/ai/chat")
async def ai_chat_get():
    return {
        "status": "ok",
        "service": "FinLabs AI Copilot API",
        "message": "Send a POST request with {'query': '...'} to chat with FinLabs AI."
    }

@app.post("/api/ai/chat")
@app.post("/ai/chat")
async def ai_chat_post(payload: AiChatRequest):
    query = (payload.query or "").strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    context = payload.context or {}
    history = payload.conversationHistory or []

    # 1. Attempt External Gemini LLM if API Key is configured in environment
    gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if gemini_key:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
            system_prompt = (
                "You are FinLabs AI, an expert personal financial education and planning copilot. "
                "Explain financial concepts clearly using markdown. Avoid guaranteed returns. "
                f"User Profile Context: {json.dumps(context)}"
            )

            contents = []
            for h in history[-6:]:
                role = "user" if h.get("sender") == "user" or h.get("role") == "user" else "model"
                text = h.get("text") or h.get("content") or ""
                if text:
                    contents.append({"role": role, "parts": [{"text": text}]})

            contents.append({"role": "user", "parts": [{"text": f"System Context: {system_prompt}\n\nUser Question: {query}"}]})

            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, json={"contents": contents})
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts and "text" in parts[0]:
                            return {
                                "success": True,
                                "answer": parts[0]["text"].strip(),
                                "source": "gemini_api"
                            }
        except Exception as e:
            print(f"Gemini API invocation fallback notice: {e}")

    # 2. Server-Side FinLabs Deterministic Financial Intelligence Engine
    answer = generate_finlabs_ai_response(query, context, history)
    return {
        "success": True,
        "answer": answer,
        "source": "finlabs_ai_engine"
    }
