import requests
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, CallbackContext, ContextTypes
import asyncio

async def create_multi(username):
    url=''
    params = {"tgHandle": username}
    try:
        get_res = requests.post(url, params=params)
        if (get_res.status_code == 200):
            user_final = get_res.json
            addr = user_final["multisigAddress"]
            return addr
        else:
            error = "multisig not found! create one at our application."
            return error
        
    except requests.exceptions.RequestException as e:
        print('Error:', e)
        return None
    
    
async def hello(update: Update, context: ContextTypes.DEFAULT_TYPE)->None:
    await update.message.reply_text(f'Hello {update.effective_user.first_name}')
    keyboard_1 = [[InlineKeyboardButton("create", callback_data='create')],
                  [InlineKeyboardButton("settle", callback_data='settle')],
                  [InlineKeyboardButton("add", callback_data="add")]]
    reply_markup_1 = InlineKeyboardMarkup(keyboard_1)
    await update.message.reply_text("Hello from ezSplit. You can select from the given options:" , reply_markup=reply_markup_1)

async def settle(update: Update, context: ContextTypes.DEFAULT_TYPE)->None:
    await update.message.reply_text(f"hey")
    options = ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5"]
    keyboard = [[InlineKeyboardButton(option, callback_data=str(index))] for index, option in enumerate(options)]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text("You have the following payments to make:", reply_markup=reply_markup)

async def button_call_1(update: Update, context: ContextTypes.DEFAULT_TYPE)->None:
    query = update.callback_query
    await query.answer()
    await query.edit_message_text(text=f"Selected option: {query.data}")
    username = query.from_user.username
    if (query.data == 'create'):
        response = await create_multi(username)
        await query.edit_message_text(text="{response}")
        
async def button_call_2(update: Update, context: ContextTypes.DEFAULT_TYPE)->None:
    query = update.callback_query
    await query.answer()
    await query.edit_message_text(text=f"Selected option: {query.data}")
    

def main():
    application = Application.builder().token("7661907961:AAEEfUbKwaS4fStONwrryhuVNzKMnETloPM").build()
    application.add_handler(CommandHandler('hello', hello))
    application.add_handler(CommandHandler('settle',settle))
    application.add_handler(CallbackQueryHandler(button_call_1))
    application.add_handler(CallbackQueryHandler(button_call_2))
    application.run_polling()

if __name__ == "__main__":
    main()