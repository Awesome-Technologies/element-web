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

const CLOSE_BUTTON_STRING = _t("Close Window");
const EDIT_PROFILE_LINK_STRING = _t("Edit my entry");
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
        id: "all",
        name: "Alle",
        icon: "searchFilterAll",
    },
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
    const { searchPractitionerDirectory, searchOrganizationDirectory, searchDirectory } = useFHIRContext();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [searchQueryName, setSearchQueryName] = useState<string>("");
    const [searchQueryLocation, setSearchQueryLocation] = useState<string>("");
    const [searchQueryQualification, setSearchQueryQualification] = useState<string>("");
    const [results, setResults] = useState<object[]>([]);
    const [option, setOption] = useState<string>(switchOptions[0].id);

    useEffect(() => {
        // Makes sure "no results" doesnt flash in the debounce timer (DEBOUNCE_TIME)
        if (searchQueryName.length > 0 || searchQueryLocation.length > 0) {
            setIsLoading(true);
        } else {
            setIsLoading(false);
        }

        const performSearch = async (): Promise<void> => {
            setIsLoading(true);

            try {
                let allResults;
                switch (option) {
                    case "people":
                        allResults = await searchPractitionerDirectory({
                            "practitioner.name": searchQueryName,
                            "location.address": searchQueryLocation,
                            "practitioner.qualification": searchQueryQualification.toString(),
                        });
                        break;
                    case "organisations":
                        allResults = await searchOrganizationDirectory({
                            "organization.name": searchQueryName,
                            "location.address": searchQueryLocation,
                            "organization.type": searchQueryQualification.toString(),
                        });
                        break;
                    default:
                        allResults = await searchDirectory({
                            name: searchQueryName,
                            address: searchQueryLocation,
                            qualification: searchQueryQualification,
                        });
                        break;
                }
                setResults(allResults);
            } catch (error) {
                console.error(error);
            }
            setIsLoading(false);
        };

        const delayTimer = setTimeout(() => {
            if (searchQueryName.length > 0 || searchQueryLocation.length > 0) {
                performSearch();
            } else {
                setResults([]);
            }
        }, DEBOUNCE_TIME);

        return () => clearTimeout(delayTimer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQueryName, searchQueryLocation, searchQueryQualification, option]);

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
                />
                <SearchBar
                    onChange={(e): void => setSearchQueryLocation(e.target.value)}
                    value={searchQueryLocation}
                    type="location"
                />

                <div className="button-container">
                    <Switch
                        options={switchOptions}
                        onChange={(e: string): void => setOption(e)}
                        defaultOption={switchOptions[0]}
                    />
                    <Dropdown
                        text="Typ"
                        options={typeOptions}
                        onSelectType={(value: any): void => setSearchQueryQualification(value)}
                    />
                </div>
            </div>
            <Table
                isInputEmpty={searchQueryName.length === 0 && searchQueryLocation.length === 0}
                isLoading={isLoading}
                rows={results}
                columnStructure={columnOptions}
            />
        </div>
    );
};

export default VzdSearch;
