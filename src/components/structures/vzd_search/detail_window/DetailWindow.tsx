/*
Copyright 2023 Awesome Technologies Innovationslabor GmbH

All rights reserved
*/

import React from "react";
import "./DetailWindow.css";
import { _t } from "matrix-react-sdk/src/languageHandler";

import Icon from "../../../Icon";
import { getCodeDisplay } from "../../../../tools";

interface IProps {
    onFinished: any;
    data: any;
}

function mapAvailableTimes(availableTimes: Array<any>): Array<string> {
    if (!availableTimes) return [];

    const times: Array<string> = [];
    availableTimes.forEach((element) => {
        const days = element.daysOfWeek?.toString();
        const time = element.allDay ? _t("All day") : element.availableStartTime + " - " + element.availableEndTime;
        times.push(days + " " + time);
    });

    return times;
}

const DetailWindow: React.FC<IProps> = ({ onFinished, data }) => {
    let contactTypeComponent;
    let connectButtonText = _t("Start chat");
    let name: string | null = null;
    let namePrefix: string | null = null;
    let qualification: string | null = null;
    let availableTimes: Array<string> | null = null;

    switch (data.resourceType) {
        case "person":
            name = data.name[0]?.text || "name error";
            if (data.name[0]?.prefix) {
                namePrefix = data.name[0].prefix[0];
            }
            contactTypeComponent = (
                <span className="aw_detailWindow__contentContainer__contactType person">{_t("Person")}</span>
            );
            qualification = data.qualification[0]?.code?.coding[0]?.display;
            availableTimes = mapAvailableTimes(data.availableTime);
            break;
        case "group":
            contactTypeComponent = (
                <span className="aw_detailWindow__contentContainer__contactType group">{_t("Group")}</span>
            );
            connectButtonText = _t("Enter group");
            break;
        case "organization":
            name = data.name || "name error";
            contactTypeComponent = (
                <span className="aw_detailWindow__contentContainer__contactType organisation">
                    {_t("Organization")}
                </span>
            );
            qualification = getCodeDisplay(
                data.qualification[0]?.coding[0]?.system,
                data.qualification[0]?.coding[0]?.code,
            );
            availableTimes = mapAvailableTimes(data.availableTime);
            break;
        default:
            contactTypeComponent = (
                <span className="aw_detailWindow__contentContainer__contactType person">{_t("Error")}</span>
            );
    }

    return (
        <div className="aw_detailWindow">
            <div className="aw_detailWindow__titlebar">
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
                <span className="aw_detailWindow__contentContainer__qualification">{qualification}</span>
                <span className="aw_detailWindow__contentContainer__title">{_t("Phone")}</span>
                <span className="aw_detailWindow__contentContainer__value">
                    {data.telecom && data.telecom[0]?.system == "phone" ? `${data.telecom[0]?.value}` : "-"}
                    <br />
                </span>
                <span className="aw_detailWindow__contentContainer__title">{_t("Location")}</span>
                <span className="aw_detailWindow__contentContainer__value">
                    {data.location[0]?.address?.line ? `${data.location[0]?.address?.line[0]}` : ""}
                    <br />
                    {data.location[0]?.address?.postalCode ? `${data.location[0]?.address?.postalCode}` : ""}&nbsp;
                    {data.location[0]?.address?.city ? `${data.location[0].address.city}` : ""}
                    <br />
                    {data.location[0]?.address?.state ? `${data.location[0].address.state}` : ""}
                </span>
                <span className="aw_detailWindow__contentContainer__title">{_t("Available times")}</span>
                <span className="aw_detailWindow__contentContainer__value">
                    {availableTimes
                        ? availableTimes.map(function (line) {
                              return (
                                  <div>
                                      {line}
                                      <br />
                                  </div>
                              );
                          })
                        : "-"}
                </span>
            </div>
            <div className="aw_detailWindow__buttonContainer">
                <button
                    className="aw_detailWindow__button mx_Dialog_nonDialogButton"
                    disabled={data.mxid ? false : true}
                >
                    <Icon icon="startChat" />
                    {connectButtonText}
                </button>
            </div>
        </div>
    );
};

export default DetailWindow;
