document.addEventListener("DOMContentLoaded", () => {
  // Function to update insights display
  function updateInsightsDisplay() {
    chrome.storage.local.get(["classification_vector", "visualization_url"], (result) => {
      const vector = result.classification_vector || {};
      const visualizationUrl = result.visualization_url || "";

      // Display category scores
      let insightsText = "Category Strengths:\n";
      for (const category in vector) {
        insightsText += `${category}: ${(vector[category] * 100).toFixed(1)}%\n`;
      }
      document.getElementById("insights").textContent = insightsText;

      // Update Luma Visualization if available
      if (visualizationUrl) {
        document.getElementById("lumaVisualization").innerHTML = `<iframe src="${visualizationUrl}" width="100%" height="400px"></iframe>`;
      }
    });
  }

  // Update insights every 5 seconds
  setInterval(updateInsightsDisplay, 5000);

  // Immediately update on page load
  updateInsightsDisplay();
});
