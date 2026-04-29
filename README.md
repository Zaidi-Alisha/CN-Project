# OpenVPN Dashboard Project

This project implements a complete OpenVPN VPN setup experience with a creative frontend dashboard, PKI automation, and Linux-ready deployment scripts.

## What is included

- `server.js`: Node.js backend for generating CA/server/client certificates using `node-forge`
- `public/`: Creative dashboard UI with interactive VPN configuration
- `scripts/setup-openvpn.sh`: Linux setup steps for OpenVPN and Easy-RSA
- `scripts/generate-certs.sh`: Helper script for certificate and key generation
- `docs/project-report.md`: Project report matching the proposal requirements
- `output/`: Generated OpenVPN files are written here when the server runs

## Features

- PKI generation for CA, server, and client certificates
- TLS-auth key generation for secure OpenVPN handshake hardening
- Server and client OpenVPN config generation with AES-256-GCM
- Creative network dashboard interface for configuration and visualization
- Linux script support for OpenVPN installation and routing setup

## How to run

1. Install dependencies:

```bash
npm install
```

2. Start the dashboard:

```bash
npm start
```

3. Open the dashboard in your browser:

```text
http://localhost:3000
```

## Linux deployment notes

Run the helper script on a Linux host with OpenVPN installed:

```bash
bash scripts/setup-openvpn.sh
```

This script installs OpenVPN, configures IP forwarding, and shows the correct server configuration pattern.

## Project mapping to proposal

The dashboard is designed to reflect the proposal's VPN goals:

- Secure VPN tunnel using OpenVPN software
- SSL/TLS mutual authentication with generated certificates
- AES-256-GCM encrypted transport
- NAT and routing preparation for Linux gateway mode
- Visual user experience with a creative frontend
