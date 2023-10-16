import deDETranslations from "../../src/i18n/strings/de_DE.json";

// test to ensure the renaming
test('Translation of "Rooms" (EN) should be "Gruppen" (DE)', () => {
    const translationKey = "Rooms";
    const expectedTranslation = "Gruppen";
    // check if translation exists and matches the expected one
    expect(deDETranslations[translationKey]).toBe(expectedTranslation);
});
