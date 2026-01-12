import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translation files
import thTranslation from "./locales/th/translation.json";
import viTranslation from "./locales/vi/translation.json";
import zhTranslation from "./locales/zh/translation.json";

const resources = {
    th: {
        translation: thTranslation,
    },
    vi: {
        translation: viTranslation,
    },
    zh: {
        translation: zhTranslation,
    },
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "th", // Default language: Thai
        fallbackLng: "zh",
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
