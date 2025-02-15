chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'captureTab') {
    chrome.tabs.captureTab(null, {format: 'png'}, (dataUrl) => {
      sendToVespa(dataUrl);
      chrome.runtime.sendMessage({action: 'displayScreenshot', dataUrl: dataUrl});
    });
  }
});

function sendToVespa(dataUrl) {
  const vespaEndpoint = 'https://your-vespa-instance.com/document/v1/namespace/doc_type/docid';
  
  fetch(vespaEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fields: {
        image: dataUrl,
        timestamp: new Date().toISOString()
      }
    })
  })
  .then(response => response.json())
  .then(data => {
    chrome.runtime.sendMessage({action: 'captureComplete', success: true});
  })
  .catch((error) => {
    console.error('Error:', error);
    chrome.runtime.sendMessage({action: 'captureComplete', success: false});
  });
}
