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
                    <span>{_t("tim|whitelist|name")}</span>
                </div>
            </th>
            <th>
                <div className="aw_whitelist_columnHeader">
                    <span>{_t("tim|whitelist|mxid")}</span>
                </div>
            </th>
            <th>
                <div className="aw_whitelist_columnHeader">
                    <span>{_t("tim|whitelist|start")}</span>
                </div>
            </th>
            <th>
                <div className="aw_whitelist_columnHeader">
                    <span>{_t("tim|whitelist|end")}</span>
                </div>
            </th>
            <th>
                <div className="aw_whitelist_columnHeader">
                    <span>{_t("tim|whitelist|edit")}</span>
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
                placeholder={_t("tim|whitelist|search")}
                onChange={handleFilter}
                className="aw_WhitelistTable_searchBar"
            />
            {isInputEmpty ? (
                <div>
                    <table className="aw_whitelist_table">
                        <ColumnHeader />
                    </table>
                    <div className="aw_whitelist_table__message">
                        <span>{_t("tim|whitelist|no_contacts")}</span>
                    </div>
                </div>
            ) : filteredResults.length === 0 ? (
                <div>
                    <table className="aw_whitelist_table">
                        <ColumnHeader />
                    </table>
                    <div className="aw_whitelist_table__message">
                        <span>
                            {_t("tim|whitelist|no_matches")}
                            {search}
                        </span>
                    </div>
                </div>
            ) : (
                <table className="aw_whitelist_table">
                    <ColumnHeader />
                    <tbody>
                        {filteredResults.map((entry, i) => (
                            <WhitelistRow
                                key={i}
                                contact={entry}
                                editContact={editContact}
                                deleteContact={deleteContact}
                            />
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default WhitelistTable;
