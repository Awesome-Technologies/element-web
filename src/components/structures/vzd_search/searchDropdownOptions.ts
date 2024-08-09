/*
Copyright 2023, 2024 Awesome Technologies Innovationslabor GmbH

All rights reserved
*/

import valueSets from "../../../valueSets";

interface CodeConcept {
    groupIdentifier: string;
    text: string;
    options: string[];
}

export const typeOptions = (key: string): CodeConcept[] => {
    const typeOptions = [];

    for (const [groupIdentifier, groupObject] of Object.entries(valueSets)) {
        if (
            (groupIdentifier === "https://gematik.de/fhir/directory/CodeSystem/PractitionerProfessionOID" &&
                key === "people") ||
            (groupIdentifier === "https://gematik.de/fhir/directory/CodeSystem/OrganizationProfessionOID" &&
                key === "organisations")
        ) {
            const groupOption = {
                groupIdentifier,
                text: groupIdentifier, // Assuming the first value is the desired text for the group
                options: [],
            };

            for (const [identifier, text] of Object.entries(groupObject)) {
                groupOption.options.push({
                    identifier,
                    text,
                });
            }

            typeOptions.push(groupOption);
        }
    }

    return typeOptions;
};
