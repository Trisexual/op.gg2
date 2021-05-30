import React from 'react';
import './App.css';
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';

import Accordion from 'react-bootstrap/Accordion';
import Image from "react-bootstrap/Image"

import { useAccordionToggle } from 'react-bootstrap/AccordionToggle';

import findSumm from "./dragon/findSummSpell"



//big note on how i made my shit
//a lot of my css styling on divs and shit use the style = {{gay}} element
//this make it incredibly hard to read, but i did this since i would need like 80 different classes in order to fit all of the shit i want
//you could porbably just try your best to ignore the style element shit and you would understand the code perfectly




function CustomToggle({ children, eventKey }) {
  const decoratedOnClick = useAccordionToggle(eventKey
  );

  return (
    <button
      type="button"
      style={{ backgroundColor: 'pink', width : '100%', marginBottom:"0px"}}
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
        puuid : "",
        encryptedId : "",
        summonerName:"",
        summonerLevel:"",
        summonerProfile : 0,

        rankedSoloInfo:{rank:"unranked", lp:0, tier : "unranked"},
        rankedFlexInfo:{rank:"unranked", lp:0, tier : "unranked"}
    }
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
      .then(res => {
        for(let i = 0; i < 5; i++){
          axios.post("http://localhost:3000/joker/baby", {"url": "https://americas.api.riotgames.com/lol/match/v5/matches/" + res.data[i]})
            .then(res => {

              console.log(res.data);
              let team1 = [];
              let team2 = [];

              for(let i = 0; i < 10; i++){

                let currentChamp = res.data.info.participants[i].championName
                let currentSumm = res.data.info.participants[i].summonerName
                let participants = res.data.info.participants


                let shitToPutIn = [
                <div style = {{"width" : "2%"}} />,


                <div style = {{"width" : "10%", "display": "flex", alignItems:"center"}}>
                  {/*champion pngs*/}
                  <Image src={`../images/champion/${currentChamp}.png`} alt = "champion" className = "championImage" roundedCircle/>

                  <div className = "summonerSpellContainer">
                    {/*summoner spell pngs*/}
                    <Image src ={`../images/spell/${findSumm(participants[i].summoner1Id).image.full}`} className = "summonerSpellImage" />
                    <Image src ={`../images/spell/${findSumm(participants[i].summoner2Id).image.full}`} className = "summonerSpellImage" />
                  </div>

                </div>,

                <div style = {{"width" : "25%", "justifyContent" : "left"}} className = "gameInfoTextBox">
                  <h1>{currentSumm}</h1>
                </div>,

                <div style = {{"width" : "14%"}} className = "gameInfoTextBox">
                  <h1>{participants[i].kills + "/" + participants[i].deaths + "/" + participants[i].assists}</h1>
                </div>,

                <div style = {{"width" : "14%"}} className = "gameInfoTextBox">
                  <h1>{participants[i].totalDamageDealtToChampions}</h1>
                </div>,

                <div style = {{"width" : "14%"}} className = "gameInfoTextBox">
                  <h1>{participants[i].totalMinionsKilled}</h1>
                </div>,

                <div style = {{"width" : "20%"}} className = "gameInfoTextBox">
                  {

                  //this shit is imossible to read
                  //basically loops through the current players items using map function
                  //if the item is 0, then uses a div to imitate a unused item slot

                  [...Array(7)].map((value, index) => {
                    let currentItem = participants[i]["item" + index.toString()]

                    if(currentItem == "0") return (<img src={`../images/item/emptyItemSlot.png`} className = "normalItem"/>);
                    else return(<img src={`../images/item/${participants[i]["item" + index.toString()]}.png`} className = "normalItem"/>);
                  })}

                </div>]

                if(i < 5){
                  team1.push(
                    <div className = "flexBoxLmao">
                      {shitToPutIn}
                    </div>)
                }
                else{
                  team2.push(
                    <div className = "flexBoxLmao">
                      {shitToPutIn}
                    </div>)
                }
              }

              
              let team1Won = false;
              if(res.data.info.teams[0].win) team1Won = true;
              
              let topMostRow = [
                <div style ={{"width" : "14%"}} className = "gameInfoTextBox">
                  <h2>K/D/A</h2>
                </div>,

                <div style ={{"width" : "14%"}} className = "gameInfoTextBox">
                  <h2>Damage</h2>
                </div>,

                <div style ={{"width" : "14%"}} className = "gameInfoTextBox">
                  <h2>CS</h2>
                </div>,

                <div style ={{"width" : "20%"}} className = "gameInfoTextBox">
                  <h2>Items</h2>
                </div>]



              let temp = [
                <div>
                  <div className = {team1Won ? "winningTeam" : "losingTeam"}>

                    <div className = "topOfInfo">
                      <div style = {{"width" : "7.5%"}} className = "gameInfoTextBox" >
                        <h1 className = {team1Won ? "blueTextWinner" : "redTextLoser"}>{team1Won ? "Win" : "Loss"}</h1>
                      </div>

                      <div style = {{"width" : "4.5%"}} />

                      <div style = {{"width" : "25%", "justifyContent":"left"}} className = "gameInfoTextBox">
                        <h1>Blue Team</h1>
                      </div>

                      {topMostRow}

                    </div>

                    {team1}
                  </div>



                  
                  <div className = {team1Won ? "losingTeam" : "winningTeam"}>

                    <div className = "topOfInfo">

                      <div style = {{"width" : "7.5%"}} className = "gameInfoTextBox" >
                        <h1 className = {team1Won ? "redTextLoser" : "blueTextWinner"}>{team1Won ? "Loss" : "Win"}</h1>
                      </div>

                      <div style = {{"width" : "4.5%"}} />

                      <div style = {{"width" : "25%", "justifyContent":"left"}} className = "gameInfoTextBox">
                        <h1>Red Team</h1>
                      </div>
                      

                      {topMostRow}


                    </div>

                    {team2}
                  </div>
                </div>
              ];



              let fakeMatches = this.state.matches;
              fakeMatches[i] = temp;
              this.setState({matches : fakeMatches});
            })
        }
      })
  }

  

  render(){

    let gameRenders = []

    console.log(this.state.rankedSoloInfo);
    for(let i = 0; i < 5; i++){

      gameRenders.push(
        <div className = "container">
          <Accordion>
            <div>
              <CustomToggle eventKey="0">
                <h1>Game {(i + 1).toString()}</h1>
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


    return (
      <div className = "container">
        
        <div className="summonerInfoContainer">
          <img src={`../images/profileicon/${this.state.summonerProfile}.png`} className = "summonerInfoImage"/>

          <div style = {{marginLeft:"1vw", width : "25vw"}} className = "summonerInfoText">
            <h1>{this.state.summonerName}</h1>
            <h1>Level {this.state.summonerLevel}</h1>
          </div>

          <div style = {{marginLeft:"3vw", width : "25vw"}} className = "rankedInfo">
            <h1>{this.state.rankedSoloInfo.tier[0].toUpperCase()}{this.state.rankedSoloInfo.tier.slice(1,10000000).toLowerCase()} {this.state.rankedSoloInfo.rank == "unranked" ? "" : this.state.rankedSoloInfo.rank}</h1>
            <h1>{this.state.rankedSoloInfo.lp} LP</h1>
            <Image src={`../images/ranked-emblems/${this.state.rankedSoloInfo.tier}.png`} alt="rankedEmblem" className = "rankedEmblems" />
          </div>

          <div style = {{marginLeft:"3vw", width : "25vw"}} className = "rankedInfo">
            <h1>{this.state.rankedFlexInfo.tier[0].toUpperCase()}{this.state.rankedFlexInfo.tier.slice(1,10000000).toLowerCase()} {this.state.rankedFlexInfo.rank == "unranked" ? "" : this.state.rankedFlexInfo.rank}</h1>
            <h1>{this.state.rankedFlexInfo.lp} LP</h1>
            <Image src={`../images/ranked-emblems/${this.state.rankedFlexInfo.tier}.png`} alt="rankedEmblem" className = "rankedEmblems" />
          </div>

        </div>
        
        {gameRenders}

      </div>
    );
  }
}

