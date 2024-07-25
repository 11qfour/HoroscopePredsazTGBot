require('dotenv').config();
const { Bot, GrammyError, HttpError, Keyboard, InlineKeyboard} = require('grammy') //switch liblary
const token = process.env.TOKEN;
const {gameOptions, againOptions} = require('./options')
const bot = new Bot (token)
const chats = {};

bot.api.setMyCommands([
    {command: '/start', description: 'Запуск телеграмм-бота'},
    {command: '/help', description: 'Доступные команды'},
    {command: '/info', description: 'Cправка'},
])

bot.command('start', async ctx => {
    await ctx.reply(`Добро пожаловать в телеграмм-бот <b>11four</b>`, {
        parse_mode: "HTML", //change style with html
    });
})

bot.command('help', async ctx => {
    await ctx.reply(`*Доступные команды бота:*\n/advertising \\- _Реклама_\n/mark \\- _Оценить бота_,\n/get\\_prediction \\- _Получить предсказание_\n/share \\- Поделиться геолокацией\n/guess\\_the\\_number \\- сыграть в игру угадай число`, {
        parse_mode: "MarkdownV2", //change style with html
    });
})

bot.command('info', async ctx => {
    const markKeyboard = new Keyboard().text('/get_prediction').resized();
    await ctx.reply('Получить предсказание можно при введении /get_prediction',{
        reply_markup: markKeyboard
    });
})


bot.command('mark', async ctx => {
    const markKeyboard = new Keyboard().text('Бот плох').row().text('Бот может лучше').row().text('Бот хорош').resized();
    await ctx.reply('Оцените телеграмм-бота',{
        reply_markup: markKeyboard
    });
})


bot.hears(/[Бот .]/, async ctx => { //regex
    await ctx.reply(`Спасибо за вашу оценку\\!\nБудем рады увидеть ваш отзыв [здесь](link)`, {
        reply_parameters: {message_id: ctx.msg.message_id}, //answer on previous msg
        parse_mode: "MarkdownV2",
        reply_markup: {remove_keyboard: true} //clear keyboard
    });
})

bot.command('advertising', async ctx => {
    await ctx.react('🙈');
    let UserFirstName=ctx.from.first_name;
    let UserLastName=ctx.from.last_name;
    const InlineKeyboard2 = new InlineKeyboard().url('Перейти в музыкальный тг-канал', 'https://t.me/+otLdzE7i1x5mNjhi');
    await ctx.reply(`Hello, *_${UserFirstName} ${UserLastName}_*\\! Не забудь подписаться на тгк автора!`,{
        parse_mode: "MarkdownV2", //change style with markdown
        reply_markup: InlineKeyboard2
    });
})

bot.on('msg:location', async ctx => {
    await ctx.reply(`Местоположение определено!`,{
        reply_markup: {remove_keyboard: true}
    }); //work with media from users 
})

bot.hears(/.редсказание/, async ctx => { //регулярное выражение
    await ctx.reply(`Предсказание для ${ctx.from.first_name} ${ctx.from.last_name}:`, {
        reply_parameters: {message_id: ctx.msg.message_id} //answer on previous msg
    });
})

bot.command('get_prediction', async ctx => { //регулярное выражение
    await ctx.reply(`Предсказание для ${ctx.from.first_name} ${ctx.from.last_name}:`, {
        reply_parameters: {message_id: ctx.msg.message_id},//answer on previous msg
        reply_markup: {remove_keyboard: true} //clear keyboard
    });
})

bot.command('share', async ctx => {
    const shareKeyboard = new Keyboard().requestLocation('Разрешить доступ').placeholder('Отправь геолокацию').resized();
    ctx.reply('Разрешить доступ к геолокации?',{
        reply_markup: shareKeyboard
    })
})

const startGame = async  ctx =>{
    await ctx.reply('Сейчас я загадал цифру от 0 до 9, угадай её!')
    const randomNumber = Math.floor(Math.random() * 10)
    chats[ctx.chat.id] = randomNumber;
    await ctx.reply('Отгадывай', gameOptions)
}

bot.callbackQuery(/[0-9]/, async ctx => {
    await ctx.answerCallbackQuery('Ваш ответ принят');
    const data = ctx.callbackQuery.data; // Используем ctx.callbackQuery.data вместо msg.data
    const chatId = ctx.callbackQuery.message.chat.id; // Используем ctx.callbackQuery.message.chat.id вместо msg.message.chat.id
    
    if (data === '/again') {
        return startGame(); // Функция startGame должна быть определена где-то в коде
    } 
    else if (data == chats[chatId]) {
        await ctx.reply(`Поздравляю, ты угадал цифру ${chats[chatId]}`, againOptions);
    } else {
        await ctx.reply(`Ты не угадал, загаданная цифра ${chats[chatId]}`, againOptions);
    }
})

bot.callbackQuery('/again', async ctx => {
    return startGame(ctx); // Функция startGame должна быть определена где-то в коде
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


// const startGame = async (chatId) => {
//     await bot.sendMessage(chatId, 'Сейчас я загадал цифру от 0 до 9, угадай её!')
//     const randomNumber = Math.floor(Math.random() * 10)
//     chats[chatId] = randomNumber;
//     bot.sendMessage(chatId, 'Отгадывай', gameOptions)
// }

// const start = () =>{
//     bot.on('message', async msg => {
//         const text = msg.text;
//         const chatId = msg.chat.id;
        
//         if (text === '/start'){
//             await bot.sendSticker(chatId, 'https://tlgrm.eu/_/stickers/747/051/747051b3-c9df-46b2-9d60-2c5a5b7c9265/96/12.webp')
//             bot.sendMessage(chatId, `Пользователь ${msg.chat.first_name} ${msg.chat.last_name}, добро пожаловать в телеграмм бот 11four`)
//         }
//         else if (text === '/help'){
//             bot.sendMessage(chatId, '/start - запуск бота\n/help - список доступных команд\n/game - сыграть в игру')
//         }
//         else if (text === '/game'){
//             return startGame(chatId);
//         }
//         else {
//             bot.sendMessage(chatId, 'Такого я ещё не умею:( Напиши по-другому!')
//         }
//     })

//     bot.on('callback_query', msg => {
//         const data = msg.data;
//         const chatId = msg.message.chat.id;
//         if (data === '/again'){
//             return startGame(chatId);
//         }
//         else if (data == chats[chatId]){
//             bot.sendMessage(chatId, `Поздравляю, ты угадал цифру ${chats[chatId]}`, againOptions)
//         }
//         else{
//             bot.sendMessage(chatId, `Ты не угадал, загаданная цифра ${chats[chatId]}`, againOptions)
//         }
//     })

//     bot.on('inline_query', (query) => {
//         const queryText = query.query;
//         charId=query.id;
//         const results = [{
//             type: 'article',
//             id: '1',
//             title: 'Результат вашего запроса',
//             input_message_content: {
//                 message_text: 'Ваш ответ на запрос: ' + queryText
//             }
//         }];
    
//         bot.answerInlineQuery(chatId, results);
//     });

//     bot.catch((err)=> {
//         const ctx= err.ctx;
//         console.error(`error while handling update ${ctx.update.update_id}`);
//         const e = err.error;

//         if (e instanceof GrammyError){
//             console.error("error int request", e.description);
//         }
//         else if (e instanceof HttpError) //troubles with tg connection
//         {
//             console.error("Connection error: ", e);
//         }
//     })
// }