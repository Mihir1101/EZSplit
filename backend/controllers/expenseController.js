const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const Expense = require("./../models/expenseModel");
const Group = require("../models/groupModel");
const User = require("../models/userModel");
const {getEthAdapter}=require("./")
exports.addExpense = catchAsync(async (req, res, next) => {
  const { addedByhandle, fromUserhandle, toUserhandle, amt, grpName } =
    req.body;

  //error handling for null condition
  const addedBy = (await User.findOne({ tgHandle: addedByhandle }))._id;
  const fromUser = (await User.findOne({ tgHandle: fromUserhandle }))._id;
  const toUser = (await User.findOne({ tgHandle: toUserhandle }))._id;
  const inGroup = (await Group.findOne({ name: grpName }))._id;
  const amount = Number(amt);
  if (fromUser == toUser) {
    return res.status(200).json({
      message: "cannot add expense ",
    });
  }

  // if (A,B) already exists
  const ex = await Expense.findOne({
    fromUser: fromUser,
    toUser: toUser,
    inGroup: inGroup,
  });

  // if (B,A) already exists
  const ex2 = await Expense.findOne({
    fromUser: toUser,
    toUser: fromUser,
    inGroup: inGroup,
  });

  if (ex) {
    let prevAmt = ex.amount;
    let updatedAmt = prevAmt + amount;
    const updatedData = {
      addedBy,
      fromUser,
      toUser,
      amount: updatedAmt,
      inGroup,
    };

    let exUpdated = await Expense.findByIdAndUpdate(ex._id, updatedData, {
      new: true, // Returns the updated document
      runValidators: true, // Enforces schema validation
    });

    if (exUpdated) {
      return res.status(200).json({
        status: "success",
        data: exUpdated,
      });
    }
  } else if (ex2) {
    let prevAmt = ex2.amount;
    let updatedAmt = prevAmt - amount;
    const updatedData = {
      addedBy,
      toUser, //B
      fromUser, //A
      amount: updatedAmt,
      inGroup,
    };

    let exUpdated = await Expense.findByIdAndUpdate(ex._id, updatedData, {
      new: true, // Returns the updated document
      runValidators: true, // Enforces schema validation
    });

    if (exUpdated) {
      return res.status(200).json({
        status: "success",
        data: exUpdated,
      });
    }
  } else {
    const group = await Group.findById(inGroup);
    const expense = await Expense.create({
      addedBy,
      fromUser,
      toUser,
      amount,
      inGroup,
    });
    const exps = await Expense.find({ inGroup: inGroup });
    const updatedgrps = { expenses: exps };
    await Group.findByIdAndUpdate(inGroup, updatedgrps);
    if (expense) {
      return res.status(200).json({
        status: "success",
        data: expense,
      });
    }
  }

  return next(new AppError("expense not created", 404));
});

exports.addExpenseAll = catchAsync(async (req, res, next) => {
  //error handling for null condition
  const { addedByhandle, fromUserhandle, amt, grpName } = req.body;
  const addedBy = (await User.findOne({ tgHandle: addedByhandle }))._id;
  const fromUser = (await User.findOne({ tgHandle: fromUserhandle }))._id;
  const inGroup = (await Group.findOne({ name: grpName }))._id;
  const amount = Number(amt);
  const grp = await Group.findById(inGroup);
  const toUsers = grp.users;
  const n = toUsers.length;

  for (const user of toUsers) {
    const userhandle = (await User.findById(user)).tgHandle;
    const fromhandle = (await User.findById(fromUser)).tgHandle;

    if (userhandle != fromhandle) {
      console.log(user, fromUser);
      const ex = await Expense.findOne({
        fromUser: fromUser,
        toUser: user,
        inGroup: inGroup,
      });
      const ex2 = await Expense.findOne({
        fromUser: user,
        toUser: fromUser,
        inGroup: inGroup,
      });
      if (ex) {
        let prevAmt = ex.amount;
        //console.log(prevAmt, amount);
        let updatedAmt = prevAmt + amount / n;
        const updatedData = {
          addedBy,
          fromUser,
          toUser: user,
          amount: updatedAmt,
          inGroup,
        };

        const exUpdated = await Expense.findByIdAndUpdate(ex._id, updatedData, {
          new: true, // Returns the updated document
          runValidators: true, // Enforces schema validation
        });
      } else if (ex2) {
        let prevAmt = ex2.amount;
        //console.log(amount, prevAmt);

        let updatedAmt = prevAmt - amount / n;
        console.log(updatedAmt);
        if (updatedAmt > 0) {
          const updatedData = {
            addedBy,
            toUser: user, //B
            fromUser, //A
            amount: updatedAmt,
            inGroup,
          };
          let exUpdated = await Expense.findByIdAndUpdate(
            ex2._id,
            updatedData,
            {
              new: true, // Returns the updated document
              runValidators: true, // Enforces schema validation
            }
          );
        } else if (updatedAmt == 0) {
          //remove the expense
          const deleted = await Expense.deleteOne({ _id: ex2._id });
          const exps = await Expense.find({ inGroup: inGroup });
          const updatedgrps = { expenses: exps };
          await Group.findByIdAndUpdate(inGroup, updatedgrps);
        } else {
          const deleted = await Expense.deleteOne({ _id: ex2._id });
          const exps = await Expense.find({ inGroup: inGroup });
          const updatedgrps = { expenses: exps };
          await Group.findByIdAndUpdate(inGroup, updatedgrps);

          updatedAmt = -1 * updatedAmt;
          const expense = await Expense.create({
            addedBy,
            fromUser,
            toUser: user,
            amount: updatedAmt,
            inGroup,
          });
          const exps2 = await Expense.find({ inGroup: inGroup });
          const updatedgrps2 = { expenses: exps2 };
          await Group.findByIdAndUpdate(inGroup, updatedgrps2);
        }
      } else {
        const updatedAmt = amount / n;
        const group = await Group.findById(inGroup);
        const expense = await Expense.create({
          addedBy,
          fromUser,
          toUser: user,
          amount: updatedAmt,
          inGroup,
        });
        const exps = await Expense.find({ inGroup: inGroup });
        const updatedgrps = { expenses: exps };
        await Group.findByIdAndUpdate(inGroup, updatedgrps);
      }
    }
  }
  const expenses = [];

  return res.status(200).json({
    status: "success",
    data: expenses,
  });
});

exports.getExpensesForGroup = catchAsync(async (req, res, next) => {
  const { grpName } = req.params;
  const grp = (await Group.findOne({ name: grpName })).populate("expenses");
  res.status(200).json({
    message: "success",
    data: grp.expenses,
  });
});

exports.getExpensesForGroupAndUser = catchAsync(async (req, res, next) => {
  const { grpName, tgHandle } = req.params;
  const userId = (await User.findOne({ tgHandle }))._id;
  const expensesOfGroupAndUser = await Expense.findOne({
    name: grpName,
    toUser: userId,
  });

  res.status(200).json({
    message: "success",
    data: expensesOfGroupAndUser,
  });
});

// const createTransaction = async (safeAddress,destination, amount) => {
//  amount = ethers.utils.parseUnits(amount.toString(), 'ether').toString();
//  const safeTransactionData= {
//      to: destination,
//      data: '0x',
//      value: amount
//  }

//  const ethAdapter = await getEthAdapter(provider);
//  const safeSDK = await Safe.create({
//      ethAdapter,
//      safeAddress
//  })

//  if (sponsored) {
//      return TransactionUtils.relayTransaction(safeTransactionData, safeSDK)
//  }

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
//      senderAddress: (await ethAdapter.getSignerAddress())!,
//      senderSignature: senderSignature.data,
//  })
//  console.log(`Transaction sent to the Safe Service: 
//  ${chainInfo.transactionServiceUrl}/api/v1/multisig-transactions/${safeTxHash}`)
// }

// const relayTransaction = async (safeTransactionData: MetaTransactionData, safeSDK: Safe) => {

//  // Create a transaction object
//  safeTransactionData = {
//      ...safeTransactionData,
//      operation: OperationType.Call
//  }

//  // Usually a limit of 21000 is used but for smart contract interactions, you can increase to 100000 because of the more complex interactions.
//  const gasLimit = '100000'
//  const options: MetaTransactionOptions = {
//      gasLimit: ethers.BigNumber.from(gasLimit),
//      isSponsored: true
//  }

//  // Get Gelato Relay API Key: https://relay.gelato.network/
//  const GELATO_RELAY_API_KEY=process.env.REACT_APP_GELATO_RELAY_API_KEY!
//  const relayAdapter = new GelatoRelayAdapter(GELATO_RELAY_API_KEY)

//  //Prepare the transaction
//  const safeTransaction = await safeSDK.createTransaction({
//      safeTransactionData
//  })
   
//  const signedSafeTx = await safeSDK.signTransaction(safeTransaction)
 
//  const encodedTx = safeSDK.getContractManager().safeContract.encode('execTransaction', [
//      signedSafeTx.data.to,
//      signedSafeTx.data.value,
//      signedSafeTx.data.data,
//      signedSafeTx.data.operation,
//      signedSafeTx.data.safeTxGas,
//      signedSafeTx.data.baseGas,
//      signedSafeTx.data.gasPrice,
//      signedSafeTx.data.gasToken,
//      signedSafeTx.data.refundReceiver,
//      signedSafeTx.encodedSignatures()
//  ])

//  const relayTransaction: RelayTransaction = {
//      target: safeSDK.getAddress(),
//      encodedTransaction: encodedTx,
//      chainId: await safeSDK.getChainId(),
//      options
//  }
//  const response = await relayAdapter.relayTransaction(relayTransaction)

//  console.log(`Relay Transaction Task ID: https://relay.gelato.digital/tasks/status/${response.taskId}`)
 
// }

// const confirmTransaction = async (safeAddress: string, safeTxHash: string) => {

//  const ethAdapter = await this.getEthAdapter();
//  const chainId = await ethAdapter.getChainId();
//  const chainInfo = CHAIN_INFO[chainId.toString()];
//  const txServiceUrl = chainInfo.transactionServiceUrl;
//  const safeService = new SafeApiKit({ txServiceUrl, ethAdapter })
   
//    const safeSdk = await Safe.create({
//      ethAdapter,
//      safeAddress
//    })
   
//    const signature = await safeSdk.signTransactionHash(safeTxHash)
//    const response = await safeService.confirmTransaction(safeTxHash, signature.data)

//  console.log(`Transaction confirmed to the Safe Service: 
//  ${txServiceUrl}/api/v1/multisig-transactions/${safeTxHash}`)
//    return response
// }

// const executeTransaction = async (safeAddress: string, safeTxHash: string) => {

//  const ethAdapter = await this.getEthAdapter();
//  const chainId = await ethAdapter.getChainId();
//  const chainInfo = CHAIN_INFO[chainId.toString()];
//  const txServiceUrl = chainInfo.transactionServiceUrl;
//  const safeService = new SafeApiKit({ txServiceUrl, ethAdapter })
   
//  const safeSdk = await Safe.create({
//  ethAdapter,
//  safeAddress
//  })
   
//  const safeTransaction = await safeService.getTransaction(safeTxHash)
//  const executeTxResponse = await safeSdk.executeTransaction(safeTransaction)
//  const receipt = await executeTxResponse.transactionResponse?.wait()!
 
//  console.log('Transaction executed:')
//  console.log(`${chainInfo.blockExplorerUrl}/tx/${receipt.transactionHash}`)

//  console.log(`Transaction confirmed to the Safe Service: 
//  ${txServiceUrl}/api/v1/multisig-transactions/${safeTxHash}`)
//  return receipt
// }

// //add transaction
// exports.settleExpense = catchAsync(async (req, res, next) => {});
