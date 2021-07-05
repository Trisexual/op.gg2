//currently how this works is just two websites where one of them is this server file right here
//and one of them is the front end stuff
//that how i did it on heroku. jank ass fix but it works i think



const express = require('express');
const axios = require('axios');
require('dotenv').config()
const app = express();
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

var Schema = mongoose.Schema;
var matchHistorySchema = new Schema({
  "matchId": {type: String, required: true},
  "matchData":{type:Object, required:"true"}
});

const Match = mongoose.model("match", matchHistorySchema);


app.use((req, res, next) => {
  //how safe is this i dont actually know
  //this used to be a proxy server so i can get around cors but i dont know shit
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PUT");
  res.header("Access-Control-Allow-Headers", "url, Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Origin, x-riot-token");
  next();
});

app.get('/jokes/random', (req, res) => {

  axios.get('https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/trismexual',
  {
    headers:{
      "X-Riot-Token": process.env.RIOT_KEY,
    }
  })
    .then((response) => {
      res.json(response.data);
    })
    .catch((err) =>{
      console.log("error");
    })
      
});

app.post('/joker/baby', (req, res) => {

  if(req.body["url"].indexOf("https://americas.api.riotgames.com/lol/match/v5/matches/") != -1 && req.body["url"].indexOf("puuid/") == -1){

    let matchIdd = req.body["url"].replace("https://americas.api.riotgames.com/lol/match/v5/matches/", "");

    Match.findOne({matchId : matchIdd}, function(errr, data){
      
      if(errr) return console.error(errr);

      if(data === null){

        axios.get(req.body["url"],
        {
          headers:{
            "X-Riot-Token": process.env.RIOT_KEY,
          }
        })
        .then((response) => {

          currentMatch = new Match({matchId : matchIdd, matchData : response.data});
          currentMatch.save();
          
          res.json(response.data);
          return
        })
        .catch((err) =>{

          console.log(err);
          res.status(err.response.status).send("suck cock");
          return
        })

      }
      else{
        res.json(data.matchData);
      }
    });
 
  }
  else{
    axios.get(req.body["url"],
    {
      headers:{
        "X-Riot-Token": process.env.RIOT_KEY,
      }
    })
      .then((response) => {
        res.json(response.data);
      })
      .catch((err) =>{
        console.log("error");
        res.status(err.response.status).send("suck cock");
      })
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`listening on ${PORT}`));