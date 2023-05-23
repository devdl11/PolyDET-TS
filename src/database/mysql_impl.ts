import { IDatabase } from "../interfaces/IDatabase";

export class MySQLDB implements IDatabase {
    is_connected(): boolean {
        throw new Error("Method not implemented.");
    }
    configure(): boolean {
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
