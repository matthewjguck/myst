document.getElementById('analyze').addEventListener('click', async () => {
  chrome.storage.local.get('screenshots', async (result) => {
    const screenshots = result.screenshots || [];
    if (screenshots.length) {
      const latest = screenshots[screenshots.length - 1];
      document.getElementById('message').textContent = "Performing OCR and sentiment analysis...";
      
      // Create a Tesseract worker
      const worker = Tesseract.createWorker({
        logger: m => console.log(m)  // Log progress for debugging
      });
      
      try {
        await worker.load();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        const { data: { text } } = await worker.recognize(latest.dataUrl);
        await worker.terminate();
        
        // Run sentiment analysis using the Sentiment library
        const sentiment = new Sentiment();
        const resultSentiment = sentiment.analyze(text);
        document.getElementById('message').textContent =
          `Extracted text: "${text.trim()}" | Sentiment Score: ${resultSentiment.score}`;
      } catch (err) {
        console.error(err);
        document.getElementById('message').textContent = "Error during OCR/sentiment analysis.";
      }
    } else {
      document.getElementById('message').textContent = "No screenshot available.";
    }
  });
});
