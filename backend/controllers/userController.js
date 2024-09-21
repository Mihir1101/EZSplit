const ethers = require("ethers");
const Safe = require("@safe-global/protocol-kit");
const CHAIN_INFO = require("./../chain");
const {
  EthersAdapter,
  SafeFactory,
  SafeAccountConfig,
} = require("@safe-global/protocol-kit");

const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const User = require("./../models/userModel");

// const rpcUrl = "https://rpc-holesky.morphl2.io"; // rpc url

// const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const helperAddr = "0x74bbf4b2223496C4547c44268242A5196E3c6499"; // signer address

// const safeFactory = SafeFactory.init({
//   provider,
//   signer,
// }).then(() => console.log("safe address initiated"));

exports.getEthAdapter = async (rpcUrl) => {
  // Using ethers
  const provider = new ethers.providers.Web3Provider(rpcUrl);
  signer = provider.getSigner();

  // console.log({ provider, signer });

  const ethAdapter = new EthersAdapter({
    ethers: ethers,
    signerOrProvider: signer || provider,
  });

  console.log(provider, signer, ethAdapter);

  return ethAdapter;
};
const createMultisigWallet = async (
  owners, //Array<string>,
  threshold, // number
  rpcUrl
) => {
  console.log({ owners, threshold });

  const ethAdapter = await getEthAdapter(rpcUrl);
  const chainId = await ethAdapter.getChainId();
  const chainInfo = CHAIN_INFO[chainId.toString()];
  const safeFactory = await SafeFactory.create({ ethAdapter });

  console.log({ ethAdapter, safeFactory });

  //SafeAccountConfig
  const safeAccountConfig = {
    owners,
    threshold,
  };

  /* This Safe is connected to owner 1 because the factory was initialized 
  with an adapter that had owner 1 as the signer. */
  //Safe
  const safe = await safeFactory.deploySafe({ safeAccountConfig });

  const safeAddress = safe.getAddress();

  console.log("Your Safe has been deployed:");
  console.log(`${chainInfo.blockExplorerUrl}/address/${safeAddress}`);
  console.log(`${chainInfo.transactionServiceUrl}/api/v1/safes/${safeAddress}`);
  console.log(`https://app.safe.global/${chainInfo.symbol}:${safeAddress}`);

  return safeAddress;
};

exports.createUser = catchAsync(async (req, res, next) => {
  const { name, tgHandle, userAddr, rpcUrl } = req.body;

  //create a multisig 1-in-2 for this user , add in database
  // global helper Address, local user Address
  const owners = [userAddr, helperAddr];
  const threshold = 1;
  const safeAddress = await createMultisigWallet(owners, threshold, rpcUrl);

  //create user in the database
  const user = await User.create({
    name: name,
    tgHandle: tgHandle,
    multisigAddress: safeAddress, //safeAddress
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
