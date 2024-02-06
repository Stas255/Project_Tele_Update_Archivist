import path from 'node:path';
import { DataSource } from 'typeorm';
import  * as Entities from './models';

export class TypeormApi {
    protected connection: DataSource;

    constructor(dbName: string) {
        if(!process.env.DB_PATH){
            throw new Error('DB_PATH environment variable not set');
        }
        this.connection = new DataSource({
            type: 'sqlite',
            database: path.join(__dirname, process.env.DB_PATH, dbName),
            entities: Entities,
            logging: true,
            synchronize: true,
            logger: "file",
        });
    }

    async connect() {
        try {
            await this.connection.initialize();
            console.log('Connected to SQLite database');
        } catch (error) {
            console.error('Error connecting to SQLite database:', error);
        }
    }

    async disconnect() {
        try {
            await this.connection.destroy();
            console.log('Disconnected from SQLite database');
        } catch (error) {
            console.error('Error disconnecting from SQLite database:', error);
        }
    }
}