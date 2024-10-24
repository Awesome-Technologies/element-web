/*
Copyright 2023 Awesome Technologies Innovationslabor GmbH

All rights reserved
*/

import React, { useEffect, useState, MouseEventHandler } from "react";
import { _t } from "matrix-react-sdk/src/languageHandler";

import "./Table.css";
import Row from "./Row";
import Icon from "../../../Icon";

interface IColumnHeaderProps {
    id: string;
    name: string;
    onClick?: MouseEventHandler<HTMLDivElement>;
    isAscend?: boolean;
    icon?: any | undefined;
}

const ColumnHeader: React.FC<IColumnHeaderProps> = ({
    id,
    name,
    onClick = (): void => {},
    isAscend = true,
    icon = undefined,
}) => {
    return (
        <th onClick={onClick} className="aw_columnHeader__container">
            <div className="aw_columnHeader">
                {!!icon && <Icon icon={icon} />}
                <span>{name}</span>
            </div>
        </th>
    );
};

interface ITableProps {
    rows: Array<object>;
    columnStructure: ColumnStructure;
    isLoading: boolean;
    isInputEmpty: boolean;
}

type ColumnStructure = {
    id: string;
    name: string;
    icon: string;
}[];

const Table: React.FC<ITableProps> = ({ rows, columnStructure, isLoading = false, isInputEmpty = false }) => {
    const [results, setResults] = useState<Array<object>>([]);

    const isEmpty = rows.length === 0;

    useEffect(() => {
        setResults(rows);
    }, [rows]);

    return (
        <div className="aw_table__container">
            {isLoading ? (
                <div className="aw_table__message spinner">
                    <Icon icon="spinnerBig" />
                    <span>{_t("tim|vzd|search")}</span>
                </div>
            ) : isInputEmpty ? (
                <div className="aw_table__message">
                    <Icon icon="magnifyingGlassBig" />
                    <span>{_t("tim|vzd|search_query")}</span>
                </div>
            ) : isEmpty ? (
                <div className="aw_table__message">
                    <Icon icon="errorBig" />
                    <span>{_t("tim|vzd|no_results")}</span>
                </div>
            ) : (
                <table className="aw_table">
                    <tr className="aw_table__header">
                        {columnStructure.map((column, i) => (
                            <ColumnHeader key={i} id={column.id} name={column.name} icon={column.icon} />
                        ))}
                    </tr>
                    {results.map((entry, i) => (
                        <Row key={i} data={entry} />
                    ))}
                </table>
            )}
        </div>
    );
};

export default Table;
