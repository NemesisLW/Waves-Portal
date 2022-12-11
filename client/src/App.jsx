import React, {useEffect, useState} from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json";
import { networks } from './utils/networks';
import { Player } from '@lottiefiles/react-lottie-player';


const getEthereumObject = () => window.ethereum;


const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [waveCount, setWaveCount] = useState(0);
  const [allWaves, setAllWaves] = useState([]);
  const [waverMessage, setWaverMessage] = useState("");
  const [network, setNetwork] = useState('');
  const [loading, setLoading] = useState(false);

  const contractAddress ="0x62a0d870D919227ec46c36E1235e4103835BE4eF"; 
  const contractABI = abi.abi;

  
  const checkIfWalletConnected = async () => {
  try {
    const ethereum = getEthereumObject();
    if (!ethereum) {
      console.error("Make sure you have metamask!");
      return null;
    }
    console.log("We have the ethereum object", ethereum);
    const accounts = await ethereum.request({method: "eth_accounts"});
    let chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log("Connected to chain " + chainId);
      setNetwork(networks[chainId]);
    
      const goerliChainId = "0x5"; 

      ethereum.on('chainChanged', handleChainChanged);
      
      // Reload the page when they change networks
        function handleChainChanged(_chainId) {
          window.location.reload();
        }
    
      if (chainId !== goerliChainId) {
      	alert("You are not connected to the Goerli Test Network!");
      }

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account: ", account);
      getAllWaves();
      return account;
    } else {
      console.error("No authorized account found");
      return null;
    }
  } catch (err) {
    console.error(err);
    return null;
  }
};


  const switchNetwork = async () => {
    if (window.ethereum) {
      try {
        // Try to switch to the Mumbai testnet
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x5' }], // Check networks.js for hexadecimal network ids
        });
      } catch (error) {
        // This error code means that the chain we want has not been added to MetaMask
        // In this case we ask the user to add it to their MetaMask
        if (error.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {	
                  chainId: '0x5',
                  chainName: 'Goerli test network',
                  rpcUrls: ['https://goerli.infura.io/v3/'],
                  nativeCurrency: {
                      name: "Goerli Ethereum",
                      symbol: "GoerliETH",
                      decimals: 18
                  },
                  blockExplorerUrls: ["https://goerli.etherscan.io"]
                },
              ],
            });
          } catch (error) {
            console.log(error);
          }
        }
        console.log(error);
      }
    } else {
      // If window.ethereum is not found then MetaMask is not installed
      alert('MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html');
    } 
}

  const renderWaveButton = () => {

    console.log(network);

    if (network !== 'Goerli') {
    return (
      <div className="connect-wallet-container">
        <button className="waveButton" onClick={switchNetwork}>Please Connect to Goerli Testnet</button>
      </div>
    );
    }
    
    
  }
  
  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const waves = await wavePortalContract.getAllWaves();

        let cleanedWaves = [];
        waves.forEach(wave => {
          cleanedWaves.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });
        setAllWaves(cleanedWaves);
        
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (err) {
      console.log(err);
    }
  }
  

  const connectWallet = async () => {
    
    try {
      const ethereum = getEthereumObject();
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request(
        {method: "eth_requestAccounts",}
      );
      
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error(err);
    }
  };

  
  const disconnectWallet = async () => {
    try {
      setCurrentAccount(null);
    } catch (error) {
      console.error(err);
    }
  }


  const getWaveCount = async() => {
    const {ethereum} = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const wavePortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer);
  
      let count = await wavePortalContract.getTotalWaves();
      setWaveCount(count.toNumber());     
    }
  }

  const wave = async () => {
    if (network !== 'Goerli') {
      alert("Switch to Goerli Network to wave :)")
    } 
     
    try {
        const { ethereum } = window;

        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const wavePortalContract = new ethers.Contract(
            contractAddress,
            contractABI,
            signer
          );

          let count = await wavePortalContract.getTotalWaves();
          console.log("Retrieved total wave count...", count.toNumber());
          
          const waveTxn = await wavePortalContract.wave(waverMessage,{ gasLimit: 300000 });
          setLoading(true);
          console.log("Mining...", waveTxn.hash);
          await waveTxn.wait();
          console.log("Mined -- ", waveTxn.hash);

          count = await wavePortalContract.getTotalWaves();
          getWaveCount();
          console.log("Retrieved total wave count...", count.toNumber());
          window.location.reload();
          
        } else {
          console.log("Ethereum object doesn't exist!");
        }
      } catch(err) {
        console.error(err);
      }
    }



    const loadingScreen = () => (
    <div>
    <Player
      autoplay
      loop
      src="https://assets8.lottiefiles.com/packages/lf20_nvzik8vy.json"
      style={{ height: '150px', width: '150px' }}> </Player>
      </div>
  );
  
  useEffect(() => {
    
    checkIfWalletConnected();
    getWaveCount();

    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message);
      setLoading(false);
      setAllWaves(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };
    
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      wavePortalContract = new ethers.Contract(
        contractAddress, 
        contractABI, 
        signer);

      wavePortalContract.on("NewWave", onNewWave);
    }

    return () => {
      if(wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    }
    
  }, []);
 

  return (
    <div className="mainContainer">
      <div className="dataContainer">
         { currentAccount ? <p className="wallet"> Wallet: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)} </p> : <p className="wallet"> Not connected </p> }
        <div className="header">
          Hey there!
        </div>
        <div className="header">
          Kindly State Your Grievances
        </div>

        <div className="bio">
          Help me become a better person.
          {currentAccount && <h3>Total Wave Count : {waveCount}</h3>}
        </div>
        {!loading ?
        <div>
        {currentAccount && 
          (<div className="prompt-container">
            <textarea className="prompt-box"
              name="message"
                     rows="10"
                     cols="70"
                     placeholder="Please state how I made you feel bad..."
                     value={waverMessage}
                     type="text"
                     onChange={e => setWaverMessage(e.target.value)}/>
            </div>
          )}
        </div> : loadingScreen()}

          {!loading ? renderWaveButton() : null}
        
          {!loading ?  <button className="waveButton" onClick={wave}>
            Wave at Me
          </button> : null}
          
        {!loading ? !currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>) : null}

        {!loading ? currentAccount && (
          <button className="waveButton" onClick={disconnectWallet}>
            Disconnect Wallet
          </button>) : null}

        

        <h1> Grievance Log </h1>
        {allWaves.slice(0).reverse().map((wave, index) => {
          return (
            <div className="messageContainer" key={index} style={
            { marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default App;
