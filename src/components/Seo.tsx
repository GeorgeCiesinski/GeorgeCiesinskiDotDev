/**
 * Sets document title and common meta / Open Graph tags by upserting <head> nodes.
 * Avoids react-helmet-async (React 19 duplicates static + client tags).
 */

import { useEffect } from "react";
import { SITE_NAME, SITE_URL } from "../config/site";

type SeoProps = {
  title: string;
  description: string;
  /** Path starting with `/`, e.g. `/blog/hello-world`. */
  path: string;
  type?: "website" | "article";
  /** Absolute or site-relative image path. */
  image?: string;
};

/**
 * Creates or updates a meta tag matched by `name` or `property`.
 *
 * @param attr - Attribute used to identify the tag (`name` or `property`).
 * @param key - Value of that attribute (e.g. `description`, `og:title`).
 * @param content - Meta content string.
 */
function upsertMeta(
  attr: "name" | "property",
  key: string,
  content: string,
): void {
  let el = document.querySelector(`meta[${attr}="${CSS.escape(key)}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/**
 * Creates or updates a link tag matched by `rel`.
 *
 * @param rel - Link relation (e.g. `canonical`).
 * @param href - Absolute or path URL.
 */
function upsertLink(rel: string, href: string): void {
  let el = document.querySelector(`link[rel="${CSS.escape(rel)}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Removes a meta tag if present (e.g. optional og:image when no cover).
 *
 * @param attr - Attribute used to identify the tag.
 * @param key - Value of that attribute.
 */
function removeMeta(attr: "name" | "property", key: string): void {
  document.querySelector(`meta[${attr}="${CSS.escape(key)}"]`)?.remove();
}

/**
 * @param props - Title, description, path, and optional OG extras.
 */
export function Seo({
  title,
  description,
  path,
  type = "website",
  image,
}: SeoProps) {
  const url = `${SITE_URL}${path}`;
  const fullTitle = title.includes(SITE_NAME)
    ? title
    : `${title} - ${SITE_NAME}`;
  const imageUrl = image
    ? image.startsWith("http")
      ? image
      : `${SITE_URL}${image}`
    : undefined;

  useEffect(() => {
    document.title = fullTitle;

    upsertMeta("name", "description", description);
    upsertLink("canonical", url);

    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:site_name", SITE_NAME);

    if (imageUrl) {
      upsertMeta("property", "og:image", imageUrl);
      upsertMeta("name", "twitter:image", imageUrl);
    } else {
      removeMeta("property", "og:image");
      removeMeta("name", "twitter:image");
    }

    upsertMeta(
      "name",
      "twitter:card",
      imageUrl ? "summary_large_image" : "summary",
    );
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", description);
  }, [fullTitle, description, url, type, imageUrl]);

  return null;
}
