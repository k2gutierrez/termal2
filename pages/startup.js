import styles from 'Q/styles/Home.module.css'
import { useAccount, useContractRead, useContractWrite } from 'wagmi';
import { useState, useEffect } from 'react';
import { useIsMounted } from './hooks/useIsMounted';
import { useRouter } from 'next/router';
import cls from 'classnames';
import termal from '../components/contracts/Termal';
import StartupsHandler from '../components/contracts/StartupsHandler';
import StartupContract from '../components/contracts/StartupContract';
import { contractKeys } from 'Q/components/engine/configuration';

export default function Startup () {

    const mounted = useIsMounted();
    const router = useRouter();
    const [count, setCount] = useState(0);
    const [functionStatus, setFunctionsStatus] = useState(false);
    const [functionStatusWallet, setFunctionsStatusWallet] = useState(false);
    let [startupAddress, setstartupAddress] = useState("");
    let [startupContract, setstartupContract] = useState("");
    let [startupName, setstartupName] = useState("");
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

    const totalStartups = useContractRead({
        address: contractKeys.StartupHandlerContractKey,
        abi: StartupsHandler.abi,
        functionName: "getTotalStartups",
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
    const totalstartups = totalStartups.data;

    useEffect(() => {
        
        if (connects === false) {
            setFunctionsStatusWallet(false);
            router.push('/');
        }

        if (startupInfo === undefined) {
            setstartupContract("");
            setstartupName("");
        } else {
            setstartupContract(startupInfo[4])
            setstartupName(startupInfo[0])
            if (startupInfo[4] === '0x0000000000000000000000000000000000000000') {
                setFunctionsStatus(false);
            } else {
                setFunctionsStatus(true);
            }
        }

        if (startupSignature === undefined){
            setSignature("");
        } else {
            setSignature(startupSignature.toString());
        }

        let timer = setTimeout(() => {
            setCount((count) => count + 1);
          }, 1000);
        
          return () => clearTimeout(timer)
        
    }, [count])

    // Función para crear startup
    const { data: createStartupData, writeAsync: createStartup } = useContractWrite({
        address: contractKeys.StartupHandlerContractKey,
        abi: StartupsHandler.abi,
        functionName: 'createStartup',
        onSuccess() {
            window.alert('Startup Created!: ', createStartupData)
        }
    })

    async function createStartupF(e) {
        e.preventDefault();
        const _address = e.target.elements[0].value;
        const _name = e.target.elements[1].value;
        const _tokenAddress = contractKeys.startupTokenContractKey;
        let contractArgs = [_address, _name, _tokenAddress];
        try{
          let cStartup = await createStartup({
            recklesslySetUnpreparedArgs: contractArgs,
          });
          cStartup.wait();
          clearInput();
        } catch(e){
          console.error(e);
        }
    }

    // Función para crear nuevo contrato de startup

    const { data: createStartupContractData, writeAsync: createStartupContract } = useContractWrite({
        address: contractKeys.StartupHandlerContractKey,
        abi: StartupsHandler.abi,
        functionName: 'createStartupContract',
        onSuccess() {
            window.alert('Startup Contract Created!: ', createStartupContractData)
        }
    })

    async function createStartupContractF(e) {
        e.preventDefault();
        const _startupAddress = e.target.elements[0].value;
        const _initialLoan = e.target.elements[1].value;
        const _interestRate = e.target.elements[2].value;
        const _maxConvertionRate = e.target.elements[3].value;
        const _minConvertionRate = e.target.elements[4].value;
        const _termalCoinPercentage = e.target.elements[5].value;
        const _stableCoinPercentage = e.target.elements[6].value;
        const _maxProjectime = e.target.elements[7].value;
        const _activeFee = e.target.elements[8].value;
        let createContractArgs = [
            _startupAddress, 
            _initialLoan,
            _interestRate,
            _maxConvertionRate,
            _minConvertionRate,
            _termalCoinPercentage,
            _stableCoinPercentage,
            _maxProjectime,
            _activeFee
        ]
        try{
            const createContract = await createStartupContract({
                recklesslySetUnpreparedArgs: createContractArgs,
            })
            createContract.wait();
            clearInput2();
        } catch(e){
        console.error(e);
        }
    }

    // Función para obtener información del contrato del startup

    const { data: startupInfo } = useContractRead({
        address: contractKeys.StartupHandlerContractKey,
        abi: StartupsHandler.abi,
        functionName: 'startups',
        args: [startupAddress],
        watch: true,
        enabled: functionStatusWallet,
    })
    
    const { data: startupSignature } = useContractRead({
        address: startupContract,
        abi: StartupContract.abi,
        functionName: 'signature',
        watch: true,
        enabled: functionStatus,
    })

    async function getStartupContractInfo(e) { 
        e.preventDefault();
        const _wallet = e.target.elements[0].value;
        try{
            setstartupAddress(_wallet);
            delay(2000);
            setFunctionsStatusWallet(true)
            console.log(startupInfo);
        
        } catch(e){
        console.error(e);
        }
    }

    return (
        <div className='container-fluid px-5 my-5'>
      {mounted ? isOwner && (
        <div>
          <div className={cls(styles.green, 'row text-center mt-3')}>
            <h1>Managers Dashboard</h1>
          </div>
          <div className={cls(styles.green, 'row')}>
            <div className='col-md-6 col-12'>
              <div className='row mt-5'>
                <h2>Create Startup</h2>
                <form id='Form1' onSubmit= {e => createStartupF(e)}>
                  <div className="form-group p-2">
                    <div className='row mb-2'>
                      <label htmlFor="investor">Startup Wallet: </label>
                      <input type="text" className="form-control" id="investor" />
                    </div>
                    <div className='row mb-2'>
                      <label htmlFor="investorName">Startup Name: </label>
                      <input type="text" className="form-control" id="investorName" />
                    </div>
                    <button type="submit" className="btn btn-success">Create Startup</button>
                  </div>
                </form>
              </div>
              <div className='row mt-5'>
                <h2>Create Startup Contract</h2>
                <form id='Form2' onSubmit= {e => createStartupContractF(e)}>
                  <div className="form-group">
                    <div className='mb-2'>
                      <label htmlFor="startupW">Startup Wallet: </label>
                      <input type="text" className="form-control" id="startupW" />
                    </div>
                    <div className='mb-2'>
                      <label htmlFor="loan">Initial Loan: </label>
                      <input type="text" className="form-control" id="loan" />
                    </div>
                    <div className='mb-2'>
                      <label htmlFor="interest">Interest Rate: </label>
                      <input type="text" className="form-control" id="interest" />
                    </div>
                    <div className='mb-2'>
                      <label htmlFor="max">Max Conversion rate: </label>
                      <input type="text" className="form-control" id="max" />
                    </div>
                    <div className='mb-2'>
                      <label htmlFor="min">Min Conversion rate: </label>
                      <input type="text" className="form-control" id="min" />
                    </div>
                    <div className='mb-2'>
                      <label htmlFor="termal">Termal Coin percentage: </label>
                      <input type="text" className="form-control" id="termal" />
                    </div>
                    <div className='mb-2'>
                      <label htmlFor="stable">Stable Coin percentage: </label>
                      <input type="text" className="form-control" id="stable" />
                    </div>
                    <div className='mb-2'>
                      <label htmlFor="maxproject">Max project time: </label>
                      <input type="text" className="form-control" id="maxproject" />
                    </div>
                    <div className='mb-2'>
                      <label htmlFor="fee">Active Fee: </label>
                      <input type="text" className="form-control" id="fee" />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-success">Create Startup Contract</button>
                </form>
              </div>
            </div>
            <div className='col-md-6 col-12 mt-5'>
              <div className='row mx-5'>
                <h1>Total Startups: {totalstartups}</h1>
                <h2>Startup Contract Info</h2>
                <form id='Form' onSubmit= {e => getStartupContractInfo(e)}>
                  <div className="form-group mb-2">
                    <label htmlFor="startup">Startup Wallet: </label>
                    <input type="text" className="form-control" id="startup" />
                  </div>
                  <button type="submit" className="btn btn-success">Startup Info</button>
                </form>
                <div className='mt-4'>
                  <p>Startup name: {startupName}</p>
                  <p>Startup Contract signed?: {signature}</p>
                </div>
              </div>
              <div className='row mx-5'>
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