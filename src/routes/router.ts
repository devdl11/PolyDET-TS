import express, {Router, Request, Response} from "express"
import { checkSchema, Result, validationResult } from "express-validator";
import { register_new_device } from "./api_routes";
import { APIResponses } from "../types/requests";
import get_db_implementation from "../database";

const apiRouter: Router = express.Router();

apiRouter.get("/hello", (req, res) => {
    res.send("Hey !")
});

apiRouter.get("/dbconnectivity", async (req, res) => {
  try {
    await get_db_implementation().is_connected();
    res.send("Online");
  } catch (err) {
    console.error("DB ERROR: ", err);
    res.send("Offline");
  }
});

apiRouter.post(
  "/registernewdevice",
  checkSchema({
    app_hash: {
      isAlphanumeric: true,
      trim: true,
      toLowerCase: true,
    },
    app_version: {
      trim: true,
      toLowerCase: true,
      isSemVer: true,
    },
    device_id: {
      isAlphanumeric: true,
      trim: true,
      toLowerCase: true,
    },
  }),
  async (req: Request, res: Response) => {
    const val: Result = validationResult(req);
    if (val.isEmpty()) {
      res.send(await register_new_device(req, res));
    } else {
      res.send(JSON.stringify(APIResponses.ENDPOINT_API_ERROR));
    }
  }
);

export default apiRouter;