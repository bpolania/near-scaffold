const fs = require('fs');
const path = require('path');
const express = require('express');
const http = require('http');

const app = express();

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Read the ABI file
const abiFilePath = path.join(__dirname, 'build', 'contract-abi.json');
const abiData = JSON.parse(fs.readFileSync(abiFilePath, 'utf8'));

const generateHtml = (abi) => {
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Contract Functions</title>
      <link rel="stylesheet" href="css/styles.css">
      <link rel="icon" type="image/x-icon" href="/images/favicon.ico">
    </head>
    <body>
      <form id="contractFunctionsForm">
        <h2>Contract Functions</h2>
  `;

  abi.body.functions.forEach((func) => {
    html += `
      <div class="form-group">
        <label for="${func.name}">${func.name}</label>
    `;

    if (func.params && func.params.args.length > 0) {
      func.params.args.forEach((arg) => {
        html += `
          <input type="text" id="${arg.name}" name="${arg.name}" placeholder="${arg.name}">
        `;
      });
    }

    html += `
        <button type="submit" class="${func.kind === 'view' || func.kind === 'pure' ? 'read-only' : 'write'}">
          ${func.kind === 'view' || func.kind === 'pure' ? 'Read' : 'Write'}
        </button>
      </div>
    `;
  });

  html += `
      </form>
    </body>
    </html>
  `;

  return html;
};

// Set up your server to listen on a port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Serve the HTML string when the root URL is accessed
app.get('/', (req, res) => {
  const html = generateHtml(abiData);
  res.send(html); // Send the HTML string directly
});

