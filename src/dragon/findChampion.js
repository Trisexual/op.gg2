import unReadable from "./data/en_US/champion.json"


export default function(champId){
    
    let tempChampId = {"id":"failed"};

    Object.keys(unReadable["data"]).forEach((champ) => {

        // eslint-disable-next-line
        if(champId == parseInt(unReadable["data"][champ]["key"])){
            tempChampId = unReadable["data"][champ]
        }
    })

    return tempChampId;
}