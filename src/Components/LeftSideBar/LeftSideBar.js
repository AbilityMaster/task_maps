import React, {Component} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faColumns, faIndustry, faPlus} from "@fortawesome/free-solid-svg-icons";
import "./leftsidebar.scss";
import InputExt from "../InputExt";

const LeftSideBar = () => {
  return (
      <div className={"left-bar"}>
          <div className={"left-bar__link"}>
              <div className={"left-bar__icon"}>
                  <FontAwesomeIcon icon={faColumns} />
              </div>
              Доски
          </div>
          <div className={"left-bar__link"}>
              <div className={"left-bar__icon"}>
                  <FontAwesomeIcon icon={faIndustry} />
              </div>
              Главная страница
          </div>
          <div className={"left-bar__label"}>
              Команды
              <div className={"left-bar__icon left-bar__icon_add"}>
                  <FontAwesomeIcon icon={faPlus} />
              </div>
          </div>
          <InputExt />
      </div>
  )
};

export default LeftSideBar;