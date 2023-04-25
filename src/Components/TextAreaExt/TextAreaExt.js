import React, {Component, useState, useRef, useEffect} from "react";
import "./textareaext.scss";

const TextAreaExt = ({ value, isEdit }) => {
    const [isHidden, setIsHidden] = useState(true);
    const textArea = useRef(null);

    useEffect(() => {
       if (isEdit) {
            setIsHidden(false);
       }

       if (!isHidden && textArea && textArea.current) {
           textArea.current.focus();
       }
    });

    const getClassNames = () => {
        const classNames = ["textarea-extended__front"];

        if (!value) {
            classNames.push("textarea-extended__front_empty");
        }

        return classNames.join(" ");
    };

    return (
        <div className={"textarea-extended"}>
            { isHidden ?
              <div onClick={() => {setIsHidden(false); }} className={getClassNames()}>{value || "Добавить более подробное описание..."}</div> :
              <React.Fragment>
                  <textarea
                      onBlur={() => { setIsHidden(true); }}
                      className={"textarea-extended__back"}
                      placeholder={value ? null : "Добавить более подробное описание..."}
                      defaultValue={value}
                      ref={textArea}
                  />
                  <div className={"textarea-extended__row"}>
                      <input className="textarea-extended__save" type="submit" value="Сохранить" />
                      <div className={"textarea-extended__close"}>✕</div>
                  </div>
              </React.Fragment>
            }
        </div>
    );
};

export default TextAreaExt;