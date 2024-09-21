import React from "react";
import { Button } from "@/components/ui/button";
import { axios } from "../axios/axios";
import { Input } from "@/components/ui/input";
import Web3 from "web3";
import { useEffect } from "react";
import { createMultiSig, ERC20Transfer } from "@/app/wallet/avocado";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";

export const CreateMultisigBtn: React.FC = () => {
    const [name, setName] = React.useState<string>("");
    const [tgHandle, setTgHandle] = React.useState<string>("");
    const [userAddr, setUserAddr] = React.useState<string>();
    const router = useRouter();

    useEffect(() => {
        const web3 = new Web3(window.ethereum);
        web3.eth.getAccounts().then((accounts) => {
            setUserAddr(accounts[0]);
        });
    }, []);

    const handleCreateMultisig = async () => {
        try {
            const multiSig = await createMultiSig(userAddr);
            await axios.post("/api/user/createUser", {
                name: name,
                tgHandle: tgHandle,
                multisigAddress: multiSig,
                accountAddr: userAddr,
                balance: 0,
            });
            
            toast.success(`Multisig created successfully. ${multiSig}`,{
                onClose: () => router.push("/dashboard"),
            });
        } catch (error) {
            console.error("Error creating multisig:", error);
        }
    };
    return (
        <>
        <ToastContainer position="bottom-right" />
        <div className="flex justify-center items-center flex-col gap-10 h-auto p-10 pt-20 w-screen">
            <div className="">
                <p className="text-6xl font-thin text-center">
                    Setup Your 
                    <span className="text-orange font-extrabold"> Wallet</span>!
                </p>
            </div>
            <Input
                type="text"
                placeholder="Name"
                className="w-1/4 p-5 pl-2 placeholder-opacity-75 border-x-0 border-t-0 text-xl h-10"
                onChange={(e) => setName(e.target.value)}
                />
            <Input
                type="text"
                placeholder="Telegram handle"
                className="w-1/4 p-5 pl-2 placeholder-opacity-75 border-x-0 border-t-0 text-xl h-10"
                onChange={(e) => setTgHandle(e.target.value)}
                />
            <Button className="bg-blue-500 rounded-2xl text-xl p-6 hover:bg-blue-500/2 mt-8 hover:scale-95" onClick={handleCreateMultisig}>
                Create a multisig wallet
            </Button>
        </div>
                </>
    );
};
