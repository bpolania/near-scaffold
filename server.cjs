const fs = require('fs');
const path = require('path');
const express = require('express');
const { promisify } = require('util');
const chokidar = require('chokidar');
const exec = promisify(require('child_process').exec);
const { setTimeout } = require('timers/promises');

const http = require('http');
const socketIo = require('socket.io');

const app = express();

const server = http.createServer(app);
const io = socketIo(server);

let shouldReload = true;

io.on('connection', (socket) => {
  console.log('New client connected');
  if (shouldReload) {
    socket.emit('reload');
    shouldReload = false; // Prevent further reloads
  }
  socket.on('disconnect', () => {
      console.log('Client disconnected');
  });
});


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
      <script src="/socket.io/socket.io.js"></script>
      <script>
        const socket = io();
        socket.on('reload', () => {
          console.log('Reloading the page...');
          window.location.reload(true);
        });
      </script>
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



// File watching setup
const watcher = chokidar.watch(['src/contract.ts', 'build/near_scaffold.wasm'], {
  ignored: /^\./,
  persistent: true
});

let isProcessing = false;  // Lock flag to indicate if a process is currently running

watcher.on('change', async (path) => {
  console.log(`File ${path} has been changed`);
  await setTimeout(2000);
  if (isProcessing) {
    console.log("A process is already running, please wait...");
    return;  // Exit if another process is running
  }
    // Set the lock when a process starts
    isProcessing = true;
  try {
    if (path.endsWith('contract.ts')) {
      console.log("Building the contract...");
      const { stdout, stderr } = await exec('near-sdk-js build src/contract.ts build/near_scaffold.wasm');
      console.log(`Build stdout: ${stdout}`);
      if (stdout.includes("Executing")) {
        console.log("Contract build was successful!");
        isProcessing = false;  // Release the lock when the process completes
      } else {
        console.log("Failed to build contract.");
      }
      // if (stderr) console.error(`Build stderr: ${stderr}`);
    } else if (path.endsWith('near_scaffold.wasm')) {
      console.log("Generating ABI...");
      const { stdout, stderr } = await exec('npx near-sdk-js build --generateABI src/contract.ts');
      console.log(`ABI stdout: ${stdout}`);
      if (stdout.includes("success")) {
        isProcessing = false;  // Release the lock when the process completes
        await setTimeout(2000);
        if (stdout.includes("success")) {
          console.log("ABI successfully generated!");
          isProcessing = false;  // Release the lock when the process completes
          const output = fs.createWriteStream('./logs/output.log');
          output.write(stdout + '\n');
        } else {
          console.log("Failed to build contract.");
        }
      } else {
        console.log("Failed to build contract.");
      }
      // if (stderr) console.error(`Process stderr: ${stderr}`);
    }
  } catch (error) {
    console.error(`Error executing command: ${error}`);
  } 
});

// Serve the HTML string when the root URL is accessed
app.get('/', (req, res) => {
  const html = generateHtml(abiData);
  res.send(html); // Send the HTML string directly
});

// Set up your server to listen on a port
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('Server is running on http://localhost:3000');
});

