"use client";
import HomeComponent from "./home";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

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
    <div className="absolute inset-0 -z-10 h-full w-full [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#ff8000_100%)]">
      <HomeComponent />
    </div>
    </>
  );
}