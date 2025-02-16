document.addEventListener("DOMContentLoaded", () => {
  // Function to update insights display
  function updateInsightsDisplay() {


      // Update circle position based on category strengths
      const politicalStrength = RUNNING_AVERAGE["Political"];
      const circlePosition = 292 * politicalStrength / 2; // Assuming the bar width is 292px
      document.getElementById("political").style.left = `${circlePosition + 146}px`;

      // Update Luma Visualization if available
      if (visualizationUrl) {
        document.getElementById("lumaVisualization").innerHTML = `<iframe src="${visualizationUrl}" width="100%" height="400px"></iframe>`;
      }

  }

    let RUNNING_AVERAGE = {
      'Motivational': 0.0,
      'Educational': 0.0,
      'Financial': 0.0,
      'Political': 0.0
    };
  
    // Function to receive running average data
    function receiveRunningAverage(runningAverage) {
      RUNNING_AVERAGE = runningAverage;
      fetch("http://127.0.0.1:5002/update_running_average", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(runningAverage)
      })
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => { throw new Error(text) });
        }
      })
      .catch(error => {
        console.error("Error sending running average to side panel:", error);
      });
    }
  
    // Update insights every 5 seconds
    setInterval(updateInsightsDisplay, 5000);
  
    // Immediately update on page load
    updateInsightsDisplay();
  });
  
