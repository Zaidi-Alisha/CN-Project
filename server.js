const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const forge = require('node-forge');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function writeOutput(relativePath, content) {
  const fullPath = path.join(outputDir, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  return fullPath;
}

function createCA(commonName) {
  const keys = forge.pki.rsa.generateKeyPair(2048);
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10);

  const attrs = [
    { name: 'commonName', value: commonName },
    { name: 'organizationName', value: 'OpenVPN PKI' },
    { name: 'countryName', value: 'PK' }
  ];

  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.setExtensions([
    { name: 'basicConstraints', cA: true },
    { name: 'keyUsage', keyCertSign: true, digitalSignature: true, cRLSign: true },
    { name: 'subjectKeyIdentifier' }
  ]);
  cert.sign(keys.privateKey, forge.md.sha256.create());

  return {
    keyPem: forge.pki.privateKeyToPem(keys.privateKey),
    certPem: forge.pki.certificateToPem(cert),
    key: keys.privateKey,
    cert
  };
}

function createSignedCertificate(commonName, ca, type = 'server') {
  const keys = forge.pki.rsa.generateKeyPair(2048);
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = Math.floor(Math.random() * 1e16).toString();
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 5);

  const attrs = [
    { name: 'commonName', value: commonName },
    { name: 'organizationName', value: 'OpenVPN Network' },
    { name: 'countryName', value: 'PK' }
  ];

  cert.setSubject(attrs);
  cert.setIssuer(ca.cert.subject.attributes);

  const extensions = [
    { name: 'basicConstraints', cA: false },
    { name: 'keyUsage', digitalSignature: true, keyEncipherment: true },
    { name: 'extKeyUsage', serverAuth: type === 'server', clientAuth: type === 'client' },
    { name: 'subjectAltName', altNames: [{ type: 2, value: commonName }] }
  ];

  cert.setExtensions(extensions);
  cert.sign(ca.key, forge.md.sha256.create());

  return {
    keyPem: forge.pki.privateKeyToPem(keys.privateKey),
    certPem: forge.pki.certificateToPem(cert)
  };
}

function formatTlsKey(rawBytes) {
  const hex = forge.util.bytesToHex(rawBytes).toUpperCase();
  const lines = hex.match(/.{1,64}/g) || [];
  return '# 2048 bit OpenVPN static key\n' + lines.join('\n') + '\n';
}

function buildServerConfig(options) {
  const { port, protocol, serverSubnet, serverMask } = options;
  return `port ${port}
proto ${protocol}
dev tun
ca ca.crt
cert server.crt
key server.key
server ${serverSubnet} ${serverMask}
push "redirect-gateway def1 bypass-dhcp"
push "dhcp-option DNS 1.1.1.1"
push "dhcp-option DNS 8.8.8.8"
keepalive 10 120
tls-auth ta.key 0
cipher AES-256-GCM
auth SHA256
persist-key
persist-tun
user nobody
group nogroup
status openvpn-status.log
verb 3
explicit-exit-notify 1
`;}

function buildClientConfig(options) {
  const { port, protocol, remoteHost } = options;
  return `client
dev tun
proto ${protocol}
remote ${remoteHost} ${port}
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
cipher AES-256-GCM
auth SHA256
verb 3
<ca>
${options.ca}
</ca>
<cert>
${options.clientCert}
</cert>
<key>
${options.clientKey}
</key>
<tls-auth>
${options.tlsAuth}
</tls-auth>
key-direction 1
`;}

app.get('/api/status', (req, res) => {
  res.json({
    status: 'ready',
    project: 'OpenVPN VPN Implementation Dashboard',
    features: [
      'PKI generation with CA / server / client certificates',
      'OpenVPN server and client config generation',
      'TLS auth key builder',
      'Interactive VPN dashboard frontend'
    ]
  });
});

app.post('/api/generate', (req, res) => {
  const {
    serverName = 'openvpn-server',
    clientName = 'openvpn-client',
    serverHost = '[SERVER_ADDRESS]',
    port = 1194,
    protocol = 'udp',
    serverSubnet = '10.8.0.0',
    serverMask = '255.255.255.0'
  } = req.body || {};

  const ca = createCA('OpenVPN Root CA');
  const serverCert = createSignedCertificate(serverName, ca, 'server');
  const clientCert = createSignedCertificate(clientName, ca, 'client');
  const tlsAuthKey = formatTlsKey(forge.random.getBytesSync(256));

  writeOutput('server/ca.crt', ca.certPem);
  writeOutput('server/ca.key', ca.keyPem);
  writeOutput('server/server.crt', serverCert.certPem);
  writeOutput('server/server.key', serverCert.keyPem);
  writeOutput('server/client.crt', clientCert.certPem);
  writeOutput('server/client.key', clientCert.keyPem);
  writeOutput('server/ta.key', tlsAuthKey);
  writeOutput('server/server.conf', buildServerConfig({ port, protocol, serverSubnet, serverMask }));

  const clientConfig = buildClientConfig({
    port,
    protocol,
    remoteHost: serverHost,
    ca: ca.certPem.trim(),
    clientCert: clientCert.certPem.trim(),
    clientKey: clientCert.keyPem.trim(),
    tlsAuth: tlsAuthKey.trim()
  });

  writeOutput('client/client.ovpn', clientConfig);

  res.json({
    message: 'VPN credentials generated successfully.',
    serverName,
    clientName,
    serverConfig: buildServerConfig({ port, protocol, serverSubnet, serverMask }),
    clientConfig,
    outputPath: outputDir
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`OpenVPN dashboard running at http://localhost:${port}`);
});
