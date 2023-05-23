import { IDatabase } from "../interfaces/IDatabase";
import mysql, { Connection } from "mysql2"

const DATABASE_URI: string = "mysql://root:polydetdb@localhost:3306/polydetdata";

export class MySQLDB implements IDatabase {
    is_connected(): Promise<void> {
        return new Promise<void> ((resolve, reject) => {
            let connection : Connection = mysql.createConnection(DATABASE_URI);
            connection.connect((err: mysql.QueryError | null) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
        });
    }

    configure(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    check_apphash(hash: string): boolean | undefined {
        throw new Error("Method not implemented.");
    }
    check_appversion(version: string): boolean | undefined {
        throw new Error("Method not implemented.");
    }
    check_deviceid(deviceid: string): boolean | undefined {
        throw new Error("Method not implemented.");
    }
    register_new_device(deviceid: string, public_key: string): boolean {
        throw new Error("Method not implemented.");
    }

}
