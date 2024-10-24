/*
Copyright 2024 Awesome Technologies Innovationslabor GmbH
Copyright 2024 New Vector Ltd.
Copyright 2019-2023 The Matrix.org Foundation C.I.C.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only
Please see LICENSE files in the repository root for full details.
*/

// ORIGINAL CODE
// https://github.com/element-hq/matrix-react-sdk/blob/v3.113.0/src/components/views/settings/tabs/user/HelpUserSettingsTab.tsx
// ORIGINAL PATH
// matrix-react-sdk/src/components/views/settings/tabs/user/

import React, { ReactNode } from "react";
import { logger } from "matrix-js-sdk/src/logger";
import AccessibleButton from "matrix-react-sdk/src/components/views/elements/AccessibleButton";
import { _t } from "matrix-react-sdk/src/languageHandler";
import SdkConfig from "matrix-react-sdk/src/SdkConfig";
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

interface IProps {}

interface IState {
    appVersion: string | null;
    basedOnVersion: string | null;
    productTypeVersion: string | null;
    canUpdate: boolean;
}

export default class HelpUserSettingsTab extends React.Component<IProps, IState> {
    public static contextType = MatrixClientContext;
    public declare context: React.ContextType<typeof MatrixClientContext>;

    public constructor(props: IProps, context: React.ContextType<typeof MatrixClientContext>) {
        super(props, context);

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
        cryptoVersion: string;
        manufacturerId: string;
        shortProductName: string;
        productType: string;
        productTypeVersion: string;
    } {
        const brand = SdkConfig.get().brand;
        const appVersion = this.state.appVersion || "unknown";
        const basedOnVersion = this.state.basedOnVersion || "unknown";
        const productTypeVersion = this.state.productTypeVersion || "unknown";
        const cryptoVersion = this.context.getCrypto()?.getVersion() ?? "<not-enabled>";

        return {
            appVersion: `${_t("setting|help_about|brand_version", { brand })} ${appVersion}`,
            basedOnVersion: `${_t("tim|info|based_on_version")} ${basedOnVersion}`,
            cryptoVersion: `${_t("setting|help_about|crypto_version")} ${cryptoVersion}`,
            manufacturerId: `${_t("tim|info|manufacturer")} AWESO`,
            shortProductName: `${_t("tim|info|short_name")} AMP_TI-M`,
            productType: `${_t("tim|info|type")} TI-Messenger-Client`,
            productTypeVersion: `${_t("tim|info|type_version")} ${productTypeVersion}`,
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
            <SettingsSubsection heading={_t("common|legal")}>
                <SettingsSubsectionText>{legalLinks}</SettingsSubsectionText>
            </SettingsSubsection>
        );
    }

    private renderCredits(): JSX.Element {
        // Note: This is not translated because it is legal text.
        // Also, &nbsp; is ugly but necessary.
        return (
            <SettingsSubsection heading={_t("common|credits")}>
                <SettingsSubsectionText>
                    <ul>
                        <li>
                            {_t(
                                "credits|twemoji_colr",
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
                                "credits|twemoji",
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
            cryptoVersion,
        } = this.getVersionInfo();
        return `${appVersion}\n${basedOnVersion}\n${shortProductName}\n${manufacturerId}\n${productType}\n${productTypeVersion}\n${cryptoVersion}`;
    };

    public render(): React.ReactNode {
        const brand = SdkConfig.get().brand;

        const faqText = _t(
            "setting|help_about|help_link",
            {
                brand,
            },
            {
                a: (sub) => <ExternalLink href={SdkConfig.get("help_url")}>{sub}</ExternalLink>,
            },
        );

        let updateButton: JSX.Element | undefined;
        if (this.state.canUpdate) {
            updateButton = <UpdateCheckButton />;
        }

        let bugReportingSection;
        if (SdkConfig.get().bug_report_endpoint_url) {
            bugReportingSection = (
                <SettingsSubsection
                    heading={_t("bug_reporting|title")}
                    description={
                        <>
                            <SettingsSubsectionText>{_t("bug_reporting|introduction")}</SettingsSubsectionText>
                            {_t("bug_reporting|description")}
                        </>
                    }
                >
                    <AccessibleButton onClick={this.onBugReport} kind="primary_outline">
                        {_t("bug_reporting|submit_debug_logs")}
                    </AccessibleButton>
                    <SettingsSubsectionText>
                        {_t(
                            "bug_reporting|matrix_security_issue",
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
            cryptoVersion,
        } = this.getVersionInfo();

        return (
            <SettingsTab>
                <SettingsSection>
                    {bugReportingSection}
                    <SettingsSubsection heading={_t("common|faq")} description={faqText} />
                    <SettingsSubsection heading={_t("setting|help_about|versions")}>
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
                                {cryptoVersion}
                                <br />
                            </CopyableText>
                            {updateButton}
                        </SettingsSubsectionText>
                    </SettingsSubsection>
                    {this.renderLegal()}
                    {this.renderCredits()}
                    <SettingsSubsection heading={_t("common|advanced")}>
                        <SettingsSubsectionText>
                            {_t(
                                "setting|help_about|homeserver",
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
                                    "setting|help_about|identity_server",
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
                                <summary className="mx_HelpUserSettingsTab_accessTokenDetails">
                                    {_t("common|access_token")}
                                </summary>
                                <strong>{_t("setting|help_about|access_token_detail")}</strong>
                                <CopyableText getTextToCopy={() => this.context.getAccessToken()}>
                                    {this.context.getAccessToken()}
                                </CopyableText>
                            </details>
                        </SettingsSubsectionText>
                        <AccessibleButton onClick={this.onClearCacheAndReload} kind="danger_outline">
                            {_t("setting|help_about|clear_cache_reload")}
                        </AccessibleButton>
                    </SettingsSubsection>
                </SettingsSection>
            </SettingsTab>
        );
    }
}
