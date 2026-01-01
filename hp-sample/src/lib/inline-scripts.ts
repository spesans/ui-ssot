import { LANGUAGES, languageMetadata } from "./dictionary";
import { DEFAULT_ROUTE_LANGUAGE, LANGUAGE_STORAGE_KEY, ROUTE_LANGUAGES } from "./locale";
import { THEME_STORAGE_KEY } from "./storage-keys";

const RTL_LANGUAGES = Object.entries(languageMetadata)
  .filter(([, meta]) => meta.rtl)
  .map(([lang]) => lang);

const stringify = (value: unknown) => JSON.stringify(value);

export const getThemeInitScript = () =>
  `(function(){try{var k=${stringify(
    THEME_STORAGE_KEY,
  )};var t=localStorage.getItem(k);if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t)}else{document.documentElement.setAttribute('data-theme','dark')}}catch(e){}})();`;

export const getLanguageInitScript = () => {
  const supportedLanguages = stringify(LANGUAGES);
  const routeLanguages = stringify(ROUTE_LANGUAGES);
  const rtlLanguages = stringify(RTL_LANGUAGES);
  const storageKey = stringify(LANGUAGE_STORAGE_KEY);
  const fallbackLanguage = stringify(DEFAULT_ROUTE_LANGUAGE);

  return `(function(){try{var storageKey=${storageKey};var supported=${supportedLanguages};var routes=${routeLanguages};var rtl=${rtlLanguages};var path=(location&&location.pathname)||'/';var seg=path.split('/').filter(Boolean)[0];var routeLang=routes.indexOf(seg)!==-1?seg:null;var stored=null;try{stored=localStorage.getItem(storageKey)}catch(e){}var storedValid=stored&&supported.indexOf(stored)!==-1?stored:null;var shouldPersist=!storedValid;var effective=null;if(routeLang){effective=routeLang}else if(storedValid){effective=storedValid}else{var candidates=[];try{candidates=(navigator&&navigator.languages&&navigator.languages.length)?navigator.languages:[navigator.language]}catch(e){candidates=[]}var selected=null;for(var i=0;i<candidates.length;i++){var c=candidates[i];if(typeof c!=='string')continue;var n=c.toLowerCase();if(n.indexOf('ja')===0){selected='ja';break}if(n.indexOf('en')===0){selected='en';break}}effective=selected||${fallbackLanguage}}if(effective&&shouldPersist){try{localStorage.setItem(storageKey,effective)}catch(e){}}if(effective){document.documentElement.lang=effective;document.documentElement.dir=rtl.indexOf(effective)!==-1?'rtl':'ltr'}}catch(e){}})();`;
};
