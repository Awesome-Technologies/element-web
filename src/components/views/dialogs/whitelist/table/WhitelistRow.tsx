/*
Copyright 2023-2024 Awesome Technologies Innovationslabor GmbH

All rights reserved
*/

import React, { useState } from "react";
import { _t } from "matrix-react-sdk/src/languageHandler";
import AccessibleButton from "matrix-react-sdk/src/components/views/elements/AccessibleButton";
import Field from "matrix-react-sdk/src/components/views/elements/Field";

import "./WhitelistRow.css";
import type { Contact } from "../../WhitelistPanel";
import Icon from "../../../../Icon";

interface IProps {
    contact: Contact;
    editContact: (contactName: string, mxid: string) => void;
    deleteContact: (contactName: string, mxid: string) => void;
}

const Row: React.FC<IProps> = ({ contact: contact, editContact, deleteContact }) => {
    const [editMode, setEditMode] = useState<boolean>(false);
    const [contactName, setContactName] = useState<string>(contact.displayName);

    const startEditMode = (): void => {
        setContactName(contact.displayName);
        setEditMode(true);
    };

    const saveData = (): void => {
        if (checkName()) {
            editContact(contactName, contact.mxid);
            contact.displayName = contactName;
            setEditMode(false);
        }
    };

    const cancelEditMode = (): void => {
        setEditMode(false);
    };
    const onDeleteContact = (): void => {
        deleteContact(contactName, contact.mxid);
    };

    const onChangeName = (ev: React.ChangeEvent<HTMLInputElement>): void => {
        setContactName(ev.target.value);
    };

    const checkName = (): boolean => {
        if (contactName === "") {
            const popup = document.getElementById("whitelist_Popup") as HTMLInputElement;
            popup.classList.toggle("show");
            return false;
        } else {
            return true;
        }
    };

    return (
        <tr role="button" tabIndex={0} className="aw_whitelist_row mx_Dialog_nonDialogButton">
            <td>
                <div className="aw_row__name__container">
                    <div className="aw_result_avatar">
                        <Icon icon="avatarPerson" />
                    </div>
                    {editMode ? (
                        <div className="aw_whitelist_popup">
                            <Field type="text" label={_t("Change name")} value={contactName} onChange={onChangeName} />
                            <span className="popuptext" id="whitelist_Popup">
                                {_t("The name field can not be empty")}
                            </span>
                        </div>
                    ) : (
                        <AccessibleButton onClick={startEditMode} element="div" className="aw_result_data">
                            {contact.displayName}
                        </AccessibleButton>
                    )}
                </div>
            </td>
            <td>
                <span className="aw_result_data">{contact.mxid}</span>
            </td>
            <td>
                {editMode ? (
                    <div className="aw_edit_buttons">
                        <AccessibleButton
                            element="div"
                            onClick={saveData}
                            className="aw_WhitelistRow__smallButton"
                            title={_t("Save changes")}
                        >
                            <Icon icon="save" />
                        </AccessibleButton>
                        <AccessibleButton
                            element="div"
                            onClick={cancelEditMode}
                            className="aw_WhitelistRow__smallButton"
                            title={_t("Cancel")}
                        >
                            <Icon icon="cancelEditMode" />
                        </AccessibleButton>
                    </div>
                ) : (
                    <div className="aw_edit_buttons">
                        <AccessibleButton
                            element="div"
                            onClick={onDeleteContact}
                            className="aw_WhitelistRow__smallButton"
                            title={_t("Delete entry")}
                        >
                            <Icon icon="deleteContact" />
                        </AccessibleButton>
                        <AccessibleButton
                            element="div"
                            onClick={startEditMode}
                            className="aw_WhitelistRow__smallButton"
                            title={_t("Edit entry")}
                        >
                            <Icon icon="edit" />
                        </AccessibleButton>
                    </div>
                )}
            </td>
        </tr>
    );
};

export default Row;
