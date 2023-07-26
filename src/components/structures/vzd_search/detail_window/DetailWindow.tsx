/*
Copyright 2023 Awesome Technologies Innovationslabor GmbH

All rights reserved
*/

import React from "react";
import { _t } from "matrix-react-sdk/src/languageHandler";

import "./DetailWindow.css";
import Icon from "../../../Icon";

interface IProps {
    onFinished: any;
    data: any;
}

const DetailWindow: React.FC<IProps> = ({ onFinished, data }) => {
    let contactTypeComponent;
    const connectButtonText = _t("Start chat");
    let name: string | null = null;
    let namePrefix: string | null = null;

    switch (data.type) {
        case "person":
            name = data.name[0].text || "name error";
            if (data.name[0].prefix) {
                namePrefix = data.name[0].prefix[0];
            }
            contactTypeComponent = (
                <span className="aw_detailWindow__contentContainer__contactType person">{_t("Person")}</span>
            );
            break;
        case "organization":
            name = data.name || "name error";
            contactTypeComponent = (
                <span className="aw_detailWindow__contentContainer__contactType organisation">
                    {_t("Organisation")}
                </span>
            );
            break;
        default:
            contactTypeComponent = (
                <span className="aw_detailWindow__contentContainer__contactType person">{_t("Error")}</span>
            );
    }

    return (
        <div className="aw_detailWindow">
            <div className="aw_detailWindow__titlebar">
                <button tabIndex={0} className="aw_detailWindow__titlebar__favoriteButton mx_Dialog_nonDialogButton">
                    <Icon icon="favorite" />
                </button>
                <button
                    className="aw_detailWindow__titlebar__closeButton mx_Dialog_nonDialogButton"
                    onClick={onFinished}
                >
                    <Icon icon="close" />
                </button>
            </div>
            <div className="aw_detailWindow__contentContainer">
                <div className="aw_detailWindow__contentContainer__avatar">{contactTypeComponent}</div>
                <span className="aw_detailWindow__contentContainer__name">
                    {!!namePrefix && namePrefix + " "}
                    {name}
                </span>
                <span className="aw_detailWindow__contentContainer__title">{_t("Location")}</span>
                <span className="aw_detailWindow__contentContainer__value">
                    {data.address.city}
                    {data.address.state ? ` (${data.address.state})` : ""}
                </span>
            </div>
            <div className="aw_detailWindow__buttonContainer">
                <button className="aw_detailWindow__button mx_Dialog_nonDialogButton">
                    <Icon icon="startChat" />
                    {connectButtonText}
                </button>
            </div>
        </div>
    );
};

export default DetailWindow;
