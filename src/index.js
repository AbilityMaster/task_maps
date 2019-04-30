import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import App from './Components/App';



ReactDOM.render((
    <Router>
        <App />
    </Router>
), document.querySelector('#root'));
