document.getElementById('captureButton').addEventListener('click', () => {
    chrome.runtime.sendMessage({action: 'captureTab'});
    document.getElementById('status').textContent = 'Capturing...';
  });
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'captureComplete') {
      document.getElementById('status').textContent = request.success ? 
        'Capture successful!' : 'Capture failed. Please try again.';
    }
  });