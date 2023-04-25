import React, {Component, useState} from "react";
import "./modal.scss";
import InputExt from "../InputExt";
import TextAreaExt from "../TextAreaExt";

const Modal = ({ isOpen, onChange, children, onClose, name, listName, block, card }) => {
  const [isEdit, setIsEdit] = useState(false);

  return (
      <React.Fragment>
          {isOpen ?
          <React.Fragment>
              <div className={"overlay overlay_visible"}>
                  <div className={"modal"}>
                      <div onClick={onClose} className={"modal__close"}>✕</div>
                      <div className={"modal__container"}>
                          <div className={"modal__header"}>
                              <InputExt
                                  onChange={onChange}
                                  isSelected={false}
                                  trigger={<div className={"modal__name"}>{name}</div>}
                                  value={name}
                              />
                              <div className={"modal__from"}>в колонке <span className={"modal__form-column"}>{listName}</span></div>
                          </div>
                          <div className={"modal__description"}>
                              <div className={"modal__row"}>
                                  <div className={"modal__headline modal__headline_level2"}>Описание</div>
                                  <div onClick={ () => {setIsEdit(true); }} className={"modal__edit"}>Изменить</div>
                              </div>
                              <TextAreaExt isEdit={isEdit} value={""}/>
                          </div>
                      </div>
                  </div>
              </div>
          </React.Fragment> : null}
          {children}
      </React.Fragment>
  )
};

export default Modal;