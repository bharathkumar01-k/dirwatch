import { Db, MongoClient } from "mongodb";

const client:MongoClient = new MongoClient("mongodb://localhost:27017")
const db:Db = client.db('dirwatch')
export const getConnection = ():Db =>  {
    return db
}