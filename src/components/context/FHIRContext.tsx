/*
Copyright 2023 Awesome Technologies Innovationslabor GmbH

All rights reserved
*/

import React, { createContext, useContext, ReactNode } from "react";
import { MatrixClientPeg } from "matrix-react-sdk/src/MatrixClientPeg";
import SdkConfig from "matrix-react-sdk/src/SdkConfig";
import { FHIRClient, OwnerPollResponse } from "fhir-js-sdk";

interface IProps {
    children: ReactNode;
}

export const FHIRContext = createContext<any | undefined>(undefined);

export function FHIRContextProvider({ children }: IProps): JSX.Element {
    const config = SdkConfig.getObject("setting_defaults");
    const FHIR_VZD_BASEURL = config?.get("fhir_vzd_base_url");
    const fhirClient = new FHIRClient({
        baseUrl: FHIR_VZD_BASEURL,
        userId: MatrixClientPeg.get()?.getUserId() as string | undefined,
        openIdTokenCallback: MatrixClientPeg.get()?.getOpenIdToken.bind(MatrixClientPeg.get()),
    });

    const searchPractitionerDirectory = async (options: any): Promise<any> => {
        const personResults = await fhirClient.searchPractitionerDirectory(options);
        return personResults;
    };

    const searchOrganizationDirectory = async (options: any): Promise<any> => {
        const organizationResults = await fhirClient.searchOrganizationDirectory(options);
        return organizationResults;
    };

    const searchDirectory = async (options: any): Promise<any> => {
        const personResults = await fhirClient.searchPractitionerDirectory({
            "practitioner.name": options.name,
            "location.address": options.address,
            "practitioner.qualification": options.qualification,
        });
        const organizationResults = await fhirClient.searchOrganizationDirectory({
            "organization.name": options.name,
            "location.address": options.address,
            "organization.type": options.qualification,
        });
        const allResults = organizationResults ? personResults?.concat(organizationResults) : personResults;
        return allResults;
    };

    const isOwnerLoggedIn = async (): Promise<boolean> => {
        return await fhirClient.isOwnerLoggedIn();
    };

    const ownerLogin = async (): Promise<void> => {
        await fhirClient.loginHbaUser();
    };

    const pollOwnerLogin = async (): Promise<OwnerPollResponse> => {
        return await fhirClient.pollOwnerAuth();
    };

    const setOwnerVisibility = async (visibility: boolean): Promise<any> => {
        return await fhirClient.setVzdVisibility(visibility);
    };

    const getContact = async (): Promise<any> => {
        return await fhirClient.getMxidFromVzd();
    };

    const setContact = async (contact: boolean): Promise<any> => {
        const userId = MatrixClientPeg.get()?.getUserId();
        if (!userId) return;
        let displayName = MatrixClientPeg.get()?.getUser(userId)?.displayName;
        if (!displayName) displayName = userId;

        // convert mxid to uri scheme
        const mxidURI = "matrix:u/" + userId.split("@")[1];

        if (contact) return await fhirClient.addMxidToVzd(mxidURI, displayName);
        else return await fhirClient.deleteMxidFromVzd();
    };

    return (
        <FHIRContext.Provider
            value={{
                searchPractitionerDirectory,
                searchOrganizationDirectory,
                searchDirectory,
                isOwnerLoggedIn,
                ownerLogin,
                pollOwnerLogin,
                setOwnerVisibility,
                getContact,
                setContact,
            }}
        >
            {children}
        </FHIRContext.Provider>
    );
}

export const useFHIRContext = (): any => useContext(FHIRContext);
