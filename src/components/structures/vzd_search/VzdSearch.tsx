/*
Copyright 2023 Awesome Technologies Innovationslabor GmbH

All rights reserved
*/

import React, { useState, useEffect } from "react";
import "./VzdSearch.css";
import defaultDispatcher from "matrix-react-sdk/src/dispatcher/dispatcher";
import { Action } from "matrix-react-sdk/src/dispatcher/actions";
import { _t } from "matrix-react-sdk/src/languageHandler";

import Switch from "./tab/Switch";
import Table from "./table/Table";
import Icon from "../../Icon";
import { FHIRContextProvider, useFHIRContext } from "../../context/FHIRContext";
import SearchBar from "./search_bar/SearchBar";
import { typeOptions } from "./searchDropdownOptions";
import Dropdown from "./search_bar/dropdown/Dropdown";

const CLOSE_BUTTON_STRING = _t("tim|vzd|close_window");
const EDIT_PROFILE_LINK_STRING = _t("tim|vzd|edit_entry");
const DEBOUNCE_TIME = 300;

interface IProps {
    onFinished: any;
}

// Adds FHIRContextProvider
const VzdSearch: React.FC<IProps> = ({ onFinished }) => {
    return (
        <FHIRContextProvider>
            <VzdSearchCore onFinished={onFinished} />
        </FHIRContextProvider>
    );
};

const switchOptions = [
    {
        id: "people",
        name: "Personen",
        icon: "searchFilterPeople",
    },
    {
        id: "organisations",
        name: "Organisationen",
        icon: "searchFilterOrganizations",
    },
];

const columnOptions = [
    {
        id: "name",
        name: "Name",
        icon: "tableColumnName",
    },
    {
        id: "qualification",
        name: "Typ",
        icon: "tableColumnQualification",
    },
    {
        id: "location",
        name: "Ort",
        icon: "tableColumnLocation",
    },
    {
        id: "resourceType",
        name: "Eintragstyp",
        icon: "tableColumnRecourceType",
    },
];

const VzdSearchCore: React.FC<IProps> = ({ onFinished }) => {
    const { searchPractitionerDirectory, searchOrganizationDirectory } = useFHIRContext();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [searchQueryName, setSearchQueryName] = useState<string>("");
    const [searchQueryHCSName, setSearchQueryHCSName] = useState<string>("");
    const [searchQueryLocation, setSearchQueryLocation] = useState<string>("");
    const [searchQueryQualification, setSearchQueryQualification] = useState<string>("");
    const [results, setResults] = useState<object[]>([]);
    const [option, setOption] = useState<string>(switchOptions[0].id);

    useEffect(() => {
        // Makes sure "no results" doesnt flash in the debounce timer (DEBOUNCE_TIME)
        if (
            searchQueryName.length > 0 ||
            searchQueryHCSName.length > 0 ||
            searchQueryLocation.length > 0 ||
            searchQueryQualification.length > 0
        ) {
            setIsLoading(true);
        } else {
            setIsLoading(false);
        }

        const performSearch = async (): Promise<void> => {
            setIsLoading(true);

            try {
                let allResults;
                const searchQuery: any = { "endpoint:Endpoint.status": "active" };
                if (searchQueryLocation) {
                    searchQuery["location.address"] = searchQueryLocation;
                }

                switch (option) {
                    case "people":
                        if (searchQueryName) {
                            searchQuery["practitioner.name"] = searchQueryName;
                        }
                        if (searchQueryQualification) {
                            searchQuery["practitioner.qualification"] = searchQueryQualification.toString();
                        }

                        allResults = await searchPractitionerDirectory(searchQuery);
                        break;
                    case "organisations":
                        if (searchQueryName) {
                            searchQuery["organization.name"] = searchQueryName;
                        }
                        if (searchQueryHCSName) {
                            searchQuery["name:contains"] = searchQueryHCSName;
                        }
                        if (searchQueryQualification) {
                            searchQuery["organization.type"] = searchQueryQualification.toString();
                        }
                        allResults = await searchOrganizationDirectory(searchQuery);
                        break;
                }
                console.log(allResults);
                setResults(allResults);
            } catch (error) {
                console.error(error);
            }
            setIsLoading(false);
        };

        const delayTimer = setTimeout(() => {
            if (
                searchQueryName.length > 0 ||
                searchQueryHCSName.length > 0 ||
                searchQueryLocation.length > 0 ||
                searchQueryQualification.length > 0
            ) {
                performSearch();
            } else {
                setResults([]);
            }
        }, DEBOUNCE_TIME);

        return (): void => clearTimeout(delayTimer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQueryName, searchQueryHCSName, searchQueryLocation, searchQueryQualification, option]);

    return (
        <div className="aw_VzdSearch">
            <div className="top">
                <div className="titlebar">
                    <span className="title">Suche</span>

                    <div className="flex" />

                    <button
                        className="edit-button mx_Dialog_nonDialogButton"
                        onClick={(): void =>
                            defaultDispatcher.dispatch({
                                action: Action.ViewUserSettings,
                                initialTabId: "USER_FHIR_TAB",
                            })
                        }
                    >
                        <span>{EDIT_PROFILE_LINK_STRING}</span>
                        <Icon icon="openNewWindow" />
                    </button>

                    <button
                        className="close-button mx_Dialog_nonDialogButton"
                        onClick={onFinished}
                        title={CLOSE_BUTTON_STRING}
                    >
                        <Icon icon="close" />
                    </button>
                </div>

                <SearchBar
                    onChange={(e): void => setSearchQueryName(e.target.value)}
                    value={searchQueryName}
                    type="name"
                    placeholder={option === "people" ? _t("tim|vzd|search_name") : _t("tim|vzd|search_org_name")}
                />
                {option === "organisations" && (
                    <SearchBar
                        onChange={(e): void => setSearchQueryHCSName(e.target.value)}
                        value={searchQueryHCSName}
                        type="hcsname"
                        placeholder={_t("tim|vzd|search_hcs_name")}
                    />
                )}
                <SearchBar
                    onChange={(e): void => setSearchQueryLocation(e.target.value)}
                    value={searchQueryLocation}
                    type="location"
                    placeholder={_t("tim|vzd|search_location")}
                />

                <div className="button-container">
                    <Switch
                        options={switchOptions}
                        onChange={(e: string): void => setOption(e)}
                        defaultOption={switchOptions[0]}
                    />
                    <Dropdown
                        text="Typ"
                        options={typeOptions(option)}
                        onSelectType={(value: any): void => setSearchQueryQualification(value)}
                    />
                </div>
            </div>
            <Table
                isInputEmpty={
                    searchQueryName.length === 0 &&
                    searchQueryHCSName.length === 0 &&
                    searchQueryLocation.length === 0 &&
                    searchQueryQualification.length === 0
                }
                isLoading={isLoading}
                rows={results}
                columnStructure={columnOptions}
            />
        </div>
    );
};

export default VzdSearch;
