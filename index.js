require('dotenv').config();
const { Bot, GrammyError, HttpError, Keyboard, InlineKeyboard} = require('grammy') //switch liblary
const token = process.env.TOKEN;
const {hydrate} = require('@grammyjs/hydrate');
const {gameOptions, againOptions, timeInterval, zodiacSigns} = require('./options');
const bot = new Bot (token)
bot.use(hydrate());
const puppeteer = require('puppeteer');

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
    await ctx.reply(`*Доступные команды бота:*\n/get\\_prediction \\- _получить горокоп\\-предсказание_`, {
        parse_mode: "MarkdownV2", //change style with Md2
        reply_markup: {remove_keyboard: true} 
    });
})

const parses = async () => {
    let fullLink = importantLink + sign + interval;
    console.log(fullLink);

    try {
        const browser = await puppeteer.launch({
            headless: true, // Запуск в headless режиме
            args: [
                '--ignore-certificate-errors',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--disable-extensions'
            ]
        });

        const page = await browser.newPage();

        // Отключение загрузки изображений и шрифтов для ускорения
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const resourceType = req.resourceType();
            if (resourceType === 'image' || resourceType === 'font' || resourceType === 'stylesheet') {
                req.abort();
            } else {
                req.continue();
            }
        });

        await page.goto(fullLink, { timeout: 60000 });

        // Ждем загрузки нужного элемента
        await page.waitForSelector('.article.article_white.article_prediction.article_collapsed.margin_top_20');

        const extractedText = await page.evaluate(() => {
            const articleElement = document.querySelector('.article.article_white.article_prediction.article_collapsed.margin_top_20');
            if (!articleElement) {
                console.error('Article element not found');
                return '';
            }

            const articleTextElement = articleElement.querySelector('.article__text');
            if (!articleTextElement) {
                console.error('Article text element not found');
                return '';
            }

            const itemElements = articleTextElement.querySelectorAll('.article__item.article__item_alignment_left.article__item_html');
            if (!itemElements || itemElements.length === 0) {
                console.error('Item elements not found');
                return '';
            }

            let itemsArray = Array.from(itemElements);
            //const filteredItems = itemsArray.filter(item => !item.querySelector('a'));
            //если предсказание на месяц, то необходимо убирать последний абзац с ссылкой на некст месяц
            return itemsArray.map(item => item.textContent.trim()).join('\n');
        });

        await browser.close();
        return extractedText;

    } catch (error) {
        console.error('Error during parsing:', error);
        throw error;
    }
};

const _prediction = async ctx => {
    const username = ctx.from.username;
    const link = 'https://t.me/' + username;
    const escapedUsername = username.replace(/([_*[\]()~`>#+-=|{}.!])/g, '\\$1'); // Экранируем символы в username
    let users = `Предсказание для [${escapedUsername}](${link}):`;
    const sentMessage = await ctx.reply(`Посылаем запрос звездам! Ожидайте!`);

    // Получаем данные (парсинг)
    let text = await parses(); // Функция парсинга
    const escapedText = text.replace(/([_*[\]()~`>#+-=|{}.!])/g, '\\$1'); // Экранируем символы
    let message = users + '\n' + escapedText;

    // Редактируем первое сообщение с новым текстом
    await ctx.api.editMessageText(ctx.chat.id, sentMessage.message_id, message, {
        parse_mode: "MarkdownV2", // Изменение стиля с помощью MarkdownV2
        disable_web_page_preview: true
    });
}

const intervalSelection = async ctx => {
    await ctx.reply('Выберите временной промежуток для предсказания:', timeInterval
    );
}

bot.callbackQuery(/.Interval/, async ctx =>{ //after selection timeInterval
    interval=ctx.callbackQuery.data.replace('Interval','/');
    console.log(interval);
    await ctx.answerCallbackQuery('Ваш ответ принят');
    await ctx.callbackQuery.message.editText('Выберите интересующий вас знак зодиака',zodiacSigns);
})

bot.callbackQuery(/.Zod/, async ctx =>{ //after selection timeInterval
    sign = ctx.callbackQuery.data.replace('Zod', '/');
    console.log(sign);
    await ctx.answerCallbackQuery('Ваш ответ принят');
    return _prediction(ctx); // Получаем предсказание как строку
})

bot.hears(/.редсказание/, async ctx => { 
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
