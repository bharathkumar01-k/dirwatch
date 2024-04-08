import express , { Express, IRouter, NextFunction, Request, Response } from "express";
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
process.on('unhandledRejection',(err)=>{
    console.log(err)
})
app.use('/api',router)
apiRouter(router);

app.use((req:Request,res:Response,next:NextFunction)=>{
    res.status(404).json({
        success:false,
        message:"URL not found"
    })
    next()
})

app.use((err, req:Request,res:Response,next:NextFunction) =>{
    console.log('err',err)
    // console.log('error =>',err)
    return res.status(411).json({
        success:false,
        message:"Unprocessable entity"
    })
})

app.listen(port , () => {
    console.log(`The app is listening on port - ${port}` )
})