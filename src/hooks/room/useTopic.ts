/*
Copyright 2024 Awesome Technologies Innovationslabor GmbH
Copyright 2024 New Vector Ltd.
Copyright 2022 The Matrix.org Foundation C.I.C.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only
Please see LICENSE files in the repository root for full details.
*/

// ORIGINAL CODE
// https://github.com/element-hq/matrix-react-sdk/blob/v3.113.0/src/hooks/room/useTopic.ts
// ORIGINAL PATH
// matrix-react-sdk/src/hooks/room/

import { useEffect, useState } from "react";
import {
    EventType,
    MatrixEvent,
    Room,
    RoomStateEvent,
    ContentHelpers,
    MRoomTopicEventContent,
} from "matrix-js-sdk/src/matrix";
import { Optional } from "matrix-events-sdk";
import { useTypedEventEmitter } from "matrix-react-sdk/src/hooks/useEventEmitter";

export const getTopic = (room?: Room): Optional<ContentHelpers.TopicState> => {
    // check if there is a TI-M state event present
    let content = room?.currentState
        ?.getStateEvents("de.gematik.tim.room.topic", "")
        ?.getContent<MRoomTopicEventContent>();

    // fallback to matrix default room topic
    if (!content) {
        content = room?.currentState?.getStateEvents(EventType.RoomTopic, "")?.getContent<MRoomTopicEventContent>();
    }

    return !!content ? ContentHelpers.parseTopicContent(content) : null; // eslint-disable-line no-extra-boolean-cast
};

/**
 * Helper to retrieve the room topic for given room
 * @param room
 * @returns the raw text and an html parsion version of the room topic
 */
export function useTopic(room?: Room): Optional<ContentHelpers.TopicState> {
    const [topic, setTopic] = useState(getTopic(room));
    useTypedEventEmitter(room?.currentState, RoomStateEvent.Events, (ev: MatrixEvent) => {
        if (ev.getType() !== EventType.RoomTopic && ev.getType() !== "de.gematik.tim.room.topic") return;
        setTopic(getTopic(room));
    });
    useEffect(() => {
        setTopic(getTopic(room));
    }, [room]);

    return topic;
}
