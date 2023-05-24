import { IDatabase } from "../interfaces/IDatabase";
import mysql, { Connection, ConnectionOptions } from "mysql2/promise"
import {compare} from "compare-versions"
import parserDbUrl from "parse-database-url"

const DATABASE_URI: string = "mysql://root:polydetdb@localhost:3306/polydetdata";

function URI_TO_PARAMS(uri: string): ConnectionOptions {
    // this lib doesn't have proper ts definitions. (manually generated). TODO: Create interface for the lib.
    let res: any = parserDbUrl(uri);
    delete res.driver;
    let res2: ConnectionOptions = res as ConnectionOptions
    res2.namedPlaceholders = true;
    return res2;
};

export class MySQLDB implements IDatabase {
    async is_connected(): Promise<void> {
        let connection : Connection = await mysql.createConnection(DATABASE_URI);
        await connection.connect();
        await connection.end();
    }

    async configure(): Promise<void> {
        let connection: Connection = await mysql.createConnection(DATABASE_URI);
        await connection.connect();
        
        const queries : string[] = [
            Scripts.GLOBALSETTINGS_CREATETABLE,
            Scripts.REGISTEREDDEVICE_CREATETABLE,
            Scripts.PLANNINGEVOLUTION_CREATETABLE,
            Scripts.SECURESTORAGEKEYS_CREATETABLE,
            Scripts.INWAITINGEVOLUTION_CREATETABLE
        ];
        
        for (const query of queries) {
            await connection.query(query);
        }
        await connection.end();
    }
    
    async check_apphash(hash: string): Promise<boolean> {
        let connection: Connection = await mysql.createConnection(DATABASE_URI);
        await connection.connect();
        
        const [rows] :[mysql.RowDataPacket[] | mysql.RowDataPacket[][] | mysql.OkPacket | mysql.OkPacket[] | mysql.ResultSetHeader, mysql.FieldPacket[]] = await connection.query(Scripts.GET_APPHASH_SETTING);
        const data : Tables.GlobalSettings[] = rows as unknown as Tables.GlobalSettings[];
        await connection.end();
        if (!data.length) {
            return true;
        }
        for (const element of data) {
            if (element.value === hash) return true;
        }
        return false
    }
    
    async check_appversion(version: string): Promise<boolean> {
        let connection: Connection = await mysql.createConnection(DATABASE_URI);
        await connection.connect();

        const [rows] :[mysql.RowDataPacket[] | mysql.RowDataPacket[][] | mysql.OkPacket | mysql.OkPacket[] | mysql.ResultSetHeader, mysql.FieldPacket[]] = await connection.query(Scripts.GET_MIN_APPVERSION_SETTING);
        const data : Tables.GlobalSettings[] = rows as unknown as Tables.GlobalSettings[];

        if (data.length === 0 || data[0] === undefined || data[0].value === undefined) {
            return true;
        }

        return compare(version, data[0].value, ">=");
    }

    async check_deviceid(deviceid: string): Promise<boolean> {
        let connection: Connection = await mysql.createConnection(URI_TO_PARAMS(DATABASE_URI));
        await connection.connect();
        
        const [rows] :[mysql.RowDataPacket[] | mysql.RowDataPacket[][] | mysql.OkPacket | mysql.OkPacket[] | mysql.ResultSetHeader, mysql.FieldPacket[]] 
            = await connection.query(Scripts.GET_REGISTEREDDEVICE_BY_DEVICEID, {uniqid: deviceid});
        const data : Tables.RegisteredDevice[] = rows as unknown as Tables.RegisteredDevice[];
        if (data.length === 0) {
            return true;
        }
        await connection.execute(Scripts.DROP_SECURESTORAGEKEY_BY_PUBLIC_KEY,{pubkey: data[0].publickey});
        await connection.execute(Scripts.DROP_REGISTEREDDEVICE_BY_DEVICEID, {uniqid: deviceid});
        return true;
    }

    async register_new_device(deviceid: string, public_key: string): Promise<boolean> {
        let connection: Connection = await mysql.createConnection(URI_TO_PARAMS(DATABASE_URI));
        await connection.connect();
        await connection.execute(Scripts.INSERT_NEW_REGISTEREDDEVICE, {
            uniqid: deviceid,
            pubkey: public_key
        });

        return true;
    }
    
}

namespace Tables {
    export interface SecureStorageKeys {
        id: Number,
        PublicKey: string,
        CipherKey: string,
    };

    export interface PlanningEvolution {
        id: Number,
        date: Date,
        data_bundle: BinaryData,
    };

    export interface InWaitingEvolution {
        id: Number,
        date: Date,
        bywho: string,
        data: BinaryData,
    };

    export interface GlobalSettings {
        id: Number,
        parameter: string,
        value: string,
    };

    export interface RegisteredDevice {
        id: Number,
        uniqueid: string,
        publickey: string,
    };
}

namespace Scripts {
    export const SECURESTORAGEKEYS_CREATETABLE: string = `CREATE TABLE IF NOT EXISTS \`polydetdata\`.\`SecureStorageKeys\` (
  \`id\` INT NOT NULL AUTO_INCREMENT,
  \`PublicKey\` VARCHAR(128) NOT NULL,
  \`CipherKey\` VARCHAR(128) NOT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE INDEX \`id_UNIQUE\` (\`id\` ASC) VISIBLE,
  UNIQUE INDEX \`PublicKey_UNIQUE\` (\`PublicKey\` ASC) VISIBLE);
`;

    export const PLANNINGEVOLUTION_CREATETABLE: string = `CREATE TABLE IF NOT EXISTS \`polydetdata\`.\`PlanningEvolution\` (
  \`id\` INT NOT NULL AUTO_INCREMENT,
  \`date\` DATETIME NOT NULL,
  \`data_bundle\` BLOB NOT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE INDEX \`id_UNIQUE\` (\`id\` ASC) VISIBLE,
  UNIQUE INDEX \`date_UNIQUE\` (\`date\` ASC) VISIBLE);
`;

    export const INWAITINGEVOLUTION_CREATETABLE: string = `CREATE TABLE IF NOT EXISTS \`polydetdata\`.\`InWaitingEvolution\` (
  \`id\` INT NOT NULL AUTO_INCREMENT,
  \`date\` DATETIME NOT NULL,
  \`bywho\` VARCHAR(128) NOT NULL,
  \`data\` BLOB NOT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE INDEX \`id_UNIQUE\` (\`id\` ASC) VISIBLE,
  UNIQUE INDEX \`date_UNIQUE\` (\`date\` ASC) VISIBLE);
`;

    export const GLOBALSETTINGS_CREATETABLE: string = `CREATE TABLE IF NOT EXISTS \`polydetdata\`.\`GlobalSettings\` (
  \`id\` INT NOT NULL AUTO_INCREMENT,
  \`parameter\` VARCHAR(32) NOT NULL,
  \`value\` VARCHAR(128) NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE INDEX \`id_UNIQUE\` (\`id\` ASC) VISIBLE,
  UNIQUE INDEX \`parameter_UNIQUE\` (\`parameter\` ASC) VISIBLE);
`;

    export const REGISTEREDDEVICE_CREATETABLE: string = `CREATE TABLE IF NOT EXISTS \`polydetdata\`.\`RegisteredDevice\` (
  \`id\` INT NOT NULL AUTO_INCREMENT,
  \`uniqueid\` VARCHAR(128) NOT NULL,
  \`publickey\` VARCHAR(128) NOT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE INDEX \`id_UNIQUE\` (\`id\` ASC) VISIBLE,
  UNIQUE INDEX \`uniqueid_UNIQUE\` (\`uniqueid\` ASC) VISIBLE,
  UNIQUE INDEX \`publickey_UNIQUE\` (\`publickey\` ASC) VISIBLE);
`;

    export const GET_APPHASH_SETTING: string = `SELECT * FROM GlobalSettings WHERE parameter='apphash'`;
    export const GET_MIN_APPVERSION_SETTING: string = `SELECT * FROM GlobalSettings WHERE parameter='minappversion'`;
    export const GET_REGISTEREDDEVICE_BY_DEVICEID: string = `SELECT * FROM RegisteredDevice WHERE uniqueid=:uniqid`;
    export const DROP_REGISTEREDDEVICE_BY_DEVICEID: string = `DELETE FROM RegisteredDevice WHERE uniqueid=:uniqid`;
    export const DROP_SECURESTORAGEKEY_BY_PUBLIC_KEY: string = `DELETE FROM SecureStorageKeys WHERE PublicKey=:pubkey`;
    export const INSERT_NEW_REGISTEREDDEVICE: string = `INSERT INTO RegisteredDevice (uniqueid, publickey) VALUES (:uniqid, :pubkey)`;

}