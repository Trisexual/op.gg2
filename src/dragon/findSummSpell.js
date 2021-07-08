import unReadable from "./data/en_US/summoner.json";


export default function(spellId){
    
    let tempSpellId = {"id":"failed"};

    Object.keys(unReadable["data"]).forEach((spell) => {

        // eslint-disable-next-line
        if(spellId == parseInt(unReadable["data"][spell]["key"])){
            tempSpellId = unReadable["data"][spell]
        }
    })

    if(tempSpellId.id == "failed"){
        tempSpellId = {image : {full : "emptyItemSlot"}}
    }

    return tempSpellId;
}