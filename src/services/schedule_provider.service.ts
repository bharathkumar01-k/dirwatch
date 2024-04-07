import { Queue } from "bullmq";
const scheduleQueue = new Queue('schedule_queue');

const getRepeatStrategy = (time:number) => {
    return {
        every:time*60*1000
    }
}

export const scheduleJob = async(task_uuid:string,scheduledTime: Date,initiatedAt: Date) => {
    /**
     * Calculates the delay between the scheduled time and the time the job was initiated,
     * then adds a job to the schedule queue with the calculated delay.
     * @param {Date} scheduledTime - The time the job is scheduled to run.
     * @param {Date} initiatedAt - The time the job was initiated.
     * @param {string} task_uuid - The unique identifier for the task.
     * @returns None
     */
    const delay = (+scheduledTime - +initiatedAt)
    console.log(delay, +scheduledTime , +initiatedAt , scheduledTime , initiatedAt)
    await scheduleQueue.add(`JobId_${task_uuid}`,{task_uuid},{
        delay,
        removeOnComplete:true
    })
    console.log('Job added successfully')
}

export const scheduleRecursiveJob = async (task_uuid : string,time:number) => {
    /**
     * Adds a job to the schedule queue with the specified task UUID and repeat strategy.
     * @param {string} task_uuid - The unique identifier for the task.
     * @param {number} time - The time interval for the repeat strategy.
     * @returns None
     */
    await scheduleQueue.add(`JobId_${task_uuid}`,{task_uuid},{
        repeat:getRepeatStrategy(time),
        removeOnComplete:true
    })
    console.log('job added successfully',task_uuid)
}

export const removeJob = async (task_uuid:string,time:number,status:number) => {
    /**
     * Removes a job from the schedule queue based on the status and time parameters.
     * If the status is true, the job is removed based on the repeat strategy.
     * If the status is false, the job is removed directly without any repeatable settings.
     * @param {boolean} status - The status indicating whether to remove the job.
     * @param {number} time - The time value used to determine the repeat strategy.
     * @param {string} task_uuid - The unique identifier of the job to be removed.
     * @returns None
     */
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