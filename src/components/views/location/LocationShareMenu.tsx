/*
Copyright 2022 The Matrix.org Foundation C.I.C.
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
// https://github.com/matrix-org/matrix-react-sdk/blob/v3.79.0/src/components/views/location/LocationShareMenu.tsx
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
