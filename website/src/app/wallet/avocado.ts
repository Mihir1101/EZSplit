import { ethers } from "ethers";
import Web3 from "web3";
import { createSafe } from "@instadapp/avocado";
import avocadoV1ABI from "./abi/avocado-v1-abi.json";
import avoForwarderV1ABI from "./abi/avo-forwarder-v1-abi.json";
import { computeAddress } from "ethers/lib/utils";

// -------------------------------- Types etc. -----------------------------------

interface ITransactionParams {
    id: string; // id for actions, e.g. 0 = CALL, 1 = MIXED (call and delegatecall), 20 = FLASHLOAN_CALL, 21 = FLASHLOAN_MIXED. Default value of 0 will work for all most common use-cases.
    salt: string; // salt to customize non-sequential nonce (if `avoNonce` is set to -1), we recommend at least to send `Date.now()`
    source: string; // source address for referral system
    actions: ITransactionAction[]; // actions to execute
    metadata: string; // generic additional metadata
    avoNonce: string; // sequential avoNonce as current value on the smart wallet contract or set to `-1`to use a non-sequential nonce
}

interface ITransactionAction {
    target: string; // the target address to execute the action on
    data: string; // the calldata to be passed to the call for each target
    value: string; // the msg.value to be passed to the call for each target. set to 0 if none
    operation: string; // type of operation to execute: 0 -> .call; 1 -> .delegateCall, 2 -> flashloan (via .call)
}

interface ITransactionForwardParams {
    gas: string; // minimum amount of gas that the relayer (AvoForwarder) is expected to send along for successful execution
    gasPrice: string; // UNUSED: maximum gas price at which the signature is valid and can be executed. Not implemented yet.
    validAfter: string; // time in seconds after which the signature is valid and can be executed
    validUntil: string; // time in seconds until which the signature is valid and can be executed
    value: string; // UNUSED: msg.value that broadcaster should send along. Not implemented yet.
}

interface ITransactionPayload {
    params: ITransactionParams;
    forwardParams: ITransactionForwardParams;
}

const types = {
    Cast: [
        { name: "params", type: "CastParams" },
        { name: "forwardParams", type: "CastForwardParams" },
    ],
    CastParams: [
        { name: "actions", type: "Action[]" },
        { name: "id", type: "uint256" },
        { name: "avoNonce", type: "int256" },
        { name: "salt", type: "bytes32" },
        { name: "source", type: "address" },
        { name: "metadata", type: "bytes" },
    ],
    Action: [
        { name: "target", type: "address" },
        { name: "data", type: "bytes" },
        { name: "value", type: "uint256" },
        { name: "operation", type: "uint256" },
    ],
    CastForwardParams: [
        { name: "gas", type: "uint256" },
        { name: "gasPrice", type: "uint256" },
        { name: "validAfter", type: "uint256" },
        { name: "validUntil", type: "uint256" },
        { name: "value", type: "uint256" },
    ],
};

const web3 = new Web3();

export const createMultiSig = async (userAddr:string) => {
    // -------------------------------- Setup -----------------------------------

    const avocadoRPCChainId = "634";

    const avocadoProvider = new ethers.providers.JsonRpcProvider("https://rpc.avocado.instadapp.io");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // request connection

    const avoForwarderAddress = "0x46978CD477A496028A18c02F07ab7F35EDBa5A54"; // available on 10+ networks

    // set up AvoForwarder contract (main interaction point) on e.g. Polygon
    const forwarder = new ethers.Contract(avoForwarderAddress, avoForwarderV1ABI, polygonProvider);

    const ownerAddress = userAddr; // Vitalik as owner EOA example
    const index = "1";
    const avocadoAddress = await forwarder.computeAvocado(ownerAddress, index);
    // const defaultAvocadoAddress = "0xB8fA67786Da2D8F7803E6f89C1b6BBd427bb6dFd";
    // const avocado = new web3.eth.Contract(avocadoV1ABI, defaultAvocadoAddress);
    // console.log({avocado});
    // const owner = await avocado.methods.owner().call({from: ownerAddress});
    // console.log(owner);
    // const owner = await avocado.owner();
    // console.log(owner);
    return avocadoAddress;
}
const polygonProvider = new ethers.providers.JsonRpcProvider("https://polygon-rpc.com");
const morphProvider = new ethers.providers.JsonRpcProvider("https://rpc-quicknode-holesky.morphl2.io");

export const ERC20Transfer = async (multisig: string, userAddr: string, usdc: number) => {
    // -------------------------------- Setup -----------------------------------

    const avocadoRPCChainId = "634";

    const avocadoProvider = new ethers.providers.JsonRpcProvider("https://rpc.avocado.instadapp.io");
    // can use any other RPC on the network you want to interact with:
    const usdcPolygonAddress = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
    const usdcMaticAddress = "";
    const lineaProvider = new ethers.providers.JsonRpcProvider("https://linea-sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161");
    const usdcLineaAddress = "";
    const chainId = (await polygonProvider.getNetwork()).chainId; // e.g. when executing later on Polygon

    // Should be connected to chainId 634 (https://rpc.avocado.instadapp.io), before doing any transaction
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // request connection

    const avoForwarderAddress = "0x46978CD477A496028A18c02F07ab7F35EDBa5A54"; // available on 10+ networks

    // set up AvoForwarder contract (main interaction point) on e.g. Polygon
    const forwarder = new ethers.Contract(avoForwarderAddress, avoForwarderV1ABI, polygonProvider);

    const ownerAddress = userAddr; // Vitalik as owner EOA example
    const index = "0";

    console.log({forwarder});
    const avocadoAddress = await forwarder.computeAvocado(ownerAddress, index)
    console.log({avocadoAddress});

    // set up Avocado
    const avocado = new ethers.Contract(avocadoAddress, avocadoV1ABI, polygonProvider);

    const isDeployed = (await polygonProvider.getCode(avocadoAddress)) !== "0x";

    // -------------------------------- Read values -----------------------------------

    let domainName, domainVersion; // domain separator name & version required for building signatures

    if (isDeployed) {
        // if avocado is deployed, can read values directly from there
        [domainName, domainVersion] = await Promise.all([avocado.DOMAIN_SEPARATOR_NAME(), avocado.DOMAIN_SEPARATOR_VERSION()]);
    } else {
        // if avocado is not deployed yet, AvoForwarder will resolve to the default values set when deploying the Avocado
        [domainName, domainVersion] = await Promise.all([forwarder.avocadoVersionName(ownerAddress, index), forwarder.avocadoVersion(ownerAddress, index)]);
    }

    const nonce = isDeployed ? await avocado.avoNonce() : "0";
    const requiredSigners = isDeployed ? await avocado.requiredSigners() : 1;
    if (requiredSigners > 1) {
        throw new Error("Example is for Avocado personal with only owner as signer");
    }

    // -------------------------------- Build transaction payload -----------------------------------

    // Sending "10" USDC (USDC has 6 decimals!)
    const usdcAmount = usdc * 1e6; // convert to USDC decimals

    const reciver = ownerAddress; // sending to owner EOA address

    const usdcInterface = new ethers.utils.Interface(["function transfer(address to, uint amount) returns (bool)"]);
    const calldata = usdcInterface.encodeFunctionData("transfer", [reciver, usdcAmount]); // create calldata from interface

    const action: ITransactionAction = {
        target: usdcAddress,
        data: calldata,
        value: "0",
        operation: "0",
    };

    // transaction with action to transfer USDC
    const txPayload: ITransactionPayload = {
        params: {
            actions: [action],
            id: "0",
            avoNonce: nonce.toString(), // setting nonce to previously obtained value for sequential avoNonce
            salt: ethers.utils.defaultAbiCoder.encode(["uint256"], [Date.now()]),
            source: "0x000000000000000000000000000000000000Cad0", // could set source here for referral system
            metadata: "0x",
        },

        forwardParams: {
            gas: "0",
            gasPrice: "0",
            validAfter: "0",
            validUntil: "0",
            value: "0",
        },
    };

    // -------------------------------- Estimate fee -----------------------------------

    // const estimate = await avocadoProvider.send("txn_multisigEstimateFeeWithoutSignature", [
    //     {
    //         message: txPayload, // transaction payload as built in previous step
    //         owner: ownerAddress, // avocado owner EOA address
    //         safe: avocadoAddress, // avocado address
    //         index: index,
    //         targetChainId: chainId,
    //     },
    // ]);
    // // convert fee from hex and 1e18, is in USDC:
    // console.log("estimate", Number(estimate.fee) / 1e18);

    // -------------------------------- Sign -----------------------------------

    const domain = {
        name: domainName, // see previous steps
        version: domainVersion, // see previous steps
        chainId: avocadoRPCChainId,
        verifyingContract: avocadoAddress, // see previous steps
        salt: ethers.utils.solidityKeccak256(["uint256"], [chainId]), // salt is set to actual chain id where execution happens
    };

    // make sure you are on chain id 634 (to interact with Avocado RPC) with expected owner
    const avoSigner = provider.getSigner();
    if ((await provider.getNetwork()).chainId !== 634) {
        throw new Error("Not connected to Avocado network");
    }
    if ((await avoSigner.getAddress()) !== ownerAddress) {
        throw new Error("Not connected with expected owner address");
    }

    // transaction payload as built in previous step
    const signature = await avoSigner._signTypedData(domain, types, txPayload);
    console.log("signature", signature);

    // -------------------------------- Execute -----------------------------------

    const txHash = await avocadoProvider.send("txn_broadcast", [
      {
        signatures: [
          {
            signature, // signature as built in previous step
            signer: ownerAddress, // signer address that signed the signature
          },
        ],
        message: txPayload, // transaction payload as built in previous step
        owner: ownerAddress, // avocado owner EOA address
        safe: avocadoAddress, // avocado address
        index,
        targetChainId: chainId,
        executionSignature: undefined, // not required for Avocado personal
      },
    ]);

    // // -------------------------------- Check status -----------------------------------

    // const txDetails = await avocadoProvider.send("api_getTransactionByHash", [txHash]);

    // // txDetails.status is of type 'pending' | 'success' | 'failed' | 'confirming'
    // // in case of 'failed', use the error message: txDetails.revertReason
    // if (txDetails.status === "failed") {
    //   // handle errors
    //   console.log(txDetails.revertReason);
    // } else {
    //   // status might still be pending or confirming
    //   console.log("tx executed! hash:", txHash, ", Avoscan: https://avoscan.co/tx/" + txHash);
    // }
}