document.addEventListener("DOMContentLoaded", () => {
  // Function to update insights display based on the fetched running average
  function updateInsightsDisplay() {
    fetch("http://127.0.0.1:5002/data")
      .then(response => response.json())
      .then(data => {
      RUNNING_AVERAGE = data;

      const politicalStrength = RUNNING_AVERAGE["Political"];
      const politicalPosition = 292 * politicalStrength / 2;

      if (politicalPosition > 146) {
        politicalPosition = 146;
      } else if (politicalPosition < -146) {
        politicalPosition = -146;
      }

      document.getElementById("political").style.left = `${politicalPosition + 146}px`;
    

      const economicStrength = RUNNING_AVERAGE["Financial"];
      const economicPosition = 292 * economicStrength / 2;

      if (economicPosition > 146) {
        economicPosition = 146;
      } else if (economicPosition < -146) {
        economicPosition = -146;
      }

      document.getElementById("economic").style.left = `${economicPosition + 146}px`;

      const motivationalStrength = RUNNING_AVERAGE["Motivational"];
      const motivationalPosition = 292 * motivationalStrength / 2;

      if (motivationalPosition > 146) {
        motivationalPosition = 146;
      } else if (motivationalPosition < -146) {
        motivationalPosition = -146;
      }

      document.getElementById("tonal").style.left = `${motivationalPosition + 146}px`;

      const educationalStrength = RUNNING_AVERAGE["Educational"];
      const educationalPosition = 292 * educationalStrength / 2;

      if (educationalPosition > 146) {
        educationalPosition = 146;
      } else if (educationalPosition < -146) {
        educationalPosition = -146;
      }

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
      "blobs/image 72.png",
      "blobs/image 73.png",
      "blobs/image 74.png",
      "blobs/image 75.png",
      "blobs/image 76.png",
      "blobs/image 77.png",
      "blobs/image 78.png",
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
  
   
    setInterval(updateBlobImage, 60000);
  
    // Immediately update the image on page load
    updateBlobImage();
  });
  