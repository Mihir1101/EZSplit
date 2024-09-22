import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Web3 from 'web3';
import { axios } from '@/components/axios/axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface TopUpBtnProps {
    multisig: string;
}

export const TopUpBtn: React.FC<TopUpBtnProps> = ({ multisig }) => {
    const [amount, setAmount] = useState<string>("");
    const handleTopUp = async () => {
        const web3 = new Web3(window.ethereum);
        try {
            // Get current account
            const accounts = await web3.eth.getAccounts();
            const sender = accounts[0];

            const amountInWei = web3.utils.toWei(amount, 'ether');

            // Create a transaction object
            const transactionParameters = {
                to: multisig,  // Multisig wallet address
                from: sender,  // Sender's account
                value: amountInWei,  // Amount in ETH
            };


            // Send transaction
            const txHash = await web3.eth.sendTransaction(transactionParameters);
            await axios.patch("/api/user/updateBalance", {
                accountAddr: sender,
                b: amountInWei,
            }
            )
            toast.success(`Successfully topped up ${amount} ETH to the multisig wallet.`,{
                onClose: () => window.location.reload(),
            });
            console.log("Transaction sent, hash:", txHash);
        } catch (error) {
            console.error("Error sending transaction:", error);
            toast.error("Error sending transaction. Please try again.");
        }
    }
    return (
        <div className='flex flex-col'>
            <ToastContainer position='bottom-right'/>
            <Input
                type="number"
                placeholder="Amount (Min. 0.001ETH)"
                className="p-5 pl-2 placeholder-opacity-75 border-x-0 border-t-0 text-xl h-10"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
            />
            <Button
                className='bg-blue-500 mt-5'
                onClick={handleTopUp}
            >
                Top up your account
            </Button>
            <span className='pt-5'>Multisig Address: <p className='text-orange font-bold'>{multisig.slice(0, 7) + "..." + multisig.slice(multisig.length - 5, multisig.length)}</p></span>
        </div>
    );
}