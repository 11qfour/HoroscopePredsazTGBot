module.exports = {    
    timeInterval:{
        reply_markup: JSON.stringify({
            inline_keyboard:[
                [{text: 'Вчера', callback_data: 'yesterdayInterval'},{text: 'Сегодня', callback_data: 'todayInterval'},{text: 'Завтра', callback_data: 'tomorrowInterval'}],
                [{text: 'Неделя', callback_data: 'weekInterval'},{text: 'Месяц', callback_data: 'monthInterval'}],
            ]
        })
    }, 

    zodiacSigns:{
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text:'Овен', callback_data: 'ariesZod'},{text:'Телец', callback_data: 'taurusZod'},{text:'Близнецы', callback_data: 'geminiZod'},{text:'Рак', callback_data: 'cancerZod'}],
                [{text:'Лев', callback_data: 'leoZod'},{text:'Дева', callback_data: 'virgoZod'},{text:'Весы', callback_data: 'libraZod'},{text:'Скорпион', callback_data: 'scorpioZod'}],
                [{text:'Стрелец', callback_data: 'sagittariusZod'},{text:'Козерог', callback_data: 'capricornZod'},{text:'Водолей', callback_data: 'aquariusZod'},{text:'Рыбы', callback_data: 'piscesZod'}],
            ]
        })
    },

    againPrediction: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Ещё предсказание', callback_data:'againPred'}],
            ]
        })
    }, 
}