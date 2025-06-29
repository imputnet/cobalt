document.addEventListener('DOMContentLoaded', function() {
  // New Cobalt download button listener
  const downloadButton = document.getElementById('downloadButton');
  const videoUrlInput = document.getElementById('videoUrl');

  if (downloadButton && videoUrlInput) {
    downloadButton.addEventListener('click', function() {
      const videoUrl = videoUrlInput.value.trim();
      if (videoUrl) {
        // Basic URL validation (optional, but good practice)
        try {
          new URL(videoUrl); // Check if it's a valid URL format
          const cobaltUrl = `https://cobalt.tools/?url=${encodeURIComponent(videoUrl)}`;
          chrome.tabs.create({ url: cobaltUrl });
        } catch (error) {
          alert('Please enter a valid URL.');
          console.error('Invalid URL:', error);
        }
      } else {
        alert('Please enter a video URL.');
      }
    });
  } else {
    if (!downloadButton) {
      console.error('Button with ID "downloadButton" not found.');
    }
    if (!videoUrlInput) {
      console.error('Input field with ID "videoUrl" not found.');
    }
  }
});
