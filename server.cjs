const fs = require('fs');
const path = require('path');
const express = require('express');
const { promisify } = require('util');
const chokidar = require('chokidar');
const exec = promisify(require('child_process').exec);
const { setTimeout } = require('timers/promises');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();

app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

let shouldReload = true;

function processAbiData() {
  const abiFilePath = path.join(__dirname, 'build', 'contract-abi.json');
  const abiData = JSON.parse(fs.readFileSync(abiFilePath, 'utf8'));

  const functionData = abiData.body.functions.map((func) => ({
    name: func.name,
    params: func.params ? func.params.args.map((arg) => arg.name) : [],
    isRead: func.kind === 'view' || func.kind === 'pure',
    isWrite: func.kind !== 'view' && func.kind !== 'pure',
  }));

  return functionData;
}

let functionData = processAbiData(); 

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

// File watching setup
const watcher = chokidar.watch(['server/src/contract.ts', 'build/near_scaffold.wasm'], {
  ignored: /^\./,
  persistent: true
});

let isProcessing = false; // Lock flag to indicate if a process is currently running

watcher.on('change', async (path) => {
  console.log(`File ${path} has been changed`);
  await setTimeout(2000);
  if (isProcessing) {
    console.log("A process is already running, please wait...");
    return; // Exit if another process is running
  }
  // Set the lock when a process starts
  isProcessing = true;
  try {
    if (path.endsWith('contract.ts')) {
      console.log("Building the contract...");
      const { stdout, stderr } = await exec('near-sdk-js build server/src/contract.ts build/near_scaffold.wasm');
      console.log(`Build stdout: ${stdout}`);
      if (stdout.includes("Executing")) {
        console.log("Contract build was successful!");
        isProcessing = false; // Release the lock when the process completes
      } else {
        console.log("Failed to build contract.");
      }
      // if (stderr) console.error(`Build stderr: ${stderr}`);
    } else if (path.endsWith('near_scaffold.wasm')) {
      console.log("Generating ABI...");
      const { stdout, stderr } = await exec('npx near-sdk-js build --generateABI server/src/contract.ts');
      console.log(`ABI stdout: ${stdout}`);
      if (stdout.includes("success")) {
        isProcessing = false; // Release the lock when the process completes
        await setTimeout(2000);
        if (stdout.includes("success")) {
          console.log("ABI successfully generated!");
          isProcessing = false; // Release the lock when the process completes
          functionData = processAbiData();
          await setTimeout(500);
          io.emit('reload');
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

// Serve the JSON response when the root URL is accessed
app.get('/', async (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.json({
    functions: functionData,
  });
});

// Set up your server to listen on a port
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log('Server is running on http://localhost:3001');
});