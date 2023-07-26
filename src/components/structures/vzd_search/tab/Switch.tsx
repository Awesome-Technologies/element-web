/*
Copyright 2023 Awesome Technologies Innovationslabor GmbH

All rights reserved
*/

import React, { useState } from "react";

import "./Switch.css";
import Icon from "../../../Icon";

interface IProps {
    options: Option[];
    onChange: Function;
    defaultOption: any;
}

type Option = {
    id: string;
    name: string;
    icon?: string;
};

const Switch: React.FC<IProps> = ({ options, onChange, defaultOption }) => {
    const [selectedId, setSelectedId] = useState<string>(defaultOption.id || options[0].id);

    const handleSelect = (optionId: string): void => {
        setSelectedId(optionId);
        onChange(optionId);
    };

    return (
        <div className="aw_switch">
            {options.map((option) => (
                <button
                    key={option.id}
                    onClick={(): void => handleSelect(option.id)}
                    className={
                        selectedId == option.id
                            ? "aw_switch__button--selected mx_Dialog_nonDialogButton aw_switch__button"
                            : "mx_Dialog_nonDialogButton aw_switch__button"
                    }
                    title={option.name}
                >
                    {option?.icon && <Icon icon={option?.icon} />}
                    <span>{option.name}</span>
                </button>
            ))}
        </div>
    );
};

export default Switch;
