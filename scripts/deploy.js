// const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const accountBalance = await deployer.getBalance();

  console.log("Deploying contracts with account: ", deployer.address);
  console.log("Account Balance: ", accountBalance.toString());

  const waveContractFactory = await hre.ethers.getContractFactory("WavePortal");
  const waveContract = await waveContractFactory.deploy({
    value: hre.ethers.utils.parseEther("0.01"),
  });

  await waveContract.deployed();

  console.log("Contract deployed to: ", waveContract.address);
}

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();

// 0x8E54Bcc234db726f4257EEdA33B333770eF30A3F

// 0xA2091f5083d372630a11d26Cef1b1F1b25330f92

// 0xfFE93e0CF56402ddE5eE3f1fB96601367d9CbA9F

// 0x62a0d870D919227ec46c36E1235e4103835BE4eF

// NOT IMPLEMENTED YET - 0xA7057105cB83DAf6c59B193456566fFcb53781fa
