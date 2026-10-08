export interface TechExplorationGuide {
  name: string;
  track: 'programming' | 'domain';
  tagline: string;
  whatItIs: string;
  whatYouCanBuild: string[];
  whereItIsUsed: string;
  exploreNextTip: string;
}

export const TECH_EXPLORATION_GUIDES: Record<string, TechExplorationGuide> = {
  Python: {
    name: 'Python',
    track: 'programming',
    tagline: 'Readable, beginner-friendly language for AI, data, automation & web backends',
    whatItIs:
      'A high-level programming language famous for its clean, English-like readability that lets you focus on solving problems rather than complex syntax.',
    whatYouCanBuild: [
      'Task automation scripts (organizing files, reading spreadsheets)',
      'Data analysis charts & Machine Learning / AI models',
      'Backend web APIs using FastAPI, Flask, or Django',
    ],
    whereItIsUsed:
      'Data Science & AI teams, backend web services, scientific computing, and cybersecurity automation.',
    exploreNextTip:
      'Try writing a 20-line script that reads a CSV file or automates a repetitive task on your computer.',
  },
  'C/C++': {
    name: 'C/C++',
    track: 'programming',
    tagline: 'High-speed compiled languages close to computer hardware and memory',
    whatItIs:
      'Foundational compiled languages that give developers direct control over hardware, CPU performance, and computer memory.',
    whatYouCanBuild: [
      '3D game engines and high-frame-rate graphics software',
      'Microcontroller, Arduino, and robotics hardware projects',
      'Operating system components, browsers, and fast data structures',
    ],
    whereItIsUsed:
      'Game development (Unreal Engine), embedded hardware/IoT, robotics, and operating systems.',
    exploreNextTip:
      'Experiment with C++ STL containers (`vector`, `map`) or build a simple Arduino/robotics simulation.',
  },
  Java: {
    name: 'Java',
    track: 'programming',
    tagline: 'Cross-platform Object-Oriented language for enterprise backends & Android',
    whatItIs:
      'A strongly typed, class-based Object-Oriented language built around the "Write Once, Run Anywhere" Java Virtual Machine (JVM).',
    whatYouCanBuild: [
      'Large-scale enterprise backend systems and Spring Boot APIs',
      'Native Android mobile applications',
      'Secure banking, e-commerce, and transaction systems',
    ],
    whereItIsUsed:
      'Enterprise software companies, fintech & banking systems, e-commerce backends, and Android development.',
    exploreNextTip:
      'Model a real-world system (like a College Library) using Java classes, objects, and `ArrayList` / `HashMap`.',
  },
  JavaScript: {
    name: 'JavaScript',
    track: 'programming',
    tagline: 'The language of interactive websites and modern full-stack web apps',
    whatItIs:
      'The native programming language built into every web browser—and thanks to Node.js, also used to build backend servers.',
    whatYouCanBuild: [
      'Interactive websites and responsive UIs with React',
      'Full-stack web applications and REST APIs with Node.js & Express',
      'Browser games, live dashboards, and cross-platform apps',
    ],
    whereItIsUsed:
      'Almost every website on the internet, frontend engineering, and full-stack web startups.',
    exploreNextTip:
      'Open your browser Developer Tools or build a small interactive webpage that responds to button clicks and fetches an API.',
  },
  SQL: {
    name: 'SQL',
    track: 'programming',
    tagline: 'The universal language for querying and organizing relational databases',
    whatItIs:
      'Structured Query Language—used to store, search, filter, join, and summarize structured data stored in database tables.',
    whatYouCanBuild: [
      'Database queries that power user profiles, orders, and score histories',
      'Analytical reports that answer business and product questions',
      'Multi-table relational schemas on PostgreSQL / Supabase',
    ],
    whereItIsUsed:
      'Every software application that saves structured data—across Web Development, Data Analytics, AI, and Cloud.',
    exploreNextTip:
      'Practice `SELECT`, `WHERE`, `JOIN`, and `GROUP BY` queries—or try the SQL Challenge in SkillQuest Skill Games!',
  },
  'Data Analytics': {
    name: 'Data Analytics',
    track: 'domain',
    tagline: 'Turning raw datasets into clear visual charts, trends, and insights',
    whatItIs:
      'The practice of cleaning, exploring, and visualizing data to understand what happened, why it happened, and what decisions to make next.',
    whatYouCanBuild: [
      'Interactive visual dashboards (Power BI, Tableau, or Python charts)',
      'Trend and funnel analyses for businesses, sports, or education',
      'Cleaned, well-structured reports from messy spreadsheets and SQL tables',
    ],
    whereItIsUsed:
      'Business intelligence, product management, finance, healthcare, sports analytics, and e-commerce.',
    exploreNextTip:
      'Pick a public CSV dataset on a topic you enjoy (like cricket, movies, or campus stats) and create 3 clear charts from it.',
  },
  'Data Science & AI': {
    name: 'Data Science & AI',
    track: 'domain',
    tagline: 'Teaching computers to learn patterns, make predictions, and build smart tools',
    whatItIs:
      'Combining data, statistics, and machine learning algorithms so software can recognize patterns, predict outcomes, and understand language or images.',
    whatYouCanBuild: [
      'Predictive models (spam filters, price estimators, recommendation engines)',
      'Natural Language Processing (NLP) chatbots and text analyzers',
      'Computer Vision tools that classify or detect objects in images',
    ],
    whereItIsUsed:
      'AI product teams, recommendation platforms (YouTube/Spotify), healthcare diagnostics, and smart automation.',
    exploreNextTip:
      'Explore how Supervised Learning works by training a simple model in a Jupyter Notebook using Python and `scikit-learn`.',
  },
  'Web Development': {
    name: 'Web Development',
    track: 'domain',
    tagline: 'Building websites and full-stack web apps people use in their browsers',
    whatItIs:
      'Creating both the visual Frontend interface (HTML, CSS, JavaScript, React) and the Backend server/API that powers modern web applications.',
    whatYouCanBuild: [
      'Personal portfolio websites and interactive landing pages',
      'Full-stack platforms with user login, dashboards, and databases (like SkillQuest)',
      'REST APIs and real-time collaborative web tools',
    ],
    whereItIsUsed:
      'Every industry—from tech startups and SaaS platforms to education, media, and e-commerce.',
    exploreNextTip:
      'Build a responsive webpage with HTML/CSS/JS or React and deploy it to a live shareable link.',
  },
  Cybersecurity: {
    name: 'Cybersecurity',
    track: 'domain',
    tagline: 'Protecting systems, networks, accounts, and data from digital threats',
    whatItIs:
      'Designing defenses, authentication rules, encryption, and safe coding practices so applications and users stay protected against cyber attacks.',
    whatYouCanBuild: [
      'Secure authentication flows (MFA, password hashing, session validation)',
      'Hardened backend APIs protected against SQL Injection and XSS',
      'Security monitoring scripts and ethical vulnerability checks',
    ],
    whereItIsUsed:
      'Banking & fintech, cloud infrastructure, government systems, and every software engineering team.',
    exploreNextTip:
      'Learn how HTTPS, password hashing, and access control work—and try beginner-friendly ethical CTF security challenges.',
  },
  'Cloud Computing': {
    name: 'Cloud Computing',
    track: 'domain',
    tagline: 'Deploying and scaling servers, storage, and apps over the internet',
    whatItIs:
      'Using internet-based platforms (AWS, Google Cloud, Azure, Vercel, Supabase) to host, scale, and manage applications without maintaining physical server rooms.',
    whatYouCanBuild: [
      'Globally accessible web applications with automatic HTTPS and CDNs',
      'Dockerized backend services that scale automatically with user traffic',
      'Automated CI/CD pipelines that deploy code whenever you push to GitHub',
    ],
    whereItIsUsed:
      'DevOps, cloud engineering, modern SaaS startups, and enterprise infrastructure.',
    exploreNextTip:
      'Deploy a web or API project to a cloud platform and explore how environment variables, logs, and live deployments work.',
  },
  'Database Management': {
    name: 'Database Management',
    track: 'domain',
    tagline: 'Structuring, securing, and maintaining reliable databases for applications',
    whatItIs:
      'Designing clean table schemas, relationships, indexes, and transaction rules so software can store and retrieve millions of records safely.',
    whatYouCanBuild: [
      'Normalized multi-table PostgreSQL schemas with Primary and Foreign Keys',
      'Fast-searching indexed tables and append-only historical logs',
      'Secure database access rules (Row-Level Security) and backup workflows',
    ],
    whereItIsUsed:
      'Backend engineering, data engineering, cloud platforms (Supabase, Cloud SQL), and enterprise systems.',
    exploreNextTip:
      'Sketch an Entity-Relationship (ER) diagram for an app idea and create its tables in Supabase PostgreSQL.',
  },
};

export function getGuideByCategory(category: string): TechExplorationGuide | undefined {
  return TECH_EXPLORATION_GUIDES[category];
}

