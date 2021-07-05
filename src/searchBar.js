import React from 'react';
import "./searchBar.css";
import axios from 'axios';
import secrets from "./secretStuff.json";

export class SearchBar extends React.Component {

    constructor(props){
      super(props);

      this.state = {username:""}
      this.submit = this.submit.bind(this);
      this.onChangeUser = this.onChangeUser.bind(this);
    }

    async submit(e){
        e.preventDefault();

        await axios.post(secrets["request-link"], {"url": "https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" + this.state.username})
        .then(res => {
            window.location.assign("/user/" + this.state.username);
        })
        .catch(err => {
          window.location.assign("/notFound");
        })
    }

    onChangeUser(e){
        this.setState({
            username: e.target.value
        });
    }

    render(){
        return(
            <div class = "searchBarEverything">

                <div className = "titleCardDiv">
                    <h1>OP.GG2</h1>
                </div>

                <div className = "searchBarContainer">
                    <form onSubmit={this.submit}>
                        <label>
                            <input type="text" onChange={this.onChangeUser} placeholder="Username" className = "searchBar" />
                        </label>
                    </form>
                    <button onClick = {this.submit} className = "submitButton"><h1>Search</h1></button>
                </div>
                
                <div className = "bottomInfoDiv"> 
                    <h2>Choose a summoner to search up, and get full data on them</h2>
                    
                    <div className = "bottomInfoBottomInfo">
                        <div><h2>Inspect a Players Ranked Info</h2></div>
                        <div><h2>Track Someone's Match History</h2></div>
                        <div><h2>Find a Persons Champion Mastery</h2></div>
                    </div>
                </div>

            </div>
        )
    }
}