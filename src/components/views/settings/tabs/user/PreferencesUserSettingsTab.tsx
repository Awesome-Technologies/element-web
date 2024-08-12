/*
Copyright 2019-2023 The Matrix.org Foundation C.I.C.
Copyright 2019 Michael Telatynski <7t3chguy@gmail.com>
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
// https://github.com/matrix-org/matrix-react-sdk/blob/v3.79.0/src/components/views/settings/tabs/user/PreferencesUserSettingsTab.tsx
// ORIGINAL PATH
// matrix-react-sdk/src/components/views/settings/tabs/user/

import React from "react";
import { _t } from "matrix-react-sdk/src/languageHandler";
import { UseCase } from "matrix-react-sdk/src/settings/enums/UseCase";
import SettingsStore from "matrix-react-sdk/src/settings/SettingsStore";
import Field from "matrix-react-sdk/src/components/views/elements/Field";
import { SettingLevel } from "matrix-react-sdk/src/settings/SettingLevel";
import SettingsFlag from "matrix-react-sdk/src/components/views/elements/SettingsFlag";
import AccessibleButton from "matrix-react-sdk/src/components/views/elements/AccessibleButton";
import dis from "matrix-react-sdk/src/dispatcher/dispatcher";
import { UserTab } from "matrix-react-sdk/src/components/views/dialogs/UserTab";
import { OpenToTabPayload } from "matrix-react-sdk/src/dispatcher/payloads/OpenToTabPayload";
import { Action } from "matrix-react-sdk/src/dispatcher/actions";
import SdkConfig from "matrix-react-sdk/src/SdkConfig";
import { showUserOnboardingPage } from "matrix-react-sdk/src/components/views/user-onboarding/UserOnboardingPage";
import SettingsSubsection from "matrix-react-sdk/src/components/views/settings/shared/SettingsSubsection";
import SettingsTab from "matrix-react-sdk/src/components/views/settings/tabs/SettingsTab";
import { SettingsSection } from "matrix-react-sdk/src/components/views/settings/shared/SettingsSection";
import { MatrixClientPeg } from "matrix-react-sdk/src/MatrixClientPeg";
import { SetPresence } from "matrix-js-sdk/src/sync";

interface IProps {
    closeSettingsFn(success: boolean): void;
}

interface IState {
    autocompleteDelay: string;
    readMarkerInViewThresholdMs: string;
    readMarkerOutOfViewThresholdMs: string;
}

export default class PreferencesUserSettingsTab extends React.Component<IProps, IState> {
    private static ROOM_LIST_SETTINGS = ["breadcrumbs", "FTUE.userOnboardingButton"];

    private static SPACES_SETTINGS = ["Spaces.allRoomsInHome"];

    private static KEYBINDINGS_SETTINGS = ["ctrlFForSearch"];

    private static PRESENCE_SETTINGS = ["sendPresence", "sendReadReceipts", "sendTypingNotifications"];

    private static COMPOSER_SETTINGS = [
        "MessageComposerInput.autoReplaceEmoji",
        "MessageComposerInput.useMarkdown",
        "MessageComposerInput.suggestEmoji",
        "MessageComposerInput.ctrlEnterToSend",
        "MessageComposerInput.surroundWith",
        "MessageComposerInput.showStickersButton",
        "MessageComposerInput.insertTrailingColon",
    ];

    private static TIME_SETTINGS = ["showTwelveHourTimestamps", "alwaysShowTimestamps"];

    private static CODE_BLOCKS_SETTINGS = [
        "enableSyntaxHighlightLanguageDetection",
        "expandCodeByDefault",
        "showCodeLineNumbers",
    ];

    private static IMAGES_AND_VIDEOS_SETTINGS = ["urlPreviewsEnabled", "autoplayGifs", "autoplayVideo", "showImages"];

    private static TIMELINE_SETTINGS = [
        "showTypingNotifications",
        "showRedactions",
        "showReadReceipts",
        "showJoinLeaves",
        "showDisplaynameChanges",
        "showChatEffects",
        "showAvatarChanges",
        "Pill.shouldShowPillAvatar",
        "TextualBody.enableBigEmoji",
        "scrollToBottomOnMessageSent",
        "useOnlyCurrentProfiles",
    ];

    private static ROOM_DIRECTORY_SETTINGS = ["SpotlightSearch.showNsfwPublicRooms"];

    private static GENERAL_SETTINGS = [
        "promptBeforeInviteUnknownUsers",
        // Start automatically after startup (electron-only)
        // Autocomplete delay (niche text box)
    ];

    public constructor(props: IProps) {
        super(props);

        this.state = {
            autocompleteDelay: SettingsStore.getValueAt(SettingLevel.DEVICE, "autocompleteDelay").toString(10),
            readMarkerInViewThresholdMs: SettingsStore.getValueAt(
                SettingLevel.DEVICE,
                "readMarkerInViewThresholdMs",
            ).toString(10),
            readMarkerOutOfViewThresholdMs: SettingsStore.getValueAt(
                SettingLevel.DEVICE,
                "readMarkerOutOfViewThresholdMs",
            ).toString(10),
        };
    }

    private onAutocompleteDelayChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({ autocompleteDelay: e.target.value });
        SettingsStore.setValue("autocompleteDelay", null, SettingLevel.DEVICE, e.target.value);
    };

    private onReadMarkerInViewThresholdMs = (e: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({ readMarkerInViewThresholdMs: e.target.value });
        SettingsStore.setValue("readMarkerInViewThresholdMs", null, SettingLevel.DEVICE, e.target.value);
    };

    private onReadMarkerOutOfViewThresholdMs = (e: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({ readMarkerOutOfViewThresholdMs: e.target.value });
        SettingsStore.setValue("readMarkerOutOfViewThresholdMs", null, SettingLevel.DEVICE, e.target.value);
    };

    private onSendPresenceChange = async (checked: boolean): Promise<void> => {
        if (checked) {
            // set status to 'online' when the sending of the presence status is activated
            MatrixClientPeg.opts = {
                initialSyncLimit: 20,
                disablePresence: false,
            };
            await MatrixClientPeg.safeGet().setPresence({ presence: "online" });
            await MatrixClientPeg.safeGet().setSyncPresence(SetPresence.Online);
        } else {
            // set status to 'offline' when the sending of the presence status is deactivated
            await MatrixClientPeg.safeGet().setPresence({ presence: "offline" });
            await MatrixClientPeg.safeGet().setSyncPresence(SetPresence.Offline);
        }
    };

    private renderGroup(settingIds: string[], level = SettingLevel.ACCOUNT): React.ReactNodeArray {
        return settingIds.map((i) => {
            if (i === "sendPresence") {
                return <SettingsFlag key={i} name={i} level={level} onChange={this.onSendPresenceChange} />;
            }
            return <SettingsFlag key={i} name={i} level={level} />;
        });
    }

    private onKeyboardShortcutsClicked = (): void => {
        dis.dispatch<OpenToTabPayload>({
            action: Action.ViewUserSettings,
            initialTabId: UserTab.Keyboard,
        });
    };

    public render(): React.ReactNode {
        const useCase = SettingsStore.getValue<UseCase | null>("FTUE.useCaseSelection");
        const roomListSettings = PreferencesUserSettingsTab.ROOM_LIST_SETTINGS
            // Only show the user onboarding setting if the user should see the user onboarding page
            .filter((it) => it !== "FTUE.userOnboardingButton" || showUserOnboardingPage(useCase));

        return (
            <SettingsTab data-testid="mx_PreferencesUserSettingsTab">
                <SettingsSection heading={_t("Preferences")}>
                    {roomListSettings.length > 0 && (
                        <SettingsSubsection heading={_t("Room list")}>
                            {this.renderGroup(roomListSettings)}
                        </SettingsSubsection>
                    )}

                    <SettingsSubsection heading={_t("Spaces")}>
                        {this.renderGroup(PreferencesUserSettingsTab.SPACES_SETTINGS, SettingLevel.ACCOUNT)}
                    </SettingsSubsection>

                    <SettingsSubsection
                        heading={_t("Keyboard shortcuts")}
                        description={_t(
                            "To view all keyboard shortcuts, <a>click here</a>.",
                            {},
                            {
                                a: (sub) => (
                                    <AccessibleButton kind="link_inline" onClick={this.onKeyboardShortcutsClicked}>
                                        {sub}
                                    </AccessibleButton>
                                ),
                            },
                        )}
                    >
                        {this.renderGroup(PreferencesUserSettingsTab.KEYBINDINGS_SETTINGS)}
                    </SettingsSubsection>

                    <SettingsSubsection heading={_t("Displaying time")}>
                        {this.renderGroup(PreferencesUserSettingsTab.TIME_SETTINGS)}
                    </SettingsSubsection>

                    <SettingsSubsection
                        heading={_t("Presence")}
                        description={_t("Share your activity and status with others.")}
                    >
                        {this.renderGroup(PreferencesUserSettingsTab.PRESENCE_SETTINGS)}
                    </SettingsSubsection>

                    <SettingsSubsection heading={_t("Composer")}>
                        {this.renderGroup(PreferencesUserSettingsTab.COMPOSER_SETTINGS)}
                    </SettingsSubsection>

                    <SettingsSubsection heading={_t("Code blocks")}>
                        {this.renderGroup(PreferencesUserSettingsTab.CODE_BLOCKS_SETTINGS)}
                    </SettingsSubsection>

                    <SettingsSubsection heading={_t("Images, GIFs and videos")}>
                        {this.renderGroup(PreferencesUserSettingsTab.IMAGES_AND_VIDEOS_SETTINGS)}
                    </SettingsSubsection>

                    <SettingsSubsection heading={_t("Timeline")}>
                        {this.renderGroup(PreferencesUserSettingsTab.TIMELINE_SETTINGS)}
                    </SettingsSubsection>

                    <SettingsSubsection heading={_t("Room directory")}>
                        {this.renderGroup(PreferencesUserSettingsTab.ROOM_DIRECTORY_SETTINGS)}
                    </SettingsSubsection>

                    <SettingsSubsection heading={_t("General")} stretchContent>
                        {this.renderGroup(PreferencesUserSettingsTab.GENERAL_SETTINGS)}

                        <SettingsFlag name="Electron.showTrayIcon" level={SettingLevel.PLATFORM} hideIfCannotSet />
                        <SettingsFlag
                            name="Electron.enableHardwareAcceleration"
                            level={SettingLevel.PLATFORM}
                            hideIfCannotSet
                            label={_t("Enable hardware acceleration (restart %(appName)s to take effect)", {
                                appName: SdkConfig.get().brand,
                            })}
                        />
                        <SettingsFlag name="Electron.alwaysShowMenuBar" level={SettingLevel.PLATFORM} hideIfCannotSet />
                        <SettingsFlag name="Electron.autoLaunch" level={SettingLevel.PLATFORM} hideIfCannotSet />
                        <SettingsFlag name="Electron.warnBeforeExit" level={SettingLevel.PLATFORM} hideIfCannotSet />

                        <Field
                            label={_t("Autocomplete delay (ms)")}
                            type="number"
                            value={this.state.autocompleteDelay}
                            onChange={this.onAutocompleteDelayChange}
                        />
                        <Field
                            label={_t("Read Marker lifetime (ms)")}
                            type="number"
                            value={this.state.readMarkerInViewThresholdMs}
                            onChange={this.onReadMarkerInViewThresholdMs}
                        />
                        <Field
                            label={_t("Read Marker off-screen lifetime (ms)")}
                            type="number"
                            value={this.state.readMarkerOutOfViewThresholdMs}
                            onChange={this.onReadMarkerOutOfViewThresholdMs}
                        />
                    </SettingsSubsection>
                </SettingsSection>
            </SettingsTab>
        );
    }
}
