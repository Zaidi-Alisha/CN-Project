#!/bin/bash
set -e

echo "Updating package lists..."
sudo apt update

echo "Installing OpenVPN, Easy-RSA, and necessary tools..."
sudo apt install -y openvpn easy-rsa openssl

cat <<'EOF'

OpenVPN and Easy-RSA are installed.
Follow these steps to initialize the PKI and configure the server:

1. Copy the sample server configuration from output/server/server.conf
2. Place the server certificate files under /etc/openvpn/server/
3. Enable IP forwarding and configure iptables

EOF

sudo sysctl -w net.ipv4.ip_forward=1

echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.conf > /dev/null

cat <<'EOF'

After generating certificates, apply NAT rules like:

sudo iptables -t nat -A POSTROUTING -s 10.8.0.0/24 -o eth0 -j MASQUERADE
sudo systemctl restart openvpn@server

Replace eth0 with the correct public interface on your machine.
EOF
