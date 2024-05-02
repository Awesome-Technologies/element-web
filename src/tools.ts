/*
Copyright 2023 Awesome Technologies Innovationslabor GmbH

All rights reserved
*/

import OrganizationProfessionOID from "./code-systems/OrganizationProfessionOID";
import PractitionerProfessionOID from "./code-systems/PractitionerProfessionOID";
import PractitionerQualificationVS from "./code-systems/PractitionerQualificationVS";

export const levenshteinDistance = (a: string, b: string): number => {
    const m: number = a.length;
    const n: number = b.length;

    // If one of the strings is empty, the distance is the length of the other string
    if (m === 0) return n;
    if (n === 0) return m;

    // Create a 2D array to store the intermediate results
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    // Initialize the first row and column with incremental values
    for (let i = 0; i <= m; i++) {
        dp[i][0] = i;
    }

    for (let j = 0; j <= n; j++) {
        dp[0][j] = j;
    }

    // Calculate the Levenshtein distance
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (a.charAt(i - 1) === b.charAt(j - 1)) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
            }
        }
    }

    return dp[m][n];
};

interface CodeConcept {
    code: string;
    display: string;
}

export const getCodeDisplay = (systemName: string, code: string): string => {
    const codeSystem: Record<string, CodeConcept[] | undefined> = {
        "https://gematik.de/fhir/directory/CodeSystem/OrganizationProfessionOID": OrganizationProfessionOID.concept,
        "https://gematik.de/fhir/directory/CodeSystem/PractitionerProfessionOID": PractitionerProfessionOID.concept,
        "urn:oid:1.2.276.0.76.5.114": PractitionerQualificationVS.compose.include.find(
            (x) => x.system === "urn:oid:1.2.276.0.76.5.114",
        )?.concept,
        "urn:oid:1.2.276.0.76.5.514": PractitionerQualificationVS.compose.include.find(
            (x) => x.system === "urn:oid:1.2.276.0.76.5.514",
        )?.concept,
        "urn:oid:1.2.276.0.76.5.492": PractitionerQualificationVS.compose.include.find(
            (x) => x.system === "urn:oid:1.2.276.0.76.5.492",
        )?.concept,
        "urn:oid:1.3.6.1.4.1.19376.3.276.1.5.11": PractitionerQualificationVS.compose.include.find(
            (x) => x.system === "urn:oid:1.3.6.1.4.1.19376.3.276.1.5.11",
        )?.concept,
        "urn:oid:1.2.276.0.76.5.493": PractitionerQualificationVS.compose.include.find(
            (x) => x.system === "urn:oid:1.2.276.0.76.5.493",
        )?.concept,
    };

    if (!codeSystem[systemName]) return `Code system "${systemName}" not found`;

    const concept = codeSystem[systemName]?.find((item) => item.code === code);

    return concept ? concept.display : `Code "${code}" not found`;
};
