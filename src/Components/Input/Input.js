import React, {Component, useRef, useImperativeHandle, forwardRef, useState} from "react";
import "./index.scss";

const Input = ({ handleChange, value }, ref) => {
    const $input = useRef(null);
    const [isFocused, setIsFocused] = useState(false);

    useImperativeHandle(ref, () => ({
        focus: () => {
            setIsFocused(true);
            $input.current.focus();
        }
    }));

    return (
        <div className={"search"}>
            <input
                onClick={() => { setIsFocused(true); }}
                onBlur={() => { setIsFocused(false); }}
                onChange={handleChange}
                ref={$input}
                defaultValue={value}
                className="search__input"
                placeholder=""
            />
            { isFocused ?
                <div className={"search__close"}>✕</div> :
                <span  onClick={() => { $input.current.focus(); setIsFocused(true); }} className={"search__icon"} />
            }
        </div>
    );
};

export default forwardRef(Input);