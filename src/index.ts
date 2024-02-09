import 'dotenv/config'
import 'sqlite3';
import { Telegram } from "@codecast-duo/codecast-duo-telegrambot";
import { Mutex } from "./classes";
import { TelegramOptions, UpdateTypes } from "@codecast-duo/codecast-duo-telegrambot/dist/types";
import { Infor } from './classes/Infor';

import { DbChatJoinRequest } from '../../Project_Tele_Typeorm';

const dbChatJoinRequest = new DbChatJoinRequest();

let bot: Telegram;

const mutex = new Mutex();

function createTelegramOptions(): TelegramOptions {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
        throw new Error('TELEGRAM_BOT_TOKEN environment variable not set');
    }
    const telegramOptions = {
        telegramApi: 'https://localhost:3000',
        telegramToken: process.env.TELEGRAM_BOT_TOKEN,
        start: false,
        optionUpdate: {
            offset: 0,
            allowed_updates: JSON.parse(process.env.ALLOWED_UPDATES || '["chat_join_request"]'),
            limitUpdates: Number(process.env.LIMIT_UPDATES || 100)
        },
        optionPollingWaitManager: {
            maxWaitTime: 3000,
            onWaitTooLong: () => { console.log('Wait too long'); }
        }
    };
    return telegramOptions;
}

async function build() {
    Infor.updateInfo('added', 0);
    await dbChatJoinRequest.connect();
    if (!process.env.TELEGRAM_BOT_TOKEN) {
        throw new Error('TELEGRAM_BOT_TOKEN environment variable not set');
    }
    let telegramOptions = createTelegramOptions();

    bot = new Telegram(telegramOptions);

    function shouldContinuePolling() {
        return !mutex.isExecuting();
    }

    bot.setPollingWaitManager("exampleFunction", shouldContinuePolling);
    let i = 0;
    bot.onUpdate('chat_join_request', (callback, update) => {
        console.log(++i);
        if (callback.invite_link) {
            mutex.dispatch(() => dbChatJoinRequest.createChatJoinRequest({
                id: update.update_id,
                chat: {
                    id: callback.chat.id,
                    title: callback.chat.title || 'No title',
                    type: callback.chat.type
                },
                from: {
                    id: callback.from.id
                },
                date: callback.date,
                invite_link: {
                    id: callback.invite_link!.invite_link,
                    name: callback.invite_link!.name || 'No name',
                    user_creator: {
                        id: callback.invite_link!.creator.id,
                        first_name: callback.invite_link!.creator.first_name,
                        last_name: callback.invite_link!.creator.last_name || '',
                        username: callback.invite_link!.creator.username || '',
                    },
                    pending_join_request_count: callback.invite_link!.pending_join_request_count || -1
                }
            }));
            mutex.dispatch(async () => { Infor.incrementInfo('added', 1); });
        }else{
            console.log('No invite_link');
        }
    });
}

async function start() {
    await build();
    bot.startUpdater();
}

async function stop() {
    await bot.stoptUpdater();
    await dbChatJoinRequest.disconnect();
}


setInterval(() => {
    console.log(`Додано ${Infor.getInfo('added')} об'єктів`);
    console.log(`Знайдено ${Infor.getInfo('countSameChatJoinRequest')} подібних запитів на вступ до чату \n`);
}, 5000);

start();
