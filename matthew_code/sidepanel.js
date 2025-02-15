// Function to capture screenshot
async function captureScreenshot() {
  try {
    const dataUrl = await new Promise((resolve, reject) => {
      chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(dataUrl);
        }
      });
    });
    
    // Save the screenshot
    await chrome.storage.local.set({ latestScreenshot: dataUrl });
    
    // Display the screenshot
    document.getElementById('screenshot').src = dataUrl;
    document.getElementById('screenshot').style.display = 'block';
    
    // Update message
    document.getElementById('message').textContent = "Screenshot captured and stored.";
    
    // Send to Vespa
    await sendToVespa(dataUrl);
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    document.getElementById('message').textContent = "Error capturing screenshot.";
  }
}

// Function to view latest screenshot
async function viewLatestScreenshot() {
  try {
    const result = await chrome.storage.local.get('latestScreenshot');
    if (result.latestScreenshot) {
      document.getElementById('screenshot').src = result.latestScreenshot;
      document.getElementById('screenshot').style.display = 'block';
      document.getElementById('message').textContent = "Displaying latest screenshot.";
    } else {
      document.getElementById('message').textContent = "No screenshot found.";
    }
  } catch (error) {
    console.error('Error viewing screenshot:', error);
    document.getElementById('message').textContent = "Error viewing screenshot.";
  }
}

// Function to send data to Vespa
async function sendToVespa(dataUrl) {
  const vespaEndpoint = 'https://your-vespa-instance.com/document/v1/namespace/doc_type/docid';
  
  try {
    const response = await fetch(vespaEndpoint, {
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
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    console.log('Success:', data);
    document.getElementById('message').textContent += " Sent to Vespa successfully.";
  } catch (error) {
    console.error('Error sending to Vespa:', error);
    document.getElementById('message').textContent += " Failed to send to Vespa.";
  }
}

// Event listeners
document.getElementById('captureButton').addEventListener('click', captureScreenshot);
document.getElementById('viewButton').addEventListener('click', viewLatestScreenshot);

// Optional: Initialize the view on load
document.addEventListener('DOMContentLoaded', viewLatestScreenshot);
