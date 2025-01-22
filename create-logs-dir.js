const fs = require("fs");
const path = require("path");

const logsDir = path.join(__dirname, "public/storage/logs");

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  console.log("Created logs directory.");
} else {
  console.log("Logs directory already exists.");
}
