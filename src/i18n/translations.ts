import en from "./locales/en";
import es from "./locales/es";
import ja from "./locales/ja";
import zhHans from "./locales/zh-hans";
import zhHant from "./locales/zh-hant";
import ko from "./locales/ko";
import ar from "./locales/ar";
import pt from "./locales/pt";
import fr from "./locales/fr";
import de from "./locales/de";
import it from "./locales/it";
import hi from "./locales/hi";
import th from "./locales/th";
import vi from "./locales/vi";
import id from "./locales/id";
import tr from "./locales/tr";
import pl from "./locales/pl";

export const TRANSLATIONS: Record<string, Record<string, string>> = {
  en,
  es,
  ja,
  "zh-Hans": zhHans,
  "zh-Hant": zhHant,
  ko,
  ar,
  pt,
  fr,
  de,
  it,
  hi,
  th,
  vi,
  id,
  tr,
  pl,
};
