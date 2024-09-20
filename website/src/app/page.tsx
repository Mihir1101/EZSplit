"use client";
import Landing from "./landing";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Connect } from "./wallet/connect";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const address = window.ethereum?.selectedAddress ?? undefined;
    if (address != undefined) {
      router.push("/user");
    }
  }, []);
  return (
    <>
      <Landing />
    </>
  );
}