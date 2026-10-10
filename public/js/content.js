"use strict";
// ALL THE WORDS ON THE SITE LIVE IN THIS FILE.
// Edit the text between the quotes, save, and refresh the browser.
// Search for [TODO] to find everything that still needs your real text.

const SITE = {
  name: "Pratik Phophaliya",
  tagline: "B.Tech student · IIIT Allahabad",
  // Small line at the top right of the page.
  edition: "Portfolio · 2026",
  // Small capital letters printed on every cover and page header.
  mark: "PRATIK PHOPHALIYA",
  // Last line on the final page of each book.
  colophon: "Part of the portfolio of Pratik Phophaliya.",
  // Shown only when the 3D shelf cannot run.
  fallbackTitle: "Seven books about me.",
  credit: "3D bookshelf based on the Complete Shelf component by ThreeUI (Meng To)."
};

// The seven books, in shelf order.
//   title      - name on the cover, spine and bottom bar
//   discipline - small label under the title
//   note       - one line under the title on the shelf
//   deck       - paragraph in the side panel when the book is picked up
//   theme      - short line in the side panel and on the picture pages
//   chapters   - the three chapter titles inside the book
//   links      - buttons in the side panel: label, icon (see icons.js) and url
//   pages      - the six inside pages, in reading order: left, right, left, right, left, right.
//                A page can have: kicker (small label), heading, body (paragraphs),
//                list (lines, optionally with an icon), fine (small line at the bottom),
//                image + caption (a picture), or art: true (the cover picture as a plate).
//   gallery    - used by Hobbies instead of pages: one picture and description per page turn
//   closingNote - the message on the last page
//   coverArt   - which painted cover to use (see js/engine/04b-cover-art.js)
const BOOKS = [
  {
    // --- Words ---
    id: "about",
    title: "About Me",
    roman: "I",
    discipline: "Who I am",
    note: "Who I am, what I study, and what I love making.",
    deck: "I'm Pratik Phophaliya, a second-year B.Tech student in Information Technology at IIIT Allahabad. I love making games and art, digital or on paper.",
    theme: "Games · art · code",
    chapters: ["Who I am", "What I build", "Find me"],
    links: [
      { label: "GitHub", icon: "github", url: "https://github.com/pratikphophaliya" },
      { label: "Codeforces", icon: "codeforces", url: "https://codeforces.com/profile/binanamakkaaalu" }
    ],
    pages: [
      {
        kicker: "Hello",
        heading: "Who I am",
        body: [
          "I'm Pratik Phophaliya, a sophomore at IIIT Allahabad, studying for a B.Tech in Information Technology."
        ]
      },
      {
        kicker: "What I love",
        heading: "Art and games",
        body: [
          "I love anything to do with art, digital or on paper, and I enjoy doing both.",
          "I also love games: playing them, and even more, making them."
        ]
      },
      {
        kicker: "From my GitHub",
        heading: "What I build",
        body: ["A lot of what I make is written from scratch:"],
        list: [
          "A chess game in Java",
          "Pong in C++",
          "A CPU ray tracer in C++",
          "A rotating 3D ASCII donut in C++"
        ]
      },
      {
        kicker: "Problem solving",
        heading: "Codeforces",
        body: ["I also do competitive programming on Codeforces, where I am rated Pupil."],
        fine: "Handle: binanamakkaaalu"
      },
      {
        kicker: "Elsewhere",
        heading: "Find me",
        list: [
          { icon: "github", text: "github.com/pratikphophaliya" },
          { icon: "codeforces", text: "Codeforces: binanamakkaaalu" }
        ],
        body: ["The Contact book on this shelf has my email and LinkedIn."]
      },
      { art: true }
    ],
    closingNote: "Thanks for reading. The other books on this shelf have my projects, my story and how to reach me.",
    // --- Look (kept from the original design) ---
    binding: "Ultramarine cloth · copper foil",
    format: "148 × 216 mm · imagined edition",
    motif: "Sunrise",
    coverArt: "sunrise",
    motifKey: "brackets",
    paletteLabel: "Ultramarine · bone · copper",
    color: "#182a43",
    foil: "#c87046",
    // Color of the title on the cover and spine. Black would vanish on this dark blue.
    titleColor: "#f1eadf",
    palette: {
      paper: "#171a24",
      paperDeep: "#10131b",
      paperPale: "#f1eadf",
      ink: "#f4eee6",
      inkSoft: "#b9b4ae",
      wall: "#171a24",
      shelf: "#3a2118",
      shelfDark: "#1c0e0a",
      light: "#f4d7b9",
      fill: "#9fb3c9"
    },
    width: 1.02,
    height: 1.58,
    depth: 0.26,
    seed: 11
  },
  {
    // --- Words ---
    id: "projects",
    title: "Projects",
    roman: "II",
    discipline: "Things I have built",
    note: "Two of my projects, with links to the code.",
    deck: "Two of my projects: Krude, a risk dashboard for India's crude oil supply, and a chess game written in Java. The code for both is on GitHub.",
    theme: "Krude · Chess in Java",
    chapters: ["Krude", "Chess in Java", "More on GitHub"],
    links: [
      { label: "Krude", icon: "github", url: "https://github.com/pratikphophaliya/Krude-" },
      { label: "Chess", icon: "github", url: "https://github.com/pratikphophaliya/oops-chess" },
      { label: "All repos", icon: "link", url: "https://github.com/pratikphophaliya?tab=repositories" }
    ],
    pages: [
      {
        kicker: "Project 01",
        heading: "Krude",
        body: [
          "A decision-support dashboard for India's crude oil supply.",
          "It scores live geopolitical risk at sea chokepoints such as the Strait of Hormuz, simulates supply disruptions, and suggests how to reroute crude purchases."
        ],
        fine: "github.com/pratikphophaliya/Krude-"
      },
      {
        kicker: "Inside Krude",
        heading: "What it does",
        list: [
          "Threat board for five sea corridors",
          "Disruption simulator with cost and GDP impact",
          "Supplier ranking and rerouting",
          "Planner for strategic reserve drawdowns"
        ],
        body: [
          "Built in a team of three with Python, FastAPI, DuckDB, NetworkX and PuLP, and a plain HTML, CSS and JavaScript front end."
        ]
      },
      {
        kicker: "Project 02",
        heading: "Chess in Java",
        body: [
          "A chess game I made to understand object-oriented programming.",
          "I wrote the core logic myself: the board, the pieces, how they move and the rules."
        ],
        fine: "github.com/pratikphophaliya/oops-chess"
      },
      {
        kicker: "Inside the chess game",
        heading: "How it is built",
        body: [
          "Every piece has its own class (King, Queen, Rook, Bishop, Knight and Pawn), alongside classes for the Board, a Move, a Position and the Game.",
          "The Swing window and the piece images were made using Claude Code."
        ]
      },
      {
        kicker: "Smaller builds",
        heading: "More on GitHub",
        list: [
          "Pong, built from scratch in C++",
          "A CPU ray tracer in C++",
          "A rotating 3D ASCII donut in C++"
        ],
        fine: "github.com/pratikphophaliya"
      },
      { art: true }
    ],
    closingNote: "More of my code is on GitHub: github.com/pratikphophaliya",
    // --- Look (kept from the original design) ---
    binding: "Burnt-orange cloth · antique-gold foil",
    format: "156 × 228 mm · imagined edition",
    motif: "Building blocks",
    coverArt: "blocks",
    motifKey: "paths",
    paletteLabel: "Burnt orange · cream · burgundy",
    color: "#c24d24",
    foil: "#efc16d",
    titleColor: "#171a16",
    palette: {
      paper: "#762f1b",
      paperDeep: "#572113",
      paperPale: "#ffe4c5",
      ink: "#fff0df",
      inkSoft: "#e3bfa8",
      wall: "#762f1b",
      shelf: "#402015",
      shelfDark: "#1d0d08",
      light: "#ffd19a",
      fill: "#dc8c6b"
    },
    width: 1.1,
    height: 1.46,
    depth: 0.29,
    seed: 22
  },
  {
    // --- Words ---
    id: "experience",
    title: "Experience",
    roman: "III",
    discipline: "Outside the classroom",
    note: "Hackathons, society work, and what I have done outside class.",
    deck: "Hackathons (including SIH 2026), society work, and anything else I have done outside class. [TODO: add roles, dates and results]",
    theme: "Hackathons · societies · outside class",
    chapters: ["Hackathons", "Society work", "Outside class"],
    // --- Look (kept from the original design) ---
    binding: "Citron cloth · black gloss foil",
    format: "140 × 210 mm · imagined edition",
    motif: "Mountain path",
    coverArt: "peaks",
    motifKey: "caret",
    paletteLabel: "Citron · ink · off-white",
    color: "#afc400",
    foil: "#171a16",
    palette: {
      paper: "#c3cf21",
      paperDeep: "#9eaa16",
      paperPale: "#f0f2c9",
      ink: "#171914",
      inkSoft: "#485015",
      wall: "#c3cf21",
      shelf: "#3b2418",
      shelfDark: "#1c0f09",
      light: "#fff6ce",
      fill: "#dce37e"
    },
    width: 0.92,
    height: 1.52,
    depth: 0.22,
    seed: 33,
    glossFoil: true
  },
  {
    // --- Words ---
    id: "origins",
    title: "Origins",
    roman: "IV",
    discipline: "Before college",
    note: "Born in Rajasthan, raised in Pune. My story before college.",
    deck: "I was born in Rajasthan and have lived my whole life in Pune. This is the short story of my school years, the entrance exams, and how I got to IIIT Allahabad.",
    theme: "Rajasthan · Pune · Allahabad",
    chapters: ["Rajasthan to Pune", "School", "Entrance exams"],
    pages: [
      {
        kicker: "Where I am from",
        heading: "Rajasthan to Pune",
        body: ["I was born in Rajasthan, but I have lived my whole life in Pune."]
      },
      {
        kicker: "Till Class 10",
        heading: "Magarpatta",
        body: [
          "I studied till Class 10 at Vidya Pratishthan's Magarpatta Public School, and finished with 98.4%."
        ]
      },
      {
        kicker: "Class 11 and 12",
        heading: "Pioneer Public School",
        body: ["I did my 11th and 12th at Pioneer Public School, and scored 88.4% in Class 12."]
      },
      {
        kicker: "Entrance exams",
        heading: "JEE and MHT-CET",
        body: ["I prepared for JEE with PW."],
        list: ["JEE Main: rank 8688, 99.44 percentile", "MHT-CET: 99.55 percentile"]
      },
      {
        kicker: "Now",
        heading: "IIIT Allahabad",
        body: [
          "That brought me to IIIT Allahabad, where I am now a second-year B.Tech student in Information Technology."
        ]
      },
      { art: true }
    ],
    closingNote: "That is the story so far.",
    // --- Look (kept from the original design) ---
    binding: "Coral cloth · copper foil",
    format: "146 × 224 mm · imagined edition",
    motif: "Tree rings",
    coverArt: "rings",
    motifKey: "frames",
    paletteLabel: "Coral · pink · oxblood",
    color: "#da3b2f",
    foil: "#ff8eab",
    palette: {
      paper: "#ae2830",
      paperDeep: "#7f1822",
      paperPale: "#ffe0df",
      ink: "#fff0e9",
      inkSoft: "#efb9b4",
      wall: "#ae2830",
      shelf: "#402016",
      shelfDark: "#1d0d08",
      light: "#ffc3bb",
      fill: "#e46d78"
    },
    width: 0.96,
    height: 1.57,
    depth: 0.24,
    seed: 66
  },
  {
    // --- Words ---
    id: "resume",
    title: "Resume",
    roman: "V",
    discipline: "One-page summary",
    note: "Education, courses, scores and coding, in short.",
    deck: "A short summary of my education, courses, exam scores and coding. The full resume is a PDF you can download.",
    theme: "Resume · in short",
    chapters: ["Education", "Scores", "Projects"],
    links: [
      { label: "Download PDF", icon: "download", url: "resume.pdf", download: true }
    ],
    pages: [
      {
        kicker: "Education",
        heading: "IIIT Allahabad",
        body: ["B.Tech in Information Technology.", "Currently in my second year."]
      },
      {
        kicker: "Important courses",
        heading: "Courses",
        list: [
          "Data Structures and Algorithms",
          "Operating Systems",
          "Object Oriented Methodologies",
          "Software Engineering",
          "Discrete Mathematical Structures",
          "Probability and Statistics",
          "Linear Algebra"
        ]
      },
      {
        kicker: "Exams",
        heading: "Scores",
        list: [
          "JEE Main: rank 8688, 99.44 percentile",
          "MHT-CET: 99.55 percentile",
          "Class 12: 88.4%",
          "Class 10: 98.4%"
        ]
      },
      {
        kicker: "Coding",
        heading: "Programming",
        list: ["Codeforces: Pupil (binanamakkaaalu)", "Languages in my projects: C++, Java and Python"]
      },
      {
        kicker: "Selected work",
        heading: "Projects",
        list: [
          "Krude: risk dashboard for India's crude oil supply",
          "Chess in Java",
          "Pong, a ray tracer and an ASCII donut in C++"
        ],
        body: ["Details are in the Projects book."]
      },
      {
        kicker: "Full version",
        heading: "Download",
        body: [
          "The complete resume is available as a PDF. Use the Download PDF button beside this book."
        ]
      }
    ],
    closingNote: "Want the full version? Use the Download PDF button beside this book.",
    // --- Look (kept from the original design) ---
    binding: "Cobalt cloth · cool-silver foil",
    format: "162 × 240 mm · imagined edition",
    motif: "Written page",
    coverArt: "sheet",
    motifKey: "orbits",
    paletteLabel: "Cobalt · sky · silver",
    color: "#1537a1",
    foil: "#dbe8f1",
    palette: {
      paper: "#142a80",
      paperDeep: "#0b1953",
      paperPale: "#dbe8f1",
      ink: "#f3f5f2",
      inkSoft: "#b5c7e9",
      wall: "#142a80",
      shelf: "#3b2117",
      shelfDark: "#1a0d08",
      light: "#e5edf2",
      fill: "#5f85dc"
    },
    width: 1.08,
    height: 1.68,
    depth: 0.25,
    seed: 44
  },
  {
    // --- Words ---
    id: "hobbies",
    title: "Hobbies",
    roman: "VI",
    discipline: "",
    note: "Drawing.",
    deck: "I like to draw. Turn the pages to see three of my drawings: Tom Holland, Doctor Strange and Ultron.",
    theme: "Drawing",
    chapters: ["Tom Holland", "Doctor Strange", "Ultron"],
    // One drawing per page turn: the picture is on the right page and its
    // description on the left page. Leave description as "" to keep that page empty.
    gallery: [
      {
        title: "Tom Holland",
        image: "assets/hobbies/tom-holland.png",
        description: "I drew this in March 2022, still caught up in the hype around the 2021 Spider-Man movie. It was turning out so well that I almost finished it in one sitting."
      },
      {
        title: "Doctor Strange",
        image: "assets/hobbies/doctor-strange.png",
        description: "Drawn in May 2022. I had just come back late from the theatre after watching Doctor Strange in the Multiverse of Madness, and I loved the movie so much that I made this to remember that day."
      },
      {
        title: "Ultron",
        image: "assets/hobbies/ultron.png",
        description: "One of the first portraits I ever made. I drew it in December 2021, during the holidays, because I wanted to try out my new pencils :)"
      }
    ],
    // Shown on the very last page instead of the usual book details.
    closingNote: "I lost most of my artworks in a flood. But you can always contact me to see more, or for a custom-made drawing.",
    // --- Look (kept from the original design) ---
    binding: "Vermilion cloth · rose-gold foil",
    format: "150 × 220 mm · imagined edition",
    motif: "Abstract shapes",
    coverArt: "abstract",
    motifKey: "modules",
    paletteLabel: "Vermilion · plum · blush",
    color: "#c83222",
    foil: "#efb0aa",
    palette: {
      paper: "#a62c21",
      paperDeep: "#7f1e17",
      paperPale: "#ffe0d5",
      ink: "#fff0e8",
      inkSoft: "#e9bbb2",
      wall: "#a62c21",
      shelf: "#432016",
      shelfDark: "#1f0d08",
      light: "#ffd1bc",
      fill: "#d66d66"
    },
    width: 1,
    height: 1.48,
    depth: 0.3,
    seed: 55
  },
  {
    // --- Words ---
    id: "contact",
    title: "Contact",
    roman: "VII",
    discipline: "Say hello",
    note: "Email, LinkedIn, GitHub and Codeforces.",
    deck: "The easiest way to reach me is email. You can also find me on LinkedIn, GitHub and Codeforces.",
    theme: "Email · LinkedIn · GitHub",
    chapters: ["Email", "LinkedIn", "Code"],
    links: [
      { label: "Email me", icon: "mail", url: "mailto:pratikphophaliya@gmail.com" },
      { label: "LinkedIn", icon: "linkedin", url: "https://www.linkedin.com/in/pratik-phophaliya/" },
      { label: "GitHub", icon: "github", url: "https://github.com/pratikphophaliya" },
      { label: "Codeforces", icon: "codeforces", url: "https://codeforces.com/profile/binanamakkaaalu" }
    ],
    pages: [
      {
        kicker: "Say hello",
        heading: "Get in touch",
        body: ["The easiest way to reach me is email.", "The buttons beside this book open each link."]
      },
      {
        kicker: "Email",
        heading: "Gmail",
        list: [
          { icon: "mail", text: "pratikphophaliya@gmail.com" }
        ]
      },
      {
        kicker: "Work",
        heading: "LinkedIn",
        list: [
          { icon: "linkedin", text: "linkedin.com/in/pratik-phophaliya" }
        ]
      },
      {
        kicker: "Code",
        heading: "GitHub and Codeforces",
        list: [
          { icon: "github", text: "github.com/pratikphophaliya" },
          { icon: "codeforces", text: "Codeforces: binanamakkaaalu" }
        ],
        body: ["I am rated Pupil on Codeforces."]
      },
      {
        kicker: "Message me",
        heading: "Send a message",
        body: [
          "Press the Email me button beside this book. It opens your email app with my address already filled in."
        ]
      },
      { art: true }
    ],
    closingNote: "Thanks for stopping by.",
    // --- Look (kept from the original design) ---
    binding: "Icy-cyan cloth · aluminum foil",
    format: "158 × 232 mm · imagined edition",
    motif: "Paper plane",
    coverArt: "plane",
    motifKey: "compass",
    paletteLabel: "Icy cyan · navy · aluminum",
    color: "#78a7bd",
    foil: "#e4e7e5",
    palette: {
      paper: "#7ea5b7",
      paperDeep: "#5e8699",
      paperPale: "#e6f0f2",
      ink: "#102a36",
      inkSoft: "#274b5a",
      wall: "#7ea5b7",
      shelf: "#382017",
      shelfDark: "#1b0e09",
      light: "#eef5f2",
      fill: "#add1df"
    },
    width: 1.12,
    height: 1.63,
    depth: 0.28,
    seed: 77
  }
];
