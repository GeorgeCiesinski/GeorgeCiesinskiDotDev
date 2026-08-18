/**
 * GitHub contribution calendar for the About section.
 *
 * Uses `react-github-calendar` (client-side fetch) and follows the site theme.
 * Block size grows with the container so the chart fills the About width on desktop.
 */

import { useEffect, useRef, useState } from "react";
import { GitHubCalendar } from "react-github-calendar";
import { useTheme } from "../theme/theme-context";
import { resolveTheme } from "../theme/theme";

const GITHUB_USERNAME = "GeorgeCiesinski";
/** Approximate weeks shown in the “last year” graph. */
const WEEKS = 53;
const BLOCK_MARGIN = 2;
/** Space reserved for weekday labels on the left of the grid. */
const LABEL_WIDTH = 40;
const MIN_BLOCK = 4.5;
const MAX_BLOCK = 8;
const MIN_FONT = 11;
const MAX_FONT = 14;

/** Contribution cell colors: empty → strongest, light and dark schemes. */
const CALENDAR_THEME = {
  light: ["#c5d8e6", "#9bc4db", "#5a9fc4", "#3c94c7", "#1c658c"],
  dark: ["#1e3544", "#2a5470", "#3c7a9e", "#4aa3d4", "#6bb8de"],
};

/**
 * Picks a cell size so ~53 weeks of blocks fill `containerWidth`.
 *
 * @param containerWidth - Width of the scroll/wrapper element in pixels.
 * @returns Clamped block size in pixels.
 */
function blockSizeForWidth(containerWidth: number): number {
  const available = containerWidth - LABEL_WIDTH;
  const size = Math.floor((available - BLOCK_MARGIN * (WEEKS - 1)) / WEEKS);
  return Math.min(MAX_BLOCK, Math.max(MIN_BLOCK, size));
}

/**
 * Picks a font size to fit mobile and desktop width.
 *
 * @param blockSize - Width of the scroll/wrapper element in pixels.
 * @returns Clamped font size in pixels.
 */
function fontSizeForWidth(blockSize: number): number {
  return Math.min(MAX_FONT, Math.max(MIN_FONT, blockSize * 1.5));
}

/**
 * Renders the last year of GitHub contributions for the portfolio username.
 *
 * @returns Contribution calendar block for the About section.
 */
export function GitHubContributions() {
  const { preference } = useTheme();
  const colorScheme = resolveTheme(preference);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [blockSize, setBlockSize] = useState(4.5);
  const [fontSize, setFontSize] = useState(10);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width == null || width <= 0) return;
      const nextBlock = blockSizeForWidth(width);
      setBlockSize(nextBlock);
      setFontSize(fontSizeForWidth(nextBlock));
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="github-contributions">
      <h3 className="github-contributions__title">GitHub Activity</h3>
      <div className="github-contributions__scroll" ref={scrollRef}>
        <GitHubCalendar
          username={GITHUB_USERNAME}
          colorScheme={colorScheme}
          theme={CALENDAR_THEME}
          blockSize={blockSize}
          blockMargin={BLOCK_MARGIN}
          fontSize={fontSize}
        />
      </div>
    </div>
  );
}
