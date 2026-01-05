import { LEGACY_THEME_STORAGE_KEY, THEME_STORAGE_KEY } from "./storage-keys";

const stringify = (value: unknown) => JSON.stringify(value);

export const getThemeInitScript = () =>
  `(function(){try{var k=${stringify(THEME_STORAGE_KEY)};var legacy=${stringify(
    LEGACY_THEME_STORAGE_KEY,
  )};var t=null;try{t=localStorage.getItem(k)}catch(e){t=null}if(t!=='light'&&t!=='dark'){try{t=localStorage.getItem(legacy)}catch(e){t=null}}if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);try{localStorage.setItem(k,t);localStorage.removeItem(legacy)}catch(e){}}else{document.documentElement.setAttribute('data-theme','dark')}}catch(e){}})();`;
