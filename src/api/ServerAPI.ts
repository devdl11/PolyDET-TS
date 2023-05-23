import { IServerAPI, UserCertificate } from "../interfaces/IServerApi";

export class ServerAPI implements IServerAPI {
    register_user(device_id: string, app_version: string, app_hash: string): UserCertificate | undefined {
        throw new Error("Method not implemented.");
    }
}