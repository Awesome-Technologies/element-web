/*
Copyright 2023, 2024 Awesome Technologies Innovationslabor GmbH

All rights reserved
*/

import React from "react";
import "./DetailWindow.css";
import { _t } from "matrix-react-sdk/src/languageHandler";
import BaseDialog from "matrix-react-sdk/src/components/views/dialogs/BaseDialog";
import { MatrixClientPeg } from "matrix-react-sdk/src/MatrixClientPeg";
import { DirectoryMember, startDmOnFirstMessage } from "matrix-react-sdk/src/utils/direct-messages";

import Icon from "../../../Icon";
import { getCodeDisplay } from "../../../../tools";

interface IProps {
    onFinished: (success?: boolean) => void;
    data?: any;
    description?: React.ReactNode;
    button?: string;
    focus?: boolean;
    headerImage?: string;
}

interface IState {
    onFinished: (success: boolean) => void;
}

export interface MxidEntry {
    name: string | undefined;
    address: string;
}

export default class ErrorDialog extends React.Component<IProps, IState> {
    public static defaultProps: Partial<IProps> = {
        focus: true,
    };

    private onClick = async (mxid: string): Promise<void> => {
        // convert to matrixid
        const inviteMxid = "@" + mxid.split("matrix:u/")[1];

        // start chat
        const cli = MatrixClientPeg.safeGet();
        await startDmOnFirstMessage(cli, [new DirectoryMember({ user_id: inviteMxid })]);

        this.props.onFinished(true);
    };

    private mapAvailableTimes = (availableTimes: Array<any>): any => {
        if (!availableTimes) return [];

        const times: Array<any> = [];
        availableTimes.forEach((element) => {
            element.daysOfWeek.forEach((day: any) => {
                const start = `${element.availableStartTime.substring(0, 2)}:${element.availableStartTime.substring(
                    3,
                    5,
                )}`;
                const end = `${element.availableEndTime.substring(0, 2)}:${element.availableEndTime.substring(3, 5)}`;
                const time = element.allDay ? _t("tim|vzd|all_day") : `${start} - ${end}`;
                times.push(<span>{_t(day) + " " + time}</span>);
            });
        });
        const result = times
            ? times.map(function (line) {
                  return (
                      <div>
                          {line}
                          <br />
                      </div>
                  );
              })
            : "-";

        return result;
    };

    public render(): React.ReactNode {
        let contactTypeComponent;
        let connectButtonText = _t("tim|vzd|start_chat");
        let name: string | null = null;
        let hcsName: string | null = null;
        let namePrefix: string | null = null;
        let qualification: string | null = null;
        let availableTimes: Array<string> | null = null;
        let availableTimeTitle = "";

        const data = this.props.data;

        console.log(data);

        switch (data.resourceType) {
            case "person":
                name = data.name[0]?.text || "name error";
                if (data.name[0]?.prefix) {
                    namePrefix = data.name[0].prefix[0];
                }
                contactTypeComponent = (
                    <div>
                        <span className="aw_detailWindow__contentContainer__avatar__icon">
                            <Icon
                                style={{
                                    height: "60px",
                                    width: "60px",
                                }}
                                icon="avatarPerson"
                            />
                        </span>
                        <span className="aw_detailWindow__contentContainer__contactType person">
                            {_t("tim|vzd|person")}
                        </span>
                    </div>
                );
                qualification = data.qualification[0]?.code?.coding[0]?.display;
                availableTimeTitle = _t("tim|vzd|availability");
                availableTimes = this.mapAvailableTimes(data.availableTime);
                break;
            case "group":
                contactTypeComponent = (
                    <span className="aw_detailWindow__contentContainer__contactType group">{_t("tim|vzd|group")}</span>
                );
                connectButtonText = _t("tim|vzd|enter_group");
                break;
            case "organization":
                name = data.name || "name error";
                hcsName = data.hcsName || null;
                contactTypeComponent = (
                    <div>
                        <span className="aw_detailWindow__contentContainer__avatar__icon">
                            <Icon
                                style={{
                                    height: "60px",
                                    width: "60px",
                                }}
                                icon="avatarOrganization"
                            />
                        </span>
                        <span className="aw_detailWindow__contentContainer__contactType organisation">
                            {_t("tim|vzd|organization")}
                        </span>
                    </div>
                );
                qualification = getCodeDisplay(
                    data.qualification[0]?.coding[0]?.system,
                    data.qualification[0]?.coding[0]?.code,
                );
                availableTimeTitle = _t("tim|vzd|available_times");
                availableTimes = this.mapAvailableTimes(data.availableTime);
                break;
            default:
                contactTypeComponent = (
                    <span className="aw_detailWindow__contentContainer__contactType person">{_t("tim|vzd|error")}</span>
                );
        }

        return (
            <BaseDialog onFinished={this.props.onFinished} contentId="mx_Dialog_content">
                <div className="aw_detailWindow">
                    <div className="aw_detailWindow__contentContainer">
                        <div className="aw_detailWindow__contentContainer__avatar">{contactTypeComponent}</div>
                        <span className="aw_detailWindow__contentContainer__name">
                            {!!namePrefix && namePrefix + " "}
                            {name}
                        </span>
                        {hcsName && <span className="aw_detailWindow__contentContainer__hcsName">{hcsName}</span>}

                        <span className="aw_detailWindow__contentContainer__qualification">{qualification}</span>
                        <span className="aw_detailWindow__contentContainer__title">{_t("tim|vzd|phone")}</span>
                        <span className="aw_detailWindow__contentContainer__value">
                            {data.telecom && data.telecom[0]?.system == "phone" ? `${data.telecom[0]?.value}` : "-"}
                            <br />
                        </span>
                        <span className="aw_detailWindow__contentContainer__title">{_t("tim|vzd|location")}</span>
                        <span className="aw_detailWindow__contentContainer__value">
                            {data.location && (
                                <>
                                    {data.location[0]?.address?.line ? `${data.location[0]?.address?.line[0]}` : ""}
                                    <br />
                                    {data.location[0]?.address?.postalCode
                                        ? `${data.location[0]?.address?.postalCode}`
                                        : ""}
                                    &nbsp;
                                    {data.location[0]?.address?.city ? `${data.location[0].address.city}` : ""}
                                    <br />
                                    {data.location[0]?.address?.state ? `${data.location[0].address.state}` : ""}
                                </>
                            )}
                        </span>
                        <span className="aw_detailWindow__contentContainer__title">{availableTimeTitle}</span>
                        <span className="aw_detailWindow__contentContainer__value">{availableTimes}</span>
                    </div>
                    {data.mxid.map((mxid: MxidEntry) => {
                        return (
                            <div>
                                <div className="aw_detailWindow__mxidContainer">{mxid.name}</div>
                                <div className="aw_detailWindow__buttonContainer">
                                    <button
                                        className="aw_detailWindow__button mx_Dialog_nonDialogButton"
                                        disabled={mxid ? false : true}
                                        onClick={(): Promise<void> => this.onClick(mxid.address)}
                                    >
                                        <Icon icon="startChat" />
                                        {connectButtonText}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </BaseDialog>
        );
    }
}
