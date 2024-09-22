"use client";
import React, { useState, useEffect } from 'react';
import { TopUpBtn } from '@/components/Buttons/TopUpBtn';
import Web3 from 'web3';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
    const [account, setAccount] = useState<string>();
    const [balance, setBalance] = useState<string>();
    const [userBalance, setUserBalance] = useState<string>();
    const [multisig, setMultisig] = useState<string>("");
    const [animatedUserBalance, setAnimatedUserBalance] = useState<number>(0); // State for animated user balance
    const router = useRouter();

    const fetchBalance = async (account: string) => {
        const web3 = new Web3(window.ethereum);
        const weiBalance = await web3.eth.getBalance(account);
        const etherBalance = web3.utils.fromWei(weiBalance, 'ether');
        setBalance(etherBalance);  // Convert balance from Wei to Ether
    };

    const fetchData = async () => {
        if (!window.ethereum?.selectedAddress) {
            router.push("/");
        } else {
            const selectedAccount = window.ethereum?.selectedAddress;
            setAccount(selectedAccount);
            fetchBalance(selectedAccount);  // Fetch user's balance

            console.log(`/api/user/ui/${selectedAccount}`);
            try {
                const response = await fetch(`http://localhost:5000/api/user/ui/${selectedAccount}`);
                if (response.status === 200) {
                    const data = await response.json();
                    console.log(data);
                    if (data.data) {
                        setMultisig(data.data.multisigAddress);
                        setUserBalance(data.data.balance/1e18);
                    }
                }
            } catch (error) {
                console.error("Error fetching multisig", error);
            }
        }
    };

    // Digit animation function
    const animateBalance = (start: number, end: number, duration: number) => {
        let startTimestamp: number | null = null;

        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = timestamp - startTimestamp;
            const percentage = Math.min(progress / duration, 1);
            const newBalance = start + (end - start) * percentage;
            setAnimatedUserBalance(newBalance);
            if (percentage < 1) {
                window.requestAnimationFrame(step);
            }
        };

        window.requestAnimationFrame(step);
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
        }

        fetchData();

        // Listen for account and network changes
        window.ethereum?.on('chainChanged', handleChainChanged);  // Chain/network change listener
        window.ethereum?.on('accountsChanged', handleAccountsChanged);  // Account change listener

        return () => {
            // Clean up event listeners when component is unmounted
            window.ethereum?.removeListener('chainChanged', handleChainChanged);
            window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        };
    }, []);

    // Trigger userBalance animation when userBalance changes
    useEffect(() => {
        if (userBalance) {
            const balanceNum = parseFloat(userBalance);
            animateBalance(0, balanceNum, 2000); // Animate userBalance from 0 to the fetched userBalance over 2 seconds
        }
    }, [userBalance]);

    return (
        <>
            <div className="flex flex-col items-center justify-center h-80 overflow-hidden">
                <div className="z-10 flex flex-col justify-center items-center w-full p-10">
                    <div className="font-bold text-3xl mb-4">
                        Multisig Balance: {animatedUserBalance.toFixed(4)} ETH {/* Show animated userBalance */}
                    </div>
                    <div className="flex flex-col items-start p-6 rounded-md w-full max-w-md">
                        <p className="text-lg mb-4">
                            Balance: {balance?.slice(0, 6)} ETH
                        </p>
                        <TopUpBtn multisig={multisig} />
                    </div>
                </div>
            </div>
        </>
    );
}
