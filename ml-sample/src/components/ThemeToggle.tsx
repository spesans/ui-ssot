"use client";

import { useTheme } from "@/lib/ThemeContext";
import { Moon, Sun } from "lucide-react";
import styles from "./ThemeToggle.module.css";

type ThemeToggleProps = {
  ariaLabel?: string;
};

export default function ThemeToggle({ ariaLabel }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  const defaultLabel = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={styles.toggle}
      aria-label={ariaLabel ?? defaultLabel}
    >
      {theme === "dark" ? (
        <Sun className={styles.icon} aria-hidden="true" />
      ) : (
        <Moon className={styles.icon} aria-hidden="true" />
      )}
    </button>
  );
}
