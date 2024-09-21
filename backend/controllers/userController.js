// const ethers = require("ethers");
// const Safe = require("@safe-global/protocol-kit");
// const CHAIN_INFO=require("./../chain")
// const {
//   EthersAdapter,
//   SafeFactory,
//   SafeAccountConfig,
// } = require("@safe-global/protocol-kit");

const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const User = require("./../models/userModel");

// const provider = "https://rpc-holesky.morphl2.io"; // rpc url
// const signer = "0x4E238321ed92d96AcEe377EB607FAc8C845aAC75"; // signer address

// // const safeFactory = SafeFactory.init({
// //   provider,
// //   signer,
// // }).then(() => console.log("safe address initiated"));

// const getEthAdapter = async () => {
//   // Using ethers
//   signer = provider.getSigner();

//   console.log({ provider, signer });

//   const ethAdapter = new EthersAdapter({
//     ethers,
//     signerOrProvider: signer || provider,
//   });

//   console.log(provider, signer, ethAdapter);

//   return ethAdapter;
// };
// const createMultisigWallet = async (
//   owners, //Array<string>,
//   threshold // number
// ) => {
//   console.log({ owners, threshold });

//   const ethAdapter = await getEthAdapter();
//   const chainId = await ethAdapter.getChainId();
//   // const chainInfo = CHAIN_INFO[chainId.toString()];
//   const safeFactory = await SafeFactory.create({ ethAdapter });

//   console.log({ ethAdapter, safeFactory });

//   //SafeAccountConfig
//   const safeAccountConfig = {
//     owners,
//     threshold,
//   };

//   /* This Safe is connected to owner 1 because the factory was initialized 
//   with an adapter that had owner 1 as the signer. */
//   //Safe
//   const safe = await safeFactory.deploySafe({ safeAccountConfig });

//   const safeAddress = safe.getAddress();

//   console.log("Your Safe has been deployed:");
//   console.log(`${chainInfo.blockExplorerUrl}/address/${safeAddress}`);
//   console.log(`${chainInfo.transactionServiceUrl}/api/v1/safes/${safeAddress}`);
//   console.log(`https://app.safe.global/${chainInfo.symbol}:${safeAddress}`);

//   return safeAddress;
// };

// const createTransaction = async (safeAddress, destination, amount) => {

//  amount = ethers.utils.parseUnits(amount.toString(), 'ether').toString()
//   // MetaTransactionData 
//  const safeTransactionData= {
//      to: destination,
//      data: '0x',
//      value: amount
//  }

//  const ethAdapter = await getEthAdapter();
//  const safeSDK = await Safe.create({
//      ethAdapter,
//      safeAddress
//  })

//  const chainId = await ethAdapter.getChainId();
//  const chainInfo = CHAIN_INFO[chainId.toString()];

//  // Create a Safe transaction with the provided parameters
//  const safeTransaction = await safeSDK.createTransaction({ safeTransactionData })

//  // Deterministic hash based on transaction parameters
//  const safeTxHash = await safeSDK.getTransactionHash(safeTransaction)

//  // Sign transaction to verify that the transaction is coming from owner 1
//  const senderSignature = await safeSDK.signTransactionHash(safeTxHash)

//  const txServiceUrl = chainInfo.transactionServiceUrl;
//  const safeService = new SafeApiKit({ txServiceUrl, ethAdapter })
//  await safeService.proposeTransaction({
//      safeAddress,
//      safeTransactionData: safeTransaction.data,
//      safeTxHash,
//      senderAddress: (await ethAdapter.getSignerAddress()),
//      senderSignature: senderSignature.data,
//  })
//  console.log(`Transaction sent to the Safe Service: 
//  ${chainInfo.transactionServiceUrl}/api/v1/multisig-transactions/${safeTxHash}`)
// }

exports.createUser = catchAsync(async (req, res, next) => {
  const { name, tgHandle, userAddr } = req.body;

  //create a multisig 1-in-2 for this user , add in database
  // global helper Address, local user Address
  // const owners = [userAddr, helperAddr];
  // const threshold = 1;
  // const safeAddress = await createMultisigWallet(owners, threshold);

  //create user in the database
  const user = await User.create({
    name: name,
    tgHandle: tgHandle,
    multisigAddress: userAddr, //safeAddress
  });

  if (user) {
    res.status(200).json({
      status: "success",
      data: user,
    });
  } else {
    return new AppError("user not created", 404);
  }
});

exports.getUser = catchAsync(async (req, res, next) => {
  const { tgHandle } = req.params;
  const user = await User.findOne({ tgHandle: tgHandle });
  if (!user) {
    return new AppError("user is not created  yet", 404);
  } else {
    res.status(200).json({
      status: "success",
      data: user,
    });
  }
});

exports.getBalancesOfUser = catchAsync(async (req, res, next) => {
  const { user, toUser } = req.body;
});
