import React, { Component } from 'react';
import Input from "../Input";
import "./header.scss";

export default class Header extends Component {

    render() {
         return (
              <div className={"header"}>
                  <div className={"header__home"}>
                      <div className={"header__home-icon"} />
                  </div>
                  {this.props.children}
                  <div className={"header__name"}>Контроль задач</div>
              </div>
         );
    }
}