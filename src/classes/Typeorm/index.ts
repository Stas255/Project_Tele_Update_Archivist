import { TelegramOptions } from "@codecast-duo/codecast-duo-telegrambot/dist/types";
import { TypeormApi } from "./typeormApi";
import { TelegramBotOptions } from "./models";

export class Typeorm extends TypeormApi {

    constructor(dbName: string) {
        super(dbName);
    }

    async createAndSaveTelegramBotOptions(options: TelegramOptions): Promise<TelegramBotOptions> {
        const telegramBotOptionsRepository = this.connection.getRepository(TelegramBotOptions);
        const telegramBotOptions = telegramBotOptionsRepository.create({
            botToken: options.telegramToken,
            started: false,
            lastUpdated: 0,
            allowed_updates: options.optionUpdate?.allowed_updates || [],
            limit: options.optionUpdate?.limit || 100,
        });
        return await telegramBotOptions.save();
    }

    async getTelegramBotOptionsById(id: number): Promise<TelegramBotOptions | null> {
        const telegramBotOptionsRepository = this.connection.getRepository(TelegramBotOptions);
        return await telegramBotOptionsRepository.findOneBy({
            id: id,
        });
    }

    async getTelegramBotOptionsByToken(token: string): Promise<TelegramBotOptions | null> {
        const telegramBotOptionsRepository = this.connection.getRepository(TelegramBotOptions);
        return await telegramBotOptionsRepository.findOneBy({
            botToken: token,
        });
    }

    async updateTelegramBotOptions(options: TelegramOptions): Promise<TelegramBotOptions> {
        const telegramBotOptionsRepository = this.connection.getRepository(TelegramBotOptions);
        const telegramBotOptions = await telegramBotOptionsRepository.findOneBy({
            botToken: options.telegramToken,
        });
        if (telegramBotOptions) {
            telegramBotOptions.allowed_updates = options.optionUpdate?.allowed_updates || [];
            telegramBotOptions.limit = options.optionUpdate?.limit || 100;
            return await telegramBotOptions.save();
        } else {
            throw new Error('TelegramBotOptions not found');
        }
    }



}