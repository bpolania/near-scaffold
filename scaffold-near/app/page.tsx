'use client';
import { useState, useEffect } from 'react';
import AccountForm from '../components/AccountForm';

interface ContractFunction {
  name: string;
  kind: string;
  result?: {
    serialization_type: string;
    type_schema: {
      type: string;
    };
  };
  params?: {
    serialization_type: string;
    args: {
      name: string;
      type_schema: {
        type: string;
      };
    }[];
  };
}

interface NearAbi {
  schema_version: string;
  metadata: {
    name: string;
    version: string;
  };
  body: {
    functions: ContractFunction[];
    root_schema: {
      $schema: string;
      title: string;
      type: string;
    };
  };
}

const Home = () => {
  const [abi, setAbi] = useState<NearAbi | null>(null);

  useEffect(() => {
    const loadAbi = async () => {
      try {
        const response = await fetch('/abi/contract_abi.json');
        const abiData: NearAbi = await response.json();
        setAbi(abiData);
      } catch (error) {
        console.error('Error loading ABI:', error);
      }
    };
    loadAbi();
  }, []);

  return (
    <AccountForm abi={abi} />
  );
};

export default Home;