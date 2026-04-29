# Project Report: OpenVPN Implementation Using OpenVPN and Linux Networking

## Project Overview

This project builds a secured Virtual Private Network (VPN) system using OpenVPN principles and Linux networking concepts. It includes a full-stack dashboard to generate certificate-based VPN credentials, configure tunneling, and visualize the secure path between a remote client and a server.

## Objectives

- Create a secure VPN tunnel using the OpenVPN protocol.
- Implement mutual SSL/TLS authentication using a self-managed PKI.
- Protect traffic with AES-256-GCM encryption.
- Enable IP forwarding and NAT-based routing for VPN clients.
- Provide a creative and interactive frontend experience.

## System Architecture

The system is organized into three layers:

1. Backend service (`server.js`)
   - Generates a Certificate Authority (CA), server certificate, and client certificate.
   - Prepares OpenVPN server and client configuration templates.
   - Exposes a REST endpoint for the frontend to trigger generation.

2. Frontend dashboard (`public/`)
   - Accepts VPN parameters from the user.
   - Shows the generated server config and inline client profile.
   - Includes animated visual elements to represent the VPN tunnel.

3. Deployment scripts (`scripts/`)
   - Linux helper scripts for OpenVPN installation and system routing.
   - Quick-start commands for enabling forwarding and NAT.

## Functional Features

### Virtual Tunneling (TUN)
The generated server configuration uses `dev tun` to establish a routed VPN interface. Traffic is encapsulated through an OpenVPN tunnel, providing a virtual point-to-point path.

### SSL/TLS Mutual Authentication
The backend builds a self-signed CA and signs both the server and client certificates. This ensures that only legitimately-issued peers can join the VPN.

### Encrypted Data Transmission
The project uses `AES-256-GCM` as the cipher in both the server and client profiles. This cipher protects the confidentiality and integrity of transported packets.

### NAT and Routing
The Linux setup script demonstrates how to enable IP forwarding and NAT translation. This allows clients to route internet traffic securely through the VPN gateway.

### Cryptographic Key Management
The dashboard also generates a static `tls-auth` key. This key hardens the OpenVPN handshake by preventing unauthorized connection attempts and port scanning attacks.

## Implementation Notes

- `node-forge` is used to create RSA keys and PEM certificates entirely in JavaScript.
- The frontend is built with modern HTML, CSS, and vanilla JavaScript for responsiveness and interactivity.
- Generated files are saved to `output/server` and `output/client` for easy deployment.

## Usage Instructions

1. Run `npm install` in the project root.
2. Start the server with `npm start`.
3. Browse to `http://localhost:3000`.
4. Fill in the server and client parameters, then click `Generate VPN Profile`.

## Linux Deployment Steps

1. Run `bash scripts/setup-openvpn.sh` on your Linux server.
2. Copy the generated files from `output/server` to the OpenVPN server directory.
3. Update the interface name in the iptables NAT rules if needed.
4. Restart OpenVPN with `sudo systemctl restart openvpn@server`.

## Conclusion

This implementation completes the project proposal by combining OpenVPN deployment patterns with an intuitive user interface. The dashboard centralizes certificate creation, configuration generation, and network visualization, making the VPN setup easier to manage and present.
