import {Request, Response} from "express"
import { RegisterNewDevice } from "../types/requests"
import get_api_implementation from "../api";

export function register_new_device(req: Request, res: Response): void {
    const data : RegisterNewDevice = req.body;
    res.send(get_api_implementation().register_user(data.device_id, data.app_version, data.app_hash));
};
