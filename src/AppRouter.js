import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import HomePage from './Components/HomePage';

function App() {
  return (
    <React.Fragment>
      <Router>
        <div>

          <Route exact path="/" component={HomePage} />
        </div>
      </Router>
    </React.Fragment>

  );
}

export default App;