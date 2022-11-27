const main = async () => {
  const [owner, otherUser] = await hre.ethers.getSigners();
  const waveContractFactory = await hre.ethers.getContractFactory("WavePortal");
  const waveContract = await waveContractFactory.deploy({
    value: hre.ethers.utils.parseEther("0.1"),
  });
  await waveContract.deployed();
  console.log("Contract deployed to: ", waveContract.address);
  console.log("Contract deployed by: ", owner.address);

  let contractBalance = await hre.ethers.provider.getBalance(
    waveContract.address
  );

  console.log(
    "Contract Balance: ",
    hre.ethers.utils.formatEther(contractBalance)
  );

  await waveContract.getTotalWaves();

  const firstWaveTxn = await waveContract.wave("Setting up My Waves.");
  await firstWaveTxn.wait();
  contractBalance = await hre.ethers.provider.getBalance(waveContract.address);
  console.log(
    "Contract Balance: ",
    hre.ethers.utils.formatEther(contractBalance)
  );

  await waveContract.getTotalWaves();

  const secondWaveTxn = await waveContract
    .connect(otherUser)
    .wave("Also setting My Waves.");
  await secondWaveTxn.wait();
  contractBalance = await hre.ethers.provider.getBalance(waveContract.address);
  console.log(
    "Contract Balance: ",
    hre.ethers.utils.formatEther(contractBalance)
  );

  await waveContract.getTotalWaves();

  const thirdtWaveTxn = await waveContract.wave("Shouldn't go through.");
  await thirdWaveTxn.wait();

  let allWaves = await waveContract.getAllWaves();
  console.log(allWaves);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(0);
  }
};

runMain();
