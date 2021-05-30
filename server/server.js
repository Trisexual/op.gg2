const express = require('express');
const axios = require('axios');
require('dotenv').config()
const app = express();
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use((req, res, next) => {
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
      res.status(500).send("suck cock");
    })
      
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`listening on ${PORT}`));