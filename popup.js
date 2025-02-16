// Capture screenshot and store it locally
document.getElementById('capture').addEventListener('click', () => {
  chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      document.getElementById('message').textContent = "Error capturing screenshot.";
      return;
    }
    
    // Create a screenshot object with the current timestamp
    const screenshot = {
      dataUrl: dataUrl,
      timestamp: new Date().toISOString()
    };

    // Retrieve existing screenshots, add the new one, and save it
    chrome.storage.local.get("screenshots", (result) => {
      const screenshots = result.screenshots || [];
      screenshots.push(screenshot);
      chrome.storage.local.set({ screenshots: screenshots }, () => {
        document.getElementById('message').textContent = "Screenshot captured and stored.";
        document.getElementById('latestScreenshot').src = dataUrl;
      });
    });
  });
});

// View the latest captured screenshot
document.getElementById('viewLatest').addEventListener('click', () => {
  chrome.storage.local.get("screenshots", (result) => {
    const screenshots = result.screenshots || [];
    if (screenshots.length) {
      const latest = screenshots[screenshots.length - 1];
      document.getElementById('latestScreenshot').src = latest.dataUrl;
      document.getElementById('message').textContent = `Displaying latest screenshot taken at ${latest.timestamp}.`;
      document.getElementById('screenshotList').innerHTML = "";
    } else {
      document.getElementById('message').textContent = "No screenshot found.";
      document.getElementById('latestScreenshot').src = "";
    }
  });
});

// View all captured screenshots in a scrollable list
document.getElementById('viewAll').addEventListener('click', () => {
  chrome.storage.local.get("screenshots", (result) => {
    const screenshots = result.screenshots || [];
    const listContainer = document.getElementById('screenshotList');
    listContainer.innerHTML = "";
    
    if (screenshots.length) {
      screenshots.forEach((shot, index) => {
        // Create a container for each screenshot
        const container = document.createElement('div');
        container.className = 'screenshot-item';
        
        // Create an image element
        const img = document.createElement('img');
        img.src = shot.dataUrl;
        img.style.width = "100%";
        img.alt = `Screenshot ${index + 1}`;
        
        // Create a timestamp element
        const timestamp = document.createElement('div');
        timestamp.className = 'timestamp';
        timestamp.textContent = `Captured at: ${shot.timestamp}`;
        
        container.appendChild(img);
        container.appendChild(timestamp);
        listContainer.appendChild(container);
      });
      document.getElementById('message').textContent = `Displaying all ${screenshots.length} screenshot(s).`;
      document.getElementById('latestScreenshot').src = "";
    } else {
      document.getElementById('message').textContent = "No screenshots found.";
    }
  });
});
