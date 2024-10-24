/*
Copyright 2024 New Vector Ltd.
Copyright 2021 The Matrix.org Foundation C.I.C.
Copyright 2024 Awesome Technologies Innovationslabor GmbH

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only
Please see LICENSE files in the repository root for full details.
*/

// ORIGINAL CODE
// https://github.com/element-hq/matrix-react-sdk/blob/v3.113.0/src/components/views/messages/DownloadActionButton.tsx
// ORIGINAL PATH
// matrix-react-sdk/src/components/views/messages/

import { MatrixEvent } from "matrix-js-sdk/src/matrix";
import React from "react";
import classNames from "classnames";
import { Icon as DownloadIcon } from "matrix-react-sdk/res/img/download.svg";
import { MediaEventHelper } from "matrix-react-sdk/src/utils/MediaEventHelper";
import { RovingAccessibleButton } from "matrix-react-sdk/src/accessibility/RovingTabIndex";
import Spinner from "matrix-react-sdk/src/components/views/elements/Spinner";
import { _t, _td, TranslationKey } from "matrix-react-sdk/src/languageHandler";
import { FileDownloader } from "matrix-react-sdk/src/utils/FileDownloader";
import Modal from "matrix-react-sdk/src/Modal";
import ErrorDialog from "matrix-react-sdk/src/components/views/dialogs/ErrorDialog";
import QuestionDialog from "matrix-react-sdk/src/components/views/dialogs/QuestionDialog";

interface IProps {
    mxEvent: MatrixEvent;

    // XXX: It can take a cycle or two for the MessageActionBar to have all the props/setup
    // required to get us a MediaEventHelper, so we use a getter function instead to prod for
    // one.
    mediaEventHelperGet: () => MediaEventHelper | undefined;
}

interface IState {
    loading: boolean;
    blob?: Blob;
    tooltip: TranslationKey;
}

export default class DownloadActionButton extends React.PureComponent<IProps, IState> {
    private downloader = new FileDownloader();

    public constructor(props: IProps) {
        super(props);

        this.state = {
            loading: false,
            tooltip: _td("timeline|download_action_downloading"),
        };
    }

    private onClick = (): void => {
        Modal.createDialog(QuestionDialog, {
            title: _t("tim|security|warning"),
            description: <p>{_t("tim|security|export_data")}</p>,
            danger: true,
            hasCancelButton: true,
            onFinished: this.onDownloadClick,
        });
    };

    private onDownloadClick = async (consent: boolean): Promise<void> => {
        if (!consent) return;

        try {
            await this.doDownload();
        } catch (e) {
            Modal.createDialog(ErrorDialog, {
                title: _t("timeline|download_failed"),
                description: (
                    <>
                        <div>{_t("timeline|download_failed_description")}</div>
                        <div>{e instanceof Error ? e.toString() : ""}</div>
                    </>
                ),
            });
            this.setState({ loading: false });
        }
    };

    private async doDownload(): Promise<void> {
        const mediaEventHelper = this.props.mediaEventHelperGet();
        if (this.state.loading || !mediaEventHelper) return;

        if (mediaEventHelper.media.isEncrypted) {
            this.setState({ tooltip: _td("timeline|download_action_decrypting") });
        }

        this.setState({ loading: true });

        if (this.state.blob) {
            // Cheat and trigger a download, again.
            return this.downloadBlob(this.state.blob);
        }

        const blob = await mediaEventHelper.sourceBlob.value;
        this.setState({ blob });
        await this.downloadBlob(blob);
    }

    private async downloadBlob(blob: Blob): Promise<void> {
        await this.downloader.download({
            blob,
            name: this.props.mediaEventHelperGet()!.fileName,
        });
        this.setState({ loading: false });
    }

    public render(): React.ReactNode {
        let spinner: JSX.Element | undefined;
        if (this.state.loading) {
            spinner = <Spinner w={18} h={18} />;
        }

        const classes = classNames({
            mx_MessageActionBar_iconButton: true,
            mx_MessageActionBar_downloadButton: true,
            mx_MessageActionBar_downloadSpinnerButton: !!spinner,
        });

        return (
            <RovingAccessibleButton
                className={classes}
                title={spinner ? _t(this.state.tooltip) : _t("action|download")}
                onClick={this.onClick}
                disabled={!!spinner}
                placement="left"
            >
                <DownloadIcon />
                {spinner}
            </RovingAccessibleButton>
        );
    }
}
