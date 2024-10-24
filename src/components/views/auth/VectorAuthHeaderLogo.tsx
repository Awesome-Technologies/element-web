/*
Copyright 2019-2024 New Vector Ltd.
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2024 Awesome Technologies Innovationslabor GmbH

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only
Please see LICENSE files in the repository root for full details.
*/

import * as React from "react";
import SdkConfig from "matrix-react-sdk/src/SdkConfig";
import "./AuthView.css";

export default class VectorAuthHeaderLogo extends React.PureComponent {
    public render(): React.ReactElement {
        const brandingConfig = SdkConfig.getObject("branding");
        const logoUrl = brandingConfig?.get("auth_header_logo_url") ?? "themes/element/img/logos/element-logo.svg";

        return (
            <aside className="tim_AuthHeaderLogo">
                <img src={logoUrl} alt="AMP.tim" />
            </aside>
        );
    }
}
