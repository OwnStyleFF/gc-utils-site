"""
Lightweight HTTPS static file server for development.
Usage:
  python serve_https.py --cert certs/cert.pem --key certs/key.pem --port 5443

This script serves the current `web/` directory over HTTPS using Python's http.server.
It requires Python 3.7+ and the certificate/key files to exist.
"""
import http.server
import ssl
import argparse
import os

parser = argparse.ArgumentParser(description='Serve current directory over HTTPS for local testing')
parser.add_argument('--cert', default='certs/cert.pem', help='Path to certificate PEM file')
parser.add_argument('--key', default='certs/key.pem', help='Path to private key PEM file')
parser.add_argument('--port', type=int, default=5443, help='Port to serve on (default 5443)')
parser.add_argument('--bind', default='127.0.0.1', help='Bind address (default 127.0.0.1)')
args = parser.parse_args()

if not os.path.exists(args.cert) or not os.path.exists(args.key):
    print('ERROR: certificate or key file not found.')
    print('Create them with the provided generate_cert.ps1 or use OpenSSL manually.')
    raise SystemExit(1)

handler = http.server.SimpleHTTPRequestHandler
httpd = http.server.ThreadingHTTPServer((args.bind, args.port), handler)

# Wrap socket with SSL
httpd.socket = ssl.wrap_socket(httpd.socket, server_side=True, certfile=args.cert, keyfile=args.key)

print(f"Serving HTTPS on https://{args.bind}:{args.port}/ (directory: {os.getcwd()})")
try:
    httpd.serve_forever()
except KeyboardInterrupt:
    print('\nServer stopped')
    httpd.server_close()
