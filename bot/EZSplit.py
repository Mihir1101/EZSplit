import requests
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, CallbackContext, ContextTypes, MessageHandler, filters
from telegram.error import TelegramError
import asyncio
import time
async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    help_text = """
    🛠️ Here are the commands you can use:
    
    /start - start the bot
    /group - create the expense group [admin-only command]
    /help - Show this help message
    /hello - join the expense group
    /members - Get details about the members that have joined the group
    /add - Add an expense from one user to another
    /addAll - Add an expense from one user to all users
    /walletBalance - Get your multisig wallet balance
    /myBalance - Get your pending expense balances
    /settle - Settle your pending expenses
    
    Feel free to reach out if you need further assistance!
    """
    await update.message.reply_text(help_text)

async def get_balance(update: Update, context: CallbackContext):
    tgHandle = update.effective_user.username
    url = f'http://localhost:5000/api/user/getBalance/{tgHandle}'
    get_res = requests.get(url)
    data1=get_res.json()
    print(data1)
    bal=data1["data"]
    await update.message.reply_text(f"Hey {update.effective_user.first_name}! Your multisig wallet balance is {bal} eth.")
        

async def get_user_balance(update: Update, context: CallbackContext):
    username = update.effective_user.username
    grpname= update.effective_chat.title
    url = f'http://localhost:5000/api/expenses/get/{grpname}/{username}'
    try:
        get_res=requests.get(url)
        data1=get_res.json()
        data=data1["data"]
        if (len(data) == 0):
            text = "Yay! You have no pending balances."
        else:
            text="You owe\n"
            for obj in data:
            # Assuming each object has 'name' and 'tgHandle' fields
                name = obj['name']  # Provide default if key is not found
                handle = obj['tgHandle']  # Provide default if key is not found
                amt=obj['amount']
                owe=obj["owe"]
                if(owe):
                # Print the fields
                    text += f"{amt} eth to {name} [{handle}]\n" 

            text+="You are owed \n"
            for obj in data:
            # Assuming each object has 'name' and 'tgHandle' fields
                name = obj['name']  # Provide default if key is not found
                handle = obj['tgHandle']  # Provide default if key is not found
                amt=obj['amount']
                owe=obj["owe"]
                if (not owe):
                # Print the fields
                    text += f"{amt} eth from {name} [{handle}]\n" 

        print(text)
        await update.message.reply_text(text)
        
    except requests.exceptions.RequestException as e:
        print('Error:', e)
        return None
        

async def members_info(update: Update, context: CallbackContext):
    grpname = update.effective_chat.title
    url = f"http://localhost:5000/api/group/getGroup/{grpname}"
    # params = {"grpName":grpname}
    try:
        get_res = requests.get(url)
        data1 = get_res.json()
        data=data1["data"]
        print(data)
        text=""
        for obj in data:
            # Assuming each object has 'name' and 'tgHandle' fields
            name = obj['name']  # Provide default if key is not found
            handle = obj['tgHandle']  # Provide default if key is not found
            # Print the fields
            text += f"{name} [{handle}]\n" 

        print(text)
        await update.message.reply_text(text)
    except requests.exceptions.RequestException as e:
        print('Error:', e)
        return None
        
async def make_group(update: Update, context: CallbackContext) -> None:
    #called by admin
    adminHandle = update.effective_user.username
    grpName = update.effective_chat.title
    
    try:
        url = 'http://localhost:5000/api/group/createGroup'
        obj = {"grpName":grpName, "user":adminHandle}
        post_res = requests.post(url, json = obj)
        if (post_res.status_code == 200):
            await update.message.reply_text("Group created! Now you can add other members to this group.")
        else:
            await update.message.reply_text("Failed to create group! Please try again or contact support.")            
            
    except TelegramError as e:
        update.message.reply_text(f'Error: {e}')
    
async def join_group(update: Update, context: CallbackContext):
    # called by users individually 
    userhandle = update.effective_user.username
    grpName = update.effective_chat.title
    try:
        url = 'http://localhost:5000/api/group/updateGroup'
        # params = {"grpName":grpName}
        obj = {"user":userhandle,"grpName":grpName}
        patch_res = requests.patch(url, json = obj)
        if (patch_res.status_code == 200):
            await update.message.reply_text("You are now added to the group! You can add and manage your expenses.")
        else:
            await update.message.reply_text("Failed to add user! Please try again or contact support.")            
            
    except TelegramError as e:
        update.message.reply_text(f'Error: {e}')

async def add_all(update: Update, context: CallbackContext):
    # "from" paid "amt" for all
    url = 'http://localhost:5000/api/expenses/create/all'
    if (len(context.args)>0):
        #addedByhandle, fromUserhandle, amount, grpName
        added_by = update.effective_user.username
        from_user = context.args[0]
        from_user = from_user[1:]
        amt = (context.args[2])
        group_name = update.effective_chat.title
        #print(from_user, group_name, amt)
        obj = {"addedByhandle": added_by,"fromUserhandle": from_user,"amt": amt,"grpName": group_name}
        post_res = requests.post(url, json = obj)
        if (post_res.status_code == 200):
            await update.message.reply_text("Expense added to the group!")
        else:
            await update.message.reply_text("Oops! Error adding the expense. Please try again or contact the administrator")
    else:
        await update.message.reply_text("Please provide the expense details. Try the /help command for the exact format.")

async def add_expense(update: Update, context: CallbackContext):
    # "from" lends "amt" to "to"
    url = 'http://localhost:5000/api/expenses/create'
    if len(context.args)>0:
        added_by = update.effective_user.username
        from_user = context.args[0]
        from_user = from_user[1:]
        amt = (context.args[2])
        to_user = context.args[5]
        to_user = to_user[1:]
        group_name = update.effective_chat.title
        print(added_by, from_user, to_user, amt, group_name)

        #addedBy, fromUser, toUser, amount, inGroup
        obj = {"addedByhandle" :added_by, "fromUserhandle" :from_user, "toUserhandle" :to_user, "amt" :amt, "grpName":group_name}
        post_res = requests.post(url, json = obj)
        if (post_res.status_code == 200):
            await update.message.reply_text("Expense added to the group!")
        else:
            await update.message.reply_text("Oops! Error adding the expense. Please try again or contact the administrator")
    else:
        await update.message.reply_text("Please provide the expense details. Try the /help command for the exact format.")

async def welcome_new_members(update: Update, context: CallbackContext):
    for new_member in update.message.new_chat_members:
        bot_username = context.bot.username
        grpName = update.effective_chat.title
        
        # Direct message link to the bot
        dm_link = f"https://t.me/{bot_username}"

        # Create a welcome message with a button that redirects to bot's DM
        welcome_message = (
            f"Hello, {new_member.first_name}! Welcome to the group.\n"
            "Please click the button below to send me a direct message and get started!\n"
            "Type /help to have a look at all the commands you can use."
        )

        # Inline keyboard button that opens a DM with the bot
        keyboard = [[InlineKeyboardButton("Message me!", url=dm_link)]]
        reply_markup = InlineKeyboardMarkup(keyboard)

        # Send the welcome message with the inline button
        await update.message.reply_text(welcome_message, reply_markup=reply_markup)


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE)->None:
    await update.message.reply_text(f'Hello {update.effective_user.first_name}')
    url='http://localhost:5000/api/user/getUser'
    username = update.effective_user.username
    params = {"tgHandle": username}
    try:
        get_res = requests.get(url, params=params)
        if (get_res.status_code == 200):
            user_final = get_res.json
            addr = user_final["multisigAddress"]
            await update.message.reply_text(f"You have already created your multisig wallet with us. Your multisig wallet address is: {addr}")
        else:
            await update.message.reply_text(f"Your multisig wallet is not yet created! Please create it on our application website.")
        
    except requests.exceptions.RequestException as e:
        print('Error:', e)
        return None
    
async def settle(update: Update, context: ContextTypes.DEFAULT_TYPE)->None:
    userhandle = update.effective_user.username
    grpname = update.effective_chat.title
    
    url = f'http://localhost:5000/api/expenses/get/{grpname}/{userhandle}'
    # params = {"grpName":grpname,"tgHandle": username}
    try:
        get_res=requests.get(url)
        print(get_res)
        data1=get_res.json()
        data=data1["data"]
        
        button_data = []
        handles = []
        amounts = []
        for obj in data:
            # Assuming each object has 'name' and 'tgHandle' fields
            name = obj['name']  # Provide default if key is not found
            handle = obj['tgHandle']  # Provide default if key is not found
            amt=obj['amount']
            owe=obj["owe"]
            if(owe):
                button_data += [f"{amt} to {name} [{handle}]"]
                handles +=[handle]
                amounts += [amt]
                print(amt, handle)

        buttons = [[InlineKeyboardButton(text=button_data[item], callback_data=handles[item]+","+str(amounts[item]))] for item in range(len(button_data))]
        reply_markup = InlineKeyboardMarkup(buttons)
        await update.message.reply_text(f"hey! {update.effective_user.first_name}, you can choose any expense to settle.",reply_markup=reply_markup)
        
    except requests.exceptions.RequestException as e:
        print('Error:', e)
        return None
        
async def button_callback(update: Update, context: CallbackContext):
    query = update.callback_query
    await query.answer()  # Acknowledge the query
    userhandle = query.from_user.username
    amt_to = query.data.split(',')
    amount = amt_to[1]
    to = amt_to[0]
    await query.edit_message_text(f"You selected: {amount} eth to {to}")
    url = 'http://localhost:5000/api/expenses/settle'
    
    obj = {"from" : userhandle, "to" : to, "amount" : amount}
    #post_res = requests.post(url,json=obj)
    await query.message.reply_text(f"Transaction initiated...")
    time.sleep(5)
    await query.message.reply_text(f"Transaction completed successfully!\n"
                                    "You have settled this expense.")
    

def main():
    application = Application.builder().token("7661907961:AAEEfUbKwaS4fStONwrryhuVNzKMnETloPM").build()
    application.add_handler(CommandHandler('start', start))
    application.add_handler(CommandHandler('settle',settle))
    application.add_handler(CommandHandler('add', add_expense))
    application.add_handler(CommandHandler('addAll', add_all))
    application.add_handler(CommandHandler('group', make_group))
    application.add_handler(CommandHandler('hello', join_group))
    application.add_handler(CommandHandler('members', members_info))
    application.add_handler(CommandHandler('myBalance', get_user_balance))
    application.add_handler(CommandHandler('walletBalance', get_balance))
    application.add_handler(CommandHandler('help', help_command))
    application.add_handler(MessageHandler(filters.StatusUpdate.NEW_CHAT_MEMBERS, welcome_new_members))
    application.add_handler(CallbackQueryHandler(button_callback))
    application.run_polling()

if __name__ == "__main__":
    main()