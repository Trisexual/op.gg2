import React from 'react';
import './App.css';
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';

import Accordion from 'react-bootstrap/Accordion';
import Image from "react-bootstrap/Image";

import { Container, Row, Col } from 'react-bootstrap';

import { useAccordionToggle } from 'react-bootstrap/AccordionToggle';

import findSumm from "./dragon/findSummSpell";
import findChamp from "./dragon/findChampion";
import findQueue from "./dragon/findQueueType";

import TopBar from "./topBar.js";

import secrets from "./secretStuff.json"



//big note on how i made my shit
//a lot of my css styling on divs and shit use the style = {{gay}} element
//this make it incredibly hard to read, but i did this since i would need like 80 different classes in order to fit all of the shit i want
//you could porbably just try your best to ignore the style element shit and you would understand the code perfectly

//this entire code is a big fuck you to everyone reading this, since only i can read it without requiring several doses of
//aderall to keep themselves from losing focus from this shitshow
//im gonna be honest the easiest way to navigate is to use ctrl f whehnever you want to see where i stored some css
//as well as using inspect element on the webpage to find specific things (ctrl-shift-c)

function CustomToggle({ children, eventKey, winLose }) {
  const decoratedOnClick = useAccordionToggle(eventKey
  );

  return (
    <button
    type="button"
    //style={{backgroundColor: 'pink', width : '100%', marginBottom:"0px"}}
    className = {"gameInfoAccordion " + winLose}
    onClick={decoratedOnClick}
    >
    {children}
    </button>

    
  );
}


export class App extends React.Component {

  constructor(props){
    super(props);

    //Im a lazy coder so this might even be all of the variables in the state
    this.state = {
        matches : [[],[],[],[],[]],
        upperAccordion: [[],[],[],[],[]],
        winLoseGame: [false,false,false,false,false],
        puuid : "",
        encryptedId : "",
        summonerName:"",
        summonerLevel:"",
        summonerProfile : 0,

        rankedSoloInfo:{rank:"unranked", lp:0, tier : "unranked"},
        rankedFlexInfo:{rank:"unranked", lp:0, tier : "unranked"},

        gamesWon : 0,
        totalKills : 0,
        totalDeaths : 0,
        totalAssists : 0,

        favRole: [],
        favChamp: [],

        matchesFound : 0,
        matchDataDone : 0,
        finishedRendering : false
    }
  }

  numberWithCommas(x) {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
  }

  async componentDidMount(){
    
    let personToSearch = this.props.match.params.username
    
    //sets puuid for later use, as well as other states to be able to render player data
    //not nesting the axios.post because async stuff makes my head hurt
    await axios.post(secrets['request-link'], {"url": "https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" + personToSearch})
    .then(res => {
        this.setState({
          puuid : res.data.puuid,
          encryptedId : res.data.id,

          summonerName : res.data.name,
          summonerLevel : res.data.summonerLevel,
          summonerProfile : res.data.profileIconId.toString(),

          masteryData : []
        });
          
      })
    .catch(err => {
      console.log(secrets['request-link']);
    })

    
    //get ranked info based on summoner id i just got from above post req
    await axios.post(secrets['request-link'], {"url": "https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/" +  this.state.encryptedId})
      .then(res => {

        let rankedSolo = {rank : "unranked", lp : 0, tier : "unranked"};
        let rankedFlex = {rank : "unranked", lp : 0, tier : "unranked"};
        
        //since they give me ranked data unsorted, i used a foreach loop
        //store ranked flex data if ranked flex data, otherwise do ranked solo data
        res.data.forEach(rankData => {
          if(rankData.queueType == "RANKED_FLEX_SR"){
            rankedFlex = {
              rank : rankData.rank,
              tier : rankData.tier,
              lp : rankData.leaguePoints
            }
          }

          else if(rankData.queueType == "RANKED_SOLO_5x5"){
            rankedSolo = {
              rank : rankData.rank,
              tier : rankData.tier,
              lp : rankData.leaguePoints
            }
          }
        });

        this.setState({
          rankedSoloInfo : rankedSolo,
          rankedFlexInfo : rankedFlex
        });
        
      });
    


    //currently gets 10 games, and cant get anymore afterwards in the webiste
    //get games, then run through a game and set some states based on the info in the game
    await axios.post(secrets['request-link'], {"url": "https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/" + this.state.puuid + "/ids?start=0&count=10"})
      .then(summ => {

        //im storing this, since later i need to know how many games to render
        this.setState({matchesFound:summ.data.length});
        

        //find all of the matches we end up finiding, poterntially less than 10
        //doing this since i get match-ids rather than match data itself
        //as in using each of the ten match ids i get search up the match data from it
        for(let i = 0; i < (this.state.matchesFound); i++){
          axios.post(secrets['request-link'], {"url": "https://americas.api.riotgames.com/lol/match/v5/matches/" + summ.data[i]})
            .then(res => {

              

              let team1 = [];
              let team2 = [];

              let team1Won = false;
              if(res.data.info.teams[0].win) team1Won = true;
              
              //find what was the highest damage dealt in the game, store it
              let highestDmg = 0;
              let playersTeam = 1;
              let playerWon = false;
              for(let i = 0; i < 10; i++){
                if(res.data.info.participants[i].totalDamageDealtToChampions > highestDmg) highestDmg = res.data.info.participants[i].totalDamageDealtToChampions
                if(this.state.puuid == res.data.info.participants[i].puuid){
                  if(i > 4) playersTeam = 2;
                  else playersTeam = 1;

                  playerWon = res.data.info.participants[i].win;
                }
              }
              if(highestDmg == 0) highestDmg = 1;
              
              
              for(let i = 0; i < 10; i++){

                let participants = res.data.info.participants
                
                //to those reading in the future, this may no longer happen, but after searching up a summoner named
                //"big boy pants" i found that i was given summoner ids that dont actually exist
                //i was never able to figure out why
                if(participants[i].summoner1Id > 100){
                  console.log(participants[i].summoner1Id);
                  console.log(participants[i].summoner2Id);
                }
              
                let shitToPutIn = (               
                <div className = "playerInfo" >

                  <Image src={`../images/champion/${participants[i].championName}.png`} alt = "champion" className = "championImage2" roundedCircle/>
                  <div className = "summonerSpellContainer" style = {{width:"5%", marginRight:"0"}}>
                    <Image src ={`../images/spell/${findSumm(participants[i].summoner1Id).image.full}`} className = "summonerSpellImage" />
                    <Image src ={`../images/spell/${findSumm(participants[i].summoner2Id).image.full}`} className = "summonerSpellImage" />
                  </div>
                  
                  <div className = "nameHolder">
                    <h2 className = "biggerH2"><a href={`http://localhost:3001/user/${participants[i].summonerName}`}>{participants[i].summonerName}</a></h2>
                  </div>

                  <div style = {{height:"100%", width:"10%"}} className = "scoreContainer">
                    <h2 className = "biggerH2">{participants[i].kills + "/" + participants[i].deaths + "/" + participants[i].assists}</h2>
                    <div className = "textImageHolder" style = {{height:"50%"}}>
                      <h2>{participants[i].totalMinionsKilled.toString()}</h2>
                      <Image src ={`../images/ui/minions.png`} className = "uiImage"/>
                    </div>
                  </div>

                  <Container style = {{height:"100%", width:"30%", alignItems:"center", display:"flex"}}>
                    <Row style = {{display:"flex", justifyContent:"flex-start"}} noGutter>
                      {/*im storing each of these items in their own column. In the case that the screens width gets
                      too small, so like on a phone, they split into two lines rather than just 1
                      Terribly bad fix*/}

                      <Col md = {6} xs = {12} sm = {12} className = "itemContainer goRight">
                        {[...Array(4)].map((value, index) => {
                          let currentItem = participants[i]["item" + index.toString()]

                          if(currentItem == "0") return (<img src={`../images/item/emptyItemSlot.png`} className = "normalItem"/>);
                          else return(<img src={`../images/item/${participants[i]["item" + index.toString()]}.png`} className = "normalItem"/>);
                        })}
                      </Col>

                      <Col md = {6} xs = {12} sm = {12} className = "itemContainer goLeft" >
                        {[...Array(3)].map((value, index) => {
                          let currentItem = participants[i]["item" + (index+4).toString()]

                          if(currentItem == "0") return (<img src={`../images/item/emptyItemSlot.png`} className = "normalItem"/>);
                          else return(<img src={`../images/item/${participants[i]["item" + (index+4).toString()]}.png`} className = "normalItem"/>);
                        })}
                      </Col>

                    </Row>
                  </Container>

                  <div style = {{height:"100%", width:"20%"}} className = "scoreContainer">

                    <div className = "textImageHolder" style = {{height:"50%"}}>
                      <h2>{this.numberWithCommas(participants[i].goldEarned)}</h2>
                      <Image src ={`../images/ui/gold.png`} className = "uiImage"  />
                    </div>
                    
                    <div className = "dmgBackBar">
                      <div className = "dmgNumber"> 
                        <h2>{this.numberWithCommas(participants[i].totalDamageDealtToChampions)}</h2>
                      </div>
                      <div className="dmgBar" style = {{height:"100%", width: (100 * (participants[i].totalDamageDealtToChampions / highestDmg)).toString() + "%"}} />
                    </div>
                  </div>


                </div>
              );
                
              //each of the teams have their own stylizations
                if(i < 5){
                  team1.push(
                  <div style = {{height:"9vh"}}>
                    {shitToPutIn}
                  </div>
                    )
                }
                else{
                  team2.push(
                  <div style = {{height:"9vh"}}>
                    {shitToPutIn}
                  </div>
                  )
                }
              }

              //top roiw says stuff like "Victory" and "Red Team" and the nuber of objectives gotten on that team
              let topRow1 = (
                <div className = "topRow">
                  <div className = "textImageHolder" style = {{width:"33%"}}>
                    <Image src ={`../images/ui/baron${team1Won ? "Blue" : "Red"}2.png`} className = "uiImage" style = {{maxHeight:"70%", maxWidth:'50%'}} />
                    <h2>{res.data.info.teams[0].objectives.baron.kills.toString()}</h2>
                  </div>

                  <div className = "textImageHolder" style = {{width:"33%"}}>
                    <Image src ={`../images/ui/dragon${team1Won ? "Blue" : "Red"}2.png`} className = "uiImage" style = {{maxHeight:"70%", maxWidth:'50%'}} />
                    <h2>{res.data.info.teams[0].objectives.dragon.kills.toString()}</h2>
                  </div>

                  <div className = "textImageHolder" style = {{width:"33%"}}>
                    <Image src ={`../images/ui/tower${team1Won ? "Blue" : "Red"}2.png`} className = "uiImage" style = {{maxHeight:"70%", maxWidth:'50%'}} />
                    <h2>{res.data.info.teams[0].objectives.tower.kills.toString()}</h2>
                  </div>
                </div>
              )

              let topRow2 = (
                <div className = "topRow">
                  <div className = "textImageHolder" style = {{width:"33%"}}>
                    <Image src ={`../images/ui/baron${team1Won ? "Red" : "Blue"}2.png`} className = "uiImage" style = {{maxHeight:"70%", maxWidth:"50%"}} />
                    <h2>{res.data.info.teams[1].objectives.baron.kills.toString()}</h2>
                  </div>

                  <div className = "textImageHolder" style = {{width:"33%"}}>
                    <Image src ={`../images/ui/dragon${team1Won ? "Red" : "Blue"}2.png`} className = "uiImage" style = {{maxHeight:"70%", maxWidth:'50%'}} />
                    <h2>{res.data.info.teams[1].objectives.dragon.kills.toString()}</h2>
                  </div>

                  <div className = "textImageHolder" style = {{width:"33%"}}>
                    <Image src ={`../images/ui/tower${team1Won ? "Red" : "Blue"}2.png`} className = "uiImage" style = {{maxHeight:"70%", maxWidth:'50%'}} />
                    <h2>{res.data.info.teams[1].objectives.tower.kills.toString()}</h2>
                  </div>
                </div>
              )


              
              let temp = (
                <div>
                  <div className = {playerWon ? "winningTeam" : "losingTeam"}>

                    <div className = "topOfInfo">
                      <div style = {{"width" : "7.5%"}} className = "gameInfoTextBox" >
                        <h1 className = {playerWon ? "blueTextWinner" : "redTextLoser"}>{playerWon ? "Win" : "Loss"}</h1>
                      </div>

                      <div style = {{"width" : "4.5%"}} />

                      <div style = {{"width" : "25%", "justifyContent":"left"}} className = "gameInfoTextBox">
                        <h1>{playersTeam == 1 ? "Blue" : "Red"} Team</h1>
                      </div>

                      {playersTeam == 1 ? topRow1 : topRow2}

                    </div>

                    {playersTeam == 1 ? team1 : team2}
                  </div>

                  <div className = {playerWon ? "losingTeam" : "winningTeam"}>

                    <div className = "topOfInfo">

                      <div style = {{"width" : "7.5%"}} className = "gameInfoTextBox" >
                        <h1 className = {playerWon ? "redTextLoser" : "blueTextWinner"}>{playerWon ? "Loss" : "Win"}</h1>
                      </div>

                      <div style = {{"width" : "4.5%"}} />

                      <div style = {{"width" : "25%", "justifyContent":"left"}} className = "gameInfoTextBox">
                        <h1>{playersTeam == 1 ? "Red" : "Blue"} Team</h1>
                      </div>
                      
                      {playersTeam == 2 ? topRow1 : topRow2}

                    </div>

                    {playersTeam == 2 ? team1 : team2}
                  </div>
                </div>
              );

              //like 80 percent of the stuff below is just to display the date a game was played
              let fakeMatches = this.state.matches;
              fakeMatches[i] = temp;
              this.setState({matches : fakeMatches});

              let fakeUpper = this.state.upperAccordion;
              let playerInfo = null;
              let fuckingDate = new Date(res.data.info.gameCreation + res.data.info.gameDuration);
              let currentDate = new Date();
              let diff = currentDate - fuckingDate;

              let mins = 0;
              let hours = 0;
              let days = 0;
              let months = 0;
              
              mins = Math.ceil(diff / 60000);
              let toDisplay = [" mins", mins];

              if(mins > 60){
                hours = Math.round(diff / 3600000);
                toDisplay = [(hours == 1 ? " hour" : " hours"), hours];
              }
              if(hours > 24){
                days = Math.round(diff / 86400000);
                toDisplay = [(days == 1 ? " day" : " days"), days];
              }
              if(days > 30){
                months = Math.round(diff / 2628000000);
                toDisplay = [(months == 1 ? " month" : " months"), months];
              }

              //Im keeping track of the number of games that the player won
              for(let j = 0; j < 10; j++){
                if(res.data.info.participants[j].summonerId === this.state.encryptedId){
                  playerInfo = res.data.info.participants[j]

                  let fakeWinLose = this.state.winLoseGame;
                  if(j < 5){
                    if(team1Won) fakeWinLose[i] = true;
                    else fakeWinLose[i] = false;

                    this.setState({winLoseGame : fakeWinLose});
                  }
                  else{
                    if(team1Won) fakeWinLose[i] = false;
                    else fakeWinLose[i] = true;

                    this.setState({winLoseGame : fakeWinLose});
                  }
                  if(fakeWinLose[i]) this.setState((prevState) => ({gamesWon: prevState.gamesWon + 1})); 

                  break
                }
              }

              //only way i could figure out making a deep copy of an object
              let gameName = JSON.parse(JSON.stringify(findQueue(res.data.info.queueId)));
              if(gameName.description == null){
                gameName.description = "probably ultbook or something";
              }
              gameName.description = gameName.description.replace("games", "");
              

              //Im given a key, i need to find name based on key. Im using a json object handed by league, problem
              //with that is that when i get the name its wayyyy to verbose. I just shorten it like so
              if(gameName.description.indexOf("Ranked Flex") != -1){
                gameName.description = "Ranked Flex";
              } else if(gameName.description.indexOf("Ranked Solo") != -1){
                gameName.description = "Ranked Solo";
              } else if(gameName.description.indexOf("ARAM") != -1){
                gameName.description = "ARAM";
              } else if(gameName.description.indexOf("Draft") != -1){
                gameName.description = "Draft Pick";
              } else if(gameName.description.indexOf("Blind") != -1){
                gameName.description = "Blind Pick";
              } else{
                //Theres no way leagues gonna add more permanent gamemode right???????????????
                //They hate fun after all
                gameName.description = "RGM";
              }


              //This ontains all of the html for the unopened accordion. As in the info for a game before you open to see all 
              //the participants of the game
              fakeUpper[i] = (
              <div className = {this.state.winLoseGame[i] ? "gameInfoUnopened gameUnopenedWinner" : "gameInfoUnopened gameUnopenedLoser"}>
                
                <Container fluid>
                <Row noGutters = {true}>
                <Col lg = {5} md = {12} xs = {12} sm = {12} style = {{height:"9vh"}}>
                  <div className = "unOpenedLeftSide">
                    <div className = "winLoseInfo" style = {{width:"30%"}}>
                      <h1>{this.state.winLoseGame[i] ? "Victory" : "Defeat"}</h1>
                    </div>

                    <div className = "gameStuffInfo ellipsisCutoff" style = {{width:"45%"}}>
                      <h2>{gameName.description}</h2>
                      <h2>{gameName.map}</h2>
                    </div>

                    <div className = "gameStuffInfo" style = {{width:"25%"}}>
                      <h2>{Math.floor(res.data.info.gameDuration / 1000 / 60).toString() + "m " + (Math.floor(res.data.info.gameDuration / 1000) % 60).toString() + "s"}</h2>
                      <h2>{toDisplay[1].toString() + toDisplay[0] + " ago"}</h2>
                    </div>
                  </div>
                </Col>
                <Col lg = {7} md = {12} xs = {12} sm = {12} style = {{height:"9vh"}}>

                  <div className = "unOpenedPlayerInfo">

                    <div className = "gameStuff">
                      <Image src={`../images/champion/${playerInfo.championName}.png`} alt = "champion" className = "championImage" roundedCircle/>
                      <div className = "summonerSpellContainer" style = {{width:"15%"}}>
                        <Image src ={`../images/spell/${findSumm(playerInfo.summoner1Id).image.full}`} className = "summonerSpellImage" />
                        <Image src ={`../images/spell/${findSumm(playerInfo.summoner2Id).image.full}`} className = "summonerSpellImage" />
                        <div style = {{width:"1vw"}} />
                      </div>

                      <Container fluid={true} style = {{height:"100%"}}>
                      <Row style = {{height:"100%"}} noGutter>

                        <Col md = {6} xs = {12} sm = {12} className = "unOpenedItems goRight">
                          {[...Array(4)].map((value, index) => {
                              let currentItem = playerInfo["item" + index.toString()]

                              if(currentItem == "0") return (<img src={`../images/item/emptyItemSlot.png`} className = "normalItem"/>);
                              else return(<img src={`../images/item/${playerInfo["item" + index.toString()]}.png`} className = "normalItem"/>);
                          })}
                        </Col>

                        <Col md = {6} xs = {12} sm = {12} className = "unOpenedItems goLeft" >
                          {[...Array(3)].map((value, index) => {
                              let currentItem = playerInfo["item" + (index+4).toString()]

                              if(currentItem == "0") return (<img src={`../images/item/emptyItemSlot.png`} className = "normalItem"/>);
                              else return(<img src={`../images/item/${playerInfo["item" + (index+4).toString()]}.png`} className = "normalItem"/>);
                          })}
                        </Col>

                      </Row>
                      </Container>

                  </div>

                    <div className = "unOpenedRightSide">
                      
                      <h2>{playerInfo.kills + "/" + playerInfo.deaths + "/" + playerInfo.assists}</h2>

                      <div className = "textImageHolder" style = {{justifyContent:"flex-start"}}>
                        <h2 style = {{color:"black"}}>{this.numberWithCommas(playerInfo.totalMinionsKilled)}</h2>
                        <Image src ={`../images/ui/minions.png`} className = "uiImage" style = {{maxWidth:"14%"}} />
                      </div>

                      <div className = "textImageHolder" style = {{justifyContent:"flex-start"}}>
                        <h2 style = {{color:"black"}}>{this.numberWithCommas(playerInfo.goldEarned)}</h2>
                        <Image src ={`../images/ui/gold.png`} className = "uiImage" style = {{maxWidth:"14%"}} />
                      </div>

                    </div>
                  </div>
                </Col>

                </Row> 
                </Container> 
              </div>
              );
              
                
              //find favourite role as well as favourite champion for later use
              //favourite as in most played within all games found
              //I can only display one favourite champion as well as role
              //Since this is running in an async function, if you have 2 or more champs that are your fav champ then
              //it effectively randomly chooses one
              let fakeFavRole = this.state.favRole;
              let fakeFavChamp = this.state.favChamp;

              let foundRole = -1;
              let foundChamp = -1;
              for(let i = 0; i < fakeFavChamp.length; i++){
                if(fakeFavChamp[i]["champ"] == playerInfo.championId) foundChamp = i;
              }
              if(foundChamp != -1){
                fakeFavChamp[foundChamp]["count"] += 1;
              }
              else{
                fakeFavChamp.push({"champ" : playerInfo.championId, "count" : 1});
              }

              if(playerInfo.individualPosition == "UTILITY") playerInfo.individualPosition = "SUPPORT";
              for(let i = 0; i < fakeFavRole.length; i++){
                if(fakeFavRole[i]["role"] == playerInfo.individualPosition) foundRole = i;
              }
              if(foundRole != -1){
                fakeFavRole[foundRole]["count"] += 1;
              }
              else{
                if(playerInfo.individualPosition != "Invalid") fakeFavRole.push({"role" : playerInfo.individualPosition, "count" : 1})
              }

              this.setState((prevState) => ({
                upperAccordion : fakeUpper, 
                totalKills: prevState.totalKills + playerInfo.kills,
                totalDeaths : prevState.totalDeaths + playerInfo.deaths,
                totalAssists : prevState.totalAssists + playerInfo.assists,

                favChamp : fakeFavChamp,
                favRole : fakeFavRole
              })); 
            });

          this.setState(prev => {return {matchDataDone: prev.matchDataDone + 1}});
        }
      })
    

    //find champion mastery
    await axios.post(secrets['request-link'], {"url": "https://na1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/" +  this.state.encryptedId})
      .then(res => {
        
        let fakeMasteryData = [];
        let defaultMastery = (
          <div className = "championMasteryInfo" >
            <Image src={`../images/profileicon/29.png`} alt = "champion" className = "masteryChampionImage" roundedCircle thumbnail/>
            
            <h1>None</h1>
            <h2>0</h2>
          </div>
        );
        

        //there is a chance that the player has a league acc but has never played more than 2 champions ever
        //this means i wont get any mastery info on anything other than the champs they played
        for(let i = 0; i < 3; i++) fakeMasteryData.push(defaultMastery)
        let amount = Math.min(3, res.data.length)

        for(let i = 0; i < amount; i++){
          let champInfo = {
            champId : "asd",
            champName : "no clue",
            masteryLevel : 1,
            masterPoints : 0
          };
          
          champInfo.champId = findChamp(res.data[i].championId).id;
          champInfo.champName = findChamp(res.data[i].championId).name;
          champInfo.masteryLevel = res.data[i].championLevel
          champInfo.masteryPoints = res.data[i].championPoints
          
          let item = (
          <div className = "championMasteryInfo" >
            <Image src={`../images/champion/${champInfo.champId}.png`} alt = "champion" className = "masteryChampionImage" roundedCircle thumbnail/>
            <Image src={`../images/mastery/mastery_${champInfo.masteryLevel}.png`} alt = "champion" className = "championMasteryLevelImage" roundedCircle />
            <h1>{champInfo.champName}</h1>
            <h2>{champInfo.masteryPoints}</h2>
          </div>
          );

          if(i == 0) fakeMasteryData[0] = item
          if(i == 1) fakeMasteryData[1] = item
          if(i == 2) fakeMasteryData[2] = item

          //fakeMasteryData.push(item)
        }
        this.setState({
          masteryData : fakeMasteryData,
          finishedRendering : true
        });
      })
  }

  

  render(){

    let gameRenders = []


    //look i need to use how many matches i found its what i said earlier like 500 lines ago
    //this creates the actual games into accordions
    for(let i = 0; i < this.state.matchesFound; i++){

      gameRenders.push(
        <div className = "gameAccordionDiv">
          <Accordion>
            <div>
              {this.state.upperAccordion[i]}
              <CustomToggle eventKey="0" winLose = {this.state.winLoseGame[i] ? "gameOpenerWon" : "gameOpenerLost"}>
                <h2 className = "accordionOpenerText">Open</h2>
              </CustomToggle>
            </div>
            <Accordion.Collapse eventKey="0">
              <div>
                {this.state.matches[i]}
              </div>
            </Accordion.Collapse>
          </Accordion>
        </div>

      );
    }

    if(this.state.matchesFound == 0){
      //just in case
      gameRenders.push(
        <div style = {{marginTop:"5vh"}}>
          <h2>There were no games found</h2>
        </div>
      )
    }


    //use the favChamp and favRole data to find the actual favourite champ and favourite role
    let favouriteChampion = {"champ" : "None", "count" : 0};
    let favouriteRole = {"role": "None", "count": 0};

    for(let i = 0; i < this.state.favChamp.length; i++){
      if(favouriteChampion.count < this.state.favChamp[i].count){
        favouriteChampion = {"champ" : this.state.favChamp[i].champ, "count":this.state.favChamp[i].count}
      }
    }
    for(let i = 0; i < this.state.favRole.length; i++){
      if(favouriteRole.count < this.state.favRole[i].count){
        favouriteRole = {"role" : this.state.favRole[i].role, "count":this.state.favRole[i].count}
      }
    }

    //Make the name readable in case its "monkeyKing" or "missFortune" or other stuff that i cant think of
    if(favouriteChampion["champ"] != "None") favouriteChampion["champ"] = findChamp(favouriteChampion["champ"]).name;


    //tkaees time to request from riot, so this is a loading screen
    //ive come to like the janky rendering of the entire page, it lets me know that stuff is actually happening, rather than
    //a circly thing that gives me ptsd
    //if you want too see my way, just add a false to the statemnent
    if(!(this.state.finishedRendering && this.state.matchDataDone >= this.state.matchesFound)/* && false */){
      return(
      <div>
        <TopBar />
        <img src = {`../images/ui/loading.png`} className = "loadingImage" style = {{transform: "rotate(39deg)", animation: `spin ${0.6}s linear infinite`}}/>

      </div>);
    }
    else if (true){
      return (
        <div>
          <TopBar />
        <div className = "everythingContainer">
          <div className="summonerInfoContainer">

          <Container>
          <Row>

            <Col lg = {6} md = {12} xs = {12} sm = {12}>
              <div className = "leftSide">

                <div className = "playerInfoStuff">
                  
                  <img src={`../images/profileicon/${this.state.summonerProfile}.png`} className = "summonerInfoImage"/>
                  
                  <div style = {{marginLeft:"1vw", width : "max(20vw, 40vh)"}} className = "summonerInfoText">
                    <h1 className = "specialText">{this.state.summonerName}</h1>
                    <h1 className = "thinText">Level {this.state.summonerLevel}</h1>
                  </div>
                </div>

                <div className = "championMastery flex">
                  {this.state.masteryData}
                </div>

              </div>
              
            </Col>
            <Col lg = {6} md = {12} xs = {12} sm = {12}>

              <div style = {{"height":"70vh"}}>
                <div className = "rankedInfoContainer">

                  <div className = "rankedInfo">
                    <h2 className = "rankedTitle">Ranked Solo</h2>
                    <h1>{this.state.rankedSoloInfo.tier[0].toUpperCase()}{this.state.rankedSoloInfo.tier.slice(1,10000000).toLowerCase()} {this.state.rankedSoloInfo.rank == "unranked" ? "" : this.state.rankedSoloInfo.rank}</h1>
                    <h1 className = "thinText">{this.state.rankedSoloInfo.lp} LP</h1>
                    <Image src={`../images/ranked-emblems/${this.state.rankedSoloInfo.tier.toUpperCase()}.png`} alt="rankedEmblem" className = "rankedEmblems" />
                  </div>

                  <div className = "rankedInfo">
                    <h2 className = "rankedTitle">Ranked Flex</h2>
                    <h1>{this.state.rankedFlexInfo.tier[0].toUpperCase()}{this.state.rankedFlexInfo.tier.slice(1,10000000).toLowerCase()} {this.state.rankedFlexInfo.rank == "unranked" ? "" : this.state.rankedFlexInfo.rank}</h1>
                    <h1 className = "thinText">{this.state.rankedFlexInfo.lp} LP</h1>
                    <img src={`../images/ranked-emblems/${this.state.rankedFlexInfo.tier.toUpperCase()}.png`} alt="rankedEmblem" className = "rankedEmblems" />
                  </div> 

                </div>

                
                <div className = "AllGameInfo">
                  <div style = {{width:"54%"}} className="allGameText">
                    <h2>{this.state.gamesWon.toString() + (this.state.gamesWon == 1 ? " Win" : " Wins")}</h2>
                    <h2>{(this.state.totalKills / 10).toString() + "/" + (this.state.totalDeaths / 10).toString() + "/" + (this.state.totalAssists / 10).toString() + " Average"}</h2>
                    <h2>{favouriteChampion.champ + " - " + favouriteChampion.count.toString() + (favouriteChampion.count == 1 ? " Game" : " Games")}</h2>
                    <h2>{favouriteRole.role.slice(0,1) + favouriteRole.role.slice(1, favouriteRole.role.length).toLowerCase() + " - " + favouriteRole.count.toString() + " Games"}</h2>
                  </div>
                  <div style = {{width : "30%"}}>
                    <h1 className = "inTenGames">In {this.state.matchesFound.toString()} Games</h1>
                  </div>
                </div>
              </div>

            </Col>

          </Row>
          </Container>
          </div>

          

        
          {/*HEY LOOK AT THIS BELOW ITS ACTUALLY IMPORTANT (kind of not really)*/}  
          {gameRenders}

        </div>
        </div>
      );
    }
  }
}

