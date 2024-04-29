/*
Copyright 2023 Awesome Technologies Innovationslabor GmbH

All rights reserved
*/

import React, { createContext, useContext, ReactNode } from "react";
import { MatrixClientPeg } from "matrix-react-sdk/src/MatrixClientPeg";
import { FHIRClient } from "tim-js-sdk";
import SdkConfig from "matrix-react-sdk/src/SdkConfig";

interface IProps {
    children: ReactNode;
}

const config = SdkConfig.getObject("setting_defaults");
const FHIR_VZD_BASEURL = config?.get("fhir_vzd_base_url");
const FHIRContext = createContext<any | undefined>(undefined);

export function FHIRContextProvider({ children }: IProps): JSX.Element {
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
        const personResults = await fhirClient.searchPractitionerDirectory({ "practitioner.name": options.name });
        const organizationResults = await fhirClient.searchOrganizationDirectory({ "organization.name": options.name });
        const allResults = organizationResults ? personResults?.concat(organizationResults) : personResults;
        return allResults;
    };

    return (
        <FHIRContext.Provider
            value={{
                searchPractitionerDirectory,
                searchOrganizationDirectory,
                searchDirectory,
            }}
        >
            {children}
        </FHIRContext.Provider>
    );
}

export const useFHIRContext = (): any => useContext(FHIRContext);
