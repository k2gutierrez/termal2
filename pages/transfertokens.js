import styles from 'Q/styles/Home.module.css'
import { useAccount, useContractWrite, useContractRead, useProvider } from 'wagmi';
import { useState, useEffect } from 'react';
import { useIsMounted } from './hooks/useIsMounted';
import { useRouter } from 'next/router';
import cls from 'classnames';
import termal from '../components/contracts/Termal';
import daiContract from '../components/contracts/DaiToken';
import { contractKeys } from 'Q/components/engine/configuration';
import { ethers } from 'ethers';

export default function Transfertokens () {

    const mounted = useIsMounted();
    const router = useRouter();
    const [count, setCount] = useState(0);

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

    let provider = useProvider();


    function clearInput() {
        document.getElementById("Form1").reset();
    }
  
    function clearInput2() {
      document.getElementById("Form2").reset();
    }

    const isOwner = Boolean(data === address);

    useEffect(() => {
        
        if (connects === false) {
            router.push('/');
        }

        let timer = setTimeout(() => {
            setCount((count) => count + 1);
          }, 1000);
        
          return () => clearTimeout(timer)
        
    }, [count])

    // Función para transferir dai a startups
    const { data: allowDaiData ,writeAsync: allowDaiF } = useContractWrite({
        address: contractKeys.DaiTokenContractKey,
        abi: daiContract.abi,
        functionName: 'approve',
        onError(error) {
            window.alert('Error', error)
        },
    })

    const { data: daiTransferData, writeAsync: transferDaiF } = useContractWrite({
        address: contractKeys.termalKey,
        abi: termal.abi,
        functionName: 'transferDaiToStartup',
        onSuccess() {
            window.alert('DAI transferred succesfully!: ', daiTransferData)
        },
        onError(error) {
            window.alert('Error', error)
        }
    })

    async function transferDai(e) {
        e.preventDefault();
        let _address = e.target.elements[0].value;
        let _amount = e.target.elements[1].value;
        let _amountWei= ethers.utils.parseEther(_amount.toString());
        const tmProvider = new ethers.Contract(contractKeys.termalKey, termal.abi, provider);
        let createContractArgsAproval = [tmProvider.address, _amountWei];
        let contractArgs = [_address, _amountWei, {gasLimit: 6485876}];
        try{
            let allowDai = await allowDaiF({
                recklesslySetUnpreparedArgs: createContractArgsAproval,
                })
            let transferDaiToken = await transferDaiF({
            recklesslySetUnpreparedArgs: contractArgs,
            });
            allowDai.wait();
            transferDaiToken.wait();
            clearInput();
        } catch(e){
          console.error(e);
        }
    }

    // Función para transferir termal

    const { data: termalTransferData, writeAsync: transferTermalF } = useContractWrite({
        address: contractKeys.termalKey,
        abi: termal.abi,
        functionName: 'transferTermal',
        onSuccess() {
            window.alert('Termal transferred Succesfully!: ', termalTransferData)
        },
        onError(error) {
            window.alert('Error', error)
        }
    })

    async function transferTermal(e) {
        e.preventDefault();
        let _address = e.target.elements[0].value;
        let _amount = e.target.elements[1].value;
        let _amountWei = ethers.utils.parseEther(_amount);
        let createContractArgs = [_address, _amountWei, {gasLimit: 6485876}];
        try{
            const transferTermalToken = await transferTermalF({
                recklesslySetUnpreparedArgs: createContractArgs,
            })
            transferTermalToken.wait();
            clearInput2();
        } catch(e){
        console.error(e);
        }
    }

    return (
        <div className='container-fluid px-5 my-5'>
      {mounted ? isOwner && (
        <div>
        <div className={cls(styles.green, 'row text-center mt-3')}>
          <h1>Manages Dashboard</h1>
        </div>
        <div className='row mt-5'>
          <div className='col-md-6 col-12'>
            <div className='row mb-4 align-items-center ms-5 me-5 px-5'>
              <h2>Transfer Dai to Startup</h2>
              <form id='Form1' onSubmit= {e => transferDai(e)}>
                <div className="form-group">
                  <div className='row mb-2'>
                    <label htmlFor="startup">Wallet to transfer: </label>
                    <input type="text" className="form-control" id="startup" />
                  </div>
                  <div className='row mb-2'>
                      <label htmlFor="startup">Amount of DAI: </label>
                      <input type="text" className="form-control" id="startup" />
                  </div>
                </div>
                <button type="submit" className="btn btn-success">Transfer DAI</button>
              </form>
            </div>
          </div>
          <div className='col-md-6 col-12'>
            <div className='row mb-4 align-items-center ms-5 me-5 px-5'>
              <h2>Transfer Termal to account</h2>
              <form id='Form2' onSubmit= {e => transferTermal(e)}>
                <div className="form-group">
                  <div>
                    <label htmlFor="startup">Wallet to transfer: </label>
                    <input type="text" className="form-control" id="startup" />
                  </div>
                  <div className='mb-2'>
                    <label htmlFor="startup">Amount of Termal: </label>
                    <input type="text" className="form-control" id="startup" />
                  </div>
                </div>
                <button type="submit" className="btn btn-success">Transfer Termal</button>
              </form>
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