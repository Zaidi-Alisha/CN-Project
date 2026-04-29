const serverOutput = document.getElementById('serverOutput');
const clientOutput = document.getElementById('clientOutput');
const generateBtn = document.getElementById('generateBtn');
const downloadServer = document.getElementById('downloadServer');
const downloadClient = document.getElementById('downloadClient');
const tabs = document.querySelectorAll('.tab');

const getFormValue = (id) => document.getElementById(id).value.trim();

const createDownloadLink = (filename, content) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  return URL.createObjectURL(blob);
};

const updateDownloadButton = (button, filename, content) => {
  const url = createDownloadLink(filename, content);
  button.onclick = () => {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
  };
};

const setActiveTab = (targetId) => {
  tabs.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.target === targetId);
  });
  document.querySelectorAll('.output-block').forEach((block) => {
    block.classList.toggle('hidden', block.id !== targetId);
  });
};

tabs.forEach((tab) => {
  tab.addEventListener('click', () => setActiveTab(tab.dataset.target));
});

const showResponse = (data) => {
  serverOutput.textContent = data.serverConfig || 'Server configuration will appear here.';
  clientOutput.textContent = data.clientConfig || 'Client profile will appear here.';
  updateDownloadButton(downloadServer, 'server.conf', data.serverConfig || '');
  updateDownloadButton(downloadClient, 'client.ovpn', data.clientConfig || '');
  setActiveTab('serverOutput');
};

generateBtn.addEventListener('click', async () => {
  generateBtn.disabled = true;
  generateBtn.textContent = 'Generating...';

  try {
    const payload = {
      serverName: getFormValue('serverName'),
      clientName: getFormValue('clientName'),
      serverHost: getFormValue('serverHost'),
      protocol: getFormValue('protocol'),
      port: parseInt(getFormValue('port'), 10) || 1194,
      serverSubnet: getFormValue('vpnSubnet'),
      serverMask: getFormValue('vpnMask')
    };

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Unable to generate VPN profile.');
    }

    const result = await response.json();
    showResponse(result);
  } catch (error) {
    serverOutput.textContent = 'Error: ' + error.message;
    clientOutput.textContent = '';
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = 'Generate VPN Profile';
  }
});

setActiveTab('serverOutput');
