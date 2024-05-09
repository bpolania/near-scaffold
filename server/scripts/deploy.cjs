const fs = require('fs');
const nearAPI = require("near-api-js");
require("dotenv").config();

const CODE = "./build/contract.wasm";

const { keyStores } = nearAPI;
const myKeyStore = new keyStores.InMemoryKeyStore();
const PK = process.env.PK;
const deployer_account = process.env.ACCOUNT;

const keyPair = nearAPI.KeyPair.fromString(PK);

const { connect } = nearAPI;

async function deployContract() {
  try {
    await myKeyStore.setKey("testnet", deployer_account, keyPair);
    const connectionConfig = {
      networkId: "testnet",
      keyStore: myKeyStore,
      nodeUrl: "https://rpc.testnet.near.org",
      walletUrl: "https://testnet.mynearwallet.com/",
      helperUrl: "https://helper.testnet.near.org",
      explorerUrl: "https://testnet.nearblocks.io",
    };
    const nearConnection = await connect(connectionConfig);
    const account = await nearConnection.account(deployer_account);

    const transactionOutcome = await account.deployContract(
      fs.readFileSync(CODE)
    );

    // Extract the contract address from the transaction outcome
    const contractAddress = transactionOutcome.transaction.receiver_id;

    console.log(`Contract deployed successfully at address: ${contractAddress}`);
    return contractAddress;
  } catch (error) {
    console.error(`Error deploying contract: ${error}`);
    process.exit(1);
  }
}

deployContract();