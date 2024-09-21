"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Web3 } from 'web3';
import { TopUpBtn } from '@/components/Buttons/TopUpBtn';
import { CreateMultisigBtn } from '@/components/Buttons/CreateMultisigBtn';
import { Connect } from '../wallet/connect';
import Background from "@/components/Background/Background";

export default function User() {
    const router = useRouter();
    const [multisig, setMultisig] = useState<string>("");
    const [account, setAccount] = useState<string>();
    const [balance, setBalance] = useState<string>();

    const fetchBalance = async (account: string) => {
        const web3 = new Web3(window.ethereum);
        const weiBalance = await web3.eth.getBalance(account);
        setBalance(web3.utils.fromWei(weiBalance, 'ether'));  // Convert balance from Wei to Ether
    };

    useEffect(() => {
        const handleChainChanged = () => {
            window.location.reload();  // Reload the page on chain/network change
        };

        const handleAccountsChanged = async (...args: unknown[]) => {
            const accounts = args[0] as string[];
            if (accounts.length > 0) {
                const newAccount = accounts[0];
                setAccount(newAccount);
                fetchBalance(newAccount);  // Fetch balance for the new account
            } else {
                router.push("/");  // If no accounts are connected, redirect to the home page
            }
        };

        // Initialize on page load
        if (window.ethereum?.selectedAddress == undefined) {
            router.push("/");
        } else {
            const selectedAccount = window.ethereum?.selectedAddress;
            setAccount(selectedAccount);
            fetchBalance(selectedAccount);  // Fetch user's balance
            // get multisig from database
        }

        // Listen for account and network changes
        window.ethereum?.on('chainChanged', handleChainChanged);  // Chain/network change listener
        window.ethereum?.on('accountsChanged', handleAccountsChanged);  // Account change listener

        return () => {
            // Clean up event listeners when component is unmounted
            window.ethereum?.removeListener('chainChanged', handleChainChanged);
            window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        };
    }, []);

    return (
        <>
        <Background />
            <div className="min-h-screen flex items-center justify-start bg-black-100 flex-col">
                <Connect />
                <div>
                    {multisig ? (
                        <>
                            <div>
                                <p>Account: {account}</p>
                                <p>Balance: {balance} ETH</p>
                            </div>
                            <TopUpBtn multisig={multisig} />
                        </>
                    ) : (
                        <CreateMultisigBtn />
                    )}
                </div>
            </div>
        </>
    );
}