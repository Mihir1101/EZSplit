"use client";
import { Connect } from '../wallet/connect';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Web3 } from 'web3';

export default function User() {
    const router = useRouter();
    const [multisig, setMultisig] = useState<string>("");
    const [account, setAccount] = useState<string>();
    const [balance, setBalance] = useState<string>();
    const [amount, setAmount] = useState<number>();

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
            setMultisig("0xYourMultisigWalletAddress");  // Example multisig address
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

    const handleTopUp = async () => {
        try {
            // Request account access if needed
            await window.ethereum?.request({ method: "eth_requestAccounts" });

            // Initialize web3
            const web3 = new Web3(window.ethereum);

            // Get current account
            const accounts = await web3.eth.getAccounts();
            const sender = accounts[0];

            // Create a transaction object
            const transactionParameters = {
                to: multisig,  // Multisig wallet address
                from: sender,  // Sender's account
                value: web3.utils.toWei({amount}.toString(), 'ether'),  // Amount in ETH
            };

            // Send transaction
            const txHash = await web3.eth.sendTransaction(transactionParameters);
            console.log("Transaction sent, hash:", txHash);
        } catch (error) {
            console.error("Error sending transaction:", error);
        }
    }

    return (
        <>
            <div className="min-h-screen flex items-center justify-center bg-black-100">
                <div>Dashboard</div>
                <Connect />
                <div>
                        <p>Account: {account}</p>
                        <p>Balance: {balance} ETH</p>
                </div>
                <div>
                    {!multisig ? (
                        <div>
                            <div>{multisig}</div>
                            <Input type="number" placeholder="Amount" onChange={(e) => setAmount(Number(e.target.value))} />
                            <Button
                                className='bg-blue-500'
                                onClick={handleTopUp}
                            >
                                Top up your account
                            </Button>
                        </div>
                    ) : (
                        <div>
                            <div>No multisig found. Create one</div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}