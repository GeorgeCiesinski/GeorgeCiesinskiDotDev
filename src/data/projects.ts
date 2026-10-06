/**
 * Portfolio project catalog and helpers for the home grid and detail routes.
 */

export type ProjectSection = "web" | "apps";

/** A single screenshot or GIF shown in the project detail carousel. */
export interface ProjectSlide {
  src: string;
  caption: string;
}

export interface Project {
  /** URL segment for `/projects/:slug`. */
  slug: string;
  title: string;
  category: string;
  datestart: string;
  dateend: string;
  description: string;
  tech: string[];
  /** Home-grid thumbnail; distinct from detail `slides`. */
  thumbnail: string;
  /** Optional outbound links shown on the detail page. */
  github?: string;
  demo?: string;
  slides: ProjectSlide[];
}

export const projects: Project[] = [
  {
    slug: "galesage",
    title: "GaleSage",
    category: "Full-Stack Web Application",
    datestart: "2026 June",
    dateend: "Present",
    description:
      "A weather forecast web app for comparing conditions across locations, with a built-in AI advisor that answers questions from the forecast data.",
    tech: [
      "TypeScript",
      "React.js",
      "Vite",
      "Vitest",
      "Vercel",
      "Visual Crossing API",
      "Nominatim API",
    ],
    thumbnail: "/img/front-page/galesage-thumb.webp",
    github: "https://github.com/GeorgeCiesinski/galesage",
    demo: "https://www.galesage.app/",
    slides: [
      {
        src: "/img/galesage/search-location.gif",
        caption: "Find your desired location using Nominatim's geocode API.",
      },
      {
        src: "/img/galesage/ask-advisor.gif",
        caption:
          "Ask the advisor questions about the next 5 days, or the selected day.",
      },
      {
        src: "/img/galesage/daily-forecast.gif",
        caption: "See up to 14 days of forecast data.",
      },
      {
        src: "/img/galesage/hourly-forecast.gif",
        caption: "See the hourly forecast for each day.",
      },
      {
        src: "/img/galesage/three-locations.gif",
        caption: "Compare forecast data from up to three locations.",
      },
    ],
  },
  {
    slug: "poke-guesser",
    title: "Poke-guesser Bot",
    category: "Back-end",
    datestart: "2021 June",
    dateend: "Present",
    description:
      "A Discord bot game where players guess Pok\u00e9mon from images. Tracks scores on a leaderboard and supports multilingual reveals via PokeAPI.",
    tech: ["JavaScript", "discord.js", "pokeapi.co", "PostgreSQL", "Docker"],
    thumbnail: "/img/front-page/pokebot-thumb.webp",
    github: "https://github.com/GeorgeCiesinski/poke-guesser-bot",
    slides: [
      {
        src: "/img/poke-bot/explore.png",
        caption:
          "The !explore admin command generates a new pockemon for users to catch",
      },
      {
        src: "/img/poke-bot/catch.png",
        caption:
          "The $catch player command allows players to guess a pokemon name.",
      },
      {
        src: "/img/poke-bot/leaderboard.png",
        caption: "The $leaderboard command shows the top 20 players.",
      },
      {
        src: "/img/poke-bot/reveal.png",
        caption:
          "The !reveal admin command reveals the pokemon if players are unable to guess it. The pokemon name is shown in multiple languages.",
      },
    ],
  },
  {
    slug: "library-app",
    title: "Library App",
    category: "Front-end",
    datestart: "2022 November",
    dateend: "2022 December",
    description:
      "Track books you are reading or have read. Add titles by ISBN for automatic cover lookup, toggle read status, and switch light/dark mode.",
    tech: ["HTML", "CSS", "SASS", "JavaScript"],
    thumbnail: "/img/front-page/library-thumb.webp",
    github: "https://github.com/GeorgeCiesinski/library-app",
    demo: "https://georgeciesinski.github.io/library-app/",
    slides: [
      {
        src: "/img/library-app/add-book.gif",
        caption:
          "Add books with ISBN so that the title and cover is added automatically",
      },
      {
        src: "/img/library-app/toggle-mode.gif",
        caption:
          "The app also detects your OS settings and adjusts the mode automatically",
      },
      {
        src: "/img/library-app/toggle-read.gif",
        caption:
          "Toggle the read/unread status of the books in the library app",
      },
      {
        src: "/img/library-app/link-to-ol.gif",
        caption:
          "Clicking the ISBN link takes you straight to the book info on Open Library",
      },
      {
        src: "/img/library-app/remove-book.gif",
        caption:
          "Books can be removed if you change your mind about reading them",
      },
    ],
  },
  {
    slug: "pixel-sketchpad",
    title: "Pixel Sketchpad",
    category: "Front-end",
    datestart: "2022 September",
    dateend: "2022 November",
    description:
      "A pixel drawing tool with color selection, grid size controls, and a background eraser that preserves drawings when the canvas color changes.",
    tech: ["HTML", "CSS", "SASS", "JavaScript"],
    thumbnail: "/img/front-page/pixel-thumb.webp",
    github: "https://github.com/GeorgeCiesinski/pixel-sketchpad",
    demo: "https://georgeciesinski.github.io/pixel-sketchpad/",
    slides: [
      {
        src: "/img/pixel-sketchpad/pixel-sketchpad.png",
        caption:
          "Tool layout contains color selection, tools, and grid size controls",
      },
      {
        src: "/img/pixel-sketchpad/background.gif",
        caption:
          "Background color can be changed without affecting drawing. Eraser turns cells into background cells.",
      },
    ],
  },
  {
    slug: "flask-api",
    title: "Flask RESTful API",
    category: "Back-end",
    datestart: "2021 August",
    dateend: "2023 January",
    description:
      "A Flask-RESTful API for registering users, authenticating, and creating/retrieving/deleting stores and items, backed by SQLite and deployable on Heroku.",
    tech: ["Python", "Flask", "Flask-RESTful", "SQLite", "Heroku"],
    thumbnail: "/img/front-page/flask-api-thumb.webp",
    github: "https://github.com/GeorgeCiesinski/FlaskRESTful-for-Heroku",
    slides: [
      {
        src: "/img/flask-api/user-auth-bad.png",
        caption: "Auth fails if bad user credentials are posted.",
      },
      {
        src: "/img/flask-api/user-register.png",
        caption: "Register new users using post.",
      },
      {
        src: "/img/flask-api/user-auth-good.png",
        caption: "Auth succeeds if good user credentials are posted.",
      },
      {
        src: "/img/flask-api/store-post.png",
        caption: "New stores can easily be posted.",
      },
      {
        src: "/img/flask-api/item-post.png",
        caption: "New items can be posted to existing stores.",
      },
      {
        src: "/img/flask-api/stores-get.png",
        caption: "All existing stores and items can be retrieved with get.",
      },
      {
        src: "/img/flask-api/item-delete.png",
        caption: "Items can be deleted from database.",
      },
      {
        src: "/img/flask-api/flask-logs.png",
        caption: "Snapshot of console output as requests are made.",
      },
    ],
  },
  {
    slug: "text-script",
    title: "Text-Script",
    category: "Desktop App",
    datestart: "2020 January",
    dateend: "2020 June",
    description:
      "A desktop expansion tool that pastes textblock templates from keyboard shortcuts into any text field \u2014 built to speed up customer email responses.",
    tech: ["Python", "Pynput", "Pyperclip"],
    thumbnail: "/img/front-page/text-script-thumb.webp",
    github: "https://github.com/GeorgeCiesinski/text-script",
    slides: [
      {
        src: "/img/text-script/email.gif",
        caption:
          "Typing in a shortcut will automatically paste the textblock into the text input.",
      },
      {
        src: "/img/text-script/console-window.png",
        caption:
          "App stats and shortcuts can be viewed in the console which can be minimized and kept in the background.",
      },
    ],
  },
];

/**
 * Looks up a project by its route slug.
 *
 * @param slug - URL slug from `/projects/:slug`.
 * @returns Matching project, or `undefined` if unknown.
 */
export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
