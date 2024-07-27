module.exports = {
    gameOptions: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: '1', callback_data:'1'},{text: '2', callback_data:'2'},{text: '3', callback_data:'3'}],
                [{text: '4', callback_data:'4'},{text: '5', callback_data:'5'},{text: '6', callback_data:'6'}],
                [{text: '7', callback_data:'7'},{text: '8', callback_data:'8'},{text: '9', callback_data:'9'}],
                [{text: '0', callback_data:'0'}],
            ]
        })
    },

    
    againOptions: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Играть ещё раз', callback_data:'/again'}],
            ]
        })
    }, 

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
    }
}