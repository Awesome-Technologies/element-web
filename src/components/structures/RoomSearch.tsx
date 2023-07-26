/*
Copyright 2020, 2021 The Matrix.org Foundation C.I.C.
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
// matrix-react-sdk/src/components/structures/

import classNames from "classnames";
import * as React from "react";
import { ALTERNATE_KEY_NAME } from "matrix-react-sdk/src/components/structures/../../accessibility/KeyboardShortcuts";
import defaultDispatcher from "matrix-react-sdk/src/components/structures/../../dispatcher/dispatcher";
import { ActionPayload } from "matrix-react-sdk/src/components/structures/../../dispatcher/payloads";
import { IS_MAC, Key } from "matrix-react-sdk/src/components/structures/../../Keyboard";
import { _t } from "matrix-react-sdk/src/components/structures/../../languageHandler";
import Modal from "matrix-react-sdk/src/components/structures/../../Modal";
import AccessibleButton from "matrix-react-sdk/src/components/structures/../views/elements/AccessibleButton";

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
            <AccessibleButton onClick={this.openSpotlight} className={classes}>
                {icon}
                {!this.props.isMinimized && <div className="mx_RoomSearch_spotlightTriggerText">{_t("Search")}</div>}
                {shortcutPrompt}
            </AccessibleButton>
        );
    }
}
