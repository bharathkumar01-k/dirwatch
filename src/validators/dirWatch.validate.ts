import { NextFunction , Request, Response} from "express";

import {z} from "zod"
export const validateInitializeTask = async (req:Request,res:Response,next:NextFunction) => {
    const initalizeTask = z.object({
        directory:z.string().regex(/^(.+)\/([^/]+)$/),
        time_interval:z.number().min(1).max(1440),
        magic_string:z.string(),
        schedule_at:z.string()
    })
    const result = initalizeTask.safeParse(req.body)
    if(!result.success){
        return res.status(411).json({
            success:false,
            message:result.error
        })
    }
    next()
}

export const validateUpdateTaskDetails = async (req:Request,res:Response,next:NextFunction) => {
    const taskDetails = z.object({
        task_uuid:z.string().uuid(),
        directory:z.string().regex(/^(.+)\/([^/]+)$/),
        time_interval:z.number().min(1).max(1440),
        magic_string:z.string(),
        schedule_at:z.string()
    })
    const result = taskDetails.safeParse(req.body)
    if(!result.success){
        return res.status(411).json({
            success:false,
            message:result.error
        })
    }
    next()
}

export const validateTaskExecutionOperations = async (req:Request,res:Response,next:NextFunction) => {
    const taskDetails = z.object({
        task_uuid:z.string().uuid()
    })

    const result = taskDetails.safeParse(req.body);
    if(!result.success){
        return res.status(411).json({
            success:false,
            message:result.error
        })
    }
    next()
}

export const validateGetTaskExecutionDetails = async(req:Request,res:Response,next:NextFunction) => {
    const ALLOWED_STATUS_VALUES = ["completed","failed"] as const
    const taskExecutionDetails = z.object({
        task_uuid:z.string().uuid(),
        pageNumber: z.string(),
        limit: z.string(),
        sort_by: z.literal(-1).or(z.literal(1)).optional(),
        status: z.enum(ALLOWED_STATUS_VALUES).optional(),
        start_time:z.string().optional(),
        end_time:z.string().optional()
    })
    const result = taskExecutionDetails.safeParse(req.query);
    if(!result.success){
        return res.status(411).json({
            success:false,
            message:result.error
        })
    }
    next()
}