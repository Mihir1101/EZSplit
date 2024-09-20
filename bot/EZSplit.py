import requests
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, CallbackContext, ContextTypes
import asyncio

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE)->None:
    await update.message.reply_text(f'Hello {update.effective_user.first_name}')
    url=''
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
    application.add_handler(CallbackQueryHandler(button_call_2))
    application.run_polling()

if __name__ == "__main__":
    main()