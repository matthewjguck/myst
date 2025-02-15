// Capture the visible part of the active tab and store it
document.getElementById('capture').addEventListener('click', () => {
  chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      document.getElementById('message').textContent = "Error capturing screenshot.";
      return;
    }
    // Save the screenshot data URL to chrome.storage.local
    chrome.storage.local.set({ latestScreenshot: dataUrl }, () => {
      document.getElementById('message').textContent = "Screenshot captured and stored.";
      // Optionally, clear the current image display:
      document.getElementById('screenshot').src = "";
    });
  });
});

// Retrieve and display the stored screenshot
document.getElementById('view').addEventListener('click', () => {
  chrome.storage.local.get('latestScreenshot', (result) => {
    if (result.latestScreenshot) {
      document.getElementById('screenshot').src = result.latestScreenshot;
      document.getElementById('message').textContent = "Displaying latest screenshot.";
    } else {
      document.getElementById('message').textContent = "No screenshot found.";
    }
  });
});
