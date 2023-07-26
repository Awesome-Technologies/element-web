/*
Copyright 2019 New Vector Ltd
Copyright 2019 - 2021 The Matrix.org Foundation C.I.C.
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

// matrix-react-sdk/src/components/views/settings/tabs/user/
import LabelledToggleSwitch from "matrix-react-sdk/src/components/views/elements/LabelledToggleSwitch";
import React from "react";
import SettingsTab from "matrix-react-sdk/src/components/views/settings/tabs/SettingsTab";
import { SettingsSection } from "matrix-react-sdk/src/components/views/settings/shared/SettingsSection";
import { SettingsSubsectionText } from "matrix-react-sdk/src/components/views/settings/shared/SettingsSubsection";

interface IState {
    visibility: boolean;
}

export default class FhirSettings extends React.Component<any, IState> {
    private unmounted = false;

    public constructor(props: any) {
        super(props);

        this.state = {
            visibility: true,
        };
    }

    public async componentDidMount(): Promise<void> {
        if (this.unmounted) return;
    }

    public componentWillUnmount(): void {
        this.unmounted = true;
    }

    public render(): React.ReactNode {
        return (
            <SettingsTab>
                <SettingsSection heading="Verzeichnis (FHIR VZD)">
                    <SettingsSubsectionText>Einstellungen zum Verzeichniss Dienst</SettingsSubsectionText>
                    <LabelledToggleSwitch
                        value={true}
                        label="Sichtbar"
                        caption="Entscheidet ob Sie im zentralen Nutzerverzeichnis auffindbar und kontaktierbar sind."
                        onChange={(): void => {}}
                        disabled={false}
                    />
                </SettingsSection>
            </SettingsTab>
        );
    }
}
