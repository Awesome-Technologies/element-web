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

import React from "react";
import { _t } from "matrix-react-sdk/src/languageHandler";

export default class AuthBody extends React.PureComponent {
    public render(): React.ReactNode {
        return (
            <div className="mx_AuthBody">
                {this.props.children}
                <br />
                <span>
                    {_t(
                        "Please do not use the TI-Messenger on publicly accessible devices or devices without security monitoring. Use on such devices increases the risk of your access or the content in TI Messenger being compromised.",
                    )}
                </span>
            </div>
        );
    }
}
