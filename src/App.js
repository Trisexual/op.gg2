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
    await axios.post("http://localhost:3000/joker/baby", {"url": "https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" + personToSearch})
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
      console.log("suck my fat cock");
      window.location.assign("/notFound");
    })

    await axios.post("http://localhost:3000/joker/baby", {"url": "https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/" +  this.state.encryptedId})
      .then(res => {

        let rankedSolo = {rank : "unranked", lp : 0, tier : "unranked"};
        let rankedFlex = {rank : "unranked", lp : 0, tier : "unranked"};

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
    


    //currently gets 10 games, can change later
    //get games, then run through a game and set some states based on the info in the game
    await axios.post("http://localhost:3000/joker/baby", {"url": "https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/" + this.state.puuid + "/ids?start=0&count=10"})
      .then(summ => {
        this.setState({matchesFound:summ.data.length});
        console.log(summ);
        for(let i = 0; i < (this.state.matchesFound); i++){
          axios.post("http://localhost:3000/joker/baby", {"url": "https://americas.api.riotgames.com/lol/match/v5/matches/" + summ.data[i]})
            .then(res => {

              console.log(res.data);
              let team1 = [];
              let team2 = [];

              let team1Won = false;
              if(res.data.info.teams[0].win) team1Won = true;
              
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
              
                let shitToPutIn = (               
                <div className = "playerInfo" >
                  <Image src={`../images/champion/${participants[i].championName}.png`} alt = "champion" className = "championImage2" roundedCircle/>
                  <div className = "summonerSpellContainer" style = {{width:"5%", marginRight:"0"}}>
                    <Image src ={`../images/spell/${findSumm(participants[i].summoner1Id).image.full}`} className = "summonerSpellImage" />
                    <Image src ={`../images/spell/${findSumm(participants[i].summoner2Id).image.full}`} className = "summonerSpellImage" />
                  </div>
                  
                  <div className = "nameHolder">
                    <h2 className = "biggerH2">{participants[i].summonerName}</h2>
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

              if(days == 2){console.log(diff)}

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
              gameName.description = gameName.description.replace("games", "");
              
              let othersTrue = false
              if(gameName.description.indexOf("Ranked Flex") != -1){
                gameName.description = "Ranked Flex";
                othersTrue = true;
              } else if(gameName.description.indexOf("Ranked Solo") != -1){
                gameName.description = "Ranked Solo";
                othersTrue = true;
              } else if(gameName.description.indexOf("ARAM") != -1){
                gameName.description = "ARAM";
                othersTrue = true;
              } else if(gameName.description.indexOf("Draft") != -1){
                gameName.description = "Draft Pick";
                othersTrue = true;
              } else if(gameName.description.indexOf("Blind") != -1){
                gameName.description = "Blind Pick";
                othersTrue = true;
              } else{
                gameName.description = "RGM";
              }

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

    await axios.post("http://localhost:3000/joker/baby", {"url": "https://na1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/" +  this.state.encryptedId})
      .then(res => {
        
        let fakeMasteryData = [];
        let defaultMastery = (
          <div className = "championMasteryInfo" >
            <Image src={`../images/profileicon/29.png`} alt = "champion" className = "masteryChampionImage" roundedCircle thumbnail/>
            
            <h1>None</h1>
            <h2>0</h2>
          </div>
        );

        for(let i = 0; i < 3; i++) fakeMasteryData.push(defaultMastery)

        let amount = Math.min(3, res.data.length)

        for(let i = 0; i < amount; i++){
          let champInfo = {
            champId : "asd",
            champName : "no clue",
            masteryLevel : 1,
            masterPoints : 0
          };

          console.log(res.data)
          
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
      gameRenders.push(
        <div style = {{marginTop:"5vh"}}>
          <h2>There were no games played this season</h2>
        </div>
      )
    }

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

    if(favouriteChampion["champ"] != "None") favouriteChampion["champ"] = findChamp(favouriteChampion["champ"]).name;

    if(!(this.state.finishedRendering && this.state.matchDataDone >= 10) && false){
      return(<div></div>);
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

          

          
          
          {gameRenders}

        </div>
        </div>
      );
    }
  }
}

