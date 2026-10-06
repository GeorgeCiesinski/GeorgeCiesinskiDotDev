/**
 * Decorative home-only code wallpaper drawn on a Canvas.
 *
 * Uses allowlisted repository source flattened into continuous lines, scrolls
 * at a parallax rate, and never puts source text in the DOM for SEO/AT.
 * On fine-pointer devices, glyphs near the cursor briefly brighten within a
 * soft radius (disabled while scrolling and under prefers-reduced-motion).
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
const FONT_FAMILY = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

/** Font size in CSS pixels. */
const FONT_SIZE_PX = 11;

/** Line height multiplier for vertical rhythm. */
const LINE_HEIGHT = 1.55;

/**
 * Fixed canvas wallpaper: theme-aware muted glyphs with scroll parallax
 * and an optional pointer proximity opacity boost.
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

    const finePointerQuery = window.matchMedia("(pointer: fine)");
    let finePointer = finePointerQuery.matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let lines: string[] = [];
    let lineHeightPx = FONT_SIZE_PX * LINE_HEIGHT;
    let charWidth = 0;
    let rafId = 0;
    let needsLayout = true;

    /** Soft spotlight radius in CSS pixels. */
    const SPOTLIGHT_RADIUS_PX = 180;
    /** Extra alpha multiplier for the spotlight pass over the base fill. */
    const SPOTLIGHT_BOOST = 2.5;
    /** Delay after the last scroll event before re-enabling the spotlight. */
    const SCROLL_IDLE_MS = 140;

    let pointerX = 0;
    let pointerY = 0;
    let hasPointer = false;
    let isScrolling = false;
    let scrollIdleTimer = 0;

    const offscreen = document.createElement("canvas");
    const offCtx = offscreen.getContext("2d");

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
     * Draws the visible slice of tiled code lines into a 2D context.
     *
     * @param target - Canvas context to draw into (main or offscreen).
     * @param scrollOffset - Parallax-adjusted vertical scroll in CSS pixels.
     */
    function drawVisibleLines(
      target: CanvasRenderingContext2D,
      scrollOffset: number,
    ): void {
      let firstLineY = -(scrollOffset % lineHeightPx);
      if (firstLineY > 0) firstLineY -= lineHeightPx;

      let lineIndex = Math.floor(scrollOffset / lineHeightPx) % lines.length;
      if (lineIndex < 0) lineIndex += lines.length;

      for (let y = firstLineY; y < height; y += lineHeightPx) {
        const line = lines[lineIndex];
        if (line) target.fillText(line, 0, y);
        lineIndex = (lineIndex + 1) % lines.length;
      }
    }

    /**
     * Clears and redraws all code lines at the current scroll offset, then
     * optionally composites a soft radial opacity boost around the pointer.
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

      drawVisibleLines(ctx!, scrollOffset);

      if (
        !reduceMotion &&
        finePointer &&
        hasPointer &&
        !isScrolling &&
        offCtx
      ) {
        const bw = Math.max(1, Math.floor(width * dpr));
        const bh = Math.max(1, Math.floor(height * dpr));
        if (offscreen.width !== bw || offscreen.height !== bh) {
          offscreen.width = bw;
          offscreen.height = bh;
        }

        offCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        offCtx.clearRect(0, 0, width, height);
        offCtx.font = `${FONT_SIZE_PX}px ${FONT_FAMILY}`;
        offCtx.textBaseline = "top";
        offCtx.fillStyle = fill;
        offCtx.globalAlpha = SPOTLIGHT_BOOST;
        drawVisibleLines(offCtx, scrollOffset);
        offCtx.globalAlpha = 1;

        const gradient = offCtx.createRadialGradient(
          pointerX,
          pointerY,
          0,
          pointerX,
          pointerY,
          SPOTLIGHT_RADIUS_PX,
        );
        gradient.addColorStop(0, "rgba(0,0,0,1)");
        gradient.addColorStop(1, "rgba(0,0,0,0)");

        offCtx.globalCompositeOperation = "destination-in";
        offCtx.fillStyle = gradient;
        offCtx.fillRect(0, 0, width, height);
        offCtx.globalCompositeOperation = "source-over";

        ctx!.drawImage(offscreen, 0, 0, width, height);
      }
    }

    /**
     * Coalesces paint requests to at most one animation frame.
     */
    function schedulePaint(): void {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        paint();
      });
    }

    /**
     * Tracks pointer position for the spotlight; no-ops on coarse pointers.
     *
     * @param e - Window pointermove event.
     */
    function onPointerMove(e: PointerEvent): void {
      if (!finePointer) return;
      pointerX = e.clientX;
      pointerY = e.clientY;
      hasPointer = true;
      if (!reduceMotion && !isScrolling) schedulePaint();
    }

    /**
     * Clears spotlight state when the pointer leaves the document.
     */
    function onPointerLeave(): void {
      hasPointer = false;
      schedulePaint();
    }

    /**
     * Parallax-repaints on scroll and suppresses the spotlight until idle.
     */
    function onScroll(): void {
      if (reduceMotion) return;
      isScrolling = true;
      window.clearTimeout(scrollIdleTimer);
      scrollIdleTimer = window.setTimeout(() => {
        isScrolling = false;
        schedulePaint();
      }, SCROLL_IDLE_MS);
      schedulePaint();
    }

    /**
     * Marks layout dirty and schedules a full reflow/repaint.
     */
    function onResize(): void {
      needsLayout = true;
      schedulePaint();
    }

    /**
     * Syncs reduced-motion preference and repaints.
     */
    function onMotionChange(): void {
      reduceMotion = motionQuery.matches;
      schedulePaint();
    }

    /**
     * Syncs fine-pointer capability; clears spotlight when unavailable.
     */
    function onPointerCapabilityChange(): void {
      finePointer = finePointerQuery.matches;
      if (!finePointer) hasPointer = false;
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
    finePointerQuery.addEventListener("change", onPointerCapabilityChange);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onPointerLeave);

    layout();
    paint();

    /**
     * Tears down observers, listeners, timers, and pending frames on unmount.
     */
    return () => {
      themeObserver.disconnect();
      motionQuery.removeEventListener("change", onMotionChange);
      finePointerQuery.removeEventListener("change", onPointerCapabilityChange);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener(
        "mouseleave",
        onPointerLeave,
      );
      window.clearTimeout(scrollIdleTimer);
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
