import {  IRouter } from "express";
import { validateGetTaskExecutionDetails, validateInitializeTask,validateTaskExecutionOperations,validateUpdateTaskDetails } from "../validators/dirWatch.validate"
import { getTaskExecutionDetails, initalizeTaskController, startTaskExecution, stopTaskExecution, updateTaskDetails } from "../controllers/dirWatch.controller";

const dirWatchRouter = (router:IRouter) => {
    router.post(
        '/initialize_task',
        validateInitializeTask,
        initalizeTaskController
        )
    router.post(
        '/update_task_details',
        validateUpdateTaskDetails,
        updateTaskDetails
    )
    router.post(
        '/stop_task_execution',
        validateTaskExecutionOperations,
        stopTaskExecution
    )
    router.post(
        '/start_task_execution',
        validateTaskExecutionOperations,
        startTaskExecution
    )
    router.get(
        '/get_task_execution_details',
        validateGetTaskExecutionDetails,
        getTaskExecutionDetails
    )
}

export default dirWatchRouter;