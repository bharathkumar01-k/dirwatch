import { Job, Worker } from "bullmq";
import { getConnection } from "../db/getMongoDBConnection";
import fs from "fs";
import { scheduleRecursiveJob } from "./schedule_provider.service";

const db = getConnection();
const scheduleHandler = async(job:Job) =>{
    const taskStartTime = new Date()
    const task_uuid = job.data.task_uuid;
    const taskDetail = await db.collection('task_details').findOne({
        task_uuid
    })
    if(!(taskDetail?.status)){
        await db.collection('task_details').updateOne({
            task_uuid,
        },{
            $set:{
                status:1
            }
        })
        scheduleRecursiveJob(task_uuid,taskDetail?.time_interval)
    }
    let jobDetail = await db.collection('task_execution_details').find({
        task_uuid
    }).sort({start_time : -1}).limit(1).toArray();
    //@ts-expect-error "job detail is an object"
    jobDetail = jobDetail.pop() || null;
    if(taskDetail){
        const {directory,magic_string} = taskDetail;
        let files= fs.readdirSync(directory,{recursive:true});
        const lookUp = new Map<string,number>();
        //@ts-ignore
        files = files.map(file => {
            const fileStatus = fs.statSync(directory+'/'+file);
            if(fileStatus.isFile()){
                let occurences = 0;
                fs.readFileSync(directory+'/'+file).toString().split(' ').forEach(word => {
                    if(word.toLowerCase().trim() === magic_string.toLowerCase().trim()){
                        occurences+=1
                        //@ts-ignore
                        lookUp.set(file,occurences);
                    }
                })
                return file
            }
            return
        })
        //@ts-ignore
        files = files.filter(file => file)
        const taskEndTime = new Date();
        if(!jobDetail){
            const taskExecDetails = await db.collection('task_execution_details').insertOne({
                task_uuid,
                start_time: taskStartTime,
                end_time:taskEndTime,
                execution_time:+taskEndTime - +taskStartTime,
                occurences:lookUp,
                files_list:files,
                files_added:[],
                files_deleted:[],
                status:'completed'
            })
        }else{
            await db.collection('task_execution_details').insertOne({
                    task_uuid,
                    start_time: taskStartTime,
                    end_time:taskEndTime,
                    execution_time:+taskEndTime - +taskStartTime,
                    occurences:lookUp,
                    files_list:files,
                    //@ts-expect-error "accessing the job detail object"
                    files_added:files.filter(file => !jobDetail.files_list.includes(file)),
                    //@ts-expect-error "accessing the job detail object"
                    files_deleted:jobDetail.files_list.filter((file:string) => !files.includes(file)),
                    status:'completed'
                }
            )
        }
    }
}
const startWorker = ()=>{
    
    const worker = new Worker("schedule_queue",scheduleHandler,{
        connection:{ host: "localhost", port: 6379 }
    })
    
    worker.on("completed", (job) => {
        console.log("Job completed", job.data.task_uuid);
    })
    
    worker.on("failed", async (job,error) => {
        console.log(`The job is ${job?.id} failed with error ${error.message}`);
        await db.collection('task_execution_details').insertOne({
            task_uuid:job?.data.task_uuid,
            status:'failed',
            error:{
                name:error.name,
                message:error.message,
                stack:error.stack
            }
        })
      });
      console.log('worker started successfully')
}
export default startWorker;