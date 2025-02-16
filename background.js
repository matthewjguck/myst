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

  if (message.action === "extractText") {
    chrome.storage.local.get("screenshots", (result) => {
      if (!result.screenshots || result.screenshots.length === 0) {
        sendResponse({ error: "No screenshots found." });
        return;
      }

      const latestScreenshot = result.screenshots[result.screenshots.length - 1].dataUrl;

      fetch("http://127.0.0.1:5001/extract_text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: latestScreenshot }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            sendResponse({ error: data.error });
          } else {
            sendResponse({ text: data.text });
          }
        })
        .catch(error => {
          console.error("Error fetching OCR data:", error);
          sendResponse({ error: "Failed to extract text." });
        });

      return true; // Keep sendResponse valid for async fetch
    });

    return true;
  }

  sendResponse({ error: "Invalid action." });
  return true;
});