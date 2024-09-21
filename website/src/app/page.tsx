"use client";
import HomeComponent from "./home";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Background from "@/components/Background/Background";

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
    <Background />
      <div className="absolute inset-0 z-10 h-full w-full">
        <HomeComponent />
      </div>
    </>
  );
}