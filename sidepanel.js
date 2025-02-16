document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("capture").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "captureScreenshot" }, (response) => {
      if (!response) {
        document.getElementById("message").textContent = "No response from background script.";
        return;
      }

      if (response.error) {
        document.getElementById("message").textContent = response.error;
        return;
      }

      document.getElementById("message").textContent = response.message;
      document.getElementById("latestScreenshot").src = response.dataUrl;
    });
  });

  document.getElementById("viewAll").addEventListener("click", () => {
    chrome.storage.local.get("screenshots", (result) => {
      const screenshots = result.screenshots || [];
      const listContainer = document.getElementById("screenshotList");
      listContainer.innerHTML = "";

      if (screenshots.length) {
        screenshots.forEach((shot, index) => {
          const container = document.createElement("div");
          container.className = "screenshot-item";

          const img = document.createElement("img");
          img.src = shot.dataUrl;
          img.style.width = "100%";
          img.alt = `Screenshot ${index + 1}`;

          const timestamp = document.createElement("div");
          timestamp.className = "timestamp";
          timestamp.textContent = `Captured at: ${shot.timestamp}`;

          container.appendChild(img);
          container.appendChild(timestamp);
          listContainer.appendChild(container);
        });

        document.getElementById("message").textContent = `Displaying all ${screenshots.length} screenshot(s).`;
        document.getElementById("latestScreenshot").src = "";
      } else {
        document.getElementById("message").textContent = "No screenshots found.";
      }
    });
  });
});
