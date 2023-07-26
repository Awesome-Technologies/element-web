/*
Copyright 2023 Awesome Technologies Innovationslabor GmbH

All rights reserved
*/

import valueSets from "../../../valueSets";

function convertObjectToTypeOptions(inputObject: Record<string, Record<number, string>>): any {
    const typeOptions = [];

    for (const [groupIdentifier, groupObject] of Object.entries(inputObject)) {
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

    return typeOptions;
}

export const typeOptions = convertObjectToTypeOptions(valueSets);
