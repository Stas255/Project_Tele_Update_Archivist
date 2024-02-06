import { UpdateTypes } from '@codecast-duo/codecast-duo-telegrambot/dist/types';
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity()
export class TelegramBotOptions extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number; // Add an initializer to the "id" property

    @Column()
    botToken!: string;

    @Column()
    started!: boolean;

    @Column()
    lastUpdated!: number;

    @Column("simple-json")
    allowed_updates!:string[];

    @Column()
    limit!: number;
}