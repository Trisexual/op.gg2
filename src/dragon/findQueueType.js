import unReadable from "./queues.json";


export default function(queueId){
    
    let tempQueueId = {"id":"failed"};

    Object.keys(unReadable).forEach((q) => {

        // eslint-disable-next-line
        if(queueId == parseInt(unReadable[q]["queueId"])){
            tempQueueId = unReadable[q]
        }
    })

    return tempQueueId;
}