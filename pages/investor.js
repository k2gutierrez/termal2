import styles from 'Q/styles/Home.module.css'
import { useAccount, useContractRead, useContractWrite } from 'wagmi';
import { useState, useEffect } from 'react';
import { useIsMounted } from './hooks/useIsMounted';
import { useRouter } from 'next/router';
import cls from 'classnames';
import termal from '../components/contracts/Termal';
import InvestorHandler from '../components/contracts/InvestorsHandler';
import InvestorContract from '../components/contracts/InvestorContract';
import { contractKeys } from 'Q/components/engine/configuration';

export default function Investor () {

    const mounted = useIsMounted();
    const router = useRouter();
    const [count, setCount] = useState(0);
    const [functionStatus, setFunctionsStatus] = useState(false);
    const [functionStatusWallet, setFunctionsStatusWallet] = useState(false);
    let [investorAddress, setinvestorAddress] = useState("");
    let [investorContract, setinvestorContract] = useState("");
    let [investorName, setinvestorName] = useState("");
    let [signature, setSignature] = useState("");

    const delay = ms => new Promise(    
        resolve => setTimeout(resolve, ms)
    );

    const { address, isConnected } = useAccount();
    const connects = Boolean(isConnected);
    

    const { data } = useContractRead({
        address: contractKeys.termalKey,
        abi: termal.abi,
        functionName: "owner",
    })

    const investorsR = useContractRead({
        address: contractKeys.InvestorHandlerContractKey,
        abi: InvestorHandler.abi,
        functionName: "getInvestors",
        watch: true,
    })

    const totalInvestors = useContractRead({
        address: contractKeys.InvestorHandlerContractKey,
        abi: InvestorHandler.abi,
        functionName: "getTotalInvestors",
        select: (data) => parseInt(data),
        watch: true,
    })

    function clearInput() {
        document.getElementById("Form1").reset();
    }
  
    function clearInput2() {
      document.getElementById("Form2").reset();
    }

    const isOwner = Boolean(data === address);
    const totalinvestors = totalInvestors.data;

    useEffect(() => {
        
        if (connects === false) {
            setFunctionsStatusWallet(false);
            router.push('/');
        }

        if (investorInfo === undefined) {
            setinvestorContract("");
            setinvestorName("");
        } else {
            setinvestorContract(investorInfo[7])
            setinvestorName(investorInfo[0])
            if (investorInfo[7] === '0x0000000000000000000000000000000000000000') {
                setFunctionsStatus(false);
            } else {
                setFunctionsStatus(true);
            }
        }

        if (investorSignature === undefined){
            setSignature("");
        } else {
            setSignature(investorSignature.toString());
        }

        let timer = setTimeout(() => {
            setCount((count) => count + 1);
          }, 1000);
        
          return () => clearTimeout(timer)
        
    }, [count])

    // Componente con función para leeer array de investors y generar un javascript array con los mismos y poder hacer map function
    const Inv = () => {
        let inv = [];
        for (let i = 1; i<=totalInvestors.data; i++){
        const inve = investorsR.data[i - 1];
        inv.push(inve)   
        } 
        
        return (
        <div className='row'>
            <h2>Investors Address List</h2>
            {inv.map((investor, key) => {
                return(
                <div key={key}>
                    <ul className='list-group'>
                    <li  className="list-group-item">{ investor }</li>
                    </ul>
                </div>
                )
            })

            }
        </div>
        );
    }

    // Función para crear inversionista
    const { data: createInvestorData, writeAsync: createInvestor, isSuccess: isInvestorCreated } = useContractWrite({
        address: contractKeys.InvestorHandlerContractKey,
        abi: InvestorHandler.abi,
        functionName: 'createInvestor',
        onSuccess() {
            window.alert('Investor Created!: ', createInvestorData)
        }
    })

    async function createInvestorF(e) {
        e.preventDefault();
        const _address = e.target.elements[0].value;
        const _name = e.target.elements[1].value;
        let contractArgs = [_address, _name];
        try{
          let cInvestor = await createInvestor({
            recklesslySetUnpreparedArgs: contractArgs,
          });
          cInvestor.wait();
          clearInput();
        } catch(e){
          console.error(e);
        }
    }

    // Función para crear nuevo contrato de inversionista

    const { data: createInvestorContractData, writeAsync: createInvestorContract } = useContractWrite({
        address: contractKeys.InvestorHandlerContractKey,
        abi: InvestorHandler.abi,
        functionName: 'createInvestorContract',
        onSuccess() {
            window.alert('Investor Contract Created!: ', createInvestorContractData)
        }
    })

    async function createInvestorContractF(e) {
        e.preventDefault();
        const _investorAddress = e.target.elements[0].value;
        const _initialInvestment = e.target.elements[1].value;
        const _managementFee = e.target.elements[2].value;
        const _termalCoinRatio = e.target.elements[3].value;
        const _duration = e.target.elements[4].value;
        const _interestRate = e.target.elements[5].value;
        let createContractArgs = [_investorAddress, _initialInvestment, _managementFee, _termalCoinRatio, _duration, _interestRate]
        try{
            const createContract = await createInvestorContract({
                recklesslySetUnpreparedArgs: createContractArgs,
            })
            createContract.wait();
            clearInput2();
        } catch(e){
        console.error(e);
        }
    }

    // Función para obtener información del contrato del inversionista

    const { data: investorInfo } = useContractRead({
        address: contractKeys.InvestorHandlerContractKey,
        abi: InvestorHandler.abi,
        functionName: 'investors',
        args: [investorAddress],
        watch: true,
        enabled: functionStatusWallet,
    })
    
    const { data: investorSignature } = useContractRead({
        address: investorContract,
        abi: InvestorContract.abi,
        functionName: 'signature',
        watch: true,
        enabled: functionStatus,
    })

    async function getInvestorContractInfo(e) {
        e.preventDefault();
        const _wallet = e.target.elements[0].value;
        try{
            setinvestorAddress(_wallet);
            delay(2000);
            setFunctionsStatusWallet(true)
            console.log(investorInfo);
        
        } catch(e){
        console.error(e);
        }
    }

    return (
        <div className='container-fluid px-5 my-5'>
      {mounted ? isOwner && (
        <div>
          <div className={cls(styles.green, 'row text-center mt-3')}>
            <h1>Manager's Dashboard</h1>
          </div>
          <div className={cls(styles.green, 'row')}>
            <div className='col-md-6 col-12'>
              <div className='row mt-5'>
                <h2>Create Investor</h2>
                <form id='Form1' onSubmit= {e => createInvestorF(e)}>
                  <div className="form-group p-2">
                    <div className='row mb-2'>
                      <label htmlFor="investor">Investor's Wallet: </label>
                      <input type="text" className="form-control" id="investor" />
                    </div>
                    <div className='row mb-2'>
                      <label htmlFor="investorName">Investor's Name: </label>
                      <input type="text" className="form-control" id="investorName" />
                    </div>
                    <button type="submit" className="btn btn-success">Create Investor</button>
                  </div>
                </form>
              </div>
              <div className='row mt-5'>
                <h2>Create Investors' Contract</h2>
                <form id='Form2' onSubmit= {e => createInvestorContractF(e)}>
                  <div className="form-group p-2">
                    <div className='row mb-2'>
                      <label htmlFor="investor">Investor Wallet: </label>
                      <input type="text" className="form-control" id="investor" />
                    </div>
                    <div className='row mb-2'>
                      <label htmlFor="initialInvestment">Initial investment: </label>
                      <input type="text" className="form-control" id="initialInvestment" />
                    </div>
                    <div className='row mb-2'>
                      <label htmlFor="managementFee">Management Fee: </label>
                      <input type="text" className="form-control" id="managementFee" />
                    </div>
                    <div className='row mb-2'>
                      <label htmlFor="termalCoinRatio">Termal coin ratio: </label>
                      <input type="text" className="form-control" id="termalCoinRatio" />
                    </div>
                    <div className='row mb-2'>
                      <label htmlFor="Duration">Duration: </label>
                      <input type="text" className="form-control" id="Duration" />
                    </div>
                    <div className='row mb-2'>
                      <label htmlFor="Interest">Interest Rate: </label>
                      <input type="text" className="form-control" id="Interest" />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-success">Create Investor Contract</button>
                </form>
              </div>
            </div>
            <div className='col-md-6 col-12 mt-5'>
              <div className='row mx-5'>
                <h1>Total Investors: {totalinvestors}</h1>
                <h2>Investor Contract Info</h2>
                <form id='Form' onSubmit= {e => getInvestorContractInfo(e)}>
                  <div className="form-group mb-2">
                    <label htmlFor="startup">Investor Wallet: </label>
                    <input type="text" className="form-control" id="startup" />
                  </div>
                  <button type="submit" className="btn btn-success">Investor Info</button>
                </form>
                <div className='mt-4'>
                  <p>Investor name: {investorName}</p>
                  <p>Investor has signed?: {signature}</p>
                </div>
              </div>
              <div className='row mx-5'>
                <Inv />
              </div>
            </div>
          </div>
        </div>
      )
      :(
        <div></div>
      )}
    {mounted ? !isOwner &&
        (
            <div className={cls(styles.green, 'row text-center mt-3')}>
                <h1>You are not allowed to access to this panel, if you are the owner please connect with Owner Address in your Wallet</h1>
            </div>
        ) :
        (
            <div></div>
        )
    }
    </div>
    )
}