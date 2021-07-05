import React from 'react';
import ReactDOM from 'react-dom';
import "./notFound.css";
import TopBar from "./topBar.js";


export class NoPage extends React.Component{

    constructor(props){
        super(props);
    }
  
  
    render(){
        return(
            <div>
                <TopBar />
                <div className = "cantFindText">
                    <div className = "actualText">
                        <h1>That page does not exist. Check the spelling and try again</h1>
                        <h2>If you are certain you are correct, there is probably a server error. Contact me, or try again later</h2>
                    </div>
                </div>
            </div>
        )
    }

}