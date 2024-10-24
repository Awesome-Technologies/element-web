/*
Copyright 2023 Awesome Technologies Innovationslabor GmbH

All rights reserved
*/

import React, { ChangeEvent, ReactNode, useState, useRef, useEffect } from "react";
import { _t } from "matrix-react-sdk/src/languageHandler";

import "./Dropdown.css";
import DropdownItem from "./DropdownItem";
import Icon from "../../../../Icon";
import { levenshteinDistance } from "../../../../../tools";

const CHOSEN_STRING = _t("tim|vzd|selected");
const RESET_BUTTON_STRING = _t("tim|vzd|reset");
const RESET_SEARCH_BUTTON_STRING = _t("tim|vzd|delete_search");
const SEARCH_PLACEHOLDER_STRING = _t("tim|vzd|search");

interface ICategoryProps {
    title: string;
    children: ReactNode;
    highlight?: boolean;
}

interface IDropdownProps {
    onSelectType: any;
    text: string;
    options: DropdownCategory[];
}

type DropdownCategory = {
    groupIdentifier: string;
    text: string;
    options: DropdownItem[];
};

type DropdownItem = {
    identifier: string | number;
    text: string;
};

const Category: React.FC<ICategoryProps> = ({ title, children, highlight = false }) => {
    return (
        <div className={`aw_dropdown__category ${highlight ? "aw_dropdown__category--highlight" : ""}`}>
            <span className="aw_dropdown__category__title">{title}</span>
            <div className="aw_dropdown__category__list">{children}</div>
        </div>
    );
};

const Dropdown: React.FC<IDropdownProps> = ({ onSelectType, text, options }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
    const [selectedList, setSelectedList] = useState<DropdownItem[]>([]);
    const [searchResults, setSearchResults] = useState<DropdownCategory[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const inputRef = useRef<HTMLInputElement>(null);

    // Updates
    const handleInput = (event: ChangeEvent<HTMLInputElement>): void => {
        const value = event.target.value;
        setSearchQuery(value);
    };

    const toggleSelected = (newSelected: DropdownItem): void => {
        if (selectedList.includes(newSelected)) {
            // Remove the item if it's already in the array
            const newList = selectedList.filter((selected) => selected !== newSelected);
            setSelectedList(newList);
            onSelectType(newList.map((qualification: DropdownItem) => qualification.identifier));
        } else {
            // Add the item if it's not in the array
            const newList = [...selectedList, newSelected];
            setSelectedList(newList);
            onSelectType(newList.map((qualification: DropdownItem) => qualification.identifier));
        }
    };

    const checkIsSelected = (newSelected: DropdownItem): boolean => {
        return selectedList.some((selected) => selected === newSelected);
    };

    const toggleDropdownWindow = (): void => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const focusSearchBar = (): void => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const closeDropdown = (): void => {
        setIsDropdownOpen(false);
    };

    const clearSearchQuery = (): void => {
        setSearchQuery("");
    };

    const resetSelectedList = (): void => {
        setSearchQuery("");
        setSelectedList([]);
        onSelectType([]);
    };

    useEffect(() => {
        if (isDropdownOpen) focusSearchBar();
    }, [isDropdownOpen]);

    useEffect(() => {
        if (searchQuery.length > 0) {
            const filteredCategories: DropdownCategory[] = options.map((category) => {
                const filteredOptions = category.options.filter((option) => {
                    const distance = levenshteinDistance(option.text.toLowerCase(), searchQuery.toLowerCase()) <= 4;
                    const contains = option.text.toLowerCase().includes(searchQuery.toLowerCase());
                    return distance || contains;
                });
                return { ...category, options: filteredOptions };
            });

            const nonEmptyCategories: DropdownCategory[] = filteredCategories.filter(
                (category) => category.options.length > 0,
            );

            setSearchResults(nonEmptyCategories);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    return (
        <div className="aw_dropdown">
            <button
                className={`aw_dropdown__button mx_Dialog_nonDialogButton ${
                    isDropdownOpen ? "aw_dropdown__button--open" : ""
                }`}
                onClick={toggleDropdownWindow}
                style={{ zIndex: isDropdownOpen ? 1000 : 0 }}
            >
                {!!text && (
                    <span className="aw_dropdown__button__text">
                        {text}
                        {selectedList.length > 0 ? " (" + selectedList.length + ")" : ""}
                    </span>
                )}
                <Icon
                    icon="searchFilterTypeDropdown"
                    style={{
                        transform: `rotate(${isDropdownOpen ? "180" : "0"}deg)`,
                        transition: "transform 0.2s ease",
                    }}
                />
            </button>
            {!!isDropdownOpen && (
                <>
                    <div className="aw_dropdown__window">
                        <div className="aw_dropdown__window__topContainer">
                            <div className="aw_dropdown__window__searchBar">
                                <input
                                    value={searchQuery}
                                    ref={inputRef}
                                    className="mx_no_textinput"
                                    type="text"
                                    placeholder={SEARCH_PLACEHOLDER_STRING}
                                    onChange={handleInput}
                                />
                                {searchQuery.length > 0 && (
                                    <button
                                        className="aw_dropdown__window__button mx_Dialog_nonDialogButton"
                                        onClick={clearSearchQuery}
                                        title={RESET_SEARCH_BUTTON_STRING}
                                    >
                                        <Icon icon="clearInput" />
                                    </button>
                                )}
                            </div>
                            {selectedList.length > 0 && (
                                <button
                                    className="aw_dropdown__window__button mx_Dialog_nonDialogButton"
                                    onClick={resetSelectedList}
                                    title={RESET_BUTTON_STRING}
                                >
                                    <Icon icon="resetSelection" />
                                </button>
                            )}
                        </div>
                        <div className="aw_dropdown__window__bottomContainer">
                            {/* If search bar has content show search result items instead of all items */}
                            {searchQuery.length > 0 ? (
                                <>
                                    {searchResults.map((item, i1) => (
                                        <Category key={i1} title={item.text}>
                                            {item.options.map((option, i2) => (
                                                <DropdownItem
                                                    key={i2}
                                                    text={option.text}
                                                    onClick={(): void => toggleSelected(option)}
                                                    isChecked={checkIsSelected(option)}
                                                />
                                            ))}
                                        </Category>
                                    ))}
                                </>
                            ) : (
                                <>
                                    {/* List selected items if any */}
                                    {selectedList.length > 0 && (
                                        <Category title={CHOSEN_STRING} highlight>
                                            {selectedList.map((option, i) => (
                                                <DropdownItem
                                                    key={i}
                                                    text={option.text}
                                                    onClick={(): void => toggleSelected(option)}
                                                    isChecked={checkIsSelected(option)}
                                                />
                                            ))}
                                        </Category>
                                    )}
                                    {/* List of all items */}
                                    {options.map((item, i1) => (
                                        <Category key={i1} title={item.text}>
                                            {item.options.map((option, i2) => (
                                                <DropdownItem
                                                    key={i2}
                                                    text={option.text}
                                                    onClick={(): void => toggleSelected(option)}
                                                    isChecked={checkIsSelected(option)}
                                                />
                                            ))}
                                        </Category>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                    <div className="aw_dropdown__backdrop" onClick={closeDropdown} />
                </>
            )}
        </div>
    );
};

export default Dropdown;
