import { IRouter } from "express";
import dirWatchRouter from "./dirWatch.route";



const apiRouter = async(router : IRouter) => {
    dirWatchRouter(router);
}

export default apiRouter