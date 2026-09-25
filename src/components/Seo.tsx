/**
 * Sets document title and common meta / Open Graph tags.
 */

import { Helmet } from "react-helmet-async";
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

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />

      {imageUrl ? <meta property="og:image" content={imageUrl} /> : null}

      <meta
        name="twitter:card"
        content={imageUrl ? "summary_large_image" : "summary"}
      />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {imageUrl ? <meta name="twitter:image" content={imageUrl} /> : null}
    </Helmet>
  );
}
