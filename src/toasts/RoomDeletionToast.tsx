/*
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

// ORIGINAL PATH
// matrix-react-sdk/src/components/views/settings/tabs/user
import { _t } from "matrix-react-sdk/src/languageHandler";
import { MatrixClientPeg } from "matrix-react-sdk/src/MatrixClientPeg";
import ToastStore from "matrix-react-sdk/src/stores/ToastStore";
import GenericToast from "matrix-react-sdk/src/components/views/toasts/GenericToast";
import React from "react";

import { RoomNameList } from "./RoomNameList";

export const showToast = async (inactiveRooms: Array<string>): Promise<void> => {
    const cli = MatrixClientPeg.safeGet();

    const onAccept = (): void => {
        // Leave inaktive rooms
        for (const roomId in inactiveRooms) {
            cli.leave(roomId);
        }
    };

    const onReject = (): void => {
        hideToast();
    };

    const inactiveRoomsNames = inactiveRooms.map((roomId) => {
        const roomName = cli.getRoom(roomId)?.name;
        return roomName ? roomName : "";
    });

    if (!inactiveRoomsNames) return;

    ToastStore.sharedInstance().addOrReplaceToast({
        key: "inactive_rooms",
        title: _t("You have inactive rooms. Do you want to delete them?"),
        icon: "verification_warning",
        props: {
            description: _t("Rooms"),
            detail: <RoomNameList names={inactiveRoomsNames} />,
            acceptLabel: _t("Delete"),
            onAccept,
            rejectLabel: _t("Later"),
            onReject,
        },
        component: GenericToast,
        priority: 80,
    });
};

export const hideToast = (): void => {
    ToastStore.sharedInstance().dismissToast("inactive_rooms");
};
