/*

Copyright 202-2024 Awesome Technologies Innovationslabor GmbH

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React from "react";
import Field from "matrix-react-sdk/src/components/views/elements/Field";
import withValidation, {
    IFieldState,
    IValidationResult,
} from "matrix-react-sdk/src/components/views/elements/Validation";
import AccessibleButton from "matrix-react-sdk/src/components/views/elements/AccessibleButton";
import { _t } from "matrix-react-sdk/src/languageHandler";
import { MatrixClientPeg } from "matrix-react-sdk/src/MatrixClientPeg";

import "./WhitelistPanel.css";
import WhitelistTable from "./whitelist/table/WhitelistTable";
import Icon from "../../Icon";

const FIELD_MXID = "field_mxid";
const FIELD_USERNAME = "field_username";
type FieldType = typeof FIELD_MXID | typeof FIELD_USERNAME;

export type Contact = {
    mxid: string;
    displayName: string;
    inviteSettings: {
        start: string;
        end: string;
    };
};

interface IProps {
    buttonClassName?: string;
    buttonKind?: string;
    onFinished: () => void;
    onError: (error: Error) => void;
}

interface IState {
    mxid: string;
    displayName: string;
    contacts: Contact[];
    openIdToken: string;
    tokenExpiry: Date;
    metaData: string;
    api_url: string;
    startInvite: string;
    endInvite: string;
    fieldValid: Partial<Record<FieldType, boolean>>;
    error: string | null;
}

export default class WhitelistPanel extends React.Component<IProps, IState> {
    private [FIELD_MXID]: Field | null = null;
    private [FIELD_USERNAME]: Field | null = null;

    public static defaultProps: Partial<IProps> = {
        onFinished() {},
        onError() {},
    };

    public constructor(props: IProps) {
        super(props);

        const client = MatrixClientPeg.get();
        this.state = {
            mxid: "",
            displayName: "",
            contacts: [],
            openIdToken: "",
            tokenExpiry: new Date(),
            metaData: "",
            api_url: client!.getHomeserverUrl() + "/tim-contact-mgmt",
            startInvite: "",
            endInvite: "",
            fieldValid: {},
            error: null,
        };
    }

    private convertToTimestamp = (date: string): number => {
        // convert date to timestamp
        const dateSplitted = date.split("-");
        const dateTimestamp = new Date(
            parseInt(dateSplitted[0]),
            parseInt(dateSplitted[1]) - 1,
            parseInt(dateSplitted[2]),
        ).getTime();

        return dateTimestamp;
    };

    private convertFromTimestamp = (timestamp: number): string => {
        // convert timestamp to date
        const date = new Date(timestamp);
        const formattedDate = new Intl.DateTimeFormat("fr-CA", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).format(date);

        return formattedDate;
    };

    public getAuthToken = async (): Promise<void> => {
        const client = MatrixClientPeg.get();
        if (client) {
            if (this.state.openIdToken === "" || this.state.tokenExpiry < new Date()) {
                const token = client.getOpenIdToken();
                const expiry = new Date(new Date().getTime() + (await token).expires_in * 1000); // jetzt + Zeit nach der das Token expired
                this.setState({
                    openIdToken: (await token).access_token,
                    tokenExpiry: expiry,
                });
            }
        }
    };

    // loading API status data
    protected loadMetaData = async (): Promise<void> => {
        this.getAuthToken();
        if (!this.state.openIdToken) {
            return;
        } else {
            try {
                const response = await fetch(this.state.api_url, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${this.state.openIdToken}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                const metaData = await response.json();

                // Save the fetched data to the state
                this.setState({ metaData });
            } catch (error) {
                this.setState({ error: "There was a problem with the fetch operation: " + error });
            }
        }
    };

    //API call to get contact data
    protected loadContactData = async (): Promise<void> => {
        this.getAuthToken();
        if (!this.state.openIdToken) {
            return;
        }
        try {
            const response = await fetch(this.state.api_url + "/v1.0.2/contacts", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${this.state.openIdToken}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                this.setState({ error: "Network response was not ok" });
                throw new Error("Network response was not ok");
            }
            const resData = await response.json();
            // convert times
            for (let index = 0; index < resData.length; index++) {
                if (resData[index].inviteSettings) {
                    resData[index].inviteSettings.start = this.convertFromTimestamp(
                        resData[index].inviteSettings.start,
                    );
                    resData[index].inviteSettings.end = this.convertFromTimestamp(resData[index].inviteSettings.end);
                }
            }

            const sortedContacts = this.sortContacts(resData);
            this.setState({ contacts: sortedContacts });
        } catch (error) {
            this.setState({ error: "There was a problem with the fetch operation: " + error });
        }
    };

    //add a new contact to the whitelist
    protected onSaveContact = async (): Promise<void> => {
        this.getAuthToken();
        if (!this.state.openIdToken) {
            this.setState({ error: "Authentication failed: No OpenID Token found." });
            return;
        }
        const allFieldsValid = await this.verifyFieldsBeforeSubmit();

        if (!allFieldsValid) {
            return;
        }

        // Check if the mxid is already in the contacts
        const mxidExists = this.state.contacts.some((contact) => contact.mxid === this.state.mxid);
        if (mxidExists) {
            this.setState({ error: _t("Contact already added") });
            return;
        }

        try {
            const response = await fetch(this.state.api_url + "/v1.0.2/contacts", {
                method: "POST",
                body: JSON.stringify({
                    displayName: this.state.displayName,
                    mxid: this.state.mxid,
                    inviteSettings: {
                        start: this.convertToTimestamp(this.state.startInvite),
                        end: this.convertToTimestamp(this.state.endInvite),
                    },
                }),
                headers: {
                    "Authorization": `Bearer ${this.state.openIdToken}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                this.setState({ error: "Network response was not ok" });
                throw new Error("Network response was not ok");
            }
            const newContact = await response.json();
            // convert times
            if (newContact.inviteSettings) {
                newContact.inviteSettings.start = this.convertFromTimestamp(newContact.inviteSettings.start);
                newContact.inviteSettings.end = this.convertFromTimestamp(newContact.inviteSettings.end);
            }

            const contactData = this.state.contacts;
            contactData.push(newContact);
            const sortedContacts = this.sortContacts(contactData);
            this.setState({ contacts: sortedContacts });
            this.clearInputFields();
        } catch (error) {
            this.setState({ error: "There was a problem with the fetch operation: " + error });
        }
    };

    protected onDeleteContact = async (name: string, selectedMxid: string): Promise<void> => {
        this.getAuthToken();
        if (!this.state.openIdToken) {
            return;
        }
        try {
            const response = await fetch(`${this.state.api_url}/v1.0.2/contacts/${selectedMxid}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${this.state.openIdToken}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                this.setState({ error: "Network response was not ok" });
                throw new Error("Network response was not ok");
            }
            const contactData = this.state.contacts.filter((contact) => contact.mxid !== selectedMxid);
            this.setState({ contacts: contactData });
        } catch (error) {
            this.setState({ error: "There was a problem with the fetch operation: " + error });
        }
    };

    protected onEditContact = async (name: string, selectedMxid: string, start: string, end: string): Promise<void> => {
        this.getAuthToken();
        if (!this.state.openIdToken) {
            this.setState({ error: "Authentication failed: No OpenID Token found." });
            return;
        }
        try {
            const response = await fetch(`${this.state.api_url}/v1.0.2/contacts`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${this.state.openIdToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    displayName: name,
                    mxid: selectedMxid,
                    inviteSettings: {
                        start: this.convertToTimestamp(start),
                        end: this.convertToTimestamp(end),
                    },
                }),
            });

            if (!response.ok) {
                this.setState({ error: "Network response was not ok" });
                throw new Error("Network response was not ok");
            }

            const editContacts = this.state.contacts.map((contact) => {
                if (contact.mxid === selectedMxid) {
                    return {
                        ...contact,
                        displayName: name,
                    };
                } else {
                    return contact;
                }
            });

            const sortedContacts = this.sortContacts(editContacts);
            this.setState({ contacts: sortedContacts });
        } catch (error) {
            this.setState({ error: "There was a problem with the fetch operation: " + error });
        }
    };

    public componentDidMount(): void {
        this.getAuthToken().then(this.loadMetaData).then(this.loadContactData);
    }

    private onInsertMXID = (ev: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({
            mxid: ev.target.value,
            error: null,
        });
    };

    private onInsertContactName = (ev: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({
            displayName: ev.target.value,
            error: null,
        });
    };

    private onInsertStartInvite = (ev: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({
            startInvite: ev.target.value,
            error: null,
        });
    };

    private onInsertEndInvite = (ev: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({
            endInvite: ev.target.value,
            error: null,
        });
    };

    private onUsernameValidate = async (fieldState: IFieldState): Promise<IValidationResult> => {
        const result = await this.validateUsername(fieldState);
        this.markFieldValid(FIELD_USERNAME, result.valid);
        return result;
    };

    private validateUsername = withValidation({
        rules: [
            {
                key: "required",
                test: ({ value, allowEmpty }): boolean | Promise<boolean> => allowEmpty || !!value,
                invalid: (): string | null => _t("Name can't be empty"),
            },
        ],
    });

    private onMxidValidate = async (fieldState: IFieldState): Promise<IValidationResult> => {
        const result = await this.validateMxidRules(fieldState);
        this.markFieldValid(FIELD_MXID, result.valid);
        return result;
    };

    private validateMxidRules = withValidation({
        rules: [
            {
                key: "required",
                test: ({ value, allowEmpty }): boolean | Promise<boolean> => allowEmpty || !!value,
                invalid: (): string | null => _t("MXID can't be empty"),
            },
            {
                key: "pattern",
                test({ value }): boolean | Promise<boolean> {
                    return /@[a-z0-9-_.]{1,248}:(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/.test(
                        value!,
                    );
                },
                invalid: (): string | null => _t("wrong MXID format"),
            },
        ],
    });

    private markFieldValid(fieldID: FieldType, valid?: boolean): void {
        const { fieldValid } = this.state;
        fieldValid[fieldID] = valid;
        this.setState({
            fieldValid,
        });
    }

    private async verifyFieldsBeforeSubmit(): Promise<boolean> {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement) {
            activeElement.blur();
        }

        const fieldIDsInDisplayOrder: FieldType[] = [FIELD_USERNAME, FIELD_MXID];

        for (const fieldID of fieldIDsInDisplayOrder) {
            const field = this[fieldID];
            if (!field) {
                continue;
            }

            await field.validate({ allowEmpty: false });
        }

        await new Promise<void>((resolve) => this.setState({}, resolve));

        if (this.allFieldsValid()) {
            return true;
        }

        const invalidField = this.findFirstInvalidField(fieldIDsInDisplayOrder);

        if (!invalidField) {
            return true;
        }

        invalidField.focus();
        invalidField.validate({ allowEmpty: false, focused: true });
        return false;
    }

    private allFieldsValid(): boolean {
        return Object.values(this.state.fieldValid).every(Boolean);
    }

    private findFirstInvalidField(fieldIDs: FieldType[]): Field | null {
        for (const fieldID of fieldIDs) {
            if (!this.state.fieldValid[fieldID] && this[fieldID]) {
                return this[fieldID];
            }
        }
        return null;
    }

    private clearInputFields = (): void => {
        this.setState({
            mxid: "",
            displayName: "",
            error: null,
            startInvite: "",
            endInvite: "",
        });
    };

    private sortContacts = (resource: any): any[] => {
        resource.sort((a: { displayName: string }, b: { displayName: string }) => {
            const nameA = a.displayName.toUpperCase(); // ignore upper and lowercase
            const nameB = b.displayName.toUpperCase(); // ignore upper and lowercase
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        });
        return resource;
    };

    public render(): React.ReactNode {
        return (
            <form className="mx_ProfileSettings" style={{ borderBottom: "0 none" }}>
                {this.state.error !== null ? (
                    <div className="aw_WhitelistPanel_warningContainer">
                        <Icon icon="triangleExclamation" />
                        <span>{this.state.error}</span>
                    </div>
                ) : null}
                <div
                    style={{
                        border: "2px solid #e0e2e7",
                        borderRadius: "16px",
                        padding: "16px",
                        gap: "8px",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <Field
                        ref={(field): Field | null => (this[FIELD_USERNAME] = field)}
                        type="text"
                        label={_t("Insert contact name")}
                        value={this.state.displayName}
                        onChange={this.onInsertContactName}
                        onValidate={this.onUsernameValidate}
                    />
                    <Field
                        ref={(field): Field | null => (this[FIELD_MXID] = field)}
                        type="text"
                        label={_t("Insert MXID")}
                        value={this.state.mxid}
                        onChange={this.onInsertMXID}
                        onValidate={this.onMxidValidate}
                    />
                    <Field
                        element="input"
                        type="date"
                        onInput={this.onInsertStartInvite}
                        value={this.state.startInvite}
                        label={_t("Starting time")}
                    />
                    <Field
                        element="input"
                        type="date"
                        onChange={this.onInsertEndInvite}
                        value={this.state.endInvite}
                        label={_t("Ending time")}
                    />
                    <div className="mx_ProfileSettings_buttons" style={{ marginBottom: "0", marginTop: "8px" }}>
                        <AccessibleButton onClick={this.onSaveContact} kind="primary">
                            {_t("Add to whitelist")}
                        </AccessibleButton>
                        {this.state.displayName != "" || this.state.mxid != "" ? (
                            <AccessibleButton
                                onClick={this.clearInputFields}
                                kind="link"
                                style={{ marginInlineEnd: 0, marginInlineStart: "10px" }}
                            >
                                {_t("Clear fields")}
                            </AccessibleButton>
                        ) : null}
                    </div>
                </div>
                <WhitelistTable
                    isInputEmpty={this.state.contacts.length === 0}
                    rows={this.state.contacts}
                    editContact={this.onEditContact}
                    deleteContact={this.onDeleteContact}
                />
            </form>
        );
    }
}
