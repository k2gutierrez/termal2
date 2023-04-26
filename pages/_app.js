import 'Q/styles/globals.css'
import "@rainbow-me/rainbowkit/styles.css";
import Head from 'next/head'
import 'bootstrap/dist/css/bootstrap.min.css'
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { mainnet, sepolia, localhost } from 'wagmi';
import { infuraProvider } from "wagmi/providers/infura";
import { publicProvider } from "wagmi/providers/public";
import Navbar from 'Q/components/Navbar';
//import { Web3ReactProvider } from '@web3-react/core'
//import Web3 from 'web3'}

const infuraId = process.env.NEXT_PUBLIC_INFURA_ID;

const { chains, provider } = configureChains(
  [sepolia],
  [infuraProvider({infuraId}), publicProvider()],
)

const { connectors } = getDefaultWallets({
  appName: "Termal",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});


export default function App({ Component, pageProps }) {
  return (
    <>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider chains={chains}>
          <Head><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
          <Navbar />
          <Component {...pageProps} />
        </RainbowKitProvider>
      </WagmiConfig>
    </>
  )
}
