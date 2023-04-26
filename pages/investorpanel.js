import styles from 'Q/styles/Home.module.css'
import { useAccount, useContractRead, useContractWrite, useProvider } from 'wagmi';
import { useState, useEffect } from 'react';
import { useIsMounted } from './hooks/useIsMounted';
import { useRouter } from 'next/router';
import cls from 'classnames';
import termal from '../components/contracts/Termal';
import InvestorHandler from '../components/contracts/InvestorsHandler';
import InvestorContract from '../components/contracts/InvestorContract';
import daiContract from '../components/contracts/DaiToken';
import { contractKeys } from 'Q/components/engine/configuration';
import { ethers } from 'ethers';

export default function Investorpanel () {


    const mounted = useIsMounted();
    const { address, isConnected } = useAccount();
    const connects = Boolean(isConnected);
    const router = useRouter();
    const { addressR } = router.query;
    const [count, setCount] = useState(0);
    let [isInvestor, setisInvestor] = useState(true);
    let [investorContract, setinvestorContract] = useState("");
    let [investorName, setinvestorName] = useState("");

    let provider = useProvider();

    const delay = ms => new Promise(    
        resolve => setTimeout(resolve, ms)
    );

    function clearInput() {
        document.getElementById("Form1").reset();
    }

    useEffect(() => {
        
        if (connects === false) {
            router.push('/');
        }

        if (isInvestor === false) {
            router.push('/');
        }

        if (addressR !== address) {
            router.push('/');
        }

        if (investorInfo === undefined) {
            setisInvestor(false);
            setinvestorContract("");
            setinvestorName("");
        } else {
            setisInvestor(true);
            setinvestorContract(investorInfo[7])
            setinvestorName(investorInfo[0])
        }

        {/*if (investorSignature === undefined){
            setSignature(false);
        } else {
            setSignature(investorSignature);
        }*/}

        let timer = setTimeout(() => {
            setCount((count) => count + 1);
          }, 1000);
        
          return () => clearTimeout(timer)
        
    }, [count])

    // Función para obtener información del contrato del inversionista

    const { data: investorInfo } = useContractRead({
        address: contractKeys.InvestorHandlerContractKey,
        abi: InvestorHandler.abi,
        functionName: 'investors',
        args: [address],
        watch: true,
        enabled: true,
    })
    
    const { data: investorSignature } = useContractRead({
        address: investorContract, //
        abi: InvestorContract.abi,
        functionName: 'signature',
        watch: true,
        enabled: true,
    })

    // Función para firmar contrato:
    const { data: signInvestorContractData, writeAsync: signInvestorContractF } = useContractWrite({
        address: investorContract,
        abi: InvestorContract.abi,
        functionName: 'investorSignature',
        onSuccess() {
            window.alert('Contract has been signed!: ', signInvestorContractData)
        }
    })

    async function signInvestorContract(e) {
        e.preventDefault();
        try{
            const createContract = await signInvestorContractF();
            createContract.wait();
        } catch(e){
        console.error(e);
        }
    }

    // Función para invertir DAI al contrato de termal
    const { data: sendDaiData, writeAsync: sendDaiF } = useContractWrite({
        
        address: contractKeys.termalKey,
        abi: termal.abi,
        functionName: 'investorDepositDai',
        onSuccess() {
            window.alert('Dai has been invested successfully!: ', sendDaiData)
        }
    })

    const { data: allowData ,writeAsync: allowSendDaiF } = useContractWrite({
        address: contractKeys.DaiTokenContractKey,
        abi: daiContract.abi,
        functionName: 'approve',
        onError(error) {
            window.alert('Error', error)
        },
    })

    async function depositDai(e) {
        e.preventDefault();
        const _daiAmount = e.target.elements[0].value;
        let _daiAmountWei = ethers.utils.parseEther(_daiAmount.toString())
        const tmProvider = new ethers.Contract(contractKeys.termalKey, termal.abi, provider);
        let createContractArgsAproval = [tmProvider.address, _daiAmountWei];
        let createContractArgsSend = [_daiAmountWei, {gasLimit: 6485876}];
        try{
          const aproveDai = await allowSendDaiF({
            recklesslySetUnpreparedArgs: createContractArgsAproval,
          });
          const sendDai = await sendDaiF({
            recklesslySetUnpreparedArgs: createContractArgsSend,
          })
          aproveDai.wait();
          sendDai.wait();
          clearInput();
        } catch(e){
          console.error(e);
        }
      }

    return (
        <div className='container-fluid my-5 mx-5'>
        { investorSignature ? (
            <div className=''>
                <div className='row'>
                    <h1 className='green'>Welcome Investor {investorName}</h1>
                    {/*<p className='green'>Your Investor Contract: {InvestorContract}</p>*/}
                </div>
                <div className='row mt-5'>
                    <h2  className='green'>Invest DAI</h2>
                    <form id='Form1' onSubmit= {e => depositDai(e)}>
                    <div className="form-group p-2">
                        <div className={cls(styles.green, 'mb-2 me-5')}>
                        <label htmlFor="investor">DAI Amount: </label>
                        <input type="text" className="form-control" id="investor" />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-success">Deposit DAI </button>
                    </form>
                </div>
            </div>
        ) : (
            <div className='container-sm text-center align-items-center mt-5 mb-5'>
                <div className='row mt-5 mb-5'>
                    <h1>Please sign your contract by clicking on the button</h1>
                </div>
                <button className="btn btn-success" onClick={signInvestorContract}>Sign Contract</button>
                <div className='row mt-5 mb-5'>
                    <p>By clicking on the button you agree on signing the contract as an Investor.</p>
                </div>
                <div className='row mt-5 mb-5'>
                    <h3>After signing the contract you will be redirected to your panel</h3>
                </div>
            </div>
        )
        }
    </div>
    )
}