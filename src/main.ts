import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
//
import * as TelegramBot from 'node-telegram-bot-api';
import * as fs from 'fs';
import * as path from 'path';
import * as requestPromise from 'request-promise';
import axios from 'axios';
//
import {
  CallbackInfo,
  commingSoon,
  detectNumber,
  detectTextMeme,
  generateNumber0to7,
  textInfo,
} from './shared/utils';

import { keyboardMarkup } from './shared/utils/keyboard-markup';

import OpenAI from 'openai';

import 'dotenv/config';

// replace the value below with the Telegram token you receive from @BotFather
const token_bot = process.env.TOKEN_BOT;
// const apiKey = process.env.API_KEY;
// const apiKeyMeme = process.env.API_KEY_MEME;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token_bot, { polling: true });

// const clientOpenAi = new OpenAI({
//   apiKey: process.env.OPENAI_APIKEY,
// });

//
// let maxUsagePerChat = 3;
// let usageCount = {};

// // Inisialisasi hitungan penggunaan untuk setiap jenis fitur
// ['colorize', 'cartoon'].forEach((feature) => {
//   usageCount[feature] = {};
// });

// //
// function resetUsageCount() {
//   setInterval(
//     () => {
//       Object.keys(usageCount).forEach((feature) => {
//         Object.keys(usageCount[feature]).forEach((chatId) => {
//           usageCount[feature][chatId] = 0;
//         });
//       });
//     },
//     24 * 60 * 60 * 1000,
//   ); // Reset every 24 hours
// }

// // Function to ensure the directory exists
// function ensureDirectoryExists(directory) {
//   if (!fs.existsSync(directory)) {
//     fs.mkdirSync(directory, { recursive: true });
//   }
// }

// //
// async function processImageAndSendToUser(
//   fileUrl: string,
//   msg,
//   chatId,
//   caption,
// ) {
//   //
//   let cond = false;
//   let apiUrl = '';

//   //
//   if (caption === '/colorize') {
//     apiUrl = `${process.env.API_URL_COLORIZE}`;
//     cond = true;
//   }

//   //
//   if (caption === '/cartoon') {
//     apiUrl = `${process.env.API_URL_CARTOON}`;
//     cond = true;
//   } else if (caption.includes('/cartoon&')) {
//     const match = detectNumber(caption);
//     const numAfterSymbol = parseInt(match[1], 10); // Mengonversi string angka menjadi bilangan bulat
//     if (numAfterSymbol >= 1 && numAfterSymbol <= 10) {
//       apiUrl = `${process.env.API_URL_CARTOON}?cartoonType=${numAfterSymbol}`;
//       cond = true;
//     } else {
//       cond = false;
//     }
//   }

//   //
//   try {
//     //
//     if (cond) {
//       const featureKey = caption.split('&')[0]; // Ambil jenis fitur tanpa argumen tambahan

//       // Pastikan usageCount[featureKey] sudah terdefinisi
//       if (!usageCount[featureKey]) {
//         usageCount[featureKey] = {};
//       }
//       const currentUsage = (usageCount[featureKey][chatId] || 0) + 1;

//       console.log({ log: 'before currentUsage:', chatId, currentUsage });
//       usageCount[featureKey][chatId] = currentUsage;
//       console.log({
//         log: 'after currentUsage:',
//         chatId,
//         currentUsage: usageCount[featureKey][chatId],
//       });
//       if (usageCount[featureKey][chatId] <= maxUsagePerChat) {
//         //
//         console.log({ log: 'waiting to process' });
//         const cutoutResponse = await requestPromise.post({
//           url: apiUrl,
//           formData: {
//             file: requestPromise(fileUrl),
//           },
//           headers: {
//             APIKEY: apiKey,
//           },
//           encoding: null,
//         });
//         //
//         const cutoutDirectory = `${__dirname}/image/`;
//         ensureDirectoryExists(cutoutDirectory);

//         // Specify the image file path
//         const cutoutImagePath = path.join(cutoutDirectory, 'your-image.jpg');

//         // console.log({ log: cutoutResponse.toString('utf8')}) //<-- debug response failed or not

//         // Handle Image processing failed!
//         if (cutoutResponse.toString('utf8').includes('Processing failed')) {
//           bot.sendMessage(chatId, textInfo.catchErrorText);
//           return;
//         }

//         // Handle credits balance
//         if (cutoutResponse.toString('utf8').includes('Insufficient credits')) {
//           bot.sendMessage(chatId, textInfo.catchBalanceText);
//           return;
//         }

//         // Send the processed image back to the user
//         fs.writeFileSync(cutoutImagePath, cutoutResponse);
//         bot.sendPhoto(chatId, cutoutImagePath, {
//           caption: 'Result your photo',
//         });
//         console.log({ log: 'finish process' });
//       } else {
//         console.log({
//           log: {
//             uname: `${msg.from.first_name} - ${msg.from.username}`,
//             msg: 'caught limit!',
//           },
//         });
//         bot.sendMessage(chatId, textInfo.limitText);
//       }
//     } else {
//       bot.sendMessage(chatId, textInfo.errorCondition);
//     }
//   } catch (error) {
//     console.error('Something Went Wrong, Telegram API Error:', error);
//     bot.sendMessage(chatId, textInfo.catchErrorText);
//     return;
//   }
// }

// async function processTextToMeme(chatId, match, msg) {
//   //
//   try {
//     const apiUrlMeme = process.env.API_URL_MEME;
//     let text = '';
//     let waitingMessage1;
//     //
//     if (!match[1]) text = 'default';
//     //
//     if (match[1]) text = match[1];

//     bot
//       .sendMessage(chatId, 'Creating your meme... It’ll be worth the wait! 🗿')
//       .then((message) => {
//         waitingMessage1 = message.message_id;
//       });
//     //
//     const memeResponse = await requestPromise.post({
//       url: apiUrlMeme,
//       json: true,
//       body: { text },
//       headers: {
//         Authorization: `Bearer ${apiKeyMeme}`, // Menyertakan bearer token dalam header
//         'Content-Type': 'application/json', // Menetapkan jenis konten sebagai JSON
//       },
//       encoding: null,
//     });

//     if (waitingMessage1) {
//       bot.deleteMessage(chatId, waitingMessage1);
//     }
//     //
//     bot.sendPhoto(chatId, memeResponse['memes'][generateNumber0to7()], {
//       caption: '🟢 Result your photo',
//     });
//   } catch (error) {
//     console.log({ log: error });
//     bot.sendMessage(
//       chatId,
//       `🔴 We're experiencing high traffic at the moment. Please try again shortly.`,
//     );
//     return;
//   }
// }
// async function getAIResponse(prompt: string): Promise<any> {
//   try {
//     const completion = await clientOpenAi.completions.create({
//       prompt,
//       model: 'gpt-3.5-turbo-instruct',
//       max_tokens: 100,
//     });
//     console.log({ log_completio: completion.choices[0].text.trim() });
//     return completion.choices[0].text.trim();
//   } catch (error) {
//     console.error('Error with OpenAI API:', error);
//     return 'Error: Unable to process your request at the moment.';
//   }
// }
//
async function generateMusic(genre: string) {
  //
  const url = 'https://soundraw.io/api/v2/musics/compose';
  const headers = {
    accept: 'application/json',
    Authorization: 'Bearer SU1BTSBSQU1BREhBTg==',
    'Content-Type': 'application/json',
  };

  const data = {
    genres: [`${genre}`],
    moods: ['Happy'],
    themes: ['Ads & Trailers'],
    length: 150,
    file_format: ['wav'],
    mute_stems: ['bs'],
    tempo: ['normal'],
    energy_levels: [
      {
        start: 0,
        end: 2.5,
        energy: 'Medium',
      },
    ],
  };

  try {
    const response = await axios.post(url, data, { headers });
    const music = response.data.wav_url;

    const buffer = await axios.get(music, {
      responseType: 'arraybuffer',
    });

    const audioBuffer = Buffer.from(buffer.data, 'binary');
    return audioBuffer;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

//
async function main() {
  //
  const app = await NestFactory.create(AppModule);
  //
  // resetUsageCount();
  //
  app.enableCors({
    origin: '*', // replace with your allowed origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders:
      // 'Origin,Content-Type,Authorization,Accept,User-Agent,Cache-Control,Pragma,x-api-key',
      'x-api-key',
    credentials: true,
    exposedHeaders: 'Content-Length',
    maxAge: 43200, // 12 hours
  });

  //
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  // Listen for any kind of message. There are different kinds of message
  bot.on('message', async (msg) => {
    //
    let messageText = msg.text;
    const chatId = msg.chat.id;
    // let match;

    // // if (msg.caption) {
    // //   //detect number
    // //   match = detectNumber(msg.caption);
    // // }

    //
    if (messageText === '/start') {
      // send a message to the chat acknowledging receipt of their message

      const photoPath =
        'https://res.cloudinary.com/drmwcjsgc/image/upload/v1736516858/ongwq4axbyollsqses92.jpg';

      // bot.sendMessage(chatId, textInfo.welcomeLaunch, {
      //   parse_mode: 'Markdown',
      //   // reply_markup: JSON.stringify({
      //   //   inline_keyboard: keyboardMarkup.start,
      //   // }),
      //   reply_markup: {
      //     inline_keyboard: [
      //       [{ text: 'Launch', web_app: { url: WEB_APP_URL } }],
      //     ],
      //   },
      // });
      await bot.sendPhoto(chatId, photoPath, keyboardMarkup.welcome as any);
      // bot.sendMessage(chatId, 'test')
      //await bot.sendVideo(chatId, videoPath, keyboardMarkup.welcome as any);
    } else {
      // let mssg;

      // bot
      //   .sendMessage(chatId, 'generate...')
      //   .then((message) => (mssg = message.message_id));

      // const resp = await getAIResponse(messageText);
      // console.log({ log: resp });

      // if (mssg) {
      //   bot.deleteMessage(chatId, mssg);
      // }

      bot.sendMessage(chatId, 'No commands executed—chill mode activated 🎵');
    }

    // else if (matchMeme) {
    //   await processTextToMeme(chatId, matchMeme, msg);
    // }

    // else if (
    //   ((msg.photo || msg.document) &&
    //     msg.caption &&
    //     (msg.caption === '/cartoon' || msg.caption === '/colorize')) ||
    //   (match && match[1])
    // ) {
    //   //
    //   const caption = msg.caption;
    //   const photoId = msg.photo
    //     ? msg.photo[msg.photo.length - 1].file_id
    //     : msg.document.file_id;
    //   //
    //   if (msg.photo) {
    //     //
    //     bot.getFile(photoId).then(async (fileInfo) => {
    //       const fileUrl = `https://api.telegram.org/file/bot${token_bot}/${fileInfo.file_path}`;
    //       // Process the image and send it back to the user
    //       await processImageAndSendToUser(fileUrl, msg, chatId, caption);
    //     });
    //   }

    //   if (msg.document) {
    //     if (
    //       msg.document.mime_type === 'image/jpeg' &&
    //       msg.document.mime_type === 'image/png'
    //     ) {
    //       bot.getFile(photoId).then(async (fileInfo) => {
    //         const fileUrl = `https://api.telegram.org/file/bot${token_bot}/${fileInfo.file_path}`;
    //         // Process the image and send it back to the user
    //         await processImageAndSendToUser(fileUrl, msg, chatId, caption);
    //       });
    //     } else {
    //       bot.sendMessage(chatId, 'Invalid format image');
    //     }
    //   }
    // } else {
    //   if (msg.photo || msg.document) {
    //     const photoId = msg.photo ? msg.photo[0].file_id : msg.document.file_id;
    //     if (msg.photo) {
    //       bot.sendPhoto(chatId, photoId, {
    //         caption: 'Please upload your photo with right commands',
    //       });
    //     }
    //     if (msg.document) {
    //       if (msg.document.mime_type !== 'image/jpeg') {
    //         //
    //         bot.sendMessage(chatId, 'Invalid format image');
    //       } else {
    //         bot.sendDocument(chatId, photoId, {
    //           caption: 'Please upload your photo with right commands',
    //         });
    //       }
    //     }
    //   } else {

    //     //
    //     if (match) {
    //       //
    //       await processTextToMeme(chatId, match, msg);
    //     } else {
    //       //I use bot command regex to prevent bot from miss understanding any user messages contain 'clear'
    //       bot.sendMessage(
    //         chatId,
    //         'There are no commands that you execute or invalid command',
    //       );
    //     }
    //   }
    // }
  });

  //
  bot.on('callback_query', async (callbackQuery) => {
    const query = callbackQuery;
    const message = query.message;

    const chatId: number = message.chat.id;
    const messageId: number = message.message_id;
    const data = JSON.parse(callbackQuery.data);

    switch (data.command) {
      // case CallbackInfo.CARTOON:
      //   bot.sendMessage(chatId, textInfo.commandCartoon);
      //   break;
      case CallbackInfo.TTG:
        bot.sendMessage(chatId, textInfo.instructions);
        break;
      // case CallbackInfo.MEME:
      //   bot.sendMessage(chatId, textInfo.commandMeme);
      //   break;
      // case CallbackInfo.REMOVE_BG:
      //   bot.sendMessage(chatId, commingSoon('Remove Background Photo'), keyboardMarkup.cancel);
      //   break;
      // case CallbackInfo.COLORIZE:
      //   bot.sendMessage(chatId, textInfo.commandColorize);
      //   break;
      // case CallbackInfo.SOON_FITUR:
      //   bot.sendMessage(chatId, textInfo.soon_feature, keyboardMarkup.cancel as any);
      //   break;
      // case CallbackInfo.GUID:
      //   bot.sendMessage(chatId, textInfo.guidline, keyboardMarkup.cancel as any);
      //   break;
      case CallbackInfo.MSC:
        bot.editMessageReplyMarkup(
          {
            inline_keyboard: keyboardMarkup.socials,
          },
          {
            chat_id: chatId,
            message_id: message.message_id,
          },
        );
        break;
      case CallbackInfo.POP:
        bot.sendMessage(chatId, 'Chill for a pop! crafting your 2-3 minute tune. It’s worth the wait!');
        const pop = await generateMusic('Pop');
        await bot.sendAudio(
          chatId,
          pop,
          {
            caption: 'Here is your composed music Pop!',
          },
          {
            filename: 'pop.wav',
            contentType: 'audio/wav',
          },
        );
        break;
      case CallbackInfo.ROCK:
        bot.sendMessage(chatId, 'Chill for a rock! crafting your 2-3 minute tune. It’s worth the wait!');
        const rock = await generateMusic('Rock');
        await bot.sendAudio(
          chatId,
          rock,
          {
            caption: 'Here is your composed music Rock!',
          },
          {
            filename: 'rock.wav',
            contentType: 'audio/wav',
          },
        );
        break;
      case CallbackInfo.ELECTRONDANCE:
        bot.sendMessage(chatId, 'Chill for a electro n dance! crafting your 2-3 minute tune. It’s worth the wait!');
        const electrondance = await generateMusic('Electro & Dance');
        await bot.sendAudio(
          chatId,
          electrondance,
          {
            caption: 'Here is your composed music electro n dance!',
          },
          {
            filename: 'electrondance.wav',
            contentType: 'audio/wav',
          },
        );
        break;
      case CallbackInfo.ACCOUSTIC:
        bot.sendMessage(chatId, 'Chill for a accoustic! crafting your 2-3 minute tune. It’s worth the wait!');
        const accoustic = await generateMusic('Acoustic');
        await bot.sendAudio(
          chatId,
          accoustic,
          {
            caption: 'Here is your composed music accoustic!',
          },
          {
            filename: 'accoustic.wav',
            contentType: 'audio/wav',
          },
        );
        break;
      case CallbackInfo.HIPHOP:
        bot.sendMessage(chatId, 'Chill for a hip hop! crafting your 2-3 minute tune. It’s worth the wait!');
        const hiphop = await generateMusic('Hip Hop');
        await bot.sendAudio(
          chatId,
          hiphop,
          {
            caption: 'Here is your composed music hip hop!',
          },
          {
            filename: 'hiphop.wav',
            contentType: 'audio/wav',
          },
        );
        break;
      case CallbackInfo.BEATS:
        bot.sendMessage(chatId, 'Chill for a beats! crafting your 2-3 minute tune. It’s worth the wait!');
        const beats = await generateMusic('Beats');
        await bot.sendAudio(
          chatId,
          beats,
          {
            caption: 'Here is your composed music beats!',
          },
          {
            filename: 'beats.wav',
            contentType: 'audio/wav',
          },
        );
        break;
      case CallbackInfo.FUNK:
        bot.sendMessage(chatId, 'Chill for a funk! crafting your 2-3 minute tune. It’s worth the wait!');
        const funk = await generateMusic('Funk');
        await bot.sendAudio(
          chatId,
          funk,
          {
            caption: 'Here is your composed music funk!',
          },
          {
            filename: 'funk.wav',
            contentType: 'audio/wav',
          },
        );
        break;
      case CallbackInfo.TRAP:
        bot.sendMessage(chatId, 'Chill for a trap! crafting your 2-3 minute tune. It’s worth the wait!');
        const trap = await generateMusic('Trap');
        await bot.sendAudio(
          chatId,
          trap,
          {
            caption: 'Here is your composed music trap!',
          },
          {
            filename: 'trap.wav',
            contentType: 'audio/wav',
          },
        );
        break;
      case CallbackInfo.AFROBEATS:
        bot.sendMessage(chatId, 'Chill for a afrobeats! crafting your 2-3 minute tune. It’s worth the wait!');
        const afrobeats = await generateMusic('Afrobeats');
        await bot.sendAudio(
          chatId,
          afrobeats,
          {
            caption: 'Here is your composed music afrobeats!',
          },
          {
            filename: 'afrobeats.wav',
            contentType: 'audio/wav',
          },
        );
        break;
      case CallbackInfo.ORCHESTRA:
        bot.sendMessage(chatId, 'Chill for a orchestra! crafting your 2-3 minute tune. It’s worth the wait!');
        const orchestra = await generateMusic('Orchestra');
        await bot.sendAudio(
          chatId,
          orchestra,
          {
            caption: 'Here is your composed music orchestra!',
          },
          {
            filename: 'orchestra.wav',
            contentType: 'audio/wav',
          },
        );
        break;
      case CallbackInfo.DRUMNBASS:
        bot.sendMessage(chatId, 'Chill for a drum n bass! crafting your 2-3 minute tune. It’s worth the wait!');
        const drumnbass = await generateMusic('Drum n Bass');
        await bot.sendAudio(
          chatId,
          drumnbass,
          {
            caption: 'Here is your composed music drum n bass!',
          },
          {
            filename: 'drumnbass.wav',
            contentType: 'audio/wav',
          },
        );
        break;
      case CallbackInfo.LOFIHIPHOP:
        bot.sendMessage(chatId, 'Chill for a lofi hip hop! crafting your 2-3 minute tune. It’s worth the wait!');
        const lofihiphop = await generateMusic('Lofi Hip Hop');
        await bot.sendAudio(
          chatId,
          lofihiphop,
          {
            caption: 'Here is your composed music lofihiphop',
          },
          {
            filename: 'lofihiphop.wav',
            contentType: 'audio/wav',
          },
        );
        break;
      // case CallbackInfo.DESC:
      //   bot.sendMessage(chatId, textInfo.description, keyboardMarkup.cancel as any);
      //   break;
      case CallbackInfo.BACK:
        bot.editMessageReplyMarkup(
          {
            inline_keyboard: keyboardMarkup.start,
          },
          {
            chat_id: chatId,
            message_id: message.message_id,
          },
        );
        break;
      case CallbackInfo.CANCEL:
        if (chatId && messageId) {
          bot.deleteMessage(chatId, messageId);
        }
        break;
      default:
        break;
    }
  });

  await app.listen(9090);
  console.log(`chronicle bot is running on: ${await app.getUrl()}`);
}
main();
