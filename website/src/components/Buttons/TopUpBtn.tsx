import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Web3 } from 'web3';

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
            alert(`Successfully topped up ${amount} ETH to the multisig wallet.`);
            console.log("Transaction sent, hash:", txHash);
        } catch (error) {
            console.error("Error sending transaction:", error);
            alert("Error sending transaction. Please try again.");
        }
    }
    return (
        <div>
            <div>{multisig}</div>
            <Input 
            type="text" 
            placeholder="Amount (Min. 0.001ETH)" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)} 
            />
            <Button
                className='bg-blue-500'
                onClick={handleTopUp}
            >
                Top up your account
            </Button>
        </div>
    );
}