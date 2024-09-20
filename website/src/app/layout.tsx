"use client";
import "./globals.css";
import React from "react";
import { MetaMaskProvider } from "@metamask/sdk-react";

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <React.StrictMode>
      <MetaMaskProvider
        debug={false}
        sdkOptions={{
          dappMetadata: {
            name: "Example React Dapp",
            url: "localhost:3000",
          },
          infuraAPIKey: process.env.INFURA_API_KEY
        }}
      >
        <html lang="en">
          <body>
            {children}
          </body>
        </html>
      </MetaMaskProvider>
    </React.StrictMode>
  );
}
