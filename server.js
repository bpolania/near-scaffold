const fs = require('fs');
const path = require('path');

// Read the ABI file
const abiFilePath = path.join(__dirname, 'abi', 'contract_abi.json');
const abiData = JSON.parse(fs.readFileSync(abiFilePath, 'utf8'));

// Generate the HTML dynamically
const generateHtml = (abi) => {
  // Implement the same logic as in the AccountForm component
  // to generate the HTML based on the ABI
  let html = '<html><body>';
  html += '<h1>Contract Functions</h1>';
  html += '<ul>';
  abi.body.functions.forEach((func) => {
    html += `<li>${func.name}</li>`;
  });
  html += '</ul>';
  html += '</body></html>';
  return html;
};

// Create an HTTP server
const http = require('http');
const server = http.createServer((req, res) => {
  if (req.url === '/') {
    const html = generateHtml(abiData);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

// Start the server
const port = 3000;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});