import React, { use } from 'react';
import { Button } from '@/components/ui/button';
import { axios } from '../axios/axios';
import { Input } from '@/components/ui/input';
import Web3 from 'web3';
import { useEffect } from 'react';
import {ethers} from 'ethers';

export const CreateMultisigBtn: React.FC = () => {
    const [name, setName] = React.useState<string>("");
    const [tgHandle, setTgHandle] = React.useState<string>("");
    const [userAddr, setUserAddr] = React.useState<string>();

    useEffect(() => {
        const web3 = new Web3(window.ethereum);
        web3.eth.getAccounts().then(accounts => {
            setUserAddr(accounts[0]);
        });
    }, []);

    const handleCreateMultisig = async () => {
        try {
            // Request account access if needed
            const ETHProvider = new ethers.providers.Web3Provider(window.ethereum as any);

            // Create a multisig wallet
            console.log("ETHProvider:", ETHProvider);
            const response = await axios.post("/api/user/createUser", { name:name, tgHandle:tgHandle, userAddr:userAddr, provider:ETHProvider});
            console.log("Multisig created:", response.data);
        } catch (error) {
            console.error("Error creating multisig:", error);
        }
    }
    return (
        <div>
            <div>No multisig found.</div>
            <Input type="text" placeholder="Name" onChange={(e) => setName(e.target.value)} />
            <Input type="text" placeholder="Telegram handle" onChange={(e) => setTgHandle(e.target.value)} />
            `{name + tgHandle + userAddr}`
            <Button
                className='bg-blue-500'
                onClick={handleCreateMultisig}
            >
                Create a multisig wallet
            </Button>
        </div>
    );
}