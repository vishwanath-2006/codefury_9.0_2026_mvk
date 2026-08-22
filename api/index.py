import os
import pyotp
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from SmartApi import SmartConnect

app = FastAPI(
    title="Angel One SmartAPI Integration",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

# Enable CORS for local development testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

# Mock data
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

def get_credentials(creds: Optional[SyncCredentials] = None):
    api_key = creds.apiKey if creds else None
    client_id = creds.clientId if creds else None
    pin = creds.pin if creds else None
    totp_secret = creds.totpSecret if creds else None

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
        # Generate TOTP
        totp_token = pyotp.TOTP(totp_secret).now()

        # Connect to SmartAPI
        smart_api = SmartConnect(api_key=api_key)
        session_data = smart_api.generateSession(client_id, pin, totp_token)
        
        if not session_data.get('status'):
            raise HTTPException(status_code=401, detail=f"Login failed: {session_data.get('message', 'Unknown Error')}")
            
        # Fetch holdings
        holdings_res = smart_api.holding()
        if not holdings_res.get('status'):
            raise HTTPException(status_code=500, detail=f"Failed to retrieve holdings: {holdings_res.get('message', 'Unknown error')}")
            
        raw_holdings = holdings_res.get('data', [])
        processed_holdings = []
        
        for stock in raw_holdings:
            raw_symbol = stock.get('tradingsymbol', 'UNKNOWN')
            symbol = raw_symbol.split('-')[0]
            
            quantity = float(stock.get('quantity', 0))
            average_price = float(stock.get('averageprice', 0))
            ltp = float(stock.get('ltp', 0))
            
            invested_value = quantity * average_price
            current_value = quantity * ltp
            pnl = current_value - invested_value
            pnl_percentage = (pnl / invested_value * 100) if invested_value > 0 else 0.0
            
            processed_holdings.append({
                "symbol": symbol,
                "quantity": quantity,
                "averagePrice": round(average_price, 2),
                "ltp": round(ltp, 2),
                "investedValue": round(invested_value, 2),
                "currentValue": round(current_value, 2),
                "pnl": round(pnl, 2),
                "pnlPercentage": round(pnl_percentage, 2)
            })
            
        return {
            "status": "success",
            "source": "live_angelone",
            "holdings": processed_holdings
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server integration error: {str(e)}")

@app.get("/api/broker/angelone/sync")
async def sync_holdings_get(demo: Optional[bool] = False, apiKey: Optional[str] = None, clientId: Optional[str] = None, pin: Optional[str] = None, totpSecret: Optional[str] = None):
    creds = SyncCredentials(apiKey=apiKey, clientId=clientId, pin=pin, totpSecret=totpSecret, demo=demo)
    return await sync_holdings(creds)

@app.post("/api/broker/angelone/stock-quote")
async def get_stock_quote(payload: QuoteRequest):
    symbol = payload.symbol.upper()
    api_key, client_id, pin, totp_secret = get_credentials(payload)
    
    mock_dict = {h["symbol"]: h["ltp"] for h in MOCK_HOLDINGS}
    
    if payload.demo or not all([api_key, client_id, pin, totp_secret]):
        ltp = mock_dict.get(symbol)
        if not ltp:
            # Deterministic fallback mock price
            char_sum = sum(ord(c) for c in symbol)
            ltp = float((char_sum * 7) % 3500 + 100)
            
        return {
            "symbol": symbol,
            "tradingSymbol": f"{symbol}-EQ",
            "ltp": round(ltp, 2),
            "status": "success",
            "source": "mock_demo"
        }
        
    try:
        totp_token = pyotp.TOTP(totp_secret).now()
        smart_api = SmartConnect(api_key=api_key)
        session_data = smart_api.generateSession(client_id, pin, totp_token)
        
        if not session_data.get('status'):
            raise HTTPException(status_code=401, detail=f"Login failed: {session_data.get('message', 'Unknown Error')}")
            
        # Search scrip to find token
        search_res = smart_api.searchScrip("NSE", symbol)
        if not search_res or not isinstance(search_res, list) or len(search_res) == 0:
            # Search fallback by name partial check
            search_res = smart_api.searchScrip("NSE", symbol[:4])
            
        if not search_res or not isinstance(search_res, list) or len(search_res) == 0:
            raise HTTPException(status_code=404, detail=f"Symbol {symbol} not found on NSE")
            
        scrip = search_res[0]
        trading_symbol = scrip.get('tradingsymbol')
        symbol_token = scrip.get('symboltoken')
        
        # Get LTP
        ltp_res = smart_api.ltpData("NSE", trading_symbol, symbol_token)
        if not ltp_res.get('status'):
            raise HTTPException(status_code=500, detail=f"LTP fetch failed: {ltp_res.get('message', 'Unknown error')}")
            
        ltp_data = ltp_res.get('data', {})
        ltp = float(ltp_data.get('ltp', 0))
        
        return {
            "symbol": symbol,
            "tradingSymbol": trading_symbol,
            "ltp": round(ltp, 2),
            "status": "success",
            "source": "live_angelone"
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server integration error: {str(e)}")

@app.get("/api/broker/angelone/stock-quote")
async def get_stock_quote_get(symbol: str, demo: Optional[bool] = False, apiKey: Optional[str] = None, clientId: Optional[str] = None, pin: Optional[str] = None, totpSecret: Optional[str] = None):
    req = QuoteRequest(symbol=symbol, apiKey=apiKey, clientId=clientId, pin=pin, totpSecret=totpSecret, demo=demo)
    return await get_stock_quote(req)

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

@app.post("/api/broker/angelone/historical-candles")
async def get_historical_candles(payload: HistoricalCandleRequest):
    symbol = payload.symbol.upper()
    api_key, client_id, pin, totp_secret = get_credentials(payload)

    if payload.demo or not all([api_key, client_id, pin, totp_secret]):
        return {
            "status": "unavailable",
            "symbol": symbol,
            "source": "no_live_connection",
            "candles": []
        }

    try:
        totp_token = pyotp.TOTP(totp_secret).now()
        smart_api = SmartConnect(api_key=api_key)
        session_data = smart_api.generateSession(client_id, pin, totp_token)

        if not session_data.get('status'):
            raise HTTPException(status_code=401, detail=f"Login failed: {session_data.get('message', 'Unknown Error')}")

        symbol_token = None
        trading_symbol = f"{symbol}-EQ"

        # 1. Exact token lookup for top NSE bluechips
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

        if symbol in NSE_TOKENS:
            symbol_token = NSE_TOKENS[symbol]
        else:
            search_res = smart_api.searchScrip("NSE", symbol)
            if not search_res or not isinstance(search_res, list) or len(search_res) == 0:
                search_res = smart_api.searchScrip("NSE", symbol[:4])

            if not search_res or not isinstance(search_res, list) or len(search_res) == 0:
                raise HTTPException(status_code=404, detail=f"Symbol {symbol} not found on NSE")

            scrip = search_res[0]
            symbol_token = scrip.get('symboltoken')
            trading_symbol = scrip.get('tradingsymbol', trading_symbol)

        from datetime import datetime, timedelta
        now = datetime.now()
        to_str = payload.toDate or now.strftime("%Y-%m-%d 15:30")
        from_str = payload.fromDate or (now - timedelta(days=365)).strftime("%Y-%m-%d 09:15")

        historic_param = {
            "exchange": "NSE",
            "symboltoken": symbol_token,
            "interval": payload.interval or "ONE_DAY",
            "fromdate": from_str,
            "todate": to_str
        }

        candle_res = smart_api.getCandleData(historic_param)
        status_val = candle_res.get('status')
        is_ok = (status_val is True) or (isinstance(status_val, str) and status_val.lower() in ['true', 'success'])

        if not is_ok:
            return {
                "status": "error",
                "symbol": symbol,
                "message": str(candle_res.get('message', 'Failed to retrieve candles')),
                "candles": []
            }

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

    except HTTPException as he:
        raise he
    except Exception as e:
        return {
            "status": "error",
            "symbol": symbol,
            "message": str(e),
            "candles": []
        }

@app.get("/api/broker/angelone/historical-candles")
async def get_historical_candles_get(symbol: str, interval: Optional[str] = "ONE_DAY", fromDate: Optional[str] = None, toDate: Optional[str] = None, demo: Optional[bool] = False, apiKey: Optional[str] = None, clientId: Optional[str] = None, pin: Optional[str] = None, totpSecret: Optional[str] = None):
    req = HistoricalCandleRequest(symbol=symbol, interval=interval, fromDate=fromDate, toDate=toDate, apiKey=apiKey, clientId=clientId, pin=pin, totpSecret=totpSecret, demo=demo)
    return await get_historical_candles(req)

class TokenSyncRequest(BaseModel):
    auth_token: str
    apiKey: Optional[str] = None
    demo: Optional[bool] = False

@app.post("/api/broker/angelone/holdings-by-token")
def get_holdings_by_token(payload: TokenSyncRequest):
    auth_token = payload.auth_token
    
    if payload.demo or auth_token == "demo":
        return {
            "status": "success",
            "source": "mock_demo",
            "holdings": MOCK_HOLDINGS
        }
        
    api_key = payload.apiKey or os.getenv('ANGELONE_API_KEY') or "OPvmoROA"
    
    import requests
    try:
        url = "https://apiconnect.angelone.in/rest/secure/angelbroking/portfolio/v1/getHolding"
        headers = {
            "Authorization": f"Bearer {auth_token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "X-UserType": "USER",
            "X-SourceID": "WEB",
            "X-ClientLocalIP": "127.0.0.1",
            "X-ClientPublicIP": "127.0.0.1",
            "X-MACAddress": "fe80::1",
            "X-PrivateKey": api_key,
        }
        response = requests.get(url, headers=headers)
        data = response.json()
        
        # Check if the API request was successful and returned status True
        is_success = (response.status_code == 200 and data.get("status") is True)
        
        raw_holdings = data.get("data", []) if is_success else [
            {
                "tradingsymbol": "TATAMOTORS-EQ",
                "quantity": 25,
                "averageprice": 950.0,
                "ltp": 985.4,
                "profitandloss": 885.0
            },
            {
                "tradingsymbol": "RELIANCE-EQ",
                "quantity": 10,
                "averageprice": 2850.0,
                "ltp": 2980.0,
                "profitandloss": 1300.0
            },
            {
                "tradingsymbol": "HDFCBANK-EQ",
                "quantity": 15,
                "averageprice": 1600.0,
                "ltp": 1675.0,
                "profitandloss": 1125.0
            }
        ]
        
        processed_holdings = []
        for stock in raw_holdings:
            raw_symbol = stock.get('tradingsymbol', 'UNKNOWN')
            symbol = raw_symbol.split('-')[0]
            
            quantity = float(stock.get('quantity', 0))
            average_price = float(stock.get('averageprice', 0))
            ltp = float(stock.get('ltp', 0))
            pnl = float(stock.get('profitandloss', stock.get('pnl', 0)))
            
            invested_value = quantity * average_price
            current_value = quantity * ltp
            if pnl == 0:
                pnl = current_value - invested_value
            pnl_percentage = (pnl / invested_value * 100) if invested_value > 0 else 0.0
            
            processed_holdings.append({
                "symbol": symbol,
                "quantity": quantity,
                "averagePrice": round(average_price, 2),
                "ltp": round(ltp, 2),
                "investedValue": round(invested_value, 2),
                "currentValue": round(current_value, 2),
                "pnl": round(pnl, 2),
                "pnlPercentage": round(pnl_percentage, 2)
            })
            
        return {
            "status": "success",
            "source": "live_angelone" if is_success else "mock_demo_fallback",
            "holdings": processed_holdings,
            "warning": None if is_success else "API call did not return holdings. Served mock portfolio fallback."
        }
        
    except Exception as e:
        print(f"Holding sync failed: {str(e)}. Falling back to mock data.")
        # Fallback to mock data on invalid credentials/tokens to keep UI interactive
        processed_holdings = []
        fallback_holdings = [
            {
                "tradingsymbol": "TATAMOTORS-EQ",
                "quantity": 25,
                "averageprice": 950.0,
                "ltp": 985.4,
                "profitandloss": 885.0
            },
            {
                "tradingsymbol": "RELIANCE-EQ",
                "quantity": 10,
                "averageprice": 2850.0,
                "ltp": 2980.0,
                "profitandloss": 1300.0
            },
            {
                "tradingsymbol": "HDFCBANK-EQ",
                "quantity": 15,
                "averageprice": 1600.0,
                "ltp": 1675.0,
                "profitandloss": 1125.0
            }
        ]
        for stock in fallback_holdings:
            raw_symbol = stock.get('tradingsymbol')
            symbol = raw_symbol.split('-')[0]
            quantity = float(stock.get('quantity'))
            average_price = float(stock.get('averageprice'))
            ltp = float(stock.get('ltp'))
            pnl = float(stock.get('profitandloss'))
            invested_value = quantity * average_price
            current_value = quantity * ltp
            pnl_percentage = (pnl / invested_value * 100) if invested_value > 0 else 0.0
            processed_holdings.append({
                "symbol": symbol,
                "quantity": quantity,
                "averagePrice": round(average_price, 2),
                "ltp": round(ltp, 2),
                "investedValue": round(invested_value, 2),
                "currentValue": round(current_value, 2),
                "pnl": round(pnl, 2),
                "pnlPercentage": round(pnl_percentage, 2)
            })
        return {
            "status": "success",
            "source": "mock_demo_fallback",
            "holdings": processed_holdings,
            "warning": f"Synced using mock fallback due to connection error: {str(e)}"
        }
