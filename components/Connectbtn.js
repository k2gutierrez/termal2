import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useDisconnect } from "wagmi";
import { getAccount } from '@wagmi/core';
import { useEffect } from "react";

export default function ConnectBtn() {

    return (
        <>
            <ConnectButton />
            {/*<div>
                {account ? (
                    <div>
                        
                    </div>
                ) : (<ConnectButton />)}
                </div>*/}
        </>
    )

}