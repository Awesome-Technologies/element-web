/*
Copyright 2024 New Vector Ltd.
Copyright 2022 The Matrix.org Foundation C.I.C.
Copyright 2024 Awesome Technologies Innovationslabor GmbH

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only
Please see LICENSE files in the repository root for full details.
*/

// ORIGINAL CODE
// https://github.com/element-hq/matrix-react-sdk/blob/v3.113.0/src/components/views/location/LocationShareMenu.tsx
// ORIGINAL PATH
// matrix-react-sdk/src/components/views/location/

import React, { SyntheticEvent, useContext } from "react";
import { Room, IEventRelation } from "matrix-js-sdk/src/matrix";
import MatrixClientContext from "matrix-react-sdk/src/contexts/MatrixClientContext";
import ContextMenu, { MenuProps } from "matrix-react-sdk/src/components/structures/ContextMenu";
import LocationPicker, { ILocationPickerProps } from "matrix-react-sdk/src/components/views/location/LocationPicker";
import { shareLocation, LocationShareType } from "matrix-react-sdk/src/components/views/location/shareLocation";

type Props = Omit<ILocationPickerProps, "onChoose" | "shareType"> & {
    onFinished: (ev?: SyntheticEvent) => void;
    menuPosition: MenuProps;
    openMenu: () => void;
    roomId: Room["roomId"];
    relation?: IEventRelation;
};

const LocationShareMenu: React.FC<Props> = ({ menuPosition, onFinished, sender, roomId, openMenu, relation }) => {
    const matrixClient = useContext(MatrixClientContext);
    // allow only LocationShareType.Pin (share a location selected on the map, no tracking involved)
    const onLocationSubmit = shareLocation(matrixClient, roomId, LocationShareType.Pin, relation, openMenu);

    return (
        <ContextMenu {...menuPosition} onFinished={onFinished} managed={false}>
            <div className="mx_LocationShareMenu">
                <LocationPicker
                    sender={sender}
                    shareType={LocationShareType.Pin}
                    onChoose={onLocationSubmit}
                    onFinished={onFinished}
                />
            </div>
        </ContextMenu>
    );
};

export default LocationShareMenu;
