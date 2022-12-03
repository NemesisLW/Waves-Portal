import React, {useEffect, useState} from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json";
// import {BounceLoader} from "react-spinners";


const getEthereumObject = () => window.ethereum;


const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [waveCount, setWaveCount] = useState(0);
  const [allWaves, setAllWaves] = useState([]);
  const [waverMessage, setWaverMessage] = useState("");
  // const [loading, setLoading] = useState(false);

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
      
      const goerliChainId = "0x5"; 
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
  
  
  useEffect(async () => {
    const account = await checkIfWalletConnected();
    if (account !== null) {
      setCurrentAccount(account);
    }
    
    getWaveCount();

    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message);
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
        <div className="header">
          Hey there!
        </div>
        <div className="header">
          Kindly State Your Grievances
        </div>

        <div className="bio">
          Help me become a better person.
          {/* {loading ? <h2><BounceLoader size={45} color="#454545"/></h2> : <p></p>} */}
          {currentAccount && <h3>Total Wave Count : {waveCount}</h3>}
        </div>
        
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
        </div>
        
          <button className="waveButton" onClick={wave}>
            Wave at Me
          </button>
          
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>)}

        {currentAccount && (
          <button className="waveButton" onClick={disconnectWallet}>
            Disconnect Wallet
          </button>)}

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
