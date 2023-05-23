import { IDatabase } from "../interfaces/IDatabase";
import { MySQLDB } from "./mysql_impl";

const DB_IMPL = new MySQLDB();

function get_db_implementation(): IDatabase {
    return DB_IMPL;
}

export default get_db_implementation;
