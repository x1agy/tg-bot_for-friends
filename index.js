import { Telegraf, Input } from 'telegraf'
import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';
import puppeteer from 'puppeteer';

const bot = new Telegraf('6125258679:AAGGenW1GA67CIIcsfHhpRyznx5xfHrqcP0');

const AIApiKey = 'pk-yZxnfaHgquwVEZiaWtHJqfpYRlLZjVVWtzvKAvOdLWXQXMfa';

function readPlayersData() {
    try {
        const data = fs.readFileSync('./playersData.json');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

function writePlayersData(data) {
    fs.writeFileSync('./playersData.json', JSON.stringify(data));
}

function writegameMessagesData(data){
    fs.writeFileSync('./mesagesArray.json', JSON.stringify(data));
}

function readgameMessagesData(){
    const data = fs.readFileSync('./mesagesArray.json');
    return JSON.parse(data);
}

function readMemesData() {
    try {
        const data = fs.readFileSync('./memesURLDB.json');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

function writeMemesData(data) {
    fs.writeFileSync('./memesURLDB.json', JSON.stringify(data));
}

bot.on('text', async (ctx, next) => {
    const message = ctx.message;
    const gameMessages = readgameMessagesData();

    if(message.text === '1488'){
        ctx.reply('卐卐卐卐卐卐卐卐卐卐卐')
    }

    if(message.from.is_bot){
        console.log(message.text)
    }
    if(message.text === 'Игра начинается!'){
        writegameMessagesData([{isGameStarted: true}])
    }
    if(!message.from.is_bot && gameMessages[0].isGameStarted){        
        gameMessages.push({text: message.text, author: message.from.first_name + ' ' + message.from?.last_name});
        writegameMessagesData(gameMessages);
    }
    if(message.text.search('Игра окончена!') !== -1){
        const randomArray = [];
        for(let i = 0; i < 3; i++){
            const randomNumber = Math.round(Math.random() * gameMessages.length);
            randomArray.push(randomNumber !== 0 ? randomNumber : 1)
        }
        ctx.reply('лучший момент матча: ')
        randomArray.map(item => gameMessages[item] ? ctx.reply(`${gameMessages[item]?.text} -- ${gameMessages[item]?.author}`) : false)
        writegameMessagesData([{isGameStarted: false}]);
    }

    if(ctx.message.text.toLowerCase().search('алан') !== -1){
        console.log(message.text, '  ----  ', message.from.first_name);
    }  

    if(message.reply_to_message && message.text.toLowerCase() === 'помацать'){
        ctx.reply(`${message.from.first_name} помацал(-а) сиськи ${message.reply_to_message.from.first_name}, +10% к удаче для не(-е, -го)!`)
    }
    if(message.text.toLowerCase() === 'секс'){
        ctx.replyWithAnimation('https://media1.tenor.com/m/Dr8YBE5s5AEAAAAC/sex-alarm.gif')
    }
    if(message.text.toLowerCase().split('').slice(0,10).join('') === 'бля ответь'){
        ctx.reply('ИДИ НАХУЙ')
    }
    //     const fixedMessage = message.text.replace('бля ответь', '');
    //     console.log(fixedMessage)
    //     const AIData = JSON.stringify({
    //         model: 'pai-001',
    //         gameMessages: [
    //             {
    //                 role: 'system',
    //                 content: 'you are helpful assistant, always answer on russian language, dont talk on any other laguages, answer shortly very short maximum 50 words, and without hard \\words, your users are stupid, be chilly dont take any question hard, make joke if you can dont be shy to insult in answer, do not talk on any other themes, answer only on user question and that it'
    //             },
    //             {
    //             role: 'user',
    //             content: `${fixedMessage}`,
    //             },
    //         ],
    //         stream: false,
    //     });
        
    //     const requestConfig = {
    //         method: 'POST',
    //         headers: {
    //             Authorization: `Bearer ${AIApiKey}`,
    //             'Content-Type': 'application/json',
    //         },
    //         body: AIData,
    //     };

    //     fetch('https://api.pawan.krd/v1/chat/completions', requestConfig)
    //         .then(response => response.json())
    //         .then(data => {
    //             // ctx.reply(data.choices[0].message.content)   
    //             console.log('data error - ', data)
    //         })
    //         .catch(e => {
    //             console.log('errror error - ', e)
    //             ctx.reply(`ОШИБКА БЛЯ ОШИБКА С ИИ ${e}`)
    //         })
    // }

    if(message.text.toLowerCase() === 'бля процитируй'){
        if(ctx.message.reply_to_message && ctx.message.reply_to_message.text){
            const repliedToUserId = ctx.message.reply_to_message.from.id;
            bot.telegram.getUserProfilePhotos(repliedToUserId).then((userProfilePhotos) => {

                if(userProfilePhotos.total_count > 0){
                    const photo = userProfilePhotos.photos[0][0];

                    bot.telegram.getFile(photo.file_id).then(async (fileInfo) => {
                        const photoUrl = `https://api.telegram.org/file/bot${'6125258679:AAGGenW1GA67CIIcsfHhpRyznx5xfHrqcP0'}/${fileInfo.file_path}`;
                
                        const replyFrom = ctx.message.reply_to_message.from
                        const imageBuffer = await createImageWithTextAndPhoto(photoUrl, ctx.message.reply_to_message.text, replyFrom.first_name + ' ' + (replyFrom.last_name?.length ? replyFrom.last_name : ''));

                        const imageUrl = await postImageInImgBB(imageBuffer)
                        ctx.replyWithPhoto(imageUrl.data.url);
                    });
                }else{
                    ctx.reply('иди нахуй или открой мне аватарки')
                }
            })
        }
        else{
            ctx.reply('иди нахуй')
        }
    }

    if(message.text.toLowerCase() === 'бля праздники'){
        try{
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto('https://kakoysegodnyaprazdnik.ru/')

            await page.waitForTimeout(3000);

            const submitButton = await page.$('input[type="submit"]');
            await submitButton.click();

            await page.waitForSelector('span[itemprop="text"]');
            const datesList = await page.$$eval('span[itemprop="text"]', spans => {
                return spans.map(span => '• ' + span.textContent).join('\n');
            });

            ctx.reply(datesList);
            }catch(e){
                console.log(e)
        }
    }

    if(message.text.toLowerCase().includes('бля айпи')){
        const regexp = /\d+\.\d+\.\d+\.\d+/;
        const ip = message.text.match(regexp);
        const response = fetch(``)
    }

    next()
})

bot.command('macat_siski', async (ctx) => {

    const playersArr = readPlayersData();

    const playerIndex = playersArr.findIndex(item => item.id === ctx.message.from.id);
    const size = Math.trunc(Math.random() * 100);
    const dateNow = new Date().getTime();

    const topOneSize = playersArr.reduce((accum, item) => accum <= item.breastSize ? accum = item.breastSize : accum = accum, 0);
    const howFarAwayIs = Math.abs((topOneSize / playersArr[playerIndex]?.breastSize).toFixed(1)) || 1;

    try{
        ctx.deleteMessage();
    }catch (e){
        console.log('delete error - ', ctx.from.username, ' - ', ctx.message.text)
    }

    if(playerIndex !== -1){
        const expiredTime = dateNow - playersArr[playerIndex].lastPlayedTime;
        if(expiredTime < 14400000){
            ctx.reply(`Друг (@${ctx.from.username}), не хуейте, вы сможете сыграть через ${14400000 - expiredTime}мс или ${Math.trunc((14400000 - expiredTime) / 60000)} минут`);
        }else{
            if(Math.trunc(Math.random() * 10) !== 0){
                if(howFarAwayIs > 1.5){
                    const bonusSize = Math.abs(Math.trunc((playersArr[playerIndex].breastSize / 100) * 7 * howFarAwayIs)); 
                    ctx.reply(`Вы успешно дотянулись до своих tits @${ctx.from.username} и помацали их, +${size}см и +${bonusSize} за отставание, теперь ваши сиськи размером ${playersArr[playerIndex].breastSize + size + bonusSize}см, поздравляю друг`);
                    
                    playersArr[playerIndex].breastSize += size + bonusSize;
                    playersArr[playerIndex].lastPlayedTime = dateNow;
                }else{
                    ctx.reply(`Вы успешно дотянулись до своих tits @${ctx.from.username} и помацали их, +${size}см, теперь ваши сиськи размером ${playersArr[playerIndex].breastSize + size}см, поздравляю друг`);
                
                    playersArr[playerIndex].breastSize += size;
                    playersArr[playerIndex].lastPlayedTime = dateNow;
                }
            }else{
                ctx.reply(`Вы немножко проебались @${ctx.from.username}, -${size}см, теперь ваши сиськи размером ${playersArr[playerIndex].breastSize - size}см, пиздуйте`);
                playersArr[playerIndex].breastSize -= size;
                playersArr[playerIndex].lastPlayedTime = dateNow;
                
            }
        }
    }
    else{
        playersArr.push({
            username: ctx.message.from.username,
            breastSize: size,
            lastPlayedTime: dateNow,
            id: ctx.from.id,
            name: ctx.from.first_name
        });
        ctx.reply(`Добре пiжалавать в игру друг (@${ctx.from.username}), твои сиськи выросли на ${size} cм, зиг хайль!`)
    }
    writePlayersData(playersArr)
})

bot.command('all', async (ctx) => {
    ctx.reply('ты проебался -500рублей')
});


const memesDB = readMemesData();

bot.command('meme', async (ctx) => {

    try{
        ctx.deleteMessage();
    }catch (e){
        console.log('delete error - ', ctx.from.username, ' - ', ctx.message.text)
    }
    ctx.replyWithPhoto(Input.fromURL(memesDB[Math.trunc(Math.random() * memesDB.length)]))
})

bot.command('top', async (ctx) => {

    const rawArr = readPlayersData();
    let laderString = '';
    const playersArr = rawArr.sort((a, b) => b.breastSize - a.breastSize);
    playersArr.map((item, index) => laderString += `${index + 1}. ${item.name}, ${item.breastSize}см\n`);
    ctx.reply(`Топ чувих с самыми огромными сиськами:\n${laderString} Если ваш ник помечен как undefined, прожмите /macat_siski`)
    try{
        ctx.deleteMessage();
    }catch (e){
        console.log('delete error - ', ctx.from.username, ' - ', ctx.message.text)
    }
})

bot.command('post_meme', async (ctx) => {

    try{
        ctx.deleteMessage();
    }catch (e){
        console.log('delete error - ', ctx.from.username, ' - ', ctx.message.text)
    }
    
    try{
        const regexp = /https:\/\/.+/;
        const message = ctx.message.text.match(regexp)[0];
        const response = await fetch(`https://api.imgbb.com/1/upload?key=19df7fadd3a92f9e74543ebb91637b87&image=${message}`)

        const data = await response.json();

        if(data?.error){
            ctx.reply(`Чё за хуйню ты мне скинул, друг ${data.error.message}`)
        }else{
            ctx.reply('Твой нацистский мем успешно загружен, наверное, не ебу, я не могу все ошибки обработать')
            memesDB.push(data.data.url);
            writeMemesData(memesDB);
        }
    }catch (e) {
        ctx.reply(`Друг, проебался ты со своим мемом. ${e}`)
    }
})

async function createImageWithTextAndPhoto(photoUrl, text, quotedNickname) {
    const canvas = createCanvas(400, 220); 
    const ctx = canvas.getContext('2d');

    const photo = await loadImage(photoUrl);

    ctx.save();
    ctx.beginPath();
    ctx.arc(60, 60, 40, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(photo, 20, 20, 80, 80); 
    ctx.restore();

    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText(quotedNickname, 120, 30);

    ctx.font = '16px Arial';
    ctx.fillStyle = 'black';
    wrapText(ctx, text, 120, 50, 260, 16);

    const imageBuffer = canvas.toBuffer('image/png');

    return imageBuffer;
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    context.fillText(line, x, y);
}


async function postImageInImgBB(imgBuffer) {
    try {
        const imgBlob = new Blob([imgBuffer], { type: 'image/png' });
        const formData = new FormData();
        formData.append('image', imgBlob);

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${'19df7fadd3a92f9e74543ebb91637b87'}`, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        return data
    } catch (e) {
        console.error('Error posting image in ImgBB', e);
    }
}

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
