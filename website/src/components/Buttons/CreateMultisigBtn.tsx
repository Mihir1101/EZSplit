import React, { use } from "react";
import { Button } from "@/components/ui/button";
import { axios } from "../axios/axios";
import { Input } from "@/components/ui/input";
import { createSafe, setRpcUrls} from '@instadapp/avocado'
import { ethers } from 'ethers'
import Web3 from "web3";
import { useEffect } from "react";
import { createMultiSig, ERC20Transfer } from "@/app/wallet/avocado";
import { toast } from "react-toastify";

export const CreateMultisigBtn: React.FC = () => {
  const [name, setName] = React.useState<string>("");
  const [tgHandle, setTgHandle] = React.useState<string>("");
  const [userAddr, setUserAddr] = React.useState<string>();

  useEffect(() => {
    const web3 = new Web3(window.ethereum);
    web3.eth.getAccounts().then((accounts) => {
      setUserAddr(accounts[0]);
    });
  }, []);

  const handleCreateMultisig = async () => {
    try {
        const multiSig = await createMultiSig(userAddr);
        // await ERC20Transfer(multiSig, userAddr, usdc);

        toast.success(`Multisig created successfully. ${multiSig}`);
    } catch (error) {
      console.error("Error creating multisig:", error);
    }
  };
  return (
    <div>
      <div>No multisig found.</div>
      <Input
        type="text"
        placeholder="Name"
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        type="text"
        placeholder="Telegram handle"
        onChange={(e) => setTgHandle(e.target.value)}
      />
      `{name + tgHandle + userAddr}`
      <Button className="bg-blue-500" onClick={handleCreateMultisig}>
        Create a multisig wallet
      </Button>
    </div>
  );
};
