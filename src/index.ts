import express, {Express, Request, Response} from "express"
import dotenv from "dotenv"
import apiRouter from "./routes/router";

dotenv.config();

const app: Express = express();
const port: Number = 4000;

const VERSION: string =  "1.0.0";

const CA_PATH: string = "ca_cert.pem";
const PK_PATH: string = "pk.key";

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.send("Hello World !");
});

app.use("/api", apiRouter);

app.listen(port, () => {    
    console.info("We're live !", port);
});
