/*
Copyright 2023, 2024 Awesome Technologies Innovationslabor GmbH
Copyright 2024 New Vector Ltd.
Copyright 2020, 2021 The Matrix.org Foundation C.I.C.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only
Please see LICENSE files in the repository root for full details.
*/

// ORIGINAL CODE
// https://github.com/element-hq/matrix-react-sdk/blob/v3.113.0/src/components/structures/RoomSearch.tsx
// ORIGINAL PATH
// matrix-react-sdk/src/components/structures/

import classNames from "classnames";
import * as React from "react";
import { ALTERNATE_KEY_NAME } from "matrix-react-sdk/src//accessibility/KeyboardShortcuts";
import defaultDispatcher from "matrix-react-sdk/src//dispatcher/dispatcher";
import { ActionPayload } from "matrix-react-sdk/src//dispatcher/payloads";
import { IS_MAC, Key } from "matrix-react-sdk/src//Keyboard";
import { _t } from "matrix-react-sdk/src//languageHandler";
import AccessibleButton from "matrix-react-sdk/src/components/views/elements/AccessibleButton";
import Modal from "matrix-react-sdk/src/Modal";

import VzdSearch from "./vzd_search/VzdSearch";

interface IProps {
    isMinimized: boolean;
}

export default class RoomSearch extends React.PureComponent<IProps> {
    private readonly dispatcherRef: string;

    public constructor(props: IProps) {
        super(props);

        this.dispatcherRef = defaultDispatcher.register(this.onAction);
    }

    public componentWillUnmount(): void {
        defaultDispatcher.unregister(this.dispatcherRef);
    }

    private openSpotlight(): void {
        //defaultDispatcher.fire(Action.OpenSpotlight);
        Modal.createDialog(VzdSearch, {}, "mx_VzdSearch_wrapper", false, true);
    }

    private onAction = (payload: ActionPayload): void => {
        if (payload.action === "focus_room_filter") {
            this.openSpotlight();
        }
    };

    public render(): React.ReactNode {
        const classes = classNames(
            {
                mx_RoomSearch: true,
                mx_RoomSearch_minimized: this.props.isMinimized,
            },
            "mx_RoomSearch_spotlightTrigger",
        );

        const icon = <div className="mx_RoomSearch_icon" />;

        const shortcutPrompt = (
            <kbd className="mx_RoomSearch_shortcutPrompt">
                {IS_MAC ? "⌘ K" : _t(ALTERNATE_KEY_NAME[Key.CONTROL]) + " K"}
            </kbd>
        );

        return (
            <AccessibleButton onClick={this.openSpotlight} className={classes} aria-label={_t("action|search")}>
                {icon}
                {!this.props.isMinimized && (
                    <div className="mx_RoomSearch_spotlightTriggerText">{_t("action|search")}</div>
                )}
                {shortcutPrompt}
            </AccessibleButton>
        );
    }
}
