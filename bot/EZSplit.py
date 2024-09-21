import requests
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, CallbackContext, ContextTypes, MessageHandler, filters
from telegram.error import TelegramError
import asyncio

# async def get_balance(update: Update, context: CallbackContext):

# async def get_balance(update: Update, context: CallbackContext):
#     url = 'http://localhost:5000/api/expenses/get'
#     username = update.effective_user.username
#     grpname= update.effective_chat.title
#     params = {"grpName":grpname,"tgHandle": username}
#     try:
    

async def make_group(update: Update, context: CallbackContext) -> None:
    #called by admin
    adminHandle = update.effective_user.username
    grpName = update.effective_chat.title
    
    try:
        url = 'http://localhost:5000/api/group/createGroup'
        post_res = requests.post(url, json = obj)
        if (post_res.status_code == 200):
            await update.message.reply_text("Added group!")
        else:
            await update.message.reply_text("Failed to add group!")            
            
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
            await update.message.reply_text("Added expense!")
        else:
            await update.message.reply_text("error adding expense!")
    else:
        await update.message.reply_text("expected params not specified")

async def add_expense(update: Update, context: CallbackContext):
    # "from" lends "amt" to "to"
    url = 'http://localhost:5000/api/expenses/create'
    if len(context.args)>0:
        added_by = update.effective_user.username
        from_user = context.args[0]
        from_user = from_user[1:]
        amt = (context.args[2])
        to_user = context.args[4]
        to_user = to_user[1:]
        group_name = update.effective_chat.title
        print(added_by, from_user, to_user, amt, group_name)

        #addedBy, fromUser, toUser, amount, inGroup
        obj = {"addedByhandle" :added_by, "fromUserhandle" :from_user, "toUserhandle" :to_user, "amt" :amt, "grpName":group_name}
        post_res = requests.post(url, json = obj)
        if (post_res.status_code == 200):
            await update.message.reply_text("Added expense!")
        else:
            await update.message.reply_text("error adding expense!")
    else:
        await update.message.reply_text("expected params not specified")

async def welcome_new_members(update: Update, context: CallbackContext):
    for new_member in update.message.new_chat_members:
        bot_username = context.bot.username
        grpName = update.effective_chat.title
        #store new_member handle somewhere along with the group name, can store in 2d list in python script only 
        current_grp+=[new_member.username]
        groups[grpName] = current_grp
        
        # Direct message link to the bot
        dm_link = f"https://t.me/{bot_username}"

        # Create a welcome message with a button that redirects to bot's DM
        welcome_message = (
            f"Hello, {new_member.first_name}! Welcome to the group.\n"
            "Please click the button below to send me a direct message and get started!"
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
            await update.message.reply_text(f"Your multisig address is: {addr}")
        else:
            await update.message.reply_text(f"Your multisig is not yet created! please create it on our application.")
        
    except requests.exceptions.RequestException as e:
        print('Error:', e)
        return None
    
async def settle(update: Update, context: ContextTypes.DEFAULT_TYPE)->None:
    await update.message.reply_text(f"hey")
    options = ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5"]
    keyboard = [[InlineKeyboardButton(option, callback_data=str(index))] for index, option in enumerate(options)]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text("You have the following payments to make:", reply_markup=reply_markup)

async def button_call_2(update: Update, context: ContextTypes.DEFAULT_TYPE)->None:
    query = update.callback_query
    await query.answer()
    await query.edit_message_text(text=f"Selected option: {query.data}")
    

def main():
    application = Application.builder().token("7661907961:AAEEfUbKwaS4fStONwrryhuVNzKMnETloPM").build()
    application.add_handler(CommandHandler('start', start))
    application.add_handler(CommandHandler('settle',settle))
    application.add_handler(CommandHandler('add', add_expense))
    application.add_handler(CommandHandler('addAll', add_all))
    application.add_handler(CommandHandler('group', make_group))
    application.add_handler(MessageHandler(filters.StatusUpdate.NEW_CHAT_MEMBERS, welcome_new_members))
    application.add_handler(CallbackQueryHandler(button_call_2))
    application.run_polling()

if __name__ == "__main__":
    main()