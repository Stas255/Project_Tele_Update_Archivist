export class Infor {
    static info: Record<string, any> = {};

    // Method to update a specific piece of information
    static updateInfo(key: string, value: any) {
        Infor.info[key] = value;
    }

    // Method to get the current value of a specific piece of information
    static getInfo(key: string) {
        return Infor.info[key];
    }

    // Method to remove a specific piece of information
    static removeInfo(key: string) {
        delete Infor.info[key];
    }

    static incrementInfo(key: string, incrementBy: number) {
        if (typeof Infor.info[key] === 'number') {
            Infor.info[key] += incrementBy;
        } else {
            throw new Error(`Cannot increment non-numeric value for key: ${key}`);
        }
    }

    // Method to get all information
    static getAllInfo() {
        return Infor.info;
    }
}