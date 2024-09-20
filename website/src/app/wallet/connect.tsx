"use client";
import { useSDK } from "@metamask/sdk-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export const Connect = () => {
    const [account, setAccount] = useState<string>();
    const [isConnecting, setIsConnecting] = useState<boolean>(false);
    const { sdk, connected, connecting } = useSDK();
    const router = useRouter();

    useEffect(() => {
        const address = window.ethereum?.selectedAddress ?? undefined;
        setAccount(address);
    }, []);

    const connect = async () => {
        try {
            setIsConnecting(true);
            const accounts = await sdk?.connect();
            setAccount(accounts?.[0]);
            setIsConnecting(false);
            router.push("/user");
        } catch (err) {
            console.warn("failed to connect..", err);
        }
    };

    const disconnect = async () => {
        try {
            setAccount(undefined);
        } catch (err) {
            console.warn("failed to disconnect..", err);
        }
    }

    return (
        <div className="App">
            {account && connected ? (
                <>
                    <Button
                        className="font-bold bg-orange"
                        onClick={disconnect}
                        disabled={connecting}
                    >
                        {account.slice(0, 4) + "...." + account.slice(account.length - 4, account.length)}
                    </Button>
                </>
            ) : (
                <>
                    <Button
                        className="font-bold bg-orange"
                        onClick={connect}
                        disabled={connecting}
                    >
                        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                    </Button>
                </>
            )}
        </div>
    );
};