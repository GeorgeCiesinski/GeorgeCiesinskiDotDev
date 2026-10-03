/**
 * Nav dropdown to choose light, dark, or system theme.
 */

import { useState } from "react";
import { useTheme } from "../theme/theme-context";
import { resolveTheme } from "../theme/theme";

/**
 * Renders a Theme button and a menu of light / dark / system options.
 *
 * @returns Theme toggle button and option menu.
 */
export function ThemeMenu() {
  const [open, setOpen] = useState(false);
  const { preference, setPreference } = useTheme();

  return (
    <div className="theme-menu">
      <button
        type="button"
        className={`theme-menu-toggle theme-menu-toggle--${resolveTheme(preference)}`}
        aria-label="Color theme"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls="theme-menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span
          className="theme-menu-toggle__icon theme-menu-toggle__icon--sun"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            width="28"
            height="28"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle fill="currentColor" stroke="none" cx="12" cy="12" r="6" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
        </span>

        <span
          className="theme-menu-toggle__icon theme-menu-toggle__icon--cloud"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            width="30"
            height="30"
            fill="currentColor"
            stroke="none"
          >
            <path d="M7 18a4 4 0 0 1-.88-7.9 5 5 0 0 1 9.3-1.2 3.5 3.5 0 0 1 3.1 5.7A3.5 3.5 0 0 1 17 18H7z" />
          </svg>
        </span>

        <span
          className="theme-menu-toggle__icon theme-menu-toggle__icon--stars"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            width="34"
            height="34"
            fill="currentColor"
            stroke="none"
          >
            <circle cx="4" cy="4" r="1.2" />
            <circle cx="22" cy="10" r="1" />
            <circle cx="17" cy="21" r="1.1" />
            <circle cx="1" cy="8" r="0.9" />
            <circle cx="5" cy="20" r="0.8" />
            <circle cx="9" cy="23" r="0.9" />
            <circle cx="14" cy="1" r="0.8" />
          </svg>
        </span>

        <span
          className="theme-menu-toggle__icon theme-menu-toggle__icon--moon"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </span>
      </button>

      {open && (
        <ul id="theme-menu" className="theme-menu__list" role="menu">
          {(["light", "dark", "system"] as const).map((option) => (
            <li key={option} role="none">
              <button
                type="button"
                role="menuitemradio"
                aria-checked={preference === option}
                className={`theme-menu__option${preference === option ? " theme-menu__option--active" : ""}`}
                onClick={() => {
                  setPreference(option);
                  setOpen(false);
                }}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
