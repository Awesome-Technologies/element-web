/*
Copyright 2023 - 2024 Awesome Technologies Innovationslabor GmbH
Copyright 2019 New Vector Ltd
Copyright 2019 - 2021 The Matrix.org Foundation C.I.C.

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

// matrix-react-sdk/src/components/views/settings/tabs/user/
import LabelledToggleSwitch from "matrix-react-sdk/src/components/views/elements/LabelledToggleSwitch";
import React from "react";
import SettingsTab from "matrix-react-sdk/src/components/views/settings/tabs/SettingsTab";
import { SettingsSection } from "matrix-react-sdk/src/components/views/settings/shared/SettingsSection";
import { SettingsSubsectionText } from "matrix-react-sdk/src/components/views/settings/shared/SettingsSubsection";
import AccessibleButton from "matrix-react-sdk/src/components/views/elements/AccessibleButton";
import { _t } from "matrix-react-sdk/src/languageHandler";
import Spinner from "matrix-react-sdk/src/components/views/elements/Spinner";
import { Endpoint } from "fhir/r4";
import { MatrixClientPeg } from "matrix-react-sdk/src/MatrixClientPeg";

import { FHIRContext } from "../../../../context/FHIRContext";
import WhitelistPanel from "../../../dialogs/WhitelistPanel";

interface IState {
    visibility: boolean;
    loggedIn: boolean;
    loginInProgress: boolean;
    pollCount: number;
    errorText: string;
    contactAdded: boolean;
    contacts: Endpoint[];
}

export default class FhirSettingsTab extends React.Component<any, IState> {
    private unmounted = false;
    public static contextType = FHIRContext;
    private timer: any = null;

    public constructor(props: any) {
        super(props);

        this.state = {
            visibility: false,
            loggedIn: true,
            loginInProgress: false,
            pollCount: 0,
            errorText: "",
            contactAdded: false,
            contacts: [],
        };
    }

    public async componentDidMount(): Promise<void> {
        if (this.unmounted) return;
        // check if owner is already logged in
        const fhirContext = this.context;
        const loggedIn = await fhirContext.isOwnerLoggedIn();
        let isContactAdded = false;
        let visibility = false;
        let contacts = [];
        if (loggedIn) {
            // check if there is a contact with the mxid of this session
            contacts = await fhirContext.getContact();

            const ownMxid = this.getOwnMxidUri();
            const endpointIndex = contacts.findIndex((endpoint: Endpoint) => endpoint.address === ownMxid);
            if (endpointIndex != -1) {
                isContactAdded = true;
                if (contacts[endpointIndex].status === "active") {
                    visibility = true;
                }
            }
        } else {
            isContactAdded = false;
        }

        this.setState({ loggedIn: loggedIn, contacts: contacts, contactAdded: isContactAdded, visibility: visibility });
    }

    public componentWillUnmount(): void {
        this.unmounted = true;
    }

    private getOwnMxidUri = (): string => {
        const userId = MatrixClientPeg.get()?.getUserId();
        const ownMxid = "matrix:u/" + userId!.split("@")[1];
        return ownMxid;
    };

    private onLogin = async (): Promise<void> => {
        const fhirContext = this.context;
        this.setState({ loginInProgress: true });
        try {
            await fhirContext.ownerLogin();
            // start polling
            this.timer = setInterval(() => this.poll(), 2500);
        } catch (e) {
            console.log(e);
            this.setState({ errorText: _t("tim|settings|start_auth") });
        }
    };

    private onCancelLogin = (): void => {
        this.stopPolling();
        this.setState({ loginInProgress: false, errorText: "" });
    };

    private onVisibilityChange = (checked: boolean): void => {
        const fhirContext = this.context;
        fhirContext.setOwnerVisibility(checked);
        this.setState({ visibility: checked });
    };

    private onAddContactChange = (checked: boolean): void => {
        const fhirContext = this.context;

        fhirContext.setContact(checked);
        this.setState({ contactAdded: checked, visibility: checked });
    };

    private poll = async (): Promise<void> => {
        let pollCount = this.state.pollCount;
        console.log("poll " + pollCount);

        const fhirContext = this.context;
        const result = await fhirContext.pollOwnerLogin();

        // login was successfull
        if (result.statusCode == 200) {
            this.stopPolling();

            // check if mxid is already added to the VZD
            const contacts = await fhirContext.getContact();
            let isContactAdded = false;
            let visibility = false;

            const ownMxid = this.getOwnMxidUri();
            const endpointIndex = contacts.findIndex((endpoint: Endpoint) => endpoint.address === ownMxid);
            if (endpointIndex != -1) {
                isContactAdded = true;
                if (contacts[endpointIndex].status === "active") {
                    visibility = true;
                }
            }

            this.setState({ loggedIn: true, contacts: contacts, contactAdded: isContactAdded, visibility: visibility });
        }

        // on errors or timeout stop polling
        if (
            (result.error && result.error !== "authorization_pending" && result.error !== "slow_down") ||
            pollCount > 30
        ) {
            console.log(result.error);
            this.stopPolling();
            let errorText = _t("tim|settings|auth_failed");
            if (result.error === "no_auth_request_pending") errorText = _t("tim|settings|no_auth");
            // token expired or reached max amount of polls
            if (result.error === "expired_token" || pollCount > 15) errorText = _t("tim|settings|auth_timeout");

            this.setState({ errorText: errorText });
        }

        pollCount += 1;
        this.setState({ pollCount: pollCount });
    };

    private stopPolling = (): void => {
        console.log("Stop polling");
        clearInterval(this.timer);
        this.timer = null;
        this.setState({ pollCount: 0, loginInProgress: false });
    };

    public render(): React.ReactNode {
        const whitelist = (
            <div>
                <SettingsSubsectionText style={{ margin: "0px 0px 10px 0px", fontSize: "13px" }}>
                    {_t("tim|settings|add_to_whitelist")}
                </SettingsSubsectionText>
                <WhitelistPanel />
            </div>
        );

        const ownMxid = this.getOwnMxidUri();
        const otherEndpoints = this.state.contacts.map((endpoint) => {
            if (endpoint.address == ownMxid) return;
            return (
                <li key={endpoint.id}>
                    {endpoint.name}: {endpoint.address}
                </li>
            );
        });

        const fhirVzdContent = [];
        if (!this.state.loggedIn) {
            if (this.state.loginInProgress) {
                // show spinner and poll for updates
                fhirVzdContent.push(
                    <>
                        <Spinner w={40} h={40} />
                        <AccessibleButton
                            kind="danger"
                            key="cancel"
                            onClick={this.onCancelLogin}
                            className="mx_InviteDialog_goButton"
                        >
                            {_t("tim|settings|cancel")}
                        </AccessibleButton>
                    </>,
                );
            } else {
                // show button to start hba login flow
                fhirVzdContent.push(
                    <AccessibleButton
                        kind="primary"
                        key="login"
                        onClick={this.onLogin}
                        className="mx_InviteDialog_goButton"
                    >
                        {_t("tim|settings|hba_login")}
                    </AccessibleButton>,
                );
            }

            if (this.state.errorText) {
                // style error message
                fhirVzdContent.push(
                    <div className="error" key="error">
                        {this.state.errorText}
                    </div>,
                );
            }
        } else {
            fhirVzdContent.push(
                <>
                    <SettingsSubsectionText>
                        {_t("tim|settings|directory_session")}
                        <br />
                        {`(Mxid: ${ownMxid})`}
                    </SettingsSubsectionText>
                    <LabelledToggleSwitch
                        value={this.state.contactAdded}
                        label={_t("tim|settings|add_own")}
                        caption={_t("tim|settings|add_mxid")}
                        onChange={this.onAddContactChange}
                        disabled={false}
                    />
                    <LabelledToggleSwitch
                        value={this.state.visibility}
                        label={_t("tim|settings|visible")}
                        caption={_t("tim|settings|visibility_desc")}
                        onChange={this.onVisibilityChange}
                        disabled={!this.state.contactAdded}
                    />
                    <div>
                        {_t("tim|settings|other_entries")}
                        <ul>{otherEndpoints}</ul>
                    </div>
                </>,
            );
        }
        return (
            <SettingsTab>
                <SettingsSection heading={_t("tim|settings|whitelist")} key="whitelist" />
                {whitelist}
                <SettingsSection heading={_t("tim|settings|directory")} key="fhirvzd" />
                {fhirVzdContent}
            </SettingsTab>
        );
    }
}
