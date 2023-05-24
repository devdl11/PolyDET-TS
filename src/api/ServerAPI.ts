import { assert } from "console";
import { SECURITY } from "..";
import get_db_implementation from "../database";
import { IServerAPI, UserCertificate } from "../interfaces/IServerApi";
import { APIResponses } from "../types/requests";

export class ServerAPI implements IServerAPI {
    async register_user(device_id: string, app_version: string, app_hash: string): Promise<string> {
        try {
            if (! await get_db_implementation().check_apphash(app_hash)) {
                return JSON.stringify(APIResponses.INVALID_APP_HASH);
            }
            
            if (! await get_db_implementation().check_appversion(app_version)) {
                return JSON.stringify(APIResponses.OUTDATED_APP);
            }

            if (! await get_db_implementation().check_deviceid(device_id)) {
              return JSON.stringify(APIResponses.DEVICEID_REFUSED);
            }

        } catch (err) {
            console.error("ERROR WHEN FETCHING: ", err);
            return JSON.stringify(APIResponses.DATABASE_API_CONNECTION_ERROR);
        }
        assert(SECURITY !== null && SECURITY !== undefined);
        
        const usercert : UserCertificate | null | undefined = await SECURITY?.generate_cert_for_user(device_id, app_hash);

        assert(usercert !== null && usercert !== undefined);

        const userc = usercert as unknown as UserCertificate;

        get_db_implementation().register_new_device(device_id, userc.public_key);
        return JSON.stringify(userc);

    }
}