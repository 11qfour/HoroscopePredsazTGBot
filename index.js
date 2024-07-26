require('dotenv').config();
const { Bot, GrammyError, HttpError, Keyboard, InlineKeyboard} = require('grammy') //switch liblary
const token = process.env.TOKEN;
const {hydrate} = require('@grammyjs/hydrate');
const {gameOptions, againOptions, timeInterval, zodiacSigns} = require('./options');
const bot = new Bot (token)
bot.use(hydrate());

const chats = {};

let importantLink = 'https://horo.mail.ru/prediction/';
let interval;
let sign;

bot.api.setMyCommands([
    {command: '/start', description: 'Запуск телеграмм-бота'},
    {command: '/get_prediction', description: 'Получить гороскоп-предсказание'},
    {command: '/help', description: 'Доступные команды'}
])

bot.command('start', async ctx => {
    await ctx.reply(`Добро пожаловать в телеграмм\\-бот *Гороскоп\\-предсказание*`, {
        parse_mode: "MarkdownV2", 
        reply_markup: {remove_keyboard: true} 
    });
    const markKeyboard = new Keyboard().text('Хочу предсказание!').resized();
    await ctx.reply('Получить _гороскоп\\-предсказание_ командой */get\\_prediction* или написать "Хочу предсказание\\!"',{
        parse_mode: "MarkdownV2",
        reply_markup: markKeyboard
    });
})

bot.command('help', async ctx => {
    await ctx.reply(`*Доступные команды бота:*\n/get\\_prediction \\- _получить горокоп\\-предсказание_\n/guess\\_the\\_number \\- _проверить удачу в игре угадай число_`, {
        parse_mode: "MarkdownV2", //change style with Md2
        reply_markup: {remove_keyboard: true} 
    });
})

const _prediction = async ctx => {
    const username = ctx.from.username;
    const link = 'https://t.me/' + username;
    const escapedUsername = username.replace(/([_*[\]()~`>#+-=|{}.!])/g, '\\$1'); // Экранируем символы в username
    let fullLink=importantLink+sign+interval;
    console.log(fullLink);
    ctx.reply(`Предсказание для [${escapedUsername}](${link}):`,{
        parse_mode: "MarkdownV2", //change style with Md2
        reply_markup: {remove_keyboard: true} 
        //скрыть всплывающий виджет контакта
    })
}

const intervalSelection = async ctx => {
    await ctx.reply('Выберите временной промежуток для предсказания:', timeInterval
    );
}

bot.callbackQuery(/.Interval/, async ctx =>{ //after selection timeInterval
    interval=ctx.callbackQuery.data.replace('Interval','/');
    await ctx.answerCallbackQuery('Ваш ответ принят');
    await ctx.callbackQuery.message.editText('Выберите интересующий вас знак зодиака',zodiacSigns);
})

bot.callbackQuery(/.Zod/, async ctx =>{ //after selection timeInterval
    sign = ctx.callbackQuery.data.replace('Zod', '/');
    await ctx.answerCallbackQuery('Ваш ответ принят');
    return _prediction(ctx); // Получаем предсказание как строку
})

bot.hears(/.редсказание/, async ctx => { 
    return  intervalSelection(ctx);
})

bot.command('get_prediction', async ctx => { 
    return  intervalSelection(ctx);
})

const startGame = async  ctx =>{
    await ctx.reply('Сейчас я загадал цифру от 0 до 9, угадай её!',{
        reply_markup: {remove_keyboard: true} 
    })
    const randomNumber = Math.floor(Math.random() * 10)
    chats[ctx.chat.id] = randomNumber;
    await ctx.reply('Отгадывай', gameOptions)
}

bot.callbackQuery(['0-9'], async ctx => {
    await ctx.answerCallbackQuery('Ваш ответ принят');
    const data = ctx.callbackQuery.data; 
    const chatId = ctx.callbackQuery.message.chat.id;
    if (data == chats[chatId]) {
        await ctx.reply(`Поздравляю, ты угадал цифру ${chats[chatId]}, сегодня удача на твоей стороне!`, againOptions);
    } 
    else {
        await ctx.reply(`Ты не угадал, загаданная цифра ${chats[chatId]}, попробуешь ещё раз?`, againOptions);
    }
})

bot.callbackQuery('/again', async ctx => { 
    return startGame(ctx);
})

bot.command('guess_the_number', async ctx => {
    return startGame(ctx);
})

bot.catch((err)=> {
            const ctx= err.ctx;
            console.error(`error while handling update ${ctx.update.update_id}`);
            const e = err.error;
    
            if (e instanceof GrammyError){
                console.error("error int request", e.description);
            }
            else if (e instanceof HttpError) //troubles with tg connection
            {
                console.error("Connection error: ", e);
            }
        })

bot.start();
