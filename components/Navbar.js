import { useContractRead, useAccount, useBalance } from 'wagmi';
import ConnectBtn from "./Connectbtn";
import Link from "next/link";
import { useState, useEffect } from 'react';
import termal from './contracts/Termal';
import startupsHandler from './contracts/StartupsHandler';
import investorHandler from './contracts/InvestorsHandler';
import InvestorContract from './contracts/InvestorContract';
import { contractKeys } from './engine/configuration';
import { useIsMounted } from 'Q/pages/hooks/useIsMounted';

export default function Navbar() {
    
    const { address, isConnected, isDisconnected } = useAccount();
    const mounted = useIsMounted();
    const [termalBalance, settermalBalance] =  useState(0);
    const [count, setCount] = useState(0);
    const [daitoken, setdaitoken] = useState(0);
    const [termaltoken ,setTermaltoken] = useState(0);
    
    let [investorContract, setinvestorContract] = useState("");
    let [investorContractReadStatus, setInvestorContractReadStatus] = useState(false);
    let [startupContractReadStatus, setStartupContractReadStatus] = useState(false);
    let [isInvestor, setisInvestor] = useState(false);
    let [isStartup, setisStartup] = useState(false);
    
    const ownerRead = useContractRead({
        address: contractKeys.termalKey,
        abi: termal.abi,
        functionName: "owner",
    })

    const isOwner = Boolean(ownerRead.data === address);  

    const daitotalSupplyR = useContractRead({
        address: contractKeys.termalKey,
        abi: termal.abi,
        functionName: "getDaiContractBalance",
        select: (data) => parseInt(data / (10 ** 18)),
        watch: true,
    })
    const daitotalSupply = daitotalSupplyR.data;

    const termaltotalSupplyR = useContractRead({
        address: contractKeys.termalKey,
        abi: termal.abi,
        functionName: "getTermalTotalSupply",
        select: (data) => parseInt(data / (10 ** 18)),
        watch: true,
    })
    const termaltotalSupply = termaltotalSupplyR.data;

    const balance = useBalance({
        address: contractKeys.termalKey,
        token: contractKeys.TermalTokenContractKey,
        watch: true,
    })

    const daitokenR = useBalance({
        address: address,
        token: contractKeys.DaiTokenContractKey,
        watch: true,
    })

    const termaltokenR = useBalance({
        address: address,
        token: contractKeys.TermalTokenContractKey,
        watch: true,
    })

    useEffect(() => {

        if (isConnected) {
            setInvestorContractReadStatus(true);
            setStartupContractReadStatus(true);
        }

        if (isDisconnected) {
            setInvestorContractReadStatus(false);
            setStartupContractReadStatus(false);
            setisInvestor(false), 
            setisStartup(false);
        }

        const termalBalance = balance.data;
        if (termalBalance === undefined) {
            settermalBalance(0);
        } else {
            settermalBalance(balance.data.formatted);
        }
        const daitoken = daitokenR.data;
        if (daitoken === undefined) {
            setdaitoken(0);
        } else {
            setdaitoken(daitokenR.data.formatted);
        }

        const termaltoken = termaltokenR.data;
        if (termaltoken === undefined) {
            setTermaltoken(0);
        } else {
            setTermaltoken(termaltokenR.data.formatted);
        }

        if (isOwner === true) {
            setInvestorContractReadStatus(false);
            setStartupContractReadStatus(false);
        } else {
            setInvestorContractReadStatus(true);
            setStartupContractReadStatus(true);
        }

        if (investorInfo !== undefined) {
            if (investorInfo[6] === true) {
                setinvestorContract(investorInfo[7])
                setisInvestor(true);
            } else {
                setisInvestor(false);
            }
        }

        if (startupInfo !== undefined) {
            if (startupInfo[3] === true) {
                setisStartup(true);
            } else {
                setisStartup(false);
            }
        }

        let timer = setTimeout(() => {
            setCount((count) => count + 1);
          }, 3000);
        
          return () => clearTimeout(timer)
        
    }, [count])

    const { data: investorInfo } = useContractRead({
        address: contractKeys.InvestorHandlerContractKey,
        abi: investorHandler.abi,
        functionName: 'investors',
        args: [address],
        watch: true,
        enabled: investorContractReadStatus,
    })

    const { data: startupInfo } = useContractRead({
        address: contractKeys.StartupHandlerContractKey,
        abi: startupsHandler.abi,
        functionName: 'startups',
        args: [address],
        watch: true,
        enabled: startupContractReadStatus,
    })

    {/*const { data: investorSignature } = useContractRead({
        address: investorContract, //
        abi: InvestorContract.abi,
        functionName: 'signature',
        watch: true,
        enabled: true,
    })*/}

    return (
        <div>
            <nav className="navbar navbar-dark navbar-expand-lg bg-dark" data-bs-theme="light">
                <div className="container-fluid">
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarTogglerDemo01" aria-controls="navbarTogglerDemo01" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarTogglerDemo01">
                    <Link className="navbar-brand" href="/"><img src="/assets/termal.png" alt='termal' width={60} className="img-fluid" /></Link>
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                    <li className="nav-item">
                        {mounted ? isOwner && (<Link className="nav-link active" aria-current="page" href="/investor">Investor</Link>) : (<div></div>) }
                    </li>
                    <li className="nav-item">
                        {mounted ? isOwner && (<Link className="nav-link active" aria-current="page" href="/startup">Startup</Link>) : (<div></div>) }
                    </li>
                    <li className="nav-item">
                        {mounted ? isOwner && (<Link className="nav-link active" aria-current="page" href="/transfertokens">Tranfer Coins</Link>) : (<div></div>) }
                    </li>
                    <li className="nav-item">
                        {mounted ? isInvestor && (<Link className="nav-link active" aria-current="page" href={{pathname: "/investorpanel", query: { addressR: address}}}>Contract Panel</Link>) : (<div></div>) }
                    </li>
                    <li className="nav-item">
                        {mounted ? isStartup && (<Link className="nav-link active" aria-current="page" href={{pathname: "/startuppanel", query: { addressR: address}}}>Startup Panel</Link>) : (<div></div>) }
                    </li>
                    <li className='nav-item'>
                        {mounted ? isOwner && (<Link className="nav-link" aria-current="page" href="#" >Dai: {daitotalSupply}</Link>) : (<div></div>) }
                        {mounted ? !isOwner && (<Link className="nav-link" aria-current="page" href="#" >Dai: {daitoken}</Link>) : (<div></div>)}
                    </li>
                    <li className='nav-item'>
                        {mounted ? isOwner && (<Link className="nav-link text-center" aria-current="page"  href="#" >Termal: {termalBalance} / {termaltotalSupply}</Link>) : (<div></div>) }
                        {mounted ? !isOwner && (<Link className="nav-link" aria-current="page" href="#" >Termal: {termaltoken}</Link>) : (<div></div>)}
                    </li>
                    </ul>
                    <div>
                    <ConnectBtn />
                </div>
                </div>
                </div>
            </nav>
        </div>
    )

}