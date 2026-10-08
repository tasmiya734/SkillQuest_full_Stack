import { SkillGameType } from '../services/api.ts';

export interface SkillGameMeta {
  type: SkillGameType;
  title: string;
  tagline: string;
  description: string;
  categories: string[];
  estimatedTime: string;
  roundsLabel: string;
  accentColor: 'blue' | 'purple' | 'cyan' | 'emerald';
}

export const SKILL_GAMES_CATALOG: SkillGameMeta[] = [
  {
    type: 'code_debugger',
    title: 'Code Debugger',
    tagline: 'Spot the Defect & Patch the Code',
    description:
      'Inspect real code snippets containing subtle syntax, memory, or logic bugs and select the exact engineering fix.',
    categories: ['Python', 'C/C++', 'Java', 'JavaScript', 'SQL'],
    estimatedTime: '3–4 mins',
    roundsLabel: '6 Rounds · +10 pts/round',
    accentColor: 'blue',
  },
  {
    type: 'output_predictor',
    title: 'Output Predictor',
    tagline: 'Trace Execution & Predict Terminal Output',
    description:
      'Mentally execute code involving closures, pointers, slicing, and object references to predict the exact runtime output.',
    categories: ['Python', 'C/C++', 'Java', 'JavaScript'],
    estimatedTime: '3–4 mins',
    roundsLabel: '6 Rounds · +10 pts/round',
    accentColor: 'purple',
  },
  {
    type: 'tech_match',
    title: 'Tech Match',
    tagline: 'Connect CS Concepts to Their Architecture',
    description:
      'Pair core computer science terms with their exact technical definitions across programming, cloud, security, and AI.',
    categories: [
      'Programming',
      'Web Development',
      'Database',
      'Cybersecurity',
      'Cloud Computing',
      'Data Science & AI',
    ],
    estimatedTime: '2–3 mins',
    roundsLabel: '3 Boards · 12 Concept Pairs',
    accentColor: 'cyan',
  },
  {
    type: 'sql_challenge',
    title: 'SQL Challenge',
    tagline: 'Write & Select the Right Relational Query',
    description:
      'Analyze live database table schemas and sample rows, then choose the exact SQL query that satisfies the specification.',
    categories: ['SQL', 'Database Management', 'Data Analytics'],
    estimatedTime: '3–4 mins',
    roundsLabel: '6 Queries · +10 pts/query',
    accentColor: 'emerald',
  },
];

// ============================================================================
// GAME 1: CODE DEBUGGER CHALLENGES
// ============================================================================

export interface DebuggerChallenge {
  id: string;
  language: 'Python' | 'C/C++' | 'Java' | 'JavaScript' | 'SQL';
  title: string;
  problemStatement: string;
  codeSnippet: string[];
  bugLineIndex: number; // 0-indexed line highlight
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const CODE_DEBUGGER_CHALLENGES: DebuggerChallenge[] = [
  {
    id: 'dbg_1',
    language: 'Python',
    title: 'Mutable Default List Argument',
    problemStatement:
      'This function is supposed to create a fresh list whenever `tags` is not passed, but subsequent calls unexpectedly retain items from previous calls.',
    codeSnippet: [
      'def add_skill_tag(tag, tags=[]):',
      '    tags.append(tag)',
      '    return tags',
      '',
      'print(add_skill_tag("Python"))  # ["Python"]',
      'print(add_skill_tag("SQL"))     # Bug: ["Python", "SQL"]',
    ],
    bugLineIndex: 0,
    options: [
      'Use `tags=None` in the signature and initialize `if tags is None: tags = []` inside the function',
      'Replace `tags.append(tag)` with `tags += [tag]` while keeping `tags=[]`',
      'Declare `global tags` at the top of `add_skill_tag`',
      'Convert `tag` to a tuple before calling `tags.append(tag)`',
    ],
    correctIndex: 0,
    explanation:
      'In Python, default parameter values are evaluated only once when the function is defined, not on every call. Using `tags=None` and creating a new list inside the body prevents shared state across calls.',
  },
  {
    id: 'dbg_2',
    language: 'Java',
    title: 'String Reference vs Value Comparison',
    problemStatement:
      'A student login role check returns `false` even when `role` contains the characters `"ADMIN"` constructed dynamically at runtime.',
    codeSnippet: [
      'public boolean isAdminRole(String inputRole) {',
      '    String normalized = inputRole.trim().toUpperCase();',
      '    if (normalized == "ADMIN") {',
      '        return true;',
      '    }',
      '    return false;',
      '}',
    ],
    bugLineIndex: 2,
    options: [
      'Replace `normalized == "ADMIN"` with `"ADMIN".equals(normalized)`',
      'Change `String normalized` to `CharSequence normalized` and keep `==`',
      'Wrap `"ADMIN"` in `new String("ADMIN")` inside the `==` check',
      'Use `normalized.compareTo("ADMIN") == true`',
    ],
    correctIndex: 0,
    explanation:
      'In Java, `==` compares object memory references rather than character content. Calling `.toUpperCase()` or `.trim()` can allocate a new `String` object on the heap, so `.equals()` must be used for value comparison.',
  },
  {
    id: 'dbg_3',
    language: 'C/C++',
    title: 'Returning Pointer to Stack-Allocated Variable',
    problemStatement:
      'Calling `createCounter()` causes undefined behavior because the returned pointer references memory that was destroyed when the function exited.',
    codeSnippet: [
      'int* createCounter(int initialValue) {',
      '    int count = initialValue;',
      '    count += 1;',
      '    return &count;',
      '}',
    ],
    bugLineIndex: 3,
    options: [
      'Return `count` by value (`int createCounter(int initialValue)`) or allocate safely via smart pointer / heap instead of returning `&count`',
      'Cast `&count` to `(void*)&count` before returning',
      'Change `int count` to `register int count`',
      'Replace `count += 1;` with `++count;` to preserve stack address',
    ],
    correctIndex: 0,
    explanation:
      'Local variable `count` lives on the stack frame of `createCounter`. Once the function returns, its stack frame is popped and `&count` becomes a dangling pointer. Returning the `int` by value avoids the lifetime bug.',
  },
  {
    id: 'dbg_4',
    language: 'JavaScript',
    title: 'Numeric Array Sort Trap',
    problemStatement:
      'Sorting an array of student assessment scores places `100` before `65` and `80` because elements are compared lexicographically as strings.',
    codeSnippet: [
      'const scores = [80, 100, 65, 92, 45];',
      'scores.sort();',
      'console.log(scores);',
      '// Output: [100, 45, 65, 80, 92]',
    ],
    bugLineIndex: 1,
    options: [
      'Pass a numeric comparator function: `scores.sort((a, b) => a - b)`',
      'Call `scores.reverse()` immediately after `scores.sort()`',
      'Use `scores.sort(Number)`',
      'Convert the array to a Set before calling `.sort()`',
    ],
    correctIndex: 0,
    explanation:
      'By default, `Array.prototype.sort()` converts elements to UTF-16 strings (`"100"` comes before `"45"`). Providing `(a, b) => a - b` sorts numbers in ascending numerical order.',
  },
  {
    id: 'dbg_5',
    language: 'SQL',
    title: 'Filtering Aggregate Count in WHERE Clause',
    problemStatement:
      'This query attempts to find departments with more than 5 students, but the database throws a syntax/execution error on line 3.',
    codeSnippet: [
      'SELECT department, COUNT(*) AS student_count',
      'FROM students',
      'WHERE COUNT(*) > 5',
      'GROUP BY department;',
    ],
    bugLineIndex: 2,
    options: [
      'Move `COUNT(*) > 5` from `WHERE` to a `HAVING COUNT(*) > 5` clause after `GROUP BY department`',
      'Replace `WHERE COUNT(*) > 5` with `WHERE student_count > 5`',
      'Remove `GROUP BY department` and keep `WHERE COUNT(*) > 5`',
      'Change `COUNT(*)` to `SUM(*)` inside the `WHERE` clause',
    ],
    correctIndex: 0,
    explanation:
      '`WHERE` filters individual rows before grouping and cannot evaluate aggregate functions like `COUNT(*)`. `HAVING` filters grouped rows after `GROUP BY` aggregation has been computed.',
  },
  {
    id: 'dbg_6',
    language: 'JavaScript',
    title: 'Missing Await in Async Fetch Handler',
    problemStatement:
      'The function logs `Promise { <pending> }` instead of the parsed JSON payload when fetching student profile data.',
    codeSnippet: [
      'async function getProfile(studentId) {',
      '  const response = await fetch(`/api/students/${studentId}`);',
      '  const data = response.json();',
      '  return data.student;',
      '}',
    ],
    bugLineIndex: 2,
    options: [
      'Add `await` before `response.json()`: `const data = await response.json();`',
      'Use `JSON.stringify(response)` instead of `response.json()`',
      'Remove `async` from the function declaration',
      'Replace `await fetch(...)` with `fetch.sync(...)`',
    ],
    correctIndex: 0,
    explanation:
      '`response.json()` reads the stream asynchronously and returns a Promise. Without `await`, `data` is a pending Promise object rather than the parsed JSON body, so `data.student` evaluates to `undefined`.',
  },
];

// ============================================================================
// GAME 2: OUTPUT PREDICTOR CHALLENGES
// ============================================================================

export interface OutputPredictorChallenge {
  id: string;
  language: 'Python' | 'C/C++' | 'Java' | 'JavaScript';
  title: string;
  codeSnippet: string[];
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const OUTPUT_PREDICTOR_CHALLENGES: OutputPredictorChallenge[] = [
  {
    id: 'out_1',
    language: 'Python',
    title: 'List Aliasing vs Slicing',
    codeSnippet: [
      'a = [10, 20, 30]',
      'b = a',
      'c = a[:]',
      'b[0] = 99',
      'c[1] = 77',
      'print(a[0], a[1])',
    ],
    options: ['99 20', '10 20', '99 77', '10 77'],
    correctIndex: 0,
    explanation:
      '`b = a` binds `b` to the exact same list object in memory, so `b[0] = 99` mutates `a[0]`. However, `c = a[:]` creates a shallow copy, so `c[1] = 77` does not affect `a[1]`. Thus `a` is `[99, 20, 30]`.',
  },
  {
    id: 'out_2',
    language: 'JavaScript',
    title: 'Event Loop & Microtask Queue Order',
    codeSnippet: [
      'console.log("A");',
      'setTimeout(() => console.log("B"), 0);',
      'Promise.resolve().then(() => console.log("C"));',
      'console.log("D");',
    ],
    options: ['A D C B', 'A B C D', 'A C D B', 'A D B C'],
    correctIndex: 0,
    explanation:
      'Synchronous statements `"A"` and `"D"` run first on the call stack. Next, the microtask queue (`Promise.then` -> `"C"`) is drained completely before the event loop processes the macrotask queue (`setTimeout` -> `"B"`).',
  },
  {
    id: 'out_3',
    language: 'C/C++',
    title: 'Pointer Arithmetic & Post-Increment',
    codeSnippet: [
      '#include <iostream>',
      'int main() {',
      '    int arr[] = {5, 15, 25, 35};',
      '    int* ptr = arr;',
      '    int val = *ptr++;',
      '    std::cout << val << " " << *ptr;',
      '    return 0;',
      '}',
    ],
    options: ['5 15', '15 15', '6 15', '5 25'],
    correctIndex: 0,
    explanation:
      'Post-increment `ptr++` has higher precedence than dereference `*`, so `*ptr++` dereferences the original address first (`val = 5`) and then advances `ptr` to point to the next element (`arr[1]`, which is `15`).',
  },
  {
    id: 'out_4',
    language: 'Java',
    title: 'String Concatenation vs Arithmetic Evaluation',
    codeSnippet: [
      'public class Trace {',
      '    public static void main(String[] args) {',
      '        System.out.println(10 + 20 + "CS" + 10 + 20);',
      '    }',
      '}',
    ],
    options: ['30CS1020', '1020CS1020', '30CS30', '1020CS30'],
    correctIndex: 0,
    explanation:
      'The `+` operator evaluates left-to-right. First, `10 + 20` performs integer addition (`30`). Next, `30 + "CS"` produces the String `"30CS"`. Subsequent `+ 10` and `+ 20` append to the String, yielding `"30CS1020"`.',
  },
  {
    id: 'out_5',
    language: 'Python',
    title: 'Short-Circuit Logical Operators',
    codeSnippet: [
      'x = [] or "Fallback"',
      'y = "Primary" and 42',
      'print(f"{x}-{y}")',
    ],
    options: [
      'Fallback-42',
      'True-True',
      '[]-Primary',
      'Fallback-Primary',
    ],
    correctIndex: 0,
    explanation:
      'In Python, `or` returns the first truthy operand (or the last operand if all are falsy): `[]` is falsy, so `x` becomes `"Fallback"`. `and` returns the first falsy operand or the last operand if all are truthy: `"Primary"` is truthy, so `y` becomes `42`.',
  },
  {
    id: 'out_6',
    language: 'JavaScript',
    title: 'Object Key Reference & Destructuring Default',
    codeSnippet: [
      'const config = { retries: 0, timeout: undefined };',
      'const { retries = 3, timeout = 5000 } = config;',
      'console.log(retries, timeout);',
    ],
    options: ['0 5000', '3 5000', '0 undefined', '3 undefined'],
    correctIndex: 0,
    explanation:
      'In JavaScript destructuring, default values are only used when a property is strictly `undefined`. Since `retries` is `0` (not `undefined`), it stays `0`, while `timeout` uses the default `5000`.',
  },
];

// ============================================================================
// GAME 3: TECH MATCH CHALLENGES (MULTI-ROUND MATCHING BOARDS)
// ============================================================================

export interface TechMatchPair {
  id: string;
  concept: string;
  category: string;
  description: string;
}

export interface TechMatchBoard {
  boardNumber: number;
  title: string;
  subtitle: string;
  pairs: TechMatchPair[];
}

export const TECH_MATCH_BOARDS: TechMatchBoard[] = [
  {
    boardNumber: 1,
    title: 'Board 1: Database & Web Architecture',
    subtitle: 'Match each relational database and web engineering concept to its exact definition.',
    pairs: [
      {
        id: 'tm_1',
        concept: 'SQL INNER JOIN',
        category: 'Database',
        description: 'Returns only rows that have matching values in both joined tables',
      },
      {
        id: 'tm_2',
        concept: 'ACID Atomicity',
        category: 'Database',
        description: 'Guarantees a transaction executes completely ("all or nothing") or rolls back entirely',
      },
      {
        id: 'tm_3',
        concept: 'REST Idempotency',
        category: 'Web Development',
        description: 'Property where making multiple identical HTTP requests produces the same server state as a single request',
      },
      {
        id: 'tm_4',
        concept: 'CORS Policy',
        category: 'Web Development',
        description: 'Browser security mechanism using HTTP headers to control cross-origin resource access',
      },
    ],
  },
  {
    boardNumber: 2,
    title: 'Board 2: Cybersecurity & Cloud Infrastructure',
    subtitle: 'Pair each security protocol and cloud computing model with its core responsibility.',
    pairs: [
      {
        id: 'tm_5',
        concept: 'Salted Password Hashing',
        category: 'Cybersecurity',
        description: 'Adds a unique random string before one-way hashing to defend against rainbow table attacks',
      },
      {
        id: 'tm_6',
        concept: 'Parameterized Queries',
        category: 'Cybersecurity',
        description: 'Separates SQL code structure from user-supplied data to prevent SQL Injection',
      },
      {
        id: 'tm_7',
        concept: 'Horizontal Auto-Scaling',
        category: 'Cloud Computing',
        description: 'Dynamically adds or removes compute instances based on real-time traffic load',
      },
      {
        id: 'tm_8',
        concept: 'Containerization (Docker)',
        category: 'Cloud Computing',
        description: 'Packages application code and dependencies into isolated user-space processes sharing the host OS kernel',
      },
    ],
  },
  {
    boardNumber: 3,
    title: 'Board 3: Programming Internals & Data Science',
    subtitle: 'Connect core language mechanics and machine learning evaluation metrics.',
    pairs: [
      {
        id: 'tm_9',
        concept: 'Lexical Closure',
        category: 'Programming',
        description: 'A function bundled with references to variables from its outer enclosing scope even after the outer function returns',
      },
      {
        id: 'tm_10',
        concept: 'Binary Search Tree (BST)',
        category: 'Programming',
        description: 'Hierarchical node structure where left descendants are smaller and right descendants are larger than the parent key',
      },
      {
        id: 'tm_11',
        concept: 'Overfitting (ML)',
        category: 'Data Science & AI',
        description: 'When a model memorizes training noise and achieves high training accuracy but poor generalization on unseen test data',
      },
      {
        id: 'tm_12',
        concept: 'Precision vs Recall',
        category: 'Data Science & AI',
        description: 'Trade-off between the exactness of positive predictions and the completeness of capturing all actual positives',
      },
    ],
  },
];

// ============================================================================
// GAME 4: SQL CHALLENGE
// ============================================================================

export interface SqlChallengeItem {
  id: string;
  title: string;
  tableName: string;
  schemaColumns: { name: string; type: string }[];
  sampleRows: Record<string, string | number>[];
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const SQL_CHALLENGES: SqlChallengeItem[] = [
  {
    id: 'sql_1',
    title: 'High-Scoring Students Filter & Sort',
    tableName: 'students',
    schemaColumns: [
      { name: 'id', type: 'INT' },
      { name: 'full_name', type: 'VARCHAR' },
      { name: 'learning_level', type: 'VARCHAR' },
      { name: 'score', type: 'INT' },
    ],
    sampleRows: [
      { id: 101, full_name: 'Aarav Sharma', learning_level: 'Difficult', score: 88 },
      { id: 102, full_name: 'Meera Nair', learning_level: 'Moderate', score: 74 },
      { id: 103, full_name: 'Rohan Desai', learning_level: 'Difficult', score: 93 },
    ],
    prompt:
      'Find all students who scored strictly above 80, ordered from highest score to lowest score.',
    options: [
      'SELECT * FROM students WHERE score > 80 ORDER BY score DESC;',
      'SELECT * FROM students WHERE score >= 80 ORDER BY score ASC;',
      'SELECT * FROM students HAVING score > 80 SORT BY score DESC;',
      'SELECT * FROM students GROUP BY score WHERE score > 80;',
    ],
    correctIndex: 0,
    explanation:
      '`WHERE score > 80` filters rows with scores strictly greater than 80, and `ORDER BY score DESC` sorts the result set in descending order (highest first).',
  },
  {
    id: 'sql_2',
    title: 'Average Score Per Learning Level',
    tableName: 'assessment_results',
    schemaColumns: [
      { name: 'result_id', type: 'INT' },
      { name: 'student_id', type: 'INT' },
      { name: 'learning_level', type: 'VARCHAR' },
      { name: 'overall_score', type: 'DECIMAL' },
    ],
    sampleRows: [
      { result_id: 1, student_id: 12, learning_level: 'Easy', overall_score: 76.0 },
      { result_id: 2, student_id: 19, learning_level: 'Moderate', overall_score: 84.5 },
      { result_id: 3, student_id: 24, learning_level: 'Easy', overall_score: 82.0 },
    ],
    prompt:
      'Calculate the average `overall_score` for each `learning_level` and alias the average column as `avg_score`.',
    options: [
      'SELECT learning_level, AVG(overall_score) AS avg_score FROM assessment_results GROUP BY learning_level;',
      'SELECT learning_level, MEAN(overall_score) AS avg_score FROM assessment_results ORDER BY learning_level;',
      'SELECT learning_level, AVG(overall_score) AS avg_score FROM assessment_results WHERE GROUP BY learning_level;',
      'SELECT AVG(overall_score) AS avg_score FROM assessment_results HAVING learning_level;',
    ],
    correctIndex: 0,
    explanation:
      'SQL uses the `AVG()` aggregate function paired with `GROUP BY learning_level` to compute the mean score per learning level group.',
  },
  {
    id: 'sql_3',
    title: 'Categories With At Least 20 Attempts',
    tableName: 'category_attempts',
    schemaColumns: [
      { name: 'attempt_id', type: 'INT' },
      { name: 'category', type: 'VARCHAR' },
      { name: 'student_id', type: 'INT' },
      { name: 'marks', type: 'INT' },
    ],
    sampleRows: [
      { attempt_id: 501, category: 'Python', student_id: 11, marks: 9 },
      { attempt_id: 502, category: 'SQL', student_id: 14, marks: 8 },
      { attempt_id: 503, category: 'Python', student_id: 18, marks: 10 },
    ],
    prompt:
      'Retrieve each `category` and its total number of attempts (`total_attempts`), returning ONLY categories that have 20 or more attempts.',
    options: [
      'SELECT category, COUNT(*) AS total_attempts FROM category_attempts GROUP BY category HAVING COUNT(*) >= 20;',
      'SELECT category, COUNT(*) AS total_attempts FROM category_attempts WHERE COUNT(*) >= 20 GROUP BY category;',
      'SELECT category, SUM(attempt_id) AS total_attempts FROM category_attempts GROUP BY category;',
      'SELECT category, COUNT(*) AS total_attempts FROM category_attempts HAVING total_attempts >= 20;',
    ],
    correctIndex: 0,
    explanation:
      'To filter groups based on the result of an aggregate function like `COUNT(*)`, you must group first (`GROUP BY category`) and filter with `HAVING COUNT(*) >= 20`.',
  },
  {
    id: 'sql_4',
    title: 'Joining Students With Their Submissions',
    tableName: 'students / submissions',
    schemaColumns: [
      { name: 'students.id', type: 'INT (PK)' },
      { name: 'students.full_name', type: 'VARCHAR' },
      { name: 'submissions.student_id', type: 'INT (FK)' },
      { name: 'submissions.track', type: 'VARCHAR' },
    ],
    sampleRows: [
      { 'students.id': 1, 'students.full_name': 'Kabir Verma', 'submissions.student_id': 1, 'submissions.track': 'programming' },
      { 'students.id': 2, 'students.full_name': 'Ananya Rao', 'submissions.student_id': 2, 'submissions.track': 'domain' },
    ],
    prompt:
      'List every student (`full_name`) alongside their `track` from `submissions`, including students who have NOT submitted any assessment yet.',
    options: [
      'SELECT s.full_name, sub.track FROM students s LEFT JOIN submissions sub ON s.id = sub.student_id;',
      'SELECT s.full_name, sub.track FROM students s INNER JOIN submissions sub ON s.id = sub.student_id;',
      'SELECT s.full_name, sub.track FROM students s RIGHT JOIN submissions sub ON s.id = sub.student_id;',
      'SELECT s.full_name, sub.track FROM students s CROSS JOIN submissions sub;',
    ],
    correctIndex: 0,
    explanation:
      '`LEFT JOIN` preserves all rows from the left table (`students`) even when there is no matching row in `submissions` (filling `sub.track` with `NULL`). `INNER JOIN` would exclude students with zero submissions.',
  },
  {
    id: 'sql_5',
    title: 'Pattern Matching Institutional Emails',
    tableName: 'users',
    schemaColumns: [
      { name: 'user_id', type: 'INT' },
      { name: 'email', type: 'VARCHAR' },
      { name: 'division', type: 'VARCHAR' },
    ],
    sampleRows: [
      { user_id: 1, email: 'aarav@cs.edu.in', division: 'A' },
      { user_id: 2, email: 'neha@gmail.com', division: 'B' },
      { user_id: 3, email: 'rohan@cs.edu.in', division: 'A' },
    ],
    prompt:
      'Find all users whose `email` address ends with `"@cs.edu.in"` in division `"A"`.',
    options: [
      "SELECT * FROM users WHERE email LIKE '%@cs.edu.in' AND division = 'A';",
      "SELECT * FROM users WHERE email LIKE '@cs.edu.in%' OR division = 'A';",
      "SELECT * FROM users WHERE email CONTAINS '@cs.edu.in' AND division = 'A';",
      "SELECT * FROM users WHERE email = '*@cs.edu.in' AND division == 'A';",
    ],
    correctIndex: 0,
    explanation:
      'In standard SQL, the `%` wildcard in `LIKE \'%@cs.edu.in\'` matches any prefix of zero or more characters ending with `@cs.edu.in`, combined with `AND division = \'A\'`.',
  },
  {
    id: 'sql_6',
    title: 'Distinct Programming Categories Attempted',
    tableName: 'question_logs',
    schemaColumns: [
      { name: 'log_id', type: 'INT' },
      { name: 'student_id', type: 'INT' },
      { name: 'category', type: 'VARCHAR' },
      { name: 'is_correct', type: 'BOOLEAN' },
    ],
    sampleRows: [
      { log_id: 1, student_id: 42, category: 'Python', is_correct: 'true' },
      { log_id: 2, student_id: 42, category: 'Python', is_correct: 'false' },
      { log_id: 3, student_id: 42, category: 'Java', is_correct: 'true' },
    ],
    prompt:
      'Return a list of unique `category` names where `student_id = 42` answered at least one question correctly (`is_correct = TRUE`), without duplicate category names.',
    options: [
      'SELECT DISTINCT category FROM question_logs WHERE student_id = 42 AND is_correct = TRUE;',
      'SELECT UNIQUE(category) FROM question_logs WHERE student_id = 42 OR is_correct = TRUE;',
      'SELECT category FROM question_logs WHERE student_id = 42 HAVING is_correct = TRUE;',
      'SELECT COUNT(category) FROM question_logs WHERE student_id = 42 AND is_correct = TRUE;',
    ],
    correctIndex: 0,
    explanation:
      '`SELECT DISTINCT category` eliminates duplicate category rows after `WHERE student_id = 42 AND is_correct = TRUE` filters for the student’s correct responses.',
  },
];
