/**
 * Decorative home-only code wallpaper drawn on a Canvas.
 *
 * Uses allowlisted repository source flattened into continuous lines, scrolls
 * at a parallax rate, and never puts source text in the DOM for SEO/AT.
 */

import { useEffect, useRef } from "react";
import {
  codeWallpaperStream,
  tileCodeLines,
  wrapCodeLines,
} from "../data/codeWallpaper";

/** Parallax scroll factor (background moves slower than the page). */
const PARALLAX_FACTOR = 0.3;

/** Cap device pixel ratio to limit overdraw on high-DPI screens. */
const MAX_DPR = 2;

/** Monospace stack matching blog prose code. */
const FONT_FAMILY =
  "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

/** Font size in CSS pixels. */
const FONT_SIZE_PX = 11;

/** Line height multiplier for vertical rhythm. */
const LINE_HEIGHT = 1.55;

/**
 * Fixed canvas wallpaper: theme-aware muted glyphs with scroll parallax.
 *
 * @returns Presentation-only canvas element.
 */
export function CodeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !codeWallpaperStream) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduceMotion = motionQuery.matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let lines: string[] = [];
    let lineHeightPx = FONT_SIZE_PX * LINE_HEIGHT;
    let charWidth = 0;
    let rafId = 0;
    let needsLayout = true;

    /**
     * Reads the resolved CSS color from the canvas (supports color-mix tokens).
     *
     * @returns CSS color string for `fillStyle`.
     */
    function readFillColor(): string {
      return getComputedStyle(canvas!).color || "rgba(90, 106, 117, 0.06)";
    }

    /**
     * Sizes the canvas to the viewport and rebuilds wrapped/tiled lines.
     */
    function layout(): void {
      const nextWidth = window.innerWidth;
      const nextHeight = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

      width = nextWidth;
      height = nextHeight;

      canvas!.width = Math.max(1, Math.floor(width * dpr));
      canvas!.height = Math.max(1, Math.floor(height * dpr));
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;

      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.font = `${FONT_SIZE_PX}px ${FONT_FAMILY}`;
      ctx!.textBaseline = "top";

      charWidth = ctx!.measureText("M").width || FONT_SIZE_PX * 0.6;
      lineHeightPx = FONT_SIZE_PX * LINE_HEIGHT;

      const charsPerLine = Math.max(1, Math.floor(width / charWidth));
      // Extra vertical coverage so parallax never reveals empty canvas.
      const minLines = Math.ceil((height * 2.5) / lineHeightPx) + 2;
      const wrapped = wrapCodeLines(codeWallpaperStream, charsPerLine);
      lines = tileCodeLines(wrapped, minLines);
      needsLayout = false;
    }

    /**
     * Clears and redraws all code lines at the current scroll offset.
     */
    function paint(): void {
      if (needsLayout) layout();
      if (lines.length === 0) return;

      const scrollOffset = reduceMotion ? 0 : window.scrollY * PARALLAX_FACTOR;
      const fill = readFillColor();

      ctx!.clearRect(0, 0, width, height);
      ctx!.fillStyle = fill;
      ctx!.font = `${FONT_SIZE_PX}px ${FONT_FAMILY}`;
      ctx!.textBaseline = "top";

      // Align to line grid so glyphs stay crisp while scrolling.
      let firstLineY = -(scrollOffset % lineHeightPx);
      if (firstLineY > 0) firstLineY -= lineHeightPx;

      let lineIndex =
        Math.floor(scrollOffset / lineHeightPx) % lines.length;
      if (lineIndex < 0) lineIndex += lines.length;

      for (let y = firstLineY; y < height; y += lineHeightPx) {
        const line = lines[lineIndex];
        if (line) ctx!.fillText(line, 0, y);
        lineIndex = (lineIndex + 1) % lines.length;
      }
    }

    function schedulePaint(): void {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        paint();
      });
    }

    function onScroll(): void {
      if (reduceMotion) return;
      schedulePaint();
    }

    function onResize(): void {
      needsLayout = true;
      schedulePaint();
    }

    function onMotionChange(): void {
      reduceMotion = motionQuery.matches;
      schedulePaint();
    }

    const themeObserver = new MutationObserver(() => {
      schedulePaint();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "style", "class"],
    });

    motionQuery.addEventListener("change", onMotionChange);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    layout();
    paint();

    return () => {
      themeObserver.disconnect();
      motionQuery.removeEventListener("change", onMotionChange);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="code-background"
      aria-hidden="true"
      role="presentation"
    />
  );
}
