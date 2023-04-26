import styles from 'Q/styles/Home.module.css'
import { useAccount, useContractRead, useContractWrite, useProvider } from 'wagmi';
import { useState, useEffect } from 'react';
import { useIsMounted } from './hooks/useIsMounted';
import { useRouter } from 'next/router';
import cls from 'classnames';
import termal from '../components/contracts/Termal';
import StartupsHandler from '../components/contracts/StartupsHandler'; 
import StartupContract from '../components/contracts/StartupContract';
import termalTokenContract from '../components/contracts/TermalToken';
import daiContract from '../components/contracts/DaiToken';
import { contractKeys } from 'Q/components/engine/configuration';
import { ethers } from 'ethers';

export default function Startuppanel () {


    const mounted = useIsMounted();
    const { address, isConnected } = useAccount();
    const connects = Boolean(isConnected);
    const router = useRouter();
    const { addressR } = router.query;
    const [count, setCount] = useState(0);
    let [isStartup, setisStartup] = useState(true);
    let [startupContract, setstartupContract] = useState("");
    let [startupName, setstartupName] = useState("");

    let provider = useProvider();

    const delay = ms => new Promise(    
        resolve => setTimeout(resolve, ms)
    );

    function clearInput() {
        document.getElementById("Form1").reset();
    }
    function clearInput2() {
        document.getElementById("Form2").reset();
    }

    useEffect(() => {
        
        if (connects === false) {
            router.push('/');
        }

        if (isStartup === false) {
            router.push('/');
        }

        if (addressR !== address) {
            router.push('/');
        }

        if (startupInfo === undefined) {
            setisStartup(false);
            setstartupContract("");
            setstartupName("");
        } else {
            setisStartup(true);
            setstartupContract(startupInfo[4])
            setstartupName(startupInfo[0])
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

    const { data: startupInfo } = useContractRead({
        address: contractKeys.StartupHandlerContractKey,
        abi: StartupsHandler.abi,
        functionName: 'startups',
        args: [address],
        watch: true,
        enabled: true,
    })
    // -----------------------------------------------------------------------------------------------------------------------------------------
    const { data: startupSignature } = useContractRead({ 
        address: startupContract, //
        abi: StartupContract.abi,
        functionName: 'signature',
        watch: true,
        enabled: true,
    })

    // Función para firmar contrato:
    const { data: signStartupContractData, writeAsync: signStartupContractF } = useContractWrite({
        address: startupContract,
        abi: StartupContract.abi,
        functionName: 'startupSignature',
        onSuccess() {
            window.alert('Contract has been signed!: ', signStartupContractData)
        }
    })

    async function signStartupContract(e) {
        e.preventDefault();
        try{
            const createContract = await signStartupContractF();
            createContract.wait();
        } catch(e){
        console.error(e);
        }
    }

    // Función para regresar DAI al contrato principal
    const { data: returnDaiData, writeAsync: returnDaiF } = useContractWrite({
        
        address: contractKeys.termalKey,
        abi: termal.abi,
        functionName: 'returnDaiStartup',
        onSuccess() {
            window.alert('Dai has been returned successfully!: ', returnDaiData)
        }
    })

    const { data: allowreturnData ,writeAsync: allowReturnDaiF } = useContractWrite({
        address: contractKeys.DaiTokenContractKey,
        abi: daiContract.abi,
        functionName: 'approve',
        onError(error) {
            window.alert('Error', error)
        },
    })

    async function returnDai(e) {
        e.preventDefault();
        const _daiAmount = e.target.elements[0].value;
        let _daiAmountWei = ethers.utils.parseEther(_daiAmount.toString())
        const tmProvider = new ethers.Contract(contractKeys.termalKey, termal.abi, provider);
        let createContractArgsAproval = [tmProvider.address, _daiAmountWei];
        let createContractArgsSend = [_daiAmountWei, {gasLimit: 6485876}];
        try{
          const aproveReturnDai = await allowReturnDaiF({
            recklesslySetUnpreparedArgs: createContractArgsAproval,
          });
          const returnDai = await returnDaiF({
            recklesslySetUnpreparedArgs: createContractArgsSend,
          })
          aproveReturnDai.wait();
          returnDai.wait();
          clearInput();
        } catch(e){
          console.error(e);
        }
      }

    // Función para regresar Termal al contrato principal
    const { data: allowtermalData ,writeAsync: allowReturnTermal } = useContractWrite({
        address: contractKeys.TermalTokenContractKey,
        abi: termalTokenContract.abi,
        functionName: 'approve',
        onError(error) {
            window.alert('Error', error)
        },
    })

    const { data: returnTermalData, writeAsync: returnTermalF } = useContractWrite({
        
        address: contractKeys.termalKey,
        abi: termal.abi,
        functionName: 'returnTermalStartup',
        onSuccess() {
            window.alert('Termal has been returned successfully!: ', returnTermalData)
        }
    })

    async function returnTermalStartup(e) {
        e.preventDefault();
        const _termalAmount = e.target.elements[0].value;
        const _Termal_wei = ethers.utils.parseEther(_termalAmount.toString());
        const tmProvider = new ethers.Contract(contractKeys.termalKey, termal.abi, provider);
        let createContractArgsAproval = [tmProvider.address, _Termal_wei];
        let createContractArgsSend = [_Termal_wei, {gasLimit: 6485876}];
        try{
            const allowtermal = await allowReturnTermal({
                recklesslySetUnpreparedArgs: createContractArgsAproval,
            })
            const returnTermal = await returnTermalF({
                recklesslySetUnpreparedArgs: createContractArgsSend,
            })
            allowtermal.wait();
            returnTermal.wait();
            clearInput2();
        } catch(e){
            console.error(e);
        }
    }

    return (
        <div className='container-fluid text-center my-5 mx-5'>
      { startupSignature ? (
        <div className='container-sm mt-5 mb-5'>

          <div className={cls(styles.green, 'row ms-5 me-5 align-items-center')}>
            <h1>Welcome {startupName}</h1>
          </div>
          <div className={cls(styles.green,'row ms-5 me-5 mt-5 align-items-center')}>
            <h2>Return DAI</h2>
            <form id='Form1' onSubmit= {e => returnDai(e)}>
              <div className="form-group p-2">
                <div className='mb-2 me-5'>
                  <label htmlFor="startup">DAI Amount: </label>
                  <input type="text" className="form-control" id="startup" />
                </div>
              </div>
              <button type="submit" className="btn btn-danger">Return DAI </button>
            </form>
          </div>
          <div className={cls(styles.green, 'row ms-5 me-5 mt-5 align-items-center')}>
            <h2>Return Termal</h2>
            <form id='Form2' onSubmit= {e => returnTermalStartup(e)}>
              <div className="form-group p-2">
                <div className='mb-2 me-5'>
                  <label htmlFor="startup">Termal Amount: </label>
                  <input type="text" className="form-control" id="startup" />
                </div>
              </div>
              <button type="submit" className="btn btn-danger">Return Termal </button>
            </form>
          </div>
        </div>
      ) : (
        <div className={cls(styles.green, 'container-sm mt-5 mb-5 text-center align-items-center')}>
          <div className='row my-5'>
            <h1>Please sign your contract by clicking on the button</h1>
          </div>
          <button className="btn btn-success" onClick={signStartupContract}>Sign Contract</button>
          <div className='row my-5'>
            <p>By clicking on the button you agree on signing the contract as an Startup.</p>
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