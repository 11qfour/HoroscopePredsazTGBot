require('dotenv').config();
const { Bot, GrammyError, HttpError, Keyboard, InlineKeyboard} = require('grammy') //switch liblary
const token = process.env.TOKEN;
const {hydrate} = require('@grammyjs/hydrate');
const {parseHoroscope} = require('./parsing');
const { timeInterval, zodiacSigns, againPrediction} = require('./options');
const bot = new Bot (token)
bot.use(hydrate());


const chats = {};

let sign;
let interval;

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
    await ctx.reply(`*Доступные команды бота:*\n/get\\_prediction \\- _получить горокоп\\-предсказание_`, {
        parse_mode: "MarkdownV2", //change style with Md2
        reply_markup: {remove_keyboard: true} 
    });
})

const _prediction = async ctx => {
    try{
        const username = ctx.from.username;
        const link = 'https://t.me/' + username;
        const escapedUsername = username.replace(/([_*[\]()~`>#+-=|{}.!])/g, '\\$1'); // Экранируем символы в username
        let users = `Предсказание для [${escapedUsername}](${link}):`;
        const sentMessage = await ctx.reply(`Посылаем запрос звездам! Ожидайте!`);

    // Получаем данные (парсинг)
        let text = await parseHoroscope(sign, interval); // Функция парсинга
        const escapedText = text.replace(/([_*[\]()~`>#+-=|{}.!])/g, '\\$1'); // Экранируем символы
        let message = users + '\n' + escapedText;

        // Редактируем первое сообщение с новым текстом
        await ctx.api.editMessageText(ctx.chat.id, sentMessage.message_id, message, {
            reply_markup: new InlineKeyboard().text('Ещё предсказание', 'againPrediction'),
            parse_mode: "MarkdownV2", // Изменение стиля с помощью MarkdownV2
            disable_web_page_preview: true
    });
    }   
    catch (error) {
        console.error('Error in _prediction:', error);
        await ctx.reply('Произошла ошибка при получении предсказания. Попробуйте позже.');
    }
}

const intervalSelection = async ctx => {
    await ctx.reply('Выберите временной промежуток для предсказания:', timeInterval
    );
}

bot.callbackQuery(/.Interval/, async ctx =>{ //after selection timeInterval
    interval=ctx.callbackQuery.data.replace('Interval','/');
    console.log(interval);
    await ctx.answerCallbackQuery('');
    await ctx.callbackQuery.message.editText('Выберите интересующий вас знак зодиака',zodiacSigns);
})

bot.callbackQuery(/.Zod/, async ctx =>{ //after selection timeInterval
    sign = ctx.callbackQuery.data.replace('Zod', '/');
    console.log(sign);
    await ctx.answerCallbackQuery('');
    return _prediction(ctx); // Получаем предсказание как строку
})

bot.hears(/.редсказание/, async ctx => { 
    return  intervalSelection(ctx);
})

bot.callbackQuery(/.Pred/, async ctx => { 
    await ctx.answerCallbackQuery(''); //быстро прогружается
    return  intervalSelection(ctx);
})

bot.command('get_prediction', async ctx => { 
    return  intervalSelection(ctx);
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
