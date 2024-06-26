/*
Copyright 2019 - 2023 The Matrix.org Foundation C.I.C.
Copyright 2024 Awesome Technologies Innovationslabor GmbH

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

// ORIGINAL CODE
// https://github.com/matrix-org/matrix-react-sdk/blob/v3.79.0/src/components/views/settings/tabs/user/HelpUserSettingsTab.tsx
// ORIGINAL PATH
// matrix-react-sdk/src/components/views/settings/tabs/user/

import React, { ReactNode } from "react";
import { logger } from "matrix-js-sdk/src/logger";
import AccessibleButton from "matrix-react-sdk/src/components/views/elements/AccessibleButton";
import { _t, getCurrentLanguage } from "matrix-react-sdk/src/languageHandler";
import SdkConfig from "matrix-react-sdk/src/SdkConfig";
import createRoom from "matrix-react-sdk/src/createRoom";
import Modal from "matrix-react-sdk/src/Modal";
import PlatformPeg from "matrix-react-sdk/src/PlatformPeg";
import UpdateCheckButton from "matrix-react-sdk/src/components/views/settings/UpdateCheckButton";
import BugReportDialog from "matrix-react-sdk/src/components/views/dialogs/BugReportDialog";
import CopyableText from "matrix-react-sdk/src/components/views/elements/CopyableText";
import SettingsTab from "matrix-react-sdk/src/components/views/settings/tabs/SettingsTab";
import { SettingsSection } from "matrix-react-sdk/src/components/views/settings/shared/SettingsSection";
import SettingsSubsection, {
    SettingsSubsectionText,
} from "matrix-react-sdk/src/components/views/settings/shared/SettingsSubsection";
import ExternalLink from "matrix-react-sdk/src/components/views/elements/ExternalLink";
import MatrixClientContext from "matrix-react-sdk/src/contexts/MatrixClientContext";

import VectorBasePlatform from "../../../../../vector/platform/VectorBasePlatform";

interface IProps {
    closeSettingsFn: () => void;
}

interface IState {
    appVersion: string | null;
    basedOnVersion: string | null;
    productTypeVersion: string | null;
    canUpdate: boolean;
}

export default class HelpUserSettingsTab extends React.Component<IProps, IState> {
    public static contextType = MatrixClientContext;
    public context!: React.ContextType<typeof MatrixClientContext>;

    public constructor(props: IProps) {
        super(props);

        this.state = {
            appVersion: null,
            basedOnVersion: null,
            productTypeVersion: null,
            canUpdate: false,
        };
    }

    public componentDidMount(): void {
        const platform = PlatformPeg.get() as VectorBasePlatform;
        platform
            .getAppVersion()
            .then((ver) => this.setState({ appVersion: ver }))
            .catch((e) => {
                logger.error("Error getting product version: ", e);
            });
        platform
            .getBasedOnVersion()
            .then((ver) => this.setState({ basedOnVersion: ver }))
            .catch((e) => {
                logger.error("Error getting vector version: ", e);
            });
        platform
            .getProductTypeVersion()
            .then((ver) => this.setState({ productTypeVersion: ver }))
            .catch((e) => {
                logger.error("Error getting product type version: ", e);
            });
        platform
            .canSelfUpdate()
            .then((v) => this.setState({ canUpdate: v }))
            .catch((e) => {
                logger.error("Error getting self updatability: ", e);
            });
    }

    private getVersionInfo(): {
        appVersion: string;
        basedOnVersion: string;
        olmVersion: string;
        manufacturerId: string;
        shortProductName: string;
        productType: string;
        productTypeVersion: string;
    } {
        const brand = SdkConfig.get().brand;
        const appVersion = this.state.appVersion || "unknown";
        const basedOnVersion = this.state.basedOnVersion || "unknown";
        const productTypeVersion = this.state.productTypeVersion || "unknown";
        const olmVersionTuple = this.context.olmVersion;
        const olmVersion = olmVersionTuple
            ? `${olmVersionTuple[0]}.${olmVersionTuple[1]}.${olmVersionTuple[2]}`
            : "<not-enabled>";

        return {
            appVersion: `${_t("%(brand)s version:", { brand })} ${appVersion}`,
            basedOnVersion: `${_t("based on Element version:")} ${basedOnVersion}`,
            olmVersion: `${_t("Olm version:")} ${olmVersion}`,
            manufacturerId: `${_t("Manufacturer ID:")} AWESO`,
            shortProductName: `${_t("Short product name:")} AMP_TI-M`,
            productType: `${_t("Product type:")} TI-Messenger-Client`,
            productTypeVersion: `${_t("Product type version:")} ${productTypeVersion}`,
        };
    }

    private onClearCacheAndReload = (): void => {
        if (!PlatformPeg.get()) return;

        // Dev note: please keep this log line, it's useful when troubleshooting a MatrixClient suddenly
        // stopping in the middle of the logs.
        logger.log("Clear cache & reload clicked");
        this.context.stopClient();
        this.context.store.deleteAllData().then(() => {
            PlatformPeg.get()?.reload();
        });
    };

    private onBugReport = (): void => {
        Modal.createDialog(BugReportDialog, {});
    };

    private onStartBotChat = (): void => {
        this.props.closeSettingsFn();
        createRoom(this.context, {
            dmUserId: SdkConfig.get("welcome_user_id"),
            andView: true,
        });
    };

    private renderLegal(): ReactNode {
        const tocLinks = SdkConfig.get().terms_and_conditions_links;
        if (!tocLinks) return null;

        const legalLinks: JSX.Element[] = [];
        for (const tocEntry of tocLinks) {
            legalLinks.push(
                <div key={tocEntry.url}>
                    <ExternalLink href={tocEntry.url}>{tocEntry.text}</ExternalLink>
                </div>,
            );
        }

        return (
            <SettingsSubsection heading={_t("Legal")}>
                <SettingsSubsectionText>{legalLinks}</SettingsSubsectionText>
            </SettingsSubsection>
        );
    }

    private renderCredits(): JSX.Element {
        // Note: This is not translated because it is legal text.
        // Also, &nbsp; is ugly but necessary.
        return (
            <SettingsSubsection heading={_t("Credits")}>
                <SettingsSubsectionText>
                    <ul>
                        <li>
                            {_t(
                                "The <colr>twemoji-colr</colr> font is © <author>Mozilla Foundation</author> " +
                                    "used under the terms of <terms>Apache 2.0</terms>.",
                                {},
                                {
                                    colr: (sub) => (
                                        <ExternalLink
                                            href="https://github.com/matrix-org/twemoji-colr"
                                            rel="noreferrer noopener"
                                            target="_blank"
                                        >
                                            {sub}
                                        </ExternalLink>
                                    ),
                                    author: (sub) => <ExternalLink href="https://mozilla.org">{sub}</ExternalLink>,
                                    terms: (sub) => (
                                        <ExternalLink
                                            href="https://www.apache.org/licenses/LICENSE-2.0"
                                            rel="noreferrer noopener"
                                            target="_blank"
                                        >
                                            {sub}
                                        </ExternalLink>
                                    ),
                                },
                            )}
                        </li>
                        <li>
                            {_t(
                                "The <twemoji>Twemoji</twemoji> emoji art is © " +
                                    "<author>Twitter, Inc and other contributors</author> used under the terms of " +
                                    "<terms>CC-BY 4.0</terms>.",
                                {},
                                {
                                    twemoji: (sub) => (
                                        <ExternalLink href="https://twemoji.twitter.com/">{sub}</ExternalLink>
                                    ),
                                    author: (sub) => (
                                        <ExternalLink href="https://twemoji.twitter.com/">{sub}</ExternalLink>
                                    ),
                                    terms: (sub) => (
                                        <ExternalLink
                                            href="https://creativecommons.org/licenses/by/4.0/"
                                            rel="noreferrer noopener"
                                            target="_blank"
                                        >
                                            {sub}
                                        </ExternalLink>
                                    ),
                                },
                            )}
                        </li>
                    </ul>
                </SettingsSubsectionText>
            </SettingsSubsection>
        );
    }

    private getVersionTextToCopy = (): string => {
        const {
            appVersion,
            basedOnVersion,
            shortProductName,
            manufacturerId,
            productType,
            productTypeVersion,
            olmVersion,
        } = this.getVersionInfo();
        return `${appVersion}\n${basedOnVersion}\n${shortProductName}\n${manufacturerId}\n${productType}\n${productTypeVersion}\n${olmVersion}`;
    };

    public render(): React.ReactNode {
        const brand = SdkConfig.get().brand;

        let faqText = _t(
            "For help with using %(brand)s, click <a>here</a>.",
            {
                brand,
            },
            {
                a: (sub) => <ExternalLink href={SdkConfig.get("help_url")}>{sub}</ExternalLink>,
            },
        );
        if (SdkConfig.get("welcome_user_id") && getCurrentLanguage().startsWith("en")) {
            faqText = (
                <div>
                    {_t(
                        "For help with using %(brand)s, click <a>here</a> or start a chat with our " +
                            "bot using the button below.",
                        {
                            brand,
                        },
                        {
                            a: (sub) => (
                                <ExternalLink
                                    href={SdkConfig.get("help_url")}
                                    rel="noreferrer noopener"
                                    target="_blank"
                                >
                                    {sub}
                                </ExternalLink>
                            ),
                        },
                    )}
                    <div>
                        <AccessibleButton onClick={this.onStartBotChat} kind="primary">
                            {_t("Chat with %(brand)s Bot", { brand })}
                        </AccessibleButton>
                    </div>
                </div>
            );
        }

        let updateButton: JSX.Element | undefined;
        if (this.state.canUpdate) {
            updateButton = <UpdateCheckButton />;
        }

        let bugReportingSection;
        if (SdkConfig.get().bug_report_endpoint_url) {
            bugReportingSection = (
                <SettingsSubsection
                    heading={_t("Bug reporting")}
                    description={
                        <>
                            <SettingsSubsectionText>
                                {_t(
                                    "If you've submitted a bug via GitHub, debug logs can help " +
                                        "us track down the problem. ",
                                )}
                            </SettingsSubsectionText>
                            {_t(
                                "Debug logs contain application " +
                                    "usage data including your username, the IDs or aliases of " +
                                    "the rooms you have visited, which UI elements you " +
                                    "last interacted with, and the usernames of other users. " +
                                    "They do not contain messages.",
                            )}
                        </>
                    }
                >
                    <AccessibleButton onClick={this.onBugReport} kind="primary">
                        {_t("Submit debug logs")}
                    </AccessibleButton>
                    <SettingsSubsectionText>
                        {_t(
                            "To report a Matrix-related security issue, please read the Matrix.org " +
                                "<a>Security Disclosure Policy</a>.",
                            {},
                            {
                                a: (sub) => (
                                    <ExternalLink href="https://matrix.org/security-disclosure-policy/">
                                        {sub}
                                    </ExternalLink>
                                ),
                            },
                        )}
                    </SettingsSubsectionText>
                </SettingsSubsection>
            );
        }

        const {
            appVersion,
            basedOnVersion,
            shortProductName,
            manufacturerId,
            productType,
            productTypeVersion,
            olmVersion,
        } = this.getVersionInfo();

        return (
            <SettingsTab>
                <SettingsSection heading={_t("Help & About")}>
                    {bugReportingSection}
                    <SettingsSubsection heading={_t("FAQ")} description={faqText} />
                    <SettingsSubsection heading={_t("Versions")}>
                        <SettingsSubsectionText>
                            <CopyableText getTextToCopy={this.getVersionTextToCopy}>
                                {appVersion}
                                <br />
                                {basedOnVersion}
                                <br />
                                {shortProductName}
                                <br />
                                {manufacturerId}
                                <br />
                                {productType}
                                <br />
                                {productTypeVersion}
                                <br />
                                {olmVersion}
                                <br />
                            </CopyableText>
                            {updateButton}
                        </SettingsSubsectionText>
                    </SettingsSubsection>
                    {this.renderLegal()}
                    {this.renderCredits()}
                    <SettingsSubsection heading={_t("Advanced")}>
                        <SettingsSubsectionText>
                            {_t(
                                "Homeserver is <code>%(homeserverUrl)s</code>",
                                {
                                    homeserverUrl: this.context.getHomeserverUrl(),
                                },
                                {
                                    code: (sub) => <code>{sub}</code>,
                                },
                            )}
                        </SettingsSubsectionText>
                        {this.context.getIdentityServerUrl() && (
                            <SettingsSubsectionText>
                                {_t(
                                    "Identity server is <code>%(identityServerUrl)s</code>",
                                    {
                                        identityServerUrl: this.context.getIdentityServerUrl(),
                                    },
                                    {
                                        code: (sub) => <code>{sub}</code>,
                                    },
                                )}
                            </SettingsSubsectionText>
                        )}
                        <SettingsSubsectionText>
                            <details>
                                <summary>{_t("Access Token")}</summary>
                                <b>
                                    {_t(
                                        "Your access token gives full access to your account." +
                                            " Do not share it with anyone.",
                                    )}
                                </b>
                                <CopyableText getTextToCopy={(): string | null => this.context.getAccessToken()}>
                                    {this.context.getAccessToken()}
                                </CopyableText>
                            </details>
                        </SettingsSubsectionText>
                        <AccessibleButton onClick={this.onClearCacheAndReload} kind="danger">
                            {_t("Clear cache and reload")}
                        </AccessibleButton>
                    </SettingsSubsection>
                </SettingsSection>
            </SettingsTab>
        );
    }
}
