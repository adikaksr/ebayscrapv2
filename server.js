const express = require("express");
const { readFile } = require("fs");
const cors = require("cors");
const path = require("path"); // Import the path module
const { main } = require("./utils/index"); // Import your existing main function
const app = express();
const port = 3000;

app.use(express.static("public")); // Serve static files from the "public" directory
// Enable CORS for all routes
app.use(cors());

// Define a route to serve the index.html file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/scrape", async (req, res) => {
  const { url, filename } = req.query;

  if (!url || !filename) {
    return res.status(400).send("Invalid input.");
  }

  try {
    const response = await main(filename, url);
    res.status(200).send(response);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error scraping data.");
  }
});

app.get("/download/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = `result/${filename}`; // Replace with the actual file path

  // Read the file and send it as the response
  readFile(filePath, (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      res.status(500).send("Error reading file");
    } else {
      res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
      res.setHeader("Content-Type", "text/csv");
      res.send(data);
    }
  });
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
