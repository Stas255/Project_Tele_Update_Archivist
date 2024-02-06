import 'dotenv/config'
import 'sqlite3';
import { Telegram } from "@codecast-duo/codecast-duo-telegrambot";
import { Mutex, Typeorm, JsonStorage } from "./classes";
import { TelegramBotOptions } from "classes/Typeorm/models";
import { TelegramOptions, UpdateTypes } from "@codecast-duo/codecast-duo-telegrambot/dist/types";

const typeorm = new Typeorm(process.env.TZ_DB_NAME || 'telegram_bot.db');
let bot: Telegram;

const mutex = new Mutex();

const jsonStorage = new JsonStorage();

function createTelegramOptions(): TelegramOptions {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
        throw new Error('TELEGRAM_BOT_TOKEN environment variable not set');
    }
    const telegramOptions = {
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

function getTelegramOptions(option: TelegramBotOptions): TelegramOptions {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
        throw new Error('TELEGRAM_BOT_TOKEN environment variable not set');
    }
    const telegramOptions: TelegramOptions = {
        telegramToken: option.botToken,
        start: false,
        optionUpdate: {
            offset: 0,
            allowed_updates: option.allowed_updates as (keyof UpdateTypes)[],
            limit: option.limit
        },
        optionPollingWaitManager: {
            maxWaitTime: 3000,
            onWaitTooLong: () => { console.log('Wait too long'); }
        }
    };
    return telegramOptions;
}

let added = 0;

async function build() {
    await typeorm.connect();
    if (!process.env.TELEGRAM_BOT_TOKEN) {
        throw new Error('TELEGRAM_BOT_TOKEN environment variable not set');
    }
    let telegramOptions = null;
    let option = await typeorm.getTelegramBotOptionsByToken(process.env.TELEGRAM_BOT_TOKEN);

    if (!option) {
        telegramOptions = createTelegramOptions();
        typeorm.createAndSaveTelegramBotOptions(telegramOptions);
    } else {
        telegramOptions = getTelegramOptions(option);
    }

    bot = new Telegram(telegramOptions);

    function shouldContinuePolling() {
        return !mutex.isExecuting();
    }

    bot.setPollingWaitManager("exampleFunction", shouldContinuePolling);

    bot.onUpdate('chat_join_request', (callback, update) => {
        mutex.dispatch(() => jsonStorage.save(update));
        mutex.dispatch(async () => { added++; });
    });

    bot.onUpdate('channel_post', (callback, update) => {
        mutex.dispatch(() => jsonStorage.save(update));
        mutex.dispatch(async () => { added++; });
    });

    bot.onUpdate('message', (callback, update) => {
        mutex.dispatch(() => jsonStorage.save(update));
        mutex.dispatch(async () => { added++; });
    });

    bot.onUpdate('poll', (callback, update) => {
        mutex.dispatch(() => jsonStorage.save(update));
        mutex.dispatch(async () => { added++; });
    });

    bot.onText('stop', async (message) => {
        setTimeout(() => {
            mutex.dispatch(async () => stop());
            mutex.dispatch(async () => { bot.sendMessage(message.chat.id, 'Stopping bot'); });
        }, 10000);
    });
}

async function start() {
    await build();
    bot.startUpdater();
}

async function stop() {
    await bot.stoptUpdater();
    await typeorm.disconnect();
}


setInterval(() => {
    console.log(`Додано ${added} об'єктів`);
    added = 0;
}, 5000);

start();
