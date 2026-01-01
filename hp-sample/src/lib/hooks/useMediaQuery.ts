import { useEffect, useState } from "react";

export const useMediaQuery = (query: string, initialValue = false) => {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return initialValue;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia(query);
    const update = () => {
      setMatches(mediaQuery.matches);
    };
    update();

    mediaQuery.addEventListener("change", update);
    return () => {
      mediaQuery.removeEventListener("change", update);
    };
  }, [query]);

  return matches;
};
