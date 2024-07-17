require('dotenv').config();
const TelegramApi = require('node-telegram-bot-api')
const token = process.env.TOKEN;
const {gameOptions, againOptions} = require('./options')
const bot = new TelegramApi(token, {polling:true})

bot.setMyCommands([
    {command: '/start', description: 'Приветствие телеграмм-бота'},
    {command: '/help', description: 'Доступные команды'},
    {command: '/game', description: 'Сыграть в игру'},
])

const chats = {};

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, 'Сейчас я загадал цифру от 0 до 9, угадай её!')
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber;
    bot.sendMessage(chatId, 'Отгадывай', gameOptions)
}

const start = () =>{
    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;
        
        if (text === '/start'){
            await bot.sendSticker(chatId, 'https://tlgrm.eu/_/stickers/747/051/747051b3-c9df-46b2-9d60-2c5a5b7c9265/96/12.webp')
            bot.sendMessage(chatId, `Пользователь ${msg.chat.first_name} ${msg.chat.last_name}, добро пожаловать в телеграмм бот 11four`)
        }
        else if (text === '/help'){
            bot.sendMessage(chatId, '/start - запуск бота\n/help - список доступных команд\n/game - сыграть в игру')
        }
        else if (text === '/game'){
            return startGame(chatId);
        }
        else {
            bot.sendMessage(chatId, 'Такого я ещё не умею:( Напиши по-другому!')
        }
    })

    bot.on('callback_query', msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        if (data === '/again'){
            return startGame(chatId);
        }
        else if (data == chats[chatId]){
            bot.sendMessage(chatId, `Поздравляю, ты угадал цифру ${chats[chatId]}`, againOptions)
        }
        else{
            bot.sendMessage(chatId, `Ты не угадал, загаданная цифра ${chats[chatId]}`, againOptions)
        }
    })
}

start();