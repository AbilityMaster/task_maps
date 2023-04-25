import React, {Component, useState, useEffect, useRef} from "react";
import "./inputext.scss";

const InputExt = ({ trigger, value, className, isSelected, onChange }) => {
    const [isHidden, setIsHidden] = useState(true);
    const input = useRef(null);

    const name = "Редактировать";
   // const testTrigger = <div>{name}</div>;

    useEffect(() => {
        if (!isHidden && input && input.current) {
            input.current.focus();

            if (isSelected) {
                input.current.select();
            }
        }
    });

    const handleClick = () => {
        setIsHidden(false);
    };

    const getClassNames = () => {
      if (!isHidden) {
          return `input-container input-container_focused  ${className}`;
      }

      return `input-container  ${className}`;
    };

    return (
        <div onClick={handleClick} className={getClassNames()}>
            { isHidden ? trigger : null }
            { isHidden ? null :
                <input
                    className={`input-container__input`}
                    ref={input}
                    defaultValue={value}
                    onBlur={ (event) => { setIsHidden(true); onChange(event, { value: input.current.value } ); }}
                />
            }
        </div>
    )
};

export default InputExt;