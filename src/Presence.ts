/*
Copyright 2024 Awesome Technologies Innovationslabor GmbH
Copyright 2024 New Vector Ltd.
Copyright 2019 The Matrix.org Foundation C.I.C.
Copyright 2018 New Vector Ltd
Copyright 2015, 2016 OpenMarket Ltd

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only
Please see LICENSE files in the repository root for full details.
*/

// ORIGINAL CODE
// https://github.com/element-hq/matrix-react-sdk/blob/v3.113.0/src/Presence.ts
// ORIGINAL PATH
// matrix-react-sdk/src/

import { logger } from "matrix-js-sdk/src/logger";
import { SetPresence } from "matrix-js-sdk/src/matrix";
import { MatrixClientPeg } from "matrix-react-sdk/src/MatrixClientPeg";
import dis from "matrix-react-sdk/src/dispatcher/dispatcher";
import Timer from "matrix-react-sdk/src/utils/Timer";
import { ActionPayload } from "matrix-react-sdk/src/dispatcher/payloads";
import { logout } from "matrix-react-sdk/src/Lifecycle";
import SettingsStore from "matrix-react-sdk/src/settings/SettingsStore";

// Time in ms after that a user is considered as unavailable/away
const UNAVAILABLE_TIME_MS = 3 * 60 * 1000; // 3 mins

class Presence {
    private unavailableTimer: Timer | null = null;
    private autoLogoutTimer: Timer | null = null;
    private dispatcherRef: string | null = null;
    private state: SetPresence | null = null;

    /**
     * Start listening the user activity to evaluate his presence state.
     * Any state change will be sent to the homeserver.
     */
    public async start(): Promise<void> {
        // also start the autologout timer
        this.startAutologout();

        this.unavailableTimer = new Timer(UNAVAILABLE_TIME_MS);
        // the user_activity_start action starts the timer
        this.dispatcherRef = dis.register(this.onAction);
        while (this.unavailableTimer) {
            try {
                await this.unavailableTimer.finished();
                this.setState(SetPresence.Unavailable);
            } catch (e) {
                /* aborted, stop got called */
            }
        }
    }

    /**
     * Start listening the user activity to evaluate the autologout time.
     */
    public async startAutologout(): Promise<void> {
        // load time from settings
        const inactivityTimeOnLock = SettingsStore.getValue("inactivityTimeOnLock");
        // set autoLogout timer to the value stored in the settings
        const autoLogoutTime: number = +(inactivityTimeOnLock * 60 * 1000);
        this.autoLogoutTimer = new Timer(autoLogoutTime);

        while (this.autoLogoutTimer) {
            try {
                await this.autoLogoutTimer.finished();
                // logout the user
                logout();
            } catch (e) {
                /* aborted, stop got called */
                console.log("Autologout timer was stopped.");
            }
        }
    }

    /**
     * Stop tracking user activity
     */
    public stop(): void {
        if (this.dispatcherRef) {
            dis.unregister(this.dispatcherRef);
            this.dispatcherRef = null;
        }
        if (this.unavailableTimer) {
            this.unavailableTimer.abort();
            this.unavailableTimer = null;
        }

        if (this.autoLogoutTimer) {
            this.autoLogoutTimer.abort();
            this.autoLogoutTimer = null;
        }
    }

    /**
     * Get the current presence state.
     * @returns {string} the presence state (see PRESENCE enum)
     */
    public getState(): SetPresence | null {
        return this.state;
    }

    private onAction = (payload: ActionPayload): void => {
        if (payload.action === "user_activity") {
            this.setState(SetPresence.Online);
            this.unavailableTimer?.restart();
            this.autoLogoutTimer?.restart();
        }
    };

    /**
     * Set the presence state.
     * If the state has changed, the homeserver will be notified.
     * @param {string} newState the new presence state (see PRESENCE enum)
     */
    private async setState(newState: SetPresence): Promise<void> {
        const sendPresenceStatus = SettingsStore.getValue("sendPresence");

        if (newState === this.state) {
            return;
        }

        const oldState = this.state;
        this.state = newState;

        // don't send any presence status if the setting is deactivated
        if (!sendPresenceStatus) {
            return;
        }

        if (MatrixClientPeg.safeGet().isGuest()) {
            return; // don't try to set presence when a guest; it won't work.
        }

        try {
            await MatrixClientPeg.safeGet().setPresence({ presence: this.state });
            await MatrixClientPeg.safeGet().setSyncPresence(this.state);

            logger.debug("Presence:", newState);
        } catch (err) {
            logger.error("Failed to set presence:", err);
            this.state = oldState;
        }
    }
}

export default new Presence();
