import { ethers } from "ethers";
import SafeApiKit from "@safe-global/api-kit";
import Safe, {
  EthersAdapter,
  SafeFactory,
  SafeAccountConfig,
} from "@safe-global/protocol-kit";
import {
  MetaTransactionData,
  OperationType,
  MetaTransactionOptions,
  RelayTransaction,
} from "@safe-global/safe-core-sdk-types";
import { CHAIN_INFO } from "./chain";
// import { SafeAuthKit, Web3AuthAdapter } from "@safe-global/auth-kit";

declare global {
  interface Window {
    ethereum: any;
  }
}

export const getEthAdapter = async () => {
  // Using ethers

  let provider, signer;

  if (!window.ethereum) {
    throw new Error("No crypto wallet found. Please install it.");
  }
  provider = new ethers.providers.Web3Provider(window.ethereum as any);

  //   if (useSigner) {
  //     // Triggers the wallet to ask the user to sign in
  //     await window.ethereum.send("eth_requestAccounts");
  //     signer = provider.getSigner();
  //   }

  console.log({ provider, signer });

  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: signer || provider,
  });

  console.log(provider, signer, ethAdapter);

  return ethAdapter;
};
export const createMultisigWallet = async (
  owners: Array<string>,
  threshold: number
) => {
  console.log({ owners, threshold });

  const ethAdapter = await getEthAdapter();
  const chainId = await ethAdapter.getChainId();
  const chainInfo = CHAIN_INFO[chainId.toString()];
  const safeFactory = await SafeFactory.create({ ethAdapter });

  console.log({ ethAdapter, safeFactory });

  const safeAccountConfig: SafeAccountConfig = {
    owners,
    threshold,
  };

  /* This Safe is connected to owner 1 because the factory was initialized 
        with an adapter that had owner 1 as the signer. */
  const safe: Safe = await safeFactory.deploySafe({ safeAccountConfig });

  const safeAddress = safe.getAddress();

  console.log("Your Safe has been deployed:");
  console.log(`${chainInfo.blockExplorerUrl}/address/${safeAddress}`);
  console.log(`${chainInfo.transactionServiceUrl}/api/v1/safes/${safeAddress}`);
  console.log(`https://app.safe.global/${chainInfo.symbol}:${safeAddress}`);

  return { safe };
};

export const createTransaction = async (
  safeAddress: string,
  destination: string,
  amount: number | string
) => {
  amount = ethers.utils.parseUnits(amount.toString(), "ether").toString();

  const safeTransactionData: MetaTransactionData = {
    to: destination,
    data: "0x",
    value: amount,
  };

  const ethAdapter = await getEthAdapter();
  const safeSDK = await Safe.create({
    ethAdapter,
    safeAddress,
  });

  const chainId = await ethAdapter.getChainId();
  const chainInfo = CHAIN_INFO[chainId.toString()];

  // Create a Safe transaction with the provided parameters
  const safeTransaction = await safeSDK.createTransaction({
    safeTransactionData,
  });

  // Deterministic hash based on transaction parameters
  const safeTxHash = await safeSDK.getTransactionHash(safeTransaction);

  // Sign transaction to verify that the transaction is coming from owner 1
  const senderSignature = await safeSDK.signTransactionHash(safeTxHash);

  const txServiceUrl = chainInfo.transactionServiceUrl;
  const safeService = new SafeApiKit({ txServiceUrl, ethAdapter });
  await safeService.proposeTransaction({
    safeAddress,
    safeTransactionData: safeTransaction.data,
    safeTxHash,
    senderAddress: (await ethAdapter.getSignerAddress())!,
    senderSignature: senderSignature.data,
  });
  console.log(`Transaction sent to the Safe Service: 
        ${chainInfo.transactionServiceUrl}/api/v1/multisig-transactions/${safeTxHash}`);
};

export const confirmTransaction = async (
  safeAddress: string,
  safeTxHash: string
) => {
  const ethAdapter = await getEthAdapter();
  const chainId = await ethAdapter.getChainId();
  const chainInfo = CHAIN_INFO[chainId.toString()];
  const txServiceUrl = chainInfo.transactionServiceUrl;
  const safeService = new SafeApiKit({ txServiceUrl, ethAdapter });

  const safeSdk = await Safe.create({
    ethAdapter,
    safeAddress,
  });

  const signature = await safeSdk.signTransactionHash(safeTxHash);
  const response = await safeService.confirmTransaction(
    safeTxHash,
    signature.data
  );

  console.log(`Transaction confirmed to the Safe Service: 
        ${txServiceUrl}/api/v1/multisig-transactions/${safeTxHash}`);
  return response;
};

export const executeTransaction = async (
  safeAddress: string,
  safeTxHash: string
) => {
  const ethAdapter = await getEthAdapter();
  const chainId = await ethAdapter.getChainId();
  const chainInfo = CHAIN_INFO[chainId.toString()];
  const txServiceUrl = chainInfo.transactionServiceUrl;
  const safeService = new SafeApiKit({ txServiceUrl, ethAdapter });

  const safeSdk = await Safe.create({
    ethAdapter,
    safeAddress,
  });

  const safeTransaction = await safeService.getTransaction(safeTxHash);
  const executeTxResponse = await safeSdk.executeTransaction(safeTransaction);
  const receipt = await executeTxResponse.transactionResponse?.wait()!;

  console.log("Transaction executed:");
  console.log(`${chainInfo.blockExplorerUrl}/tx/${receipt.transactionHash}`);

  console.log(`Transaction confirmed to the Safe Service: 
        ${txServiceUrl}/api/v1/multisig-transactions/${safeTxHash}`);
  return receipt;
};
