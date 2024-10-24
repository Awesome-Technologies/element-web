/*
Copyright 2024 Awesome Technologies Innovationslabor GmbH
Copyright 2019-2024 New Vector Ltd.
Copyright 2019 The Matrix.org Foundation C.I.C.
Copyright 2019 Michael Telatynski <7t3chguy@gmail.com>

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only
Please see LICENSE files in the repository root for full details.
*/

// ORIGINAL CODE
// https://github.com/element-hq/matrix-react-sdk/blob/v3.113.0/src/components/views/settings/tabs/user/AccountUserSettingsTab.tsx
// ORIGINAL PATH
// matrix-react-sdk/src/components/views/settings/tabs/user

import React, { useCallback, useContext, useEffect } from "react";
import { HTTPError } from "matrix-js-sdk/src/matrix";
import { logger } from "matrix-js-sdk/src/logger";
import { UserFriendlyError, _t } from "matrix-react-sdk/src/languageHandler";
import UserProfileSettings from "matrix-react-sdk/src/components/views/settings/UserProfileSettings";
import SettingsStore from "matrix-react-sdk/src/settings/SettingsStore";
import AccessibleButton from "matrix-react-sdk/src/components/views/elements/AccessibleButton";
import DeactivateAccountDialog from "matrix-react-sdk/src/components/views/dialogs/DeactivateAccountDialog";
import Modal from "matrix-react-sdk/src/Modal";
import { UIFeature } from "matrix-react-sdk/src/settings/UIFeature";
import ErrorDialog, { extractErrorMessageFromError } from "matrix-react-sdk/src/components/views/dialogs/ErrorDialog";
import ChangePassword from "matrix-react-sdk/src/components/views/settings/ChangePassword";
import SettingsTab from "matrix-react-sdk/src/components/views/settings/tabs/SettingsTab";
import { SettingsSection } from "matrix-react-sdk/src/components/views/settings/shared/SettingsSection";
import SettingsSubsection, {
    SettingsSubsectionText,
} from "matrix-react-sdk/src/components/views/settings/shared/SettingsSubsection";
import { SDKContext } from "matrix-react-sdk/src/contexts/SDKContext";
import UserPersonalInfoSettings from "matrix-react-sdk/src/components/views/settings/UserPersonalInfoSettings";
import { useMatrixClientContext } from "matrix-react-sdk/src/contexts/MatrixClientContext";
import QRCode from "matrix-react-sdk/src/components/views/elements/QRCode";
import { MatrixClientPeg } from "matrix-react-sdk/src/MatrixClientPeg";
import { OwnProfileStore } from "matrix-react-sdk/src/stores/OwnProfileStore";

interface IProps {
    closeSettingsFn: () => void;
}

interface AccountSectionProps {
    canChangePassword: boolean;
    onPasswordChangeError: (e: Error) => void;
    onPasswordChanged: () => void;
}

const AccountSection: React.FC<AccountSectionProps> = ({
    canChangePassword,
    onPasswordChangeError,
    onPasswordChanged,
}) => {
    if (!canChangePassword) return <></>;

    return (
        <>
            <SettingsSubsection
                heading={_t("settings|general|account_section")}
                stretchContent
                data-testid="accountSection"
            >
                <SettingsSubsectionText>{_t("settings|general|password_change_section")}</SettingsSubsectionText>
                <ChangePassword
                    rowClassName=""
                    buttonKind="primary"
                    onError={onPasswordChangeError}
                    onFinished={onPasswordChanged}
                />
            </SettingsSubsection>
        </>
    );
};

interface ManagementSectionProps {
    onDeactivateClicked: () => void;
}

const ManagementSection: React.FC<ManagementSectionProps> = ({ onDeactivateClicked }) => {
    return (
        <SettingsSection heading={_t("settings|general|deactivate_section")}>
            <SettingsSubsection
                heading={_t("settings|general|account_management_section")}
                data-testid="account-management-section"
                description={_t("settings|general|deactivate_warning")}
            >
                <AccessibleButton onClick={onDeactivateClicked} kind="danger">
                    {_t("settings|general|deactivate_section")}
                </AccessibleButton>
            </SettingsSubsection>
        </SettingsSection>
    );
};

const AccountUserSettingsTab: React.FC<IProps> = ({ closeSettingsFn }) => {
    const [externalAccountManagementUrl, setExternalAccountManagementUrl] = React.useState<string | undefined>();
    const [canMake3pidChanges, setCanMake3pidChanges] = React.useState<boolean>(false);
    const [canSetDisplayName, setCanSetDisplayName] = React.useState<boolean>(false);
    const [canSetAvatar, setCanSetAvatar] = React.useState<boolean>(false);
    const [canChangePassword, setCanChangePassword] = React.useState<boolean>(false);

    const cli = useMatrixClientContext();
    const sdkContext = useContext(SDKContext);

    useEffect(() => {
        (async (): Promise<void> => {
            const capabilities = (await cli.getCapabilities()) ?? {};
            const changePasswordCap = capabilities["m.change_password"];

            // You can change your password so long as the capability isn't explicitly disabled. The implicit
            // behaviour is you can change your password when the capability is missing or has not-false as
            // the enabled flag value.
            const canChangePassword = !changePasswordCap || changePasswordCap["enabled"] !== false;

            await sdkContext.oidcClientStore.readyPromise; // wait for the store to be ready
            const externalAccountManagementUrl = sdkContext.oidcClientStore.accountManagementEndpoint;
            // https://spec.matrix.org/v1.7/client-server-api/#m3pid_changes-capability
            // We support as far back as v1.1 which doesn't have m.3pid_changes
            // so the behaviour for when it is missing has to be assume true
            const canMake3pidChanges =
                !capabilities["m.3pid_changes"] || capabilities["m.3pid_changes"].enabled === true;

            const canSetDisplayName =
                !capabilities["m.set_displayname"] || capabilities["m.set_displayname"].enabled === true;
            const canSetAvatar = !capabilities["m.set_avatar_url"] || capabilities["m.set_avatar_url"].enabled === true;

            setCanMake3pidChanges(canMake3pidChanges);
            setCanSetDisplayName(canSetDisplayName);
            setCanSetAvatar(canSetAvatar);
            setExternalAccountManagementUrl(externalAccountManagementUrl);
            setCanChangePassword(canChangePassword);
        })();
    }, [cli, sdkContext.oidcClientStore]);

    const onPasswordChangeError = useCallback((err: Error): void => {
        logger.error("Failed to change password: " + err);

        let underlyingError = err;
        if (err instanceof UserFriendlyError && err.cause instanceof Error) {
            underlyingError = err.cause;
        }

        const errorMessage = extractErrorMessageFromError(
            err,
            _t("settings|general|error_password_change_unknown", {
                stringifiedError: String(err),
            }),
        );

        let errorMessageToDisplay = errorMessage;
        if (underlyingError instanceof HTTPError && underlyingError.httpStatus === 403) {
            errorMessageToDisplay = _t("settings|general|error_password_change_403");
        } else if (underlyingError instanceof HTTPError) {
            errorMessageToDisplay = _t("settings|general|error_password_change_http", {
                errorMessage,
                httpStatus: underlyingError.httpStatus,
            });
        }

        // TODO: Figure out a design that doesn't involve replacing the current dialog
        Modal.createDialog(ErrorDialog, {
            title: _t("settings|general|error_password_change_title"),
            description: errorMessageToDisplay,
        });
    }, []);

    const onPasswordChanged = useCallback((): void => {
        const description = _t("settings|general|password_change_success");
        // TODO: Figure out a design that doesn't involve replacing the current dialog
        Modal.createDialog(ErrorDialog, {
            title: _t("common|success"),
            description,
        });
    }, []);

    const onDeactivateClicked = useCallback((): void => {
        Modal.createDialog(DeactivateAccountDialog, {
            onFinished: (success) => {
                if (success) closeSettingsFn();
            },
        });
    }, [closeSettingsFn]);

    let accountManagementSection: JSX.Element | undefined;
    const isAccountManagedExternally = Boolean(externalAccountManagementUrl);
    if (SettingsStore.getValue(UIFeature.Deactivate) && !isAccountManagedExternally) {
        accountManagementSection = <ManagementSection onDeactivateClicked={onDeactivateClicked} />;
    }

    // construct qr code
    const userId = MatrixClientPeg.safeGet().getSafeUserId();
    const displayName = OwnProfileStore.instance.displayName;
    const firstName = displayName?.split(", ")[1];
    const lastName = displayName?.split(", ")[0];
    const matrixId = userId.replace("@", "matrix:u/");
    const qrCodeText = `BEGIN:VCARD
VERSION:4.0
N:${lastName};${firstName};;;
FN:${firstName} ${lastName}
IMPP:${matrixId}
END:VCARD`;

    return (
        <SettingsTab data-testid="mx_AccountUserSettingsTab">
            <SettingsSection>
                <UserProfileSettings
                    externalAccountManagementUrl={externalAccountManagementUrl}
                    canSetDisplayName={canSetDisplayName}
                    canSetAvatar={canSetAvatar}
                />
                {_t("tim|settings|contact_qr")}
                <QRCode data={qrCodeText} className="contactQrCode" />
                <UserPersonalInfoSettings canMake3pidChanges={canMake3pidChanges} />
                <AccountSection
                    canChangePassword={canChangePassword}
                    onPasswordChanged={onPasswordChanged}
                    onPasswordChangeError={onPasswordChangeError}
                />
            </SettingsSection>
            {accountManagementSection}
        </SettingsTab>
    );
};

export default AccountUserSettingsTab;
