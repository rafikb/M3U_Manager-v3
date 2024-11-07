from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

@app.route('/check_url', methods=['POST'])
def check_url():
    url = request.json.get('url')
    try:
        response = requests.get(url)
        return jsonify({'status': response.status_code})
    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(port=5000)
