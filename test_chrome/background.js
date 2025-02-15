chrome.runtime.onInstalled.addListener(() => {
    console.log("Auto Screen Capture Extension Installed");
  });
  
  chrome.alarms.create("captureScreen", { periodInMinutes: 0.1 }); // Capture every 6 seconds
  
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "captureScreen") {
      chrome.tabs.captureVisibleTab(null, { format: "png" }, (image) => {
        if (image) {
          console.log("Captured screenshot");
          chrome.storage.local.set({ lastCapture: image });
        }
      });
    }
  });