"use client";
import React, { useState, useEffect } from 'react';
import { TopUpBtn } from '@/components/Buttons/TopUpBtn';
import { Web3 } from 'web3';
import { useRouter } from 'next/navigation';
import Background from '@/components/Background/Background';
import Image from 'next/image';
import Logo from '@/assets/images/EZ_Split.png';
import { Connect } from '../wallet/connect';

export default function Dashboard() {
    const [account, setAccount] = useState<string>();
    const [balance, setBalance] = useState<string>();
    const [multisig, setMultisig] = useState<string>("");
    const router = useRouter();

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
                <div className="h-20 w-screen flex items-center justify-between p-14 px-8 text-xl">
                    <div className='flex flex-row'>
                        <Image src={Logo} alt="Logo" className="h-24 w-auto" />
                        <p>Dashboard</p>
                    </div>
                    <Connect />
                </div>
                <div className="z-10">
                    hello
                </div>
            </div>
            <div>
                <p>Account: {account}</p>
                <p>Balance: {balance} ETH</p>
            </div>
            <TopUpBtn multisig={multisig} />
        </>
    );
}