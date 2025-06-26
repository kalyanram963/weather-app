import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import translationEN from "./en.json";
import translationHI from "./hi.json";
import translationTE from "./te.json";
import ta from "./ta.json";
import kn from "./kn.json";
import fr from "./fr.json";
import es from "./es.json";

const resources = {
  en: { translation: translationEN },
  hi: { translation: translationHI },
  te: { translation: translationTE },
  ta: { translation: ta },
  kn: { translation: kn },
  fr: { translation: fr },
  es: { translation: es },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
