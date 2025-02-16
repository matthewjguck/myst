chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "captureScreenshot") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        sendResponse({ error: "No active tab found." });
        return;
      }

      chrome.tabs.captureVisibleTab(tabs[0].windowId, { format: "png" }, (dataUrl) => {
        if (chrome.runtime.lastError) {
          console.error("Error capturing screenshot:", chrome.runtime.lastError.message);
          sendResponse({ error: "Error capturing screenshot." });
          return;
        }

        chrome.storage.local.get("screenshots", (result) => {
          const screenshots = result.screenshots || [];
          const screenshot = { dataUrl, timestamp: new Date().toISOString() };
          screenshots.push(screenshot);

          chrome.storage.local.set({ screenshots }, () => {
            sendResponse({ dataUrl, message: "Screenshot captured and saved." });
          });
        });
      });

      return true;
    });

    return true;
  }

  sendResponse({ error: "Invalid action." });
  return true;
});