import { Queue } from "bullmq";
const scheduleQueue = new Queue('schedule_queue');

const getRepeatStrategy = (time:number) => {
    return {
        every:time*60*1000
    }
}

export const scheduleJob = async(task_uuid:string,scheduledTime: Date,initiatedAt: Date) => {
    const delay = (+scheduledTime - +initiatedAt)
    console.log(delay, +scheduledTime , +initiatedAt , scheduledTime , initiatedAt)
    await scheduleQueue.add(`JobId_${task_uuid}`,{task_uuid},{
        delay,
        removeOnComplete:true
    })
    console.log('Job added successfully')
}

export const scheduleRecursiveJob = async (task_uuid : string,time:number) => {
    await scheduleQueue.add(`JobId_${task_uuid}`,{task_uuid},{
        repeat:getRepeatStrategy(time),
        removeOnComplete:true
    })
    console.log('job added successfully',task_uuid)
}

export const removeJob = async (task_uuid:string,time:number,status:number) => {
    if (status){
        const repeatStrategy = getRepeatStrategy(time)
        await scheduleQueue.removeRepeatable(`JobId_${task_uuid}`,{
        every:repeatStrategy.every
        })
    console.log('Job Removed Successfully')
    }else{
        await scheduleQueue.remove(`JobId_${task_uuid}`)
        console.log('Job removed from queue')
    }
    
}