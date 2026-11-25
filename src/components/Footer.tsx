/**
 * Site footer with external profile links and copyright.
 */

const links = [
  {
    href: "https://github.com/GeorgeCiesinski",
    label: "GitHub",
    path: "M12 .5C5.37.5 0 5.78 0 12.29c0 5.21 3.44 9.63 8.21 11.19.6.11.82-.26.82-.57v-2.01c-3.34.71-4.04-1.59-4.04-1.59-.55-1.37-1.33-1.74-1.33-1.74-1.09-.73.08-.72.08-.72 1.2.08 1.84 1.22 1.84 1.22 1.07 1.81 2.81 1.29 3.5.99.11-.77.42-1.29.76-1.59-2.67-.3-5.47-1.31-5.47-5.84 0-1.29.47-2.35 1.24-3.17-.12-.3-.54-1.51.12-3.15 0 0 1.01-.32 3.3 1.21a11.7 11.7 0 0 1 6 0c2.29-1.53 3.3-1.21 3.3-1.21.66 1.64.24 2.85.12 3.15.77.82 1.24 1.88 1.24 3.17 0 4.54-2.81 5.54-5.49 5.83.43.37.82 1.1.82 2.22v3.29c0 .32.22.69.83.57C20.56 21.92 24 17.5 24 12.29 24 5.78 18.63.5 12 .5Z",
  },
  {
    href: "https://stackoverflow.com/users/2665812/georgeciesinski",
    label: "Stack Overflow",
    path: "M17.09 19.38v-5.1h1.69V21H2.86v-6.72h1.69v5.1h12.54ZM7.1 17.7h8.45v-1.69H7.1V17.7Zm.21-3.83 8.26 1.73.36-1.65-8.26-1.73-.36 1.65Zm1.09-4.02 7.65 3.57.7-1.53-7.65-3.57-.7 1.53Zm2.12-3.8 6.49 5.42 1.07-1.28-6.49-5.42-1.07 1.28Zm4.16-4.05-1.37.99 5.04 6.76 1.37-.99-5.04-6.76Z",
  },
  {
    href: "https://www.linkedin.com/in/george-ciesinski/",
    label: "LinkedIn",
    path: "M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.23 0Z",
  },
];

/**
 * Site footer with social links and copyright year.
 *
 * @returns Footer with profile links and the current copyright year.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <h2 className="footer__heading">My Links</h2>
        <div className="footer__links">
          {links.map((link) => (
            <a
              key={link.href}
              className="footer__link"
              href={link.href}
              target="_blank"
              rel="noreferrer"
              aria-label={link.label}
              title={link.label}
            >
              <svg
                viewBox="0 0 24 24"
                width="28"
                height="28"
                aria-hidden="true"
              >
                <path fill="currentColor" d={link.path} />
              </svg>
            </a>
          ))}
        </div>
        <p className="footer__copy">
          &copy; {year} George Ciesinski. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
