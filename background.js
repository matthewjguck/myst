chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

console.log("Background script loaded. Automatic screenshot classification enabled.");

// Function to capture a screenshot and classify it
function captureAndClassify() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) {
      console.error("No active tab found.");
      return;
    }

    chrome.tabs.captureVisibleTab(tabs[0].windowId, { format: "png" }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        console.error("Error capturing screenshot:", chrome.runtime.lastError.message);
        return;
      }

      console.log("Screenshot captured. Sending for classification...");

      fetch("http://127.0.0.1:5002/analyze_screenshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl, user_id: "default_user" }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            console.error("Error from classification API:", data.error);
          } else {
            console.log("Classification result:", data);

            /// Retrieve the current classification vector
            chrome.storage.local.get("classification_vector", (result) => {
              let updatedVector = result.classification_vector || {};

              // Update classification vector dynamically
              for (const category in data.category_scores) {
                if (updatedVector[category]) {
                  updatedVector[category] = (
                    updatedVector[category] * 0.8 + data.category_scores[category] * 0.2
                  ); // Weighted rolling update (80% old, 20% new)
                } else {
                  updatedVector[category] = data.category_scores[category];
                }
              }

              // Save updated vector
              chrome.storage.local.set({ classification_vector: updatedVector });
            });
          }
        })
        .catch(error => console.error("Failed to send screenshot:", error));
    });
  });
}

// Automatically capture a screenshot when a tab updates (page load or navigation)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    console.log(`Tab updated: ${tab.url}`);
    captureAndClassify();
  }
});

// Manual trigger for capturing a screenshot
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "captureScreenshot") {
    captureAndClassify();
    sendResponse({ message: "Screenshot captured and sent for classification." });
    return true;
  }

  if (message.action === "getClassificationVector") {
    chrome.storage.local.get("classification_vector", (result) => {
      sendResponse({ classification_vector: result.classification_vector || {} });
    });

    return true;
  }

  sendResponse({ error: "Invalid action." });
  return true;
});
