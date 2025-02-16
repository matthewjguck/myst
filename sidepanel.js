document.addEventListener("DOMContentLoaded", () => {
  // Function to update insights display based on the fetched running average
  function updateInsightsDisplay() {
    fetch("http://127.0.0.1:5002/data")
      .then(response => response.json())
      .then(data => {
      RUNNING_AVERAGE = data;

      const politicalStrength = RUNNING_AVERAGE["Political"];
      const politicalPosition = 292 * politicalStrength / 2;
      document.getElementById("political").style.left = `${politicalPosition + 146}px`;

      const economicStrength = RUNNING_AVERAGE["Financial"];
      const economicPosition = 292 * economicStrength / 2;
      document.getElementById("economic").style.left = `${economicPosition + 146}px`;

      const motivationalStrength = RUNNING_AVERAGE["motivational"];
      const motivationalPosition = 292 * motivationalStrength / 2;
      document.getElementById("motivational").style.left = `${motivationalPosition + 146}px`;

      const educationalStrength = RUNNING_AVERAGE["Educational"];
      const educationalPosition = 292 * educationalStrength / 2;
      document.getElementById("educational").style.left = `${educationalPosition + 146}px`;


      });
      

  }

  // Update insights every 5 seconds
  setInterval(updateInsightsDisplay, 5000);

  // Immediately update on page load
  updateInsightsDisplay();
});



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
  
  document.addEventListener("DOMContentLoaded", () => {
    // Array of blob image URLs. You might generate this list on the server
    // or hardcode it if it's fixed.
    const blobImages = [
      "blobs/dalle1.png",
      "blobs/dalle2.png",
      "blobs/dalle3.png",
      "blobs/dalle4.png",
      "blobs/dalle5.png",
      "blobs/dalle6.png",
      "blobs/dalle7.png",
      // add more blob paths as needed
    ];
  
    let currentImageIndex = 0;
  
    function updateBlobImage() {
      // Get the image element where you want to display the blob
      const imageElement = document.getElementById("blobImage");
      if (!imageElement) return;
  
      // Set the src attribute to the current blob image
      imageElement.src = blobImages[currentImageIndex];
  
      // Move to the next image (loop back to start if needed)
      currentImageIndex = (currentImageIndex + 1) % blobImages.length;
    }
  
    // Update the blob image every 30 seconds (30,000 ms)
    setInterval(updateBlobImage, 10000);
  
    // Immediately update the image on page load
    updateBlobImage();
  });
  