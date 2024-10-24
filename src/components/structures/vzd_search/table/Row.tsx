/*
Copyright 2023 Awesome Technologies Innovationslabor GmbH

All rights reserved
*/

import React from "react";
import "./Row.css";
import Modal from "matrix-react-sdk/src/Modal";
import { _t } from "matrix-react-sdk/src/languageHandler";

import DetailWindow from "../detail_window/DetailWindow";
import Icon from "../../../Icon";
import { getCodeDisplay } from "../../../../tools";

const EMPTY_FIELD_STRING = "-";

interface IProps {
    data: any;
}

const Row: React.FC<IProps> = ({ data }) => {
    let nameString: string | null = EMPTY_FIELD_STRING;
    let namePrefixString: string | null = null;
    let hcsNameString: string | null = EMPTY_FIELD_STRING;

    const type: any[] = [];
    let typeString: string = EMPTY_FIELD_STRING;

    const locations = data?.location;
    const locationArray: any[] = [];
    let locationString: string = EMPTY_FIELD_STRING;

    if (locations) {
        locations.forEach((element: any) => {
            if (element.address.city) {
                locationArray.push(element.address.city);
            }
        });
    }

    if (locationArray.length > 0) {
        locationString = locationArray.join(", ");
    }

    let resourceTypeComponent;
    const resourceType = data.resourceType;

    switch (resourceType) {
        case "person":
            nameString = data.name[0].text || "name error";
            hcsNameString = data.hcsName || null;
            if (data.name[0].prefix) {
                namePrefixString = data.name[0].prefix[0];
            }
            resourceTypeComponent = (
                <span className="aw_result_resourceType person">
                    <Icon icon="searchFilterPeople" />
                    {_t("tim|vzd|person")}
                </span>
            );
            data.qualification.forEach((element: any) => {
                if (element?.code?.coding?.[0]?.display) {
                    type.push(element?.code?.coding?.[0]?.display);
                } else {
                    type.push(getCodeDisplay(element?.code?.coding?.[0]?.system, element?.code?.coding?.[0]?.code));
                }
            });
            break;
        case "organization":
            nameString = data.name || "name error";
            hcsNameString = data.hcsName || null;
            resourceTypeComponent = (
                <span className="aw_result_resourceType organisation">
                    <Icon icon="searchFilterOrganizations" />
                    {_t("tim|vzd|organization")}
                </span>
            );
            data.qualification.forEach((element: any) => {
                type.push(getCodeDisplay(element?.coding?.[0]?.system, element?.coding?.[0]?.code));
            });
            break;
        case "group":
            resourceTypeComponent = (
                <span className="aw_result_resourceType group">
                    <Icon icon="searchFilterGroup" />
                    {_t("tim|vzd|group")}
                </span>
            );
            break;
        default:
            resourceTypeComponent = <span className="aw_result_resourceType person">{_t("tim|vzd|error")}</span>;
    }

    typeString = type.length > 0 ? type.join(", ") : EMPTY_FIELD_STRING;

    const handleClick = (): void => {
        Modal.createDialog(DetailWindow, { data: data }, "mx_VzdSearch_wrapper", true, true);
    };

    return (
        <tr role="button" tabIndex={0} className="aw_row mx_Dialog_nonDialogButton" onClick={handleClick}>
            <td>
                <div className="aw_row__name__container">
                    <div className="aw_result_avatar">
                        {resourceType == "person" && <Icon icon="avatarPerson" />}
                        {resourceType == "organization" && <Icon icon="avatarOrganization" />}
                    </div>
                    <div>
                        <span className="aw_result_name">
                            {nameString || "-"}
                            {!!namePrefixString && (
                                <span className="aw_result_name_prefix">&nbsp;({namePrefixString})</span>
                            )}
                        </span>
                        {hcsNameString && (
                            <>
                                <span className="aw_result_hcsname">&nbsp;({hcsNameString})</span>
                            </>
                        )}
                    </div>
                </div>
            </td>
            <td>
                <span className="aw_result_location">{typeString}</span>
            </td>
            <td>
                <span className="aw_result_location">{locationString}</span>
            </td>
            <td>
                <div className="aw_result_contact-type-container">{resourceTypeComponent}</div>
            </td>
        </tr>
    );
};

export default Row;
