"use client";
import { useSDK } from "@metamask/sdk-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FaSpinner } from "react-icons/fa";
import classNames from "classnames";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
            toast.success("Wallet connected successfully! Redirecting.....", {
                position: "bottom-right", // Set the position to bottom right
                autoClose: 3000, // Automatically close after 3 seconds
                onClose: () => router.push("/user"), // Redirect after toast closes
            });
        } catch (err) {
            console.warn("failed to connect..", err);
            setIsConnecting(false);
            toast.error("Failed to connect wallet. Please try again.", {
                position: "bottom-right",
            });
        }
    };

    const disconnect = async () => {
        try {
            setAccount(undefined);
            toast.success("Wallet disconnected successfully!", {
                position: "bottom-right",
            });
        } catch (err) {
            console.warn("failed to disconnect..", err);
            toast.error("Failed to disconnect wallet.", {
                position: "bottom-right",
            });
        }
    };

    return (
        <div className="App">
            <ToastContainer position="bottom-right" />
            {account && connected ? (
                <button
                    onClick={disconnect}
                    disabled={connecting}
                >
                    <span className="spark__container">
                        <span className="spark" />
                    </span>
                    <span className="backdrop" />
                    <span className="text">Connected</span>
                    <span className="text-xs text">{account.slice(0, 4) + "...." + account.slice(account.length - 5, account.length)}</span>
                </button>
            ) : (
                <Button
                    className={classNames(
                        "font-bold text-xl p-5",
                        { "bg-black cursor-not-allowed": isConnecting, "bg-black": !isConnecting }
                    )}
                    onClick={connect}
                    disabled={connecting || isConnecting}
                >
                    {isConnecting ? (
                        <span className="flex items-center">
                            <FaSpinner className="animate-spin mr-2" /> Connecting...
                        </span>
                    ) : (
                        <>
                            <span className="spark__container">
                                <span className="spark" />
                            </span>
                            <span className="backdrop" />
                            <span className="text">Connect Wallet</span>
                        </>
                    )}
                </Button>
            )}
        </div>
    );
};
