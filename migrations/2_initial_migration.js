const Termal = artifacts.require("../contracts/Termal");
const TermalToken = artifacts.require("../contracts/TermalToken");
const DaiToken = artifacts.require("../contracts/DaiToken");
const InvestorsHandler = artifacts.require("../contracts/InvestorsHandler");
const StartupsHandler = artifacts.require("../contracts/StartupsHandler");
const StartupToken = artifacts.require("../contracts/StartupToken");

//const InvestorContract = artifacts.require("../contracts/InvestorContract");
//const StartupContract = artifacts.require("../contracts/StartupContract");

require('dotenv').config({path: '../.env.local'});

module.exports = async function (deployer) {
  let addr = await web3.eth.getAccounts();
  //local
  let daiInstance = await deployer.deploy(DaiToken, process.env.INITIAL_TOKENS, {from: addr[0]});
  let termalToken = await deployer.deploy(TermalToken, process.env.INITIAL_TOKENST, {from: addr[0]});
  let startupToken = await deployer.deploy(StartupToken, process.env.STARTUP_TOKENS, {from: addr[0]});

  let investorsHandler = await deployer.deploy(InvestorsHandler, {from: addr[0]});
  let startupsHandler = await deployer.deploy(StartupsHandler, {from: addr[0]});

  await deployer.deploy(Termal, daiInstance.address, termalToken.address, investorsHandler.address, startupsHandler.address, {from: addr[0], value: 1000000000000000000});

  let termal = await Termal.deployed();
  await termalToken.transfer(termal.address, process.env.TOKENS_TO_CONTRACT, {from:addr[0]});
  await daiInstance.transfer(process.env.INVESTOR_ACCOUNT_1, process.env.DAI_TO_INVESTOR, {from:addr[0]});
  await daiInstance.transfer(process.env.INVESTOR_ACCOUNT_2, process.env.DAI_TO_INVESTOR, {from:addr[0]});

  
};