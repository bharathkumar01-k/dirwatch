# Dirwatch

## Prerequisites

1. Typescript
2. NodeJS (min version - 20)
3. Redis
4. MongoDB

## Steps to run

1. Clone the repository
2. Run ***tsc -b***
3. Run ***npm install***
4. Navigate to __/dist__ folder
5. Run ***node app.js***

## Architecture

![Screenshot 2024-04-07 at 8 37 27 PM](https://github.com/bharathkumar01-k/dirwatch/assets/42500502/db4c26b2-4b54-484d-8e0b-089f25f388d8)

## Schema Design

![Screenshot 2024-04-07 at 8 02 53 PM](https://github.com/bharathkumar01-k/dirwatch/assets/42500502/69c3e355-5cd5-4654-b0c5-6507dfa6f37e)

## APIs

> The date time should always be in ***MM-DD-YYYY HH:mm*** this format
>
> The time_interval should always be in ***minutes***


| S.No | Mehod | Path | Description | Sample Request | Sample Response | Additional Notes |
|---|---|---|---|---|---|---|
| 1 | POST | /api/initialize_task | To initialize the task at a given time | ``` {"directory":"/Users/Bharath/rewq","time_interval":1,"magic_string":"lorem","schedule_at":"04-07-2024 18:08"} ``` | ``` {"success":true,"result":{"task_uuid":"1510cd94-f8f2-4375-8a84-242af2dbe24a"}} ``` |
| 2 | POST | /api/update_task_details | To update the task details| ``` {"task_uuid":"1510cd94-f8f2-4375-8a84-242af2dbe24a","directory":"/Users/Bharath/rewq","time_interval":2,"magic_string":"lorem","schedule_at":"04-07-2024 21:25"} ``` | ``` {{"success":true,"message":"The details updated successfully","result":{"task_uuid":"1510cd94-f8f2-4375-8a84-242af2dbe24a"}} ``` |
| 3 | POST | /api/stop_task_execution | To stop task | ``` {"task_uuid":"d2215b6a-80ab-48c0-8fbd-7a00eb61bb1b"} ``` | ``` {"success":true,"message":"The task stopped successfully"} ``` |
| 4 | POST | /api/start_task_execution | To start task| ``` {"task_uuid":"d2215b6a-80ab-48c0-8fbd-7a00eb61bb1b"} ``` | ``` {"success":true,"message":"The task started successfully"} ``` |
| 5 | GET | /api/get_task_execution_details | Get execution details of a particular task | ```?task_uuid=1510cd94-f8f2-4375-8a84-242af2dbe24a&pageNumber=1&limit=2&start_time=04-07-2024 04:40&end_time=04-07-2024 19:00&status=completed``` | ``` {"result":true,"data":[{"metadata":[{"total":42,"page":1,"pageSize":2,"totalPages":21}],"data":[{"_id":"66129f9cb0698d4da9959548","task_uuid":"1510cd94-f8f2-4375-8a84-242af2dbe24a","start_time":"2024-04-07T13:29:00.018Z","end_time":"2024-04-07T13:29:00.116Z","execution_time":98,"occurences":{"ds.txt":4,"file2.txt":4,"file3.txt":5,"ipsum.txt":198,"lorem.txt":33,"dsf/ipsummm.txt":427,"dsf/lorem.txt":35,"dsf/djhsb/ndmasmn/kasd/hd.txt":331},"files_list":["ds.txt","file2.txt","file3.txt","ipsum.txt","lorem.txt","dsf/ipsummm.txt","dsf/lorem.txt","dsf/djhsb/ndmasmn/kasd/hd.txt"],"files_added":[],"files_deleted":[],"status":"completed"},{"_id":"66129f60b0698d4da9959547","task_uuid":"1510cd94-f8f2-4375-8a84-242af2dbe24a","start_time":"2024-04-07T13:28:00.053Z","end_time":"2024-04-07T13:28:00.192Z","execution_time":139,"occurences":{"ds.txt":4,"file2.txt":4,"file3.txt":5,"ipsum.txt":198,"lorem.txt":33,"dsf/ipsummm.txt":427,"dsf/lorem.txt":35,"dsf/djhsb/ndmasmn/kasd/hd.txt":331},"files_list":["ds.txt","file2.txt","file3.txt","ipsum.txt","lorem.txt","dsf/ipsummm.txt","dsf/lorem.txt","dsf/djhsb/ndmasmn/kasd/hd.txt"],"files_added":[],"files_deleted":[],"status":"completed"}]}]} ``` | The response will be in pagination format |

