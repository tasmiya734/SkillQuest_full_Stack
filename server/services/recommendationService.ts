import {
  AcademicYear,
  LearningLevel,
  normalizeLearningLevel,
  PerformanceLevel,
} from '../config/constants.ts';

export interface CategoryScoreSummary {
  category: string;
  correct: number;
  total: number;
  percentage: number;
  performanceLevel: PerformanceLevel;
}

export interface LearningRecommendation {
  category: string;
  percentage: number;
  performanceLevel: PerformanceLevel;
  suggestion: string;
  focusTopics: string[];
}

const LEARNING_GUIDANCE_MAP: Record<
  string,
  Record<
    LearningLevel,
    {
      needsPractice: string;
      developing: string;
      good: string;
      topics: string[];
    }
  >
> = {
  Python: {
    Easy: {
      needsPractice:
        'Explore what Python is used for—from simple task automation to data analysis and AI—and try writing basic scripts using `print()`, lists, and functions.',
      developing:
        'You have a growing awareness of Python! Try experimenting with lists, dictionaries, and small automation scripts to see how Python simplifies everyday tasks.',
      good:
        'You already have a good grasp of Python’s purpose and basics. Try building a small mini-project like a file organizer or simple quiz script.',
      topics: [
        'What Python Is Used For',
        'Lists, Dictionaries & Functions',
        'Simple Task Automation Scripts',
      ],
    },
    Moderate: {
      needsPractice:
        'Explore how Python packages (`pip`), dictionaries, and tools like Jupyter Notebook are used in data analysis and backend web APIs.',
      developing:
        'Try exploring Python’s popular libraries—such as Pandas for reading CSV data or Flask/FastAPI for creating a simple web endpoint.',
      good:
        'Deepen your Python exploration by combining a small dataset analysis in Pandas or building a clean backend API endpoint.',
      topics: [
        'Data Exploration with Pandas',
        'Jupyter Notebooks & Packages',
        'Backend Web APIs (Flask / FastAPI)',
      ],
    },
    Difficult: {
      needsPractice:
        'Explore how Python connects data science, automation, and web backends in real-world projects using virtual environments and API libraries.',
      developing:
        'Practice connecting a Python script to a public REST API (`requests`) or serving a simple machine learning prediction via FastAPI.',
      good:
        'You have strong familiarity with Python’s ecosystem. Try building an end-to-end mini-project that fetches data, processes it, and serves results.',
      topics: [
        'Calling & Building Web APIs',
        'Python for AI & Data Workflows',
        'Project Virtual Environments',
      ],
    },
  },
  'C/C++': {
    Easy: {
      needsPractice:
        'Explore why C and C++ are used for high-speed software like game engines, operating systems, and Arduino robotics, and review basic compiled program structure.',
      developing:
        'You understand the basics of where C/C++ is used. Try writing small console programs using variables, loops, and functions to see how compiled code works.',
      good:
        'You have a solid understanding of C/C++ fundamentals. Try experimenting with simple arrays, structs, or an Arduino/robotics simulation.',
      topics: [
        'Where C/C++ Is Used (Games, OS, Robotics)',
        'Compiled Code & Static Types',
        'Basic Program Structure (`main`)',
      ],
    },
    Moderate: {
      needsPractice:
        'Explore how C++ uses classes, objects, and the Standard Template Library (`std::vector`, `std::string`, `std::map`) to organize larger programs.',
      developing:
        'Practice using `std::vector` and `std::string` in C++ and explore how references and pointers help programs manage memory efficiently.',
      good:
        'Try building a small object-oriented console project or solving beginner-friendly problems using C++ STL containers.',
      topics: [
        'C++ STL (`vector`, `string`, `map`)',
        'Classes & Object-Oriented Design',
        'How Memory & References Work',
      ],
    },
    Difficult: {
      needsPractice:
        'Explore when engineering teams choose C/C++ (real-time games, embedded hardware, high-speed engines) versus higher-level languages like Python.',
      developing:
        'Review how stack vs. heap memory, `const` references, and modern smart pointers keep C++ applications fast and safe.',
      good:
        'Explore building a small 2D game loop (e.g., with Raylib/SFML) or a microcontroller project to experience C/C++ in action.',
      topics: [
        'Performance-Critical Use Cases',
        'Safe Memory Practices in Modern C++',
        'Game Engines & Embedded Systems',
      ],
    },
  },
  Java: {
    Easy: {
      needsPractice:
        'Explore what Java is commonly used for (Android apps, banking systems, enterprise backends) and how the JVM enables "Write Once, Run Anywhere".',
      developing:
        'You have a developing familiarity with Java! Review how classes and objects act as blueprints and instances in Java programs.',
      good:
        'You understand Java’s core purpose well. Try creating a few simple Java classes with fields, constructors, and methods.',
      topics: [
        'What Can Be Built with Java',
        'JVM & Cross-Platform Execution',
        'Classes & Objects Blueprint',
      ],
    },
    Moderate: {
      needsPractice:
        'Explore how Java organizes real-world applications using Collections (`ArrayList`, `HashMap`), interfaces, and frameworks like Spring Boot.',
      developing:
        'Practice storing and looking up data with `ArrayList` and `HashMap`, and explore how `try ... catch` handles errors safely.',
      good:
        'Try building a small Student or Library directory in Java using collections and object-oriented interfaces.',
      topics: [
        'Java Collections (`ArrayList`, `HashMap`)',
        'Interfaces & Inheritance Basics',
        'Introduction to Spring Boot APIs',
      ],
    },
    Difficult: {
      needsPractice:
        'Explore how Java powers large-scale backend services through encapsulation, automated JUnit testing, and database integration.',
      developing:
        'Look into how Spring Boot REST APIs and Java Streams simplify building and maintaining modern backend services.',
      good:
        'Explore creating a simple Spring Boot REST API endpoint and testing it to see how enterprise Java backends work.',
      topics: [
        'Enterprise Backend Architecture',
        'Spring Boot & Database Mapping',
        'Clean OOP & Automated Testing',
      ],
    },
  },
  JavaScript: {
    Easy: {
      needsPractice:
        'Explore how JavaScript works alongside HTML and CSS to add interactivity—like button clicks, live form checks, and dynamic updates—to websites.',
      developing:
        'You know why JavaScript is important on the web! Practice using `let`/`const`, functions, and DOM events (`click`, `input`) in a browser.',
      good:
        'You have a good grasp of JavaScript’s role. Try building a small interactive webpage (like a counter, to-do list, or color switcher).',
      topics: [
        'How HTML, CSS & JS Work Together',
        'Adding Website Interactivity (DOM)',
        'JSON & Node.js Basics',
      ],
    },
    Moderate: {
      needsPractice:
        'Explore how modern JavaScript uses array methods (`map`, `filter`), `fetch()` for calling APIs, and UI libraries like React.',
      developing:
        'Practice transforming lists with `.map()` and `.filter()`, and experiment with fetching live JSON data from a public API.',
      good:
        'Try building a reusable UI component in React or TypeScript that fetches and displays data dynamically.',
      topics: [
        'Frontend Components with React',
        'Fetching API Data (`async / await`)',
        'TypeScript & Array Methods',
      ],
    },
    Difficult: {
      needsPractice:
        'Explore how JavaScript/TypeScript powers full-stack Single-Page Applications (React on the frontend + Node.js/Express on the backend).',
      developing:
        'Review how asynchronous Promises keep apps responsive and why secret API keys must always stay on the backend server.',
      good:
        'Combine a React frontend with an Express API route to experience full-stack JavaScript development firsthand.',
      topics: [
        'Full-Stack JS (React + Node.js)',
        'Asynchronous Workflows & State',
        'Client vs. Server Security Practices',
      ],
    },
  },
  SQL: {
    Easy: {
      needsPractice:
        'Explore how relational databases organize data into tables (rows and columns) and how SQL `SELECT`, `WHERE`, and `INSERT` work.',
      developing:
        'You understand what SQL is used for! Practice filtering rows with `WHERE`, sorting with `ORDER BY`, and counting records with `COUNT()`.',
      good:
        'You have a solid grasp of introductory SQL. Try querying a sample table using filters, sorting, and primary keys.',
      topics: [
        'Relational Tables, Rows & Columns',
        'Querying Data (`SELECT`, `WHERE`)',
        'Primary Keys & Sorting (`ORDER BY`)',
      ],
    },
    Moderate: {
      needsPractice:
        'Explore how SQL connects related tables using `JOIN` (such as linking `students` and `assessments`) and summarizes data with `GROUP BY`.',
      developing:
        'Practice writing `INNER JOIN` and `LEFT JOIN` queries and calculating group averages or counts with `GROUP BY`.',
      good:
        'Try SkillQuest’s interactive SQL Challenge game or write multi-table queries that answer questions across linked tables.',
      topics: [
        'Connecting Tables with `JOIN`',
        'Summarizing Data (`GROUP BY`, `AVG`, `COUNT`)',
        'Foreign Keys & Table Relationships',
      ],
    },
    Difficult: {
      needsPractice:
        'Explore how real applications use SQL indexes for fast lookups, transactions for safe updates, and parameterized queries for security.',
      developing:
        'Review how Common Table Expressions (`WITH`) organize analytical queries and how PostgreSQL powers platforms like Supabase.',
      good:
        'Design a small multi-table schema in PostgreSQL/Supabase and write analytical queries to explore real-world reporting.',
      topics: [
        'Database Indexes & Fast Lookups',
        'Safe Transactions & SQL Security',
        'Analytical Queries in PostgreSQL',
      ],
    },
  },
  'Data Analytics': {
    Easy: {
      needsPractice:
        'Explore what Data Analytics involves—cleaning messy data, calculating averages/medians, and choosing clear charts (bar and line charts) to spot trends.',
      developing:
        'You understand the purpose of Data Analytics! Practice exploring a simple spreadsheet or CSV file and creating charts to answer questions.',
      good:
        'Try taking a public dataset (like sports stats or college trends) and creating a visual summary dashboard.',
      topics: [
        'What Data Analysts Do',
        'Data Cleaning & Missing Values',
        'Choosing the Right Visual Chart',
      ],
    },
    Moderate: {
      needsPractice:
        'Explore how analysts use Exploratory Data Analysis (EDA), Pivot Tables, and KPIs to summarize datasets and avoid correlation pitfalls.',
      developing:
        'Practice grouping data with Pivot Tables or SQL/Pandas and spotting outliers or funnel drop-offs in sample datasets.',
      good:
        'Explore combining multiple data tables and building an interactive chart dashboard in Power BI, Tableau, or Python.',
      topics: [
        'Exploratory Data Analysis (EDA)',
        'Pivot Tables, KPIs & Outliers',
        'Correlation vs. Causation',
      ],
    },
    Difficult: {
      needsPractice:
        'Explore how organizations use A/B testing, cohort analysis, and data storytelling to make evidence-based product decisions.',
      developing:
        'Look into how sampling bias and seasonality affect real-world datasets and how ETL pipelines keep dashboards updated.',
      good:
        'Practice presenting an end-to-end data analysis project with clear visual storytelling and actionable takeaways.',
      topics: [
        'A/B Testing & Cohort Analysis',
        'Spotting Sampling Bias & Seasonality',
        'Data Storytelling & Dashboards',
      ],
    },
  },
  'Data Science & AI': {
    Easy: {
      needsPractice:
        'Explore what Machine Learning and AI actually do—learning patterns from data for tasks like spam filtering, recommendations, NLP, and computer vision.',
      developing:
        'Review the core difference between Supervised Learning (labeled data), Unsupervised Learning (clustering), Classification, and Regression.',
      good:
        'You have a clear picture of AI fundamentals! Explore how training and test splits help check if a model truly learned.',
      topics: [
        'How Machine Learning Learns from Data',
        'Classification vs. Regression',
        'Real-World AI (NLP & Computer Vision)',
      ],
    },
    Moderate: {
      needsPractice:
        'Explore how data scientists prepare features, prevent overfitting, and use libraries like `scikit-learn` to train and evaluate models.',
      developing:
        'Look into how Decision Trees, Random Forests, and K-Means clustering work and why accuracy alone isn’t enough on imbalanced data.',
      good:
        'Try training a beginner-friendly machine learning model in a Jupyter Notebook using Python and `scikit-learn`.',
      topics: [
        'Overfitting vs. Generalization',
        'Decision Trees & Clustering Basics',
        'Introductory ML with `scikit-learn`',
      ],
    },
    Difficult: {
      needsPractice:
        'Explore how modern AI systems—such as Neural Networks, Recommendation Engines, and Large Language Models (LLMs)—work and get deployed via APIs.',
      developing:
        'Explore concepts like embeddings, transfer learning, responsible AI (checking for dataset bias), and serving models through web APIs.',
      good:
        'Build a small AI-powered prototype that uses a pre-trained model or `scikit-learn` pipeline behind a clean web interface.',
      topics: [
        'Neural Networks, Embeddings & LLMs',
        'Responsible AI & Dataset Fairness',
        'Deploying ML Models via Web APIs',
      ],
    },
  },
  'Web Development': {
    Easy: {
      needsPractice:
        'Explore how websites work by learning the difference between Frontend (HTML, CSS, JavaScript in the browser) and Backend (servers and databases).',
      developing:
        'Practice building a clean, responsive webpage using semantic HTML tags (`<header>`, `<main>`) and CSS Flexbox/Grid.',
      good:
        'You have a solid grasp of web basics! Try creating and styling a responsive personal portfolio page using HTML, CSS, and JavaScript.',
      topics: [
        'Frontend vs. Backend Overview',
        'Semantic HTML & Responsive CSS',
        'How Browsers & HTTP Work',
      ],
    },
    Moderate: {
      needsPractice:
        'Explore how modern web apps connect a component-based frontend (React) to a backend REST API (`GET` and `POST` requests) and manage user login sessions.',
      developing:
        'Practice building reusable React components, styling with Tailwind CSS, and using Git/GitHub to track your project code.',
      good:
        'Try connecting a frontend form or dashboard to a backend API route and displaying the returned JSON data.',
      topics: [
        'Reusable UI Components (React)',
        'REST APIs (`GET` / `POST`) & JSON',
        'Authentication & Version Control (Git)',
      ],
    },
    Difficult: {
      needsPractice:
        'Explore how full-stack web applications are secured (`.env` variables, CORS), optimized for fast loading, and deployed live to the cloud.',
      developing:
        'Review how dynamic full-stack apps handle loading/error states, SEO metadata, and real-time updates.',
      good:
        'Deploy a complete full-stack web project (React + Express + Supabase) to a live shareable HTTPS link.',
      topics: [
        'Full-Stack Architecture & Deployment',
        'Web Performance & User Experience',
        'Environment Variables & API Security',
      ],
    },
  },
  Cybersecurity: {
    Easy: {
      needsPractice:
        'Explore the core goals of Cybersecurity (Confidentiality, Integrity, Availability) and everyday protections like HTTPS, MFA, and password hashing.',
      developing:
        'Review how Phishing attacks trick users and how Authentication (who you are) differs from Authorization (what you can access).',
      good:
        'You have a strong awareness of security basics! Explore how firewalls and unique salted password hashes protect accounts.',
      topics: [
        'CIA Triad (Confidentiality, Integrity, Availability)',
        'Authentication, MFA & Password Hashing',
        'Spotting Phishing & Securing Connections (HTTPS)',
      ],
    },
    Moderate: {
      needsPractice:
        'Explore how secure software is built using Least Privilege, server-side ownership checks, and defenses against web attacks like XSS and SQL Injection.',
      developing:
        'Review the difference between two-way Encryption and one-way Hashing, and why secret admin keys must never be placed in frontend code.',
      good:
        'Explore ethical security testing concepts and audit a small web project to verify that all secrets and user routes are protected.',
      topics: [
        'Encryption vs. Hashing',
        'Web Security Basics (XSS, SQLi, Access Control)',
        'Protecting Backend Secret Keys',
      ],
    },
    Difficult: {
      needsPractice:
        'Explore how modern applications layer defenses ("Defense in Depth") using Role-Based Access Control (RBAC), Rate Limiting, and Row-Level Security (RLS).',
      developing:
        'Look into Zero-Trust security principles, auditing open-source dependencies (`npm audit`), and security monitoring.',
      good:
        'Practice beginner-friendly ethical Capture The Flag (CTF) challenges or OWASP security labs to sharpen your defensive skills.',
      topics: [
        'Defense in Depth & Zero-Trust Principles',
        'Role-Based Access & Database RLS',
        'Ethical Security Practice (CTFs & OWASP)',
      ],
    },
  },
  'Cloud Computing': {
    Easy: {
      needsPractice:
        'Explore what Cloud Computing is—running servers, storage, and databases over the internet on demand instead of managing physical hardware yourself.',
      developing:
        'Review the difference between IaaS, PaaS, and SaaS, and how cloud features like Auto-Scaling and Regions keep apps fast and online.',
      good:
        'You understand cloud fundamentals well! Explore how Cloud Object Storage and Virtual Machines power everyday apps.',
      topics: [
        'What the Cloud Is & Why Teams Use It',
        'IaaS, PaaS & SaaS Service Models',
        'Auto-Scaling, Regions & Cloud Storage',
      ],
    },
    Moderate: {
      needsPractice:
        'Explore how developers package apps with Docker containers, speed up websites with CDNs, and deploy code using Serverless and Managed Databases.',
      developing:
        'Look into how Load Balancers distribute traffic across servers and how CI/CD pipelines automatically deploy GitHub updates.',
      good:
        'Try deploying a web or API project using an automated cloud platform (like Vercel, Render, or Cloud Run) connected to GitHub.',
      topics: [
        'Docker Containers & Serverless Hosting',
        'Load Balancers & CDNs',
        'Automated CI/CD Deployments',
      ],
    },
    Difficult: {
      needsPractice:
        'Explore how cloud-native systems manage containers, monitor health with Logs and Metrics, and deploy updates with zero downtime.',
      developing:
        'Review Monolith vs. Microservices trade-offs, background job queues, and the Cloud Shared Responsibility security model.',
      good:
        'Containerize a full-stack application with a `Dockerfile` and explore cloud logs, health checks, and environment configuration.',
      topics: [
        'Container Orchestration & Cloud Architecture',
        'Cloud Logs, Metrics & Health Checks',
        'Zero-Downtime Releases & Cloud Security',
      ],
    },
  },
  'Database Management': {
    Easy: {
      needsPractice:
        'Explore why applications rely on a DBMS (like PostgreSQL) instead of flat files, and how schemas, Primary Keys, and Foreign Keys organize data.',
      developing:
        'Review how `CRUD` operations (Create, Read, Update, Delete), data types, and constraints (`NOT NULL`, `UNIQUE`) keep data clean.',
      good:
        'Try sketching a simple Entity-Relationship (ER) diagram for a college or hobby app with 2–3 linked tables.',
      topics: [
        'Why Applications Use a DBMS',
        'Tables, Schemas & Primary/Foreign Keys',
        'CRUD Operations & Data Constraints',
      ],
    },
    Moderate: {
      needsPractice:
        'Explore how Database Normalization reduces duplicate data, how ACID Transactions prevent half-saved mistakes, and how Indexes speed up searches.',
      developing:
        'Review how Relational (SQL) and Document (NoSQL) databases compare, and how junction tables model Many-to-Many relationships.',
      good:
        'Explore how SkillQuest stores historical assessment attempts in Supabase PostgreSQL without overwriting past records.',
      topics: [
        'Database Normalization & Clean Schemas',
        'ACID Transactions & Data Reliability',
        'How Database Indexes Speed Up Lookups',
      ],
    },
    Difficult: {
      needsPractice:
        'Explore how production databases handle thousands of simultaneous users (concurrency), survive power failures (WAL), and stay safe with Replication and Backups.',
      developing:
        'Look into versioned database migrations (`schema.sql`), query plans (`EXPLAIN`), caching, and modern AI vector search (`pgvector`).',
      good:
        'Design and deploy a multi-table PostgreSQL schema on Supabase with foreign keys, indexes, and clean access rules.',
      topics: [
        'Concurrency, Durability & Replication',
        'Query Optimization (`EXPLAIN`) & Caching',
        'Schema Migrations & Data Privacy',
      ],
    },
  },
};

/**
 * Generates modular, exploration-oriented recommendations based on categories where the student
 * can build familiarity or explore further.
 * Strictly avoids career-prediction language ("You should become...", "Your future career is...").
 */
export function generateLearningRecommendations(
  categoryScores: CategoryScoreSummary[],
  academicYear: AcademicYear | string
): LearningRecommendation[] {
  const normalizedLevel = normalizeLearningLevel(academicYear);
  // Sort categories from lowest percentage to highest so areas to explore/strengthen come first
  const sorted = [...categoryScores].sort((a, b) => a.percentage - b.percentage);

  // Focus on categories below 80% (Needs Practice, Developing, Good).
  // If a student scored 80%+ in everything, provide 2 categories with hands-on project exploration ideas.
  const targetCategories = sorted.filter((c) => c.percentage < 80);
  const selected =
    targetCategories.length > 0 ? targetCategories.slice(0, 3) : sorted.slice(0, 2);

  return selected.map((cat) => {
    const guidance =
      LEARNING_GUIDANCE_MAP[cat.category]?.[normalizedLevel] ||
      LEARNING_GUIDANCE_MAP[cat.category]?.Easy;
    let suggestion = `Explore what ${cat.category} is used for in real-world projects and try a beginner-friendly hands-on exercise.`;

    if (guidance) {
      if (cat.percentage < 40) {
        suggestion = guidance.needsPractice;
      } else if (cat.percentage < 60) {
        suggestion = guidance.developing;
      } else {
        suggestion = guidance.good;
      }
    }

    return {
      category: cat.category,
      percentage: cat.percentage,
      performanceLevel: cat.performanceLevel,
      suggestion,
      focusTopics: guidance
        ? guidance.topics
        : [`What ${cat.category} Is Used For`, 'Real-World Use Cases', 'Hands-On Mini Project'],
    };
  });
}
