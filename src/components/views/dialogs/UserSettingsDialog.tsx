/*
Copyright 2019 New Vector Ltd
Copyright 2019 The Matrix.org Foundation C.I.C.
Copyright 2023 Awesome Technologies Innovationslabor GmbH

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

// ORIGINAL PATH
// matrix-react-sdk/src/components/views/dialogs/

import React from "react";
import TabbedView, { Tab } from "matrix-react-sdk/src/components/structures/TabbedView";
import { _t, _td } from "matrix-react-sdk/src/languageHandler";
import GeneralUserSettingsTab from "matrix-react-sdk/src/components/views/settings/tabs/user/GeneralUserSettingsTab";
import SettingsStore, { CallbackFn } from "matrix-react-sdk/src/settings/SettingsStore";
import SecurityUserSettingsTab from "matrix-react-sdk/src/components/views/settings/tabs/user/SecurityUserSettingsTab";
import NotificationUserSettingsTab from "matrix-react-sdk/src/components/views/settings/tabs/user/NotificationUserSettingsTab";
import PreferencesUserSettingsTab from "matrix-react-sdk/src/components/views/settings/tabs/user/PreferencesUserSettingsTab";
import VoiceUserSettingsTab from "matrix-react-sdk/src/components/views/settings/tabs/user/VoiceUserSettingsTab";
import HelpUserSettingsTab from "matrix-react-sdk/src/components/views/settings/tabs/user/HelpUserSettingsTab";
import MjolnirUserSettingsTab from "matrix-react-sdk/src/components/views/settings/tabs/user/MjolnirUserSettingsTab";
import { UIFeature } from "matrix-react-sdk/src/settings/UIFeature";
import BaseDialog from "matrix-react-sdk/src/components/views/dialogs/BaseDialog";
import KeyboardUserSettingsTab from "matrix-react-sdk/src/components/views/settings/tabs/user/KeyboardUserSettingsTab";
import SessionManagerTab from "matrix-react-sdk/src/components/views/settings/tabs/user/SessionManagerTab";
import { NonEmptyArray } from "matrix-react-sdk/src/@types/common";

import { UserTab } from "./UserTab";
import FhirSettings from "../settings/FhirSettings";
import { FHIRContextProvider } from "../../context/FHIRContext";

interface IProps {
    initialTabId?: UserTab;
    onFinished(): void;
}

interface IState {
    mjolnirEnabled: boolean;
}

export default class UserSettingsDialog extends React.Component<IProps, IState> {
    private settingsWatchers: string[] = [];

    public constructor(props: IProps) {
        super(props);

        this.state = {
            mjolnirEnabled: SettingsStore.getValue("feature_mjolnir"),
        };
    }

    public componentDidMount(): void {
        this.settingsWatchers = [SettingsStore.watchSetting("feature_mjolnir", null, this.mjolnirChanged)];
    }

    public componentWillUnmount(): void {
        this.settingsWatchers.forEach((watcherRef) => SettingsStore.unwatchSetting(watcherRef));
    }

    private mjolnirChanged: CallbackFn = (settingName, roomId, atLevel, newValue) => {
        // We can cheat because we know what levels a feature is tracked at, and how it is tracked
        this.setState({ mjolnirEnabled: newValue });
    };

    private getTabs(): NonEmptyArray<Tab<UserTab>> {
        const tabs: Tab<UserTab>[] = [];

        tabs.push(
            new Tab(
                UserTab.General,
                _td("General"),
                "mx_UserSettingsDialog_settingsIcon",
                <GeneralUserSettingsTab closeSettingsFn={this.props.onFinished} />,
                "UserSettingsGeneral",
            ),
        );
        tabs.push(
            new Tab(
                UserTab.FHIRTab,
                _td("Directory"),
                "mx_UserSettingsDialog_FhirIcon",
                <FhirSettings />,
                "UserSettingsAppearance",
            ),
        );
        tabs.push(
            new Tab(
                UserTab.Notifications,
                _td("Notifications"),
                "mx_UserSettingsDialog_bellIcon",
                <NotificationUserSettingsTab />,
                "UserSettingsNotifications",
            ),
        );
        tabs.push(
            new Tab(
                UserTab.Preferences,
                _td("Preferences"),
                "mx_UserSettingsDialog_preferencesIcon",
                <PreferencesUserSettingsTab closeSettingsFn={this.props.onFinished} />,
                "UserSettingsPreferences",
            ),
        );
        tabs.push(
            new Tab(
                UserTab.Keyboard,
                _td("Keyboard"),
                "mx_UserSettingsDialog_keyboardIcon",
                <KeyboardUserSettingsTab />,
                "UserSettingsKeyboard",
            ),
        );
        // tabs.push(
        //     new Tab(
        //         UserTab.Sidebar,
        //         _td("Sidebar"),
        //         "mx_UserSettingsDialog_sidebarIcon",
        //         <SidebarUserSettingsTab />,
        //         "UserSettingsSidebar",
        //     ),
        // );

        if (SettingsStore.getValue(UIFeature.Voip)) {
            tabs.push(
                new Tab(
                    UserTab.Voice,
                    _td("Voice & Video"),
                    "mx_UserSettingsDialog_voiceIcon",
                    <VoiceUserSettingsTab />,
                    "UserSettingsVoiceVideo",
                ),
            );
        }

        tabs.push(
            new Tab(
                UserTab.Security,
                _td("Security & Privacy"),
                "mx_UserSettingsDialog_securityIcon",
                <SecurityUserSettingsTab closeSettingsFn={this.props.onFinished} />,
                "UserSettingsSecurityPrivacy",
            ),
        );
        tabs.push(
            new Tab(
                UserTab.SessionManager,
                _td("Sessions"),
                "mx_UserSettingsDialog_sessionsIcon",
                <SessionManagerTab />,
                // don't track with posthog while under construction
                undefined,
            ),
        );
        // Show the Labs tab if enabled or if there are any active betas
        // if (
        //     SdkConfig.get("show_labs_settings") ||
        //     SettingsStore.getFeatureSettingNames().some((k) => SettingsStore.getBetaInfo(k))
        // ) {
        //     tabs.push(
        //         new Tab(
        //             UserTab.Labs,
        //             _td("Labs"),
        //             "mx_UserSettingsDialog_labsIcon",
        //             <LabsUserSettingsTab />,
        //             "UserSettingsLabs",
        //         ),
        //     );
        // }
        if (this.state.mjolnirEnabled) {
            tabs.push(
                new Tab(
                    UserTab.Mjolnir,
                    _td("Ignored users"),
                    "mx_UserSettingsDialog_mjolnirIcon",
                    <MjolnirUserSettingsTab />,
                    "UserSettingMjolnir",
                ),
            );
        }
        tabs.push(
            new Tab(
                UserTab.Help,
                _td("Help & About"),
                "mx_UserSettingsDialog_helpIcon",
                <HelpUserSettingsTab closeSettingsFn={(): void => this.props.onFinished()} />,
                "UserSettingsHelpAbout",
            ),
        );

        return tabs as NonEmptyArray<Tab<UserTab>>;
    }

    public render(): React.ReactNode {
        return (
            <BaseDialog
                className="mx_UserSettingsDialog"
                hasCancel={true}
                onFinished={this.props.onFinished}
                title={_t("Settings")}
            >
                <div className="mx_SettingsDialog_content">
                    <FHIRContextProvider>
                        <TabbedView
                            tabs={this.getTabs()}
                            initialTabId={this.props.initialTabId}
                            screenName="UserSettings"
                        />
                    </FHIRContextProvider>
                </div>
            </BaseDialog>
        );
    }
}
