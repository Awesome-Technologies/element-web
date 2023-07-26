export const levenshteinDistance = (a, b) => {
    const m = a.length;
    const n = b.length;

    // If one of the strings is empty, the distance is the length of the other string
    if (m === 0) return n;
    if (n === 0) return m;

    // Create a 2D array to store the intermediate results
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

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

export const cleanString = (string) => {
    string = string.trim(); // Remove leading and trailing whitespace
    string = string.replace(/[^\w\s]/gi, ""); // Remove special characters and punctuation
    string = string.replace(/\s+/g, " "); // Normalize white space (replace multiple spaces with a single space)
    string = string.toLowerCase(); // Convert to lowercase
    return string;
};
