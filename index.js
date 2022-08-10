import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const withdrawButton = document.getElementById("withdrawButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
connectButton.onclick = connect;
withdrawButton.onclick = withdraw;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;

async function connect() {
  if (window.ethereum) {
    console.log("metamask exists");
    await window.ethereum.request({ method: "eth_requestAccounts" });
    console.log("connected");
    connectButton.innerHTML = "connected";
  } else {
    connectButton.innerHTML = "please install metamask";
    console.log("please install metamask");
  }
}

async function fund() {
  if (window.ethereum) {
    const ethAmount = document.getElementById("ethAmount").value;
    console.log(`funding with ${ethAmount}`);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    const balance = await provider.getBalance("ethers.eth");
    console.log("balance", balance);  
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      await listenForTransactionMine(transactionResponse, provider);
    } catch (error) {
      console.log(error);
    }
    console.log(
      "connected wallet address",
      await provider.getSigner().getAddress()
    );
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`mining ${transactionResponse.hash}`);
  return new Promise(function (resolve, reject) {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `completed with no of confirmations : ${transactionReceipt.confirmations}`
      );
      resolve();
    });
  });
}

async function getBalance() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const balance = await provider.getBalance(contractAddress);
  console.log(" balance " + (await ethers.utils.formatEther(balance)));
}
async function withdraw() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(contractAddress, abi, signer);
  try {
    const transactionResponse = await contract.withdraw()
    console.log("withdrawing")
    await listenForTransactionMine(transactionResponse,provider)

    
  } catch (error) {
    console.log(error);

  }
}
