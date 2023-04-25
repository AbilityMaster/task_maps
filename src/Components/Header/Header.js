import React, { Component } from 'react';
import "./header.scss";
import {Link} from "react-router-dom";

export default class Header extends Component {

    render() {
         return (
              <div className={"header"}>
                  <Link to="/">
                      <div className={"header__home"}>
                          <div className={"header__home-icon"} />
                      </div>
                  </Link>
                  {this.props.children}
                  <div className={"header__name"}>Контроль задач</div>
              </div>
         );
    }
}