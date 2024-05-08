import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ContractFunctions from './ContractFunctions';

function App() {
  const [functions, setFunctions] = useState([]);

  useEffect(() => {
    fetchFunctions();
  }, []);

  const fetchFunctions = async () => {
    try {
      const response = await axios.get('http://localhost:3001');
      setFunctions(response.data.functions);
    } catch (error) {
      console.error('Error fetching functions:', error);
    }
  };

  return (
    <div>
      <h1>Smart Contract Functions</h1>
      <ContractFunctions functions={functions} />
    </div>
  );
}

export default App;