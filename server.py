import os
import pyotp
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from SmartApi import SmartConnect

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)
# Enable CORS for frontend requests from port 3000
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}})

# Mock demo holdings for testing if no credentials are input
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

@app.route('/api/broker/angelone/sync', methods=['GET', 'POST'])
def sync_angelone_holdings():
    # 1. Parse parameters from POST JSON or GET query params or Environment Variables
    api_key = None
    client_id = None
    pin = None
    totp_secret = None
    is_demo = False

    if request.method == 'POST':
        data = request.get_json(silent=True) or {}
        api_key = data.get('apiKey')
        client_id = data.get('clientId')
        pin = data.get('pin')
        totp_secret = data.get('totpSecret')
        is_demo = data.get('demo', False)
    else:
        api_key = request.args.get('apiKey')
        client_id = request.args.get('clientId')
        pin = request.args.get('pin')
        totp_secret = request.args.get('totpSecret')
        is_demo = request.args.get('demo') == 'true'

    # Fallback to environment variables
    if not api_key:
        api_key = os.getenv('ANGELONE_API_KEY')
    if not client_id:
        client_id = os.getenv('ANGELONE_CLIENT_ID')
    if not pin:
        pin = os.getenv('ANGELONE_PIN')
    if not totp_secret:
        totp_secret = os.getenv('ANGELONE_TOTP_SECRET')

    # 2. Return mock holdings if explicitly requested or if credentials are empty
    if is_demo or not all([api_key, client_id, pin, totp_secret]):
        # If any credential is empty and no fallback environment variables, return mock data as a demo
        return jsonify({
            "status": "success",
            "source": "mock_demo",
            "holdings": MOCK_HOLDINGS
        })

    # 3. Attempt live integration with Angel One SmartAPI
    try:
        # Generate dynamic TOTP
        totp_token = pyotp.TOTP(totp_secret).now()

        # Connect to SmartAPI
        smart_api = SmartConnect(api_key=api_key)
        session_data = smart_api.generateSession(client_id, pin, totp_token)

        if not session_data.get('status'):
            return jsonify({
                "status": "error",
                "message": f"Login failed: {session_data.get('message', 'Unknown Error')}"
            }), 401

        # Fetch holdings
        holdings_res = smart_api.holding()
        
        if not holdings_res.get('status'):
            return jsonify({
                "status": "error",
                "message": f"Failed to retrieve holdings: {holdings_res.get('message', 'Unknown error')}"
            }), 500

        raw_holdings = holdings_res.get('data', [])
        processed_holdings = []

        for stock in raw_holdings:
            # Clean symbol (e.g. BHEL-EQ -> BHEL)
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

        return jsonify({
            "status": "success",
            "source": "live_angelone",
            "holdings": processed_holdings
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Server integration error: {str(e)}"
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5005))
    print(f"Starting Angel One integration proxy server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)
