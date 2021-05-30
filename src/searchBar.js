import React from 'react';
import "./searchBar.css";
import axios from 'axios';

export class SearchBar extends React.Component {

    constructor(props){
      super(props);

      this.state = {username:""}
      this.submit = this.submit.bind(this);
      this.onChangeUser = this.onChangeUser.bind(this);
    }

    async submit(e){
        e.preventDefault();

        await axios.post("http://localhost:3000/joker/baby", {"url": "https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" + this.state.username})
        .then(res => {
            window.location.assign("/user/" + this.state.username);
        })
        .catch(err => {
          console.log("suck my fat cock");
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
                <form onSubmit={this.submit}>
                    <label>
                        <input type="text" onChange={this.onChangeUser} placeholder="Username" className = "searchBar" />
                    </label>

                    <input type="submit" />
                </form>
            </div>
        )
    }
}