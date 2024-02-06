import { Update } from '@codecast-duo/codecast-duo-telegrambot/dist/types';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

const appendFile = promisify(fs.appendFile);
const readFile = promisify(fs.readFile);
const stat = promisify(fs.stat);

export class JsonStorage {
    private filename: string;
    private maxFileSize = 10 * 1024 * 1024; // 10 MB
    private maxRecords = 5000;
    private currentRecords = 0;

    constructor() {
        this.filename = this.generateNewFileName();
        this.createFile();
    }

    private async getFileSize(): Promise<number> {
        const stats = await stat(this.filename);
        return stats.size;
    }

    private generateNewFileName(): string {
        const baseName = "Log";
        const timestamp = Date.now();
        this.currentRecords = 0;
        return path.join(__dirname, './logs', `${baseName}_${timestamp}.json`);
    }

    private createFile(): void {
        const dir = path.dirname(this.filename);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFile(this.filename, '', (err) => {
            if (err) throw err;
            console.log('Файл успешно создан!');
        });
    }

    async save(object: Update | {}): Promise<void> {
        const data = JSON.stringify(object, null, 2);
        if (!fs.existsSync(this.filename)) {
            this.createFile();
        }
        const currentSize = await this.getFileSize();
        this.currentRecords++;

        if (currentSize >= this.maxFileSize || this.currentRecords >= this.maxRecords) {
            this.filename = this.generateNewFileName();
            this.createFile();
            this.currentRecords = 0;
        }

        await appendFile(this.filename, data, 'utf8');
        await appendFile(this.filename, ',', 'utf8');
    }

    async load(filename: string): Promise<any> {
        const data = await readFile(filename, 'utf8');
        return JSON.parse(data);
    }
}