import { Request,Response } from "express";
import { getConnection } from "../db/getMongoDBConnection";
import fs from 'fs';
import {v4 as uuid} from 'uuid';
import { scheduleRecursiveJob , removeJob, scheduleJob } from "../services/schedule_provider.service";
interface TaskInit{
    directory:string,
    time_interval:number,
    magic_string:string,
    schedule_at:string
}
interface updateTaskDetails extends TaskInit{
    task_uuid:string
}

export const initalizeTaskController = async (req:Request,res:Response) =>{
    const body:TaskInit = req.body;
    const db = getConnection()
    const task_uuid = uuid()
    const scheduleAt = new Date(body.schedule_at)
    const currentTime = new Date()
    if(!(scheduleAt>currentTime)){
        return res.status(411).json({
            success:false,
            message:"Can't Schedule tasks at given interval"
        })
    }
    const taskDetail = await db.collection('task_details').findOne({
        directory: body.directory,
        magic_string: body.magic_string
    })
    if(!taskDetail){
        try
        {
            if(fs.statSync(body.directory).isDirectory()){
            await db.collection('task_details').insertOne({
                task_uuid,
                directory :body.directory,
                time_interval :body.time_interval,
                magic_string :body.magic_string,
                schedule_at:scheduleAt,
                time:currentTime,
                status:0
            })
        }}catch(err){
            try{
                fs.mkdirSync(body.directory)
                await db.collection('task_details').insertOne({
                    task_uuid,
                    directory :body.directory,
                    time_interval :body.time_interval,
                    magic_string :body.magic_string,
                    schedule_at:scheduleAt,
                    time:currentTime,
                    status:0
                })
            }catch(e){
                console.log('Errorr -> ',err)
                return res.status(411).json({
                    success:false,
                    message:"Error in accessing directory"
                })
            }
        }
        scheduleJob(task_uuid,scheduleAt,currentTime)
        res.status(201).json({
            success:true,
            result:{
                task_uuid
            }
        })
    }else{
        res.status(411).json({
            success:true,
            result:{
                messasge:"The task already exists"
            }
        })
    }
    
} 


export const updateTaskDetails = async (req:Request,res:Response) => {
    const body = req.body;
    const db = getConnection();
    const scheduleAt = new Date(body.schedule_at)
    const currentTime = new Date()

    if(!(scheduleAt>currentTime)){
        return res.status(411).json({
            success:false,
            message:"Can't Schedule tasks at given interval"
        })
    }
    if(!(body?.directory || body?.time_interval || body?.magic_string)){
        return res.status(411).send({
            status:false,
            message:"Unprocessable entity"
        })
    }else{
        const updatedDetails = await db.collection('task_details').findOneAndUpdate({
            task_uuid:body.task_uuid
        },{
            $set:{
                directory:body.directory,
                time_interval:body.time_interval,
                magic_string:body.magic_string,
                schedule_at:scheduleAt,
                time:currentTime,
                status:0
            }
        },{
            upsert:false,
            returnDocument:"after"
        })
        if(!updatedDetails){
            return res.status(411).json({
                success:false,
                message:"The task doesn't exists"
            })
        }
        await removeJob(body.task_uuid,body.time_interval,updatedDetails?.status);
        scheduleRecursiveJob(updatedDetails?.task_uuid,updatedDetails?.time_interval);
        res.status(201).json({
            success:true,
            message:"The details updated successfully",
            result:{
                task_uuid:body.task_uuid,
            }
        })
    }
}

export const stopTaskExecution = async (req:Request,res:Response) => {
    const body =req.body
    const db= getConnection();
    const taskDetail = await db.collection('task_details').findOne({
        task_uuid:body.task_uuid
    })
    if(!taskDetail){
        return res.status(411).json({
            success:false,
            message:"The task does not exist"
        })
    }else{
        removeJob(taskDetail?.task_uuid,taskDetail?.time_interval,taskDetail?.status)
    }
    res.status(201).json({
        success:true,
        message:"The task stopped successfully"
    })
}

export const startTaskExecution = async(req:Request,res:Response) => {
    const body =req.body
    const db= getConnection();
    const taskDetail = await db.collection('task_details').findOne({
        task_uuid:body.task_uuid
    })
    if(!taskDetail){
        return res.status(411).json({
            success:false,
            message:"The task does not exist"
        })
    }else{
        scheduleRecursiveJob(taskDetail?.task_uuid,taskDetail?.time_interval)
    }
    res.status(201).json({
        success:true,
        message:"The task started successfully"
    })
}

export const getTaskExecutionDetails = async(req:Request,res:Response) => {
    const queryString = JSON.parse(JSON.stringify(req.query))

    const task_uuid = queryString?.task_uuid || ''
    const pageNumber:string = queryString?.pageNumber || '1'
    const limit:string = queryString?.limit || '10'
    const sort_by:string = queryString?.sort_by || '-1'
    const status = queryString?.status
    const start_time = queryString?.start_time
    const end_time = queryString?.end_time

    const page :number =+pageNumber
    const pageSize : number = +limit
    const sortOrder:number = +sort_by
    const getTaskExecutionDetailsQuery:{
        task_uuid:string,
        status?:string,
        start_time?:Date,
        end_time?:Date
    } = {
        task_uuid
    }
    if(status){
        getTaskExecutionDetailsQuery.status= status
    }
    if(start_time && end_time){

        //@ts-ignore
        getTaskExecutionDetailsQuery.start_time = {$gte: new Date(start_time as string)}
        //@ts-ignore
        getTaskExecutionDetailsQuery.end_time = {$lt: new Date(end_time as string)}
    }
    
    const db = getConnection();


    const aggregationPiepline = [
        {
            $match:getTaskExecutionDetailsQuery
        },
        {
            $sort: (sortOrder ? {start_time:sortOrder} : {start_time:-1})
        },
        { '$facet'    : {
            metadata: [ { $count: "total" }, { $addFields: { page: page , pageSize: pageSize ,totalPages: { $ceil: { $divide: [ "$total", pageSize ] }}} }],
            data: [ { $skip: ((page-1) * pageSize) }, { $limit: pageSize } ] // add projection here wish you re-shape the docs
        } }
    ]
    try{
        const result = await db.collection('task_execution_details').aggregate(aggregationPiepline).toArray();
        res.status(200).json({
            result:true,
            data:result
        })
    }catch(err){
        console.log('Error',err)
        res.status(500).json({
            result:false,
        })
    }

    
}
