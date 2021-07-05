import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {App} from './App';
import {SearchBar} from "./searchBar.js";
import {NotFound} from "./notFound.js";
import {NoPage} from "./404.js"
import 'bootstrap/dist/css/bootstrap.min.css';

import {BrowserRouter as Router, Route, Switch} from "react-router-dom";


//hopefully this is the first file that peoiple open up
//if you couldnt tell already, this app needs firebase to run.
//running this localhost can be done using firbase, but if youre gay you can use the server files and change all of
//the axios requests to localhost:3000
ReactDOM.render(
  <React.StrictMode>
    <Router>
      <div>
        <Switch>
          <Route exact path="/user/:username" component={App} />
          <Route exact path="/" component={SearchBar} />
          <Route exact path="/notFound" component={NotFound} />
          <Route exact path="*" component={NoPage} />
        </Switch>
      </div>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
