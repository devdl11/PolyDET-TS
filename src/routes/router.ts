import express, {Router, Request, Response} from "express"
import { checkSchema, Result, validationResult } from "express-validator";
import { register_new_device } from "./api_routes";
import { APIResponses } from "../types/requests";

const apiRouter: Router = express.Router();

apiRouter.get("/hello", (req, res) => {
    res.send("Hello World !")
});

apiRouter.get("/dbconnectivity", (req, res) => {

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
  (req: Request, res: Response) => {
    const val: Result = validationResult(req);
    if (val.isEmpty()) {
        register_new_device(req, res);
    } else {
      res.send(JSON.stringify(APIResponses.ENDPOINT_API_ERROR));
    }
  },
);

export default apiRouter;