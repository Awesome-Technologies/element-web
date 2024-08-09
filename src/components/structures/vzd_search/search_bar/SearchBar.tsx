/*
Copyright 2023-2024 Awesome Technologies Innovationslabor GmbH

All rights reserved
*/

import React, { useEffect, useRef } from "react";

import Icon from "../../../Icon";
import "./SearchBar.css";

interface IProps {
    onChange: React.ChangeEventHandler<HTMLInputElement> | undefined;
    value: string;
    type: string;
    placeholder: string;
}

const SearchBar: React.FC<IProps> = ({ onChange, value, type, placeholder }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const focusSearchBar = (): void => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    useEffect(() => {
        // Focuses user input on name searchbar so they can start typing on search window open
        if (type === "name") focusSearchBar();
    }, [type]);

    return (
        <div className="aw_searchbar">
            <Icon icon="searchbarMagnifyingGlass" />
            <input
                ref={inputRef}
                className="mx_no_textinput"
                type="text"
                placeholder={placeholder}
                onChange={onChange}
                value={value}
            />
            <div className="aw_searchbar__divider" />
        </div>
    );
};

export default SearchBar;
