/*
Copyright 2023-2024 Awesome Technologies Innovationslabor GmbH

All rights reserved
*/

import React, { useEffect, useState } from "react";
import { _t } from "matrix-react-sdk/src/languageHandler";

import "./WhitelistTable.css";
import WhitelistRow from "./WhitelistRow";
import type { Contact } from "../../WhitelistPanel";

const ColumnHeader = (): JSX.Element => {
    return (
        <tr className="aw_whitelist_table__header">
            <th>
                <div className="aw_whitelist_columnHeader">
                    <span>{_t("Name")}</span>
                </div>
            </th>
            <th>
                <div className="aw_whitelist_columnHeader">
                    <span>{_t("MXID")}</span>
                </div>
            </th>
            <th>
                <div className="aw_whitelist_columnHeader">
                    <span>{_t("Starting time")}</span>
                </div>
            </th>
            <th>
                <div className="aw_whitelist_columnHeader">
                    <span>{_t("Ending time")}</span>
                </div>
            </th>
            <th>
                <div className="aw_whitelist_columnHeader">
                    <span>{_t("Edit")}</span>
                </div>
            </th>
        </tr>
    );
};

interface ITableProps {
    rows: Array<Contact>;
    isInputEmpty: boolean;
    editContact: (contactName: string, mxid: string, start: string, end: string) => void;
    deleteContact: (contactName: string, mxid: string, start: string, end: string) => void;
}

const WhitelistTable: React.FC<ITableProps> = ({ rows, isInputEmpty = false, editContact, deleteContact }) => {
    const [results, setResults] = useState<Array<any>>([]);
    const [filteredResults, setFilteredResults] = useState<Array<Contact>>([]);
    const [search, setSearch] = useState<string>("");

    useEffect(() => {
        setResults(rows);
        setFilteredResults(rows);
    }, [rows]);

    const handleFilter = (event: { target: { value: React.SetStateAction<string> } }): void => {
        setSearch(event.target.value);
        const value = event.target.value;
        const filtered = results.filter((user) => user.displayName.includes(value) || user.mxid.includes(value));
        setFilteredResults(filtered);
    };

    return (
        <div
            className="aw_whitelist_table__container"
            style={{
                border: "2px solid #e0e2e7",
                borderRadius: "16px",
                padding: "16px",
            }}
        >
            <input
                type="text"
                placeholder={_t("Search contacts")}
                onChange={handleFilter}
                className="aw_WhitelistTable_searchBar"
            />
            {isInputEmpty ? (
                <div>
                    <table className="aw_whitelist_table">
                        <ColumnHeader />
                    </table>
                    <div className="aw_whitelist_table__message">
                        <span>{_t("No contacts in the whitelist")}</span>
                    </div>
                </div>
            ) : filteredResults.length === 0 ? (
                <div>
                    <table className="aw_whitelist_table">
                        <ColumnHeader />
                    </table>
                    <div className="aw_whitelist_table__message">
                        <span>
                            {_t("No matches for: ")}
                            {search}
                        </span>
                    </div>
                </div>
            ) : (
                <table className="aw_whitelist_table">
                    <ColumnHeader />
                    {filteredResults.map((entry, i) => (
                        <WhitelistRow key={i} contact={entry} editContact={editContact} deleteContact={deleteContact} />
                    ))}
                </table>
            )}
        </div>
    );
};

export default WhitelistTable;
