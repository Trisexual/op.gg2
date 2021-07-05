import React from 'react';
import "./topBar.css";
import axios from 'axios';

export default class TopBar extends React.Component {

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
            window.location.assign("/notFound");
        })
    }

    onChangeUser(e){
        this.setState({
            username: e.target.value
        });
    }

    goToHome(e){
        window.location.assign("/")
    }

    render(){
        return(
            <div className = "topBar">
                
                <div className = "logo">
                    <button onClick = {this.goToHome} className = "goHome">
                        <h1>OP.GG2</h1>
                    </button>
                </div>
                    
                

                <div className = "searchContainer">
                    <form onSubmit={this.submit}>
                        <label>
                            <input type="text" onChange={this.onChangeUser} placeholder="Username" className = "searchBart" />
                        </label>
                    </form>
                    <button onClick = {this.submit} className = "submitButtont"><h1>Search</h1></button>
                </div>

            </div>
        )
    }
}