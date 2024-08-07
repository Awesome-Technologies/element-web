/*
Copyright 2023 Awesome Technologies Innovationslabor GmbH

All rights reserved
*/

import React, { useEffect, useRef } from "react";
import { _t } from "matrix-react-sdk/src/languageHandler";

import Icon from "../../../Icon";
import Dropdown from "./dropdown/Dropdown";
import { typeOptions } from "../searchDropdownOptions";
import "./SearchBar.css";

interface IProps {
    onChange: React.ChangeEventHandler<HTMLInputElement> | undefined;
    value: string;
    type: string;
}

const SearchBar: React.FC<IProps> = ({ onChange, value, type }) => {
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
                placeholder={type === "name" ? _t("Search name..") : _t("Search location..")}
                onChange={onChange}
                value={value}
            />
            <div className="aw_searchbar__divider" />
            {type === "name" && <Dropdown text="Typ" options={typeOptions} />}
        </div>
    );
};

export default SearchBar;
