document.addEventListener("DOMContentLoaded", () => {
  const scrapeButton = document.getElementById("scrapeButton");
  const loadingContainer = document.getElementById("loading-container");
  const contentContainer = document.getElementById("content-container");
  const linkContainer = document.getElementById("link-container");

  scrapeButton.addEventListener("click", async () => {
    const urlInput = document.getElementById("url");
    const filenameInput = document.getElementById("filename");

    const url = urlInput.value;
    const filename = filenameInput.value;

    if (!url || !filename) {
      alert("Please provide both URL and filename.");
      return;
    }
    // Show loading animation
    scrapeButton.setAttribute("disabled", true);
    loadingContainer.classList.remove("hidden");
    contentContainer.classList.add("cursor-disable");
    urlInput.readOnly = true;
    filenameInput.readOnly = true;
    console.log(url, filename);
    try {
      const response = await fetch(
        `/scrape?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(
          filename
        )}`
      );
      const data = await response.json();
      // Hide loading animation and display content
      urlInput.readOnly = false;
      filenameInput.readOnly = false;
      loadingContainer.classList.add("hidden");
      contentContainer.classList.remove("cursor-disable");
      scrapeButton.disabled = false;
      if (response.ok) {
        const pElement = document.createElement("p");
        pElement.textContent = `File ready in ${data.fileLocation}`;
        linkContainer.appendChild(pElement);
        urlInput.value = "";
        filenameInput.value = "";
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  });
});
