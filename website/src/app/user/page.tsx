"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Web3 from "web3"; // Import Web3 properly
import { TopUpBtn } from "@/components/Buttons/TopUpBtn";
import { CreateMultisigBtn } from "@/components/Buttons/CreateMultisigBtn";
import { Connect } from "../wallet/connect";
import Background from "@/components/Background/Background";
import Image from "next/image";
import Logo from "@/assets/images/EZ_Split.png";
import Dashboard from "../dashboard/page";
import { axios } from "../../components/axios/axios"; // Import axios properly

export default function User() {
  const router = useRouter();
  const [multisig, setMultisig] = useState<string>(""); // Store multisig address
  const [account, setAccount] = useState<string>();
  const [balance, setBalance] = useState<string>();

  const fetchBalance = async (account: string) => {
    const web3 = new Web3(window.ethereum);
    const weiBalance = await web3.eth.getBalance(account);
    setBalance(web3.utils.fromWei(weiBalance, "ether")); // Convert balance from Wei to Ether
  };

  const fetchData = async () => {
    if (!window.ethereum?.selectedAddress) {
      router.push("/");
    } else {
      const selectedAccount = window.ethereum?.selectedAddress;
      setAccount(selectedAccount);
      fetchBalance(selectedAccount); // Fetch user's balance

      console.log(`/api/user/ui/${selectedAccount}`);
      try {
        let response = await axios.get(`/api/user/ui/${selectedAccount}`);
        response = response.data;
        console.log(response);
        const multisigData = response.data?.data || null;
        if (multisigData) {
          setMultisig(multisigData); // Set the multisig data
        }
        console.log(multisigData);
        console.log(selectedAccount);
      } catch (error) {
        console.error("Error fetching multisig", error);
      }
    }
  };

  useEffect(() => {
    const handleChainChanged = () => {
      window.location.reload(); // Reload the page on chain/network change
    };

    const handleAccountsChanged = async (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (accounts.length > 0) {
        const newAccount = accounts[0];
        setAccount(newAccount);
        fetchBalance(newAccount); // Fetch balance for the new account
      } else {
        router.push("/"); // If no accounts are connected, redirect to the home page
      }
    };

    window.ethereum?.on("chainChanged", handleChainChanged); // Chain/network change listener
    window.ethereum?.on("accountsChanged", handleAccountsChanged); // Account change listener
    fetchData();

    return () => {
      window.ethereum?.removeListener("chainChanged", handleChainChanged);
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);

  return (
    <>
      <Background />
      <div className="min-h-screen flex items-center justify-start bg-black-100 flex-col">
        <div className="h-20 w-screen flex items-center justify-between p-14 px-8 text-xl">
          <Image src={Logo} alt="Logo" className="h-24 w-auto" />
          <Connect />
        </div>
        <div className="z-10">
          {multisig ? <Dashboard /> : <CreateMultisigBtn />}
        </div>
      </div>
    </>
  );
}
