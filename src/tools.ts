/*
Copyright 2023 Awesome Technologies Innovationslabor GmbH

All rights reserved
*/

import organizationProfessionOID from "./code-systems/organizationProfessionOID";

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
    const codeSystem: Record<string, CodeConcept[]> = {
        "https://gematik.de/fhir/directory/CodeSystem/OrganizationProfessionOID": organizationProfessionOID.concept,
    };

    if (!codeSystem[systemName]) return `Code system "${systemName}" not found`;

    const concept = codeSystem[systemName].find((item) => item.code === code);

    return concept ? concept.display : `Code "${code}" not found`;
};
