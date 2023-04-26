import { InjectedConnector } from '@web3-react/injected-connector'

export const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42, 5777, 11155111], //1 = mainnet, 3 = ropsten, 4 = rinkeby, 5 = goerli, 42 = kovan, local = 5777, sepolia =  11155111
})