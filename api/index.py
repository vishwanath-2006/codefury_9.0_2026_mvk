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
