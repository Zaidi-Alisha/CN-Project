#!/bin/bash
set -e

if ! command -v openssl >/dev/null 2>&1; then
  echo "OpenSSL is required but not installed. Install it with: sudo apt install openssl"
  exit 1
fi

OUTPUT_DIR="output/server"
mkdir -p "$OUTPUT_DIR"
cd "$OUTPUT_DIR"

echo "Generating OpenVPN TLS auth key..."
openvpn --genkey --secret ta.key

cat <<'EOF'
Use the Node.js dashboard to generate the CA, server, and client certificates.
The generated server.conf and client.ovpn files will be available under output/.
EOF
