document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get("lastCapture", (data) => {
    if (data.lastCapture) {
      console.log("Loading screenshot into popup.");
      document.getElementById("screenshot").src = data.lastCapture;
    } else {
      console.log("No screenshot found.");
    }
  });
});
