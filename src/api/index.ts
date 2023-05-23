import { IServerAPI } from "../interfaces/IServerApi";
import { ServerAPI } from "./ServerAPI";

const SERVER_API = new ServerAPI()

function get_api_implementation(): IServerAPI {
    return SERVER_API;
}

export default get_api_implementation;