import express , {Express, IRouter, Request, Response } from "express";
import apiRouter from "./router/route";
import startWorker from "./services/schedule_consumer.service";

const app:Express = express();

const router:IRouter = express.Router();

const port:number = 3000

startWorker()

app.use(express.json())
app.get('/', (req:Request,res:Response) => {
    res.status(200).json({
        success:true,
        message:"The app is running successfully"
    })
})

app.use('/api',router)
apiRouter(router);

app.listen(port , () => {
    console.log(`The app is listening on port - ${port}` )
})