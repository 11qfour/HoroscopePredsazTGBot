const puppeteer = require('puppeteer');

 const parseHoroscope = async (sign, interval) => {
    let importantLink = 'https://horo.mail.ru/prediction/';
    let fullLink = importantLink + sign + interval;

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
}

module.exports =  {parseHoroscope}