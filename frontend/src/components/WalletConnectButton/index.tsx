"use client"
import { useWallet, WalletName } from "@aptos-labs/wallet-adapter-react"
import { useMemo } from "react";
export function WalletConnectButton(){
    const { wallets, connected, connect, disconnect, isLoading } = useWallet();
    const wallet = useMemo(()=>{
        if(!Array.isArray(wallets) || wallets.length == 0) return null;
        return wallets.find(wallet => wallet.name === "Petra" && wallet.readyState === "Installed"); // only petra
    },[wallets])
    const onDisconnectWallet = async() => {
        try {
            await disconnect();
        } catch (error) {
            console.error(error)
        }
    }
    const onConnectWallet = async(walletName: WalletName) => {
        try {
            await connect(walletName)
        } catch (error) {
            console.error(error)
        }
    }
    if(connected){
        return <button className="btn btn-danger" onClick={onDisconnectWallet}>Disconnect</button>
    }
    if(isLoading){
        return <button className="btn btn-info">Loading...</button>
    }
    if(!wallet){
        return <button className="btn btn-muted" disabled={true}>No Wallet</button>
    }
    if(!connected){
        return <button className="btn btn-success" onClick={()=>onConnectWallet(wallet.name)}>Connect</button>
    }
}