import express, {Express, Request, Response} from "express"
import dotenv from "dotenv"
import apiRouter from "./routes/router";
import { Security } from "./security";
import get_db_implementation from "./database";

dotenv.config();

const app: Express = express();
const port: Number = 4000;

const VERSION: string =  "1.0.0";

const CA_PATH: string = "ca_cert.pem";
const PK_PATH: string = "pk.key";

export let SECURITY : Security | null = Security.new(CA_PATH, PK_PATH);

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.send("Hello World !");
});

app.use("/api", apiRouter);

new Promise<void>((resolve, reject) => {
    let dbinit = () => {
        get_db_implementation().configure().then(() => {
            resolve();
            return;
        }).catch(() => {
            reject("Can't init the database! ");
            return;
        });
    }
    if (SECURITY === null) {
        Security.init_env(CA_PATH, PK_PATH).then(() => {
            SECURITY = Security.new(CA_PATH, PK_PATH);
            dbinit();
            return;
        }).catch(() => {
            reject("Can't generate cert or key !");
            return;
        });
    } else {
        dbinit();
    }
}).then(() => {
    app.listen(port, () => {    
        console.info("We're live !", port);
    });
}).catch((err) => {
    console.error("ERROR: CAN'T START THE SERVER. REASON: ", err);
});

