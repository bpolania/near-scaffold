import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ContractFunctions from './ContractFunctions';
import { io } from 'socket.io-client';

function App() {
  const [functions, setFunctions] = useState([]);

  useEffect(() => {
    fetchFunctions();
  }, []);

  useEffect(() => {
    const socket = io('http://localhost:3001');
    socket.on('reload', () => {
      window.location.reload(true);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchFunctions = async () => {
    try {
      const response = await axios.get('http://localhost:3001?timestamp=' + Date.now());
      setFunctions(response.data.functions);
    } catch (error) {
      console.error('Error fetching functions:', error);
    }
  };

  const deployContract = async () => {
    try {
      const response = await axios.post('http://localhost:3001/deploy');
      console.log(response.data.message);
      // Handle the successful deployment response
    } catch (error) {
      console.error('Error deploying contract:', error);
      // Handle the deployment error
    }
  };

  return (
    <div>
      <h1>Smart Contract Functions</h1>
      <button onClick={deployContract}>Deploy Contract</button>
      <ContractFunctions functions={functions} />
    </div>
  );
}

export default App;