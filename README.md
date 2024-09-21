# EZSplit

![alt text](https://github.com/Mihir1101/EZSplit/blob/main/website/assets/images/EZ_Split.jpg?raw=true)

## Introduction

EZSplit is an application designed to simplify on-chain transaction management for groups. With our Telegram bot integration, users can effortlessly add and settle group expenses, making financial interactions smooth and efficient.

## Features

- **Group Expense Management**: Easily add expenses within your Telegram group using simple commands.
- **Settlement Mechanism**: Settle net balances among group members with a single button click.
- **Multisig Wallets**: Each user in the group is provided with a multisig wallet for secure transaction signing.
- **Telegram Bot Integration**: Seamlessly interact with the application through a Telegram bot.

## How It Works

1. **Add the Telegram Bot**: Add the EZSplit bot to your Telegram group and let the group members interact with the bot.
2. **Track Expenses**: Use specific commands to add group expenses. The bot records these expenses and updates the net balances.
3. **Settlement**: When you’re ready to settle balances,check your blances for the group and click the settlement button for the one you wanna setlle. The backend will handle the multisig wallet signing for secure transactions.

## Getting Started

### Prerequisites

- Node.js
- MongoDB (for storing user and group data)
- A Telegram account for bot integration
- Web3 provider (like Infura or Alchemy) for interacting with the blockchain

### Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/yourusername/EZSplit.git
   cd EZSplit
   ```

2. **Install Dependencies**:

   ```javascript
    ~/EZSplit/website$ npm install
    ~/EZSplit/bot$ pip3 install telegram requests
    ~/EZSplit/backend$ npm install

   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the backend and website directories according to the `.env.example` of each of them.

4. **Start the Application**:

   1. Start the server

   ```bash
   npm run start
   ```

   2. Start the website

   ```bash
   npm run dev
   ```

   3. Start the bot

   ```bash
   python3 EZSplit.py
   ```

### Using the Telegram Bot

1. **Add the Bot to Your Group**: Search for the name `Billbot` bot on Telegram and add it to your group before adding other members.
2. **Add Expenses**:
   - Use the command `/add_expense [amount] [description]` to record an expense.
3. **Check your Expenses**:
   - Use `/myBalance` to view the net balances of all group members.
4. **Settle Balances**:
   - Click the “Settle” buttons provided on `myBalance` to trigger the settlement process. The bot will initiate a transaction using the multisig wallet.

## Backend Architecture

- **Multisig Wallets**: For every user in the group, a multisig wallet is created, enhancing security and ensuring that transactions require confirmations.
- **Transaction Signing**: When a settlement is initiated, the backend signs the transaction with the appropriate multisig wallet.
