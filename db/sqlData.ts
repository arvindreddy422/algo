import { SqlSource } from "../types";

export const SQL_PREREQUISITES = [
  {
    id: 1,
    topic: "Basics",
    title: "SELECT, WHERE, ORDER BY, LIMIT",
    description: "Understand the core structure of a SQL query. Practice filtering rows, sorting results, and limiting output.",
    docUrl: "https://www.postgresql.org/docs/current/tutorial-select.html",
    completed: false
  },
  {
    id: 2,
    topic: "Aggregation",
    title: "GROUP BY and HAVING",
    description: "Learn how to group rows that have the same values and filter these groups using HAVING.",
    docUrl: "https://www.postgresql.org/docs/current/tutorial-agg.html",
    completed: false
  },
  {
    id: 3,
    topic: "Joins",
    title: "INNER, LEFT, RIGHT, FULL, CROSS",
    description: "Understand how to combine rows from two or more tables based on a related column between them.",
    docUrl: "https://www.postgresql.org/docs/current/tutorial-join.html",
    completed: false
  },
  {
    id: 4,
    topic: "Advanced Queries",
    title: "Subqueries and CTEs",
    description: "Learn how to nest queries using subqueries and the WITH clause (Common Table Expressions) for better readability.",
    docUrl: "https://www.postgresql.org/docs/current/queries-with.html",
    completed: false
  },
  {
    id: 5,
    topic: "Window Functions",
    title: "ROW_NUMBER, RANK, LAG, LEAD",
    description: "Master window functions to perform calculations across a set of table rows that are somehow related to the current row.",
    docUrl: "https://www.postgresql.org/docs/current/tutorial-window.html",
    completed: false
  },
  {
    id: 6,
    topic: "PostgreSQL Specifics",
    title: "Date/Time, Strings, JSONB",
    description: "Familiarize yourself with Postgres specific functions like DATE_TRUNC, EXTRACT, ILIKE, and handling JSON data.",
    docUrl: "https://www.postgresql.org/docs/current/functions.html",
    completed: false
  }
];

export const SQL_PROBLEMS = [
  // Basics
  { id: 1, title: "Select All Columns from Employees", difficulty: "Easy", topics: ["Basics"], url: "https://leetcode.com/problems/find-customer-referee/", source: "LeetCode" as SqlSource, prerequisiteTopics: ["Basics"], status: "pending", attempts: 0 },
  { id: 2, title: "Recyclable and Low Fat Products", difficulty: "Easy", topics: ["Basics"], url: "https://leetcode.com/problems/recyclable-and-low-fat-products/", source: "LeetCode" as SqlSource, prerequisiteTopics: ["Basics"], status: "pending", attempts: 0 },
  { id: 3, title: "Big Countries", difficulty: "Easy", topics: ["Basics"], url: "https://leetcode.com/problems/big-countries/", source: "LeetCode" as SqlSource, prerequisiteTopics: ["Basics"], status: "pending", attempts: 0 },
  { id: 4, title: "Article Views I", difficulty: "Easy", topics: ["Basics", "Distinct"], url: "https://leetcode.com/problems/article-views-i/", source: "LeetCode" as SqlSource, prerequisiteTopics: ["Basics"], status: "pending", attempts: 0 },
  
  // Joins
  { id: 5, title: "Replace Employee ID With The Unique Identifier", difficulty: "Easy", topics: ["Joins"], url: "https://leetcode.com/problems/replace-employee-id-with-the-unique-identifier/", source: "LeetCode" as SqlSource, prerequisiteTopics: ["Joins"], status: "pending", attempts: 0 },
  { id: 6, title: "Product Sales Analysis I", difficulty: "Easy", topics: ["Joins"], url: "https://leetcode.com/problems/product-sales-analysis-i/", source: "LeetCode" as SqlSource, prerequisiteTopics: ["Joins"], status: "pending", attempts: 0 },
  { id: 7, title: "Customer Who Visited but Did Not Make Any Transactions", difficulty: "Easy", topics: ["Joins", "Aggregation"], url: "https://leetcode.com/problems/customer-who-visited-but-did-not-make-any-transactions/", source: "LeetCode" as SqlSource, prerequisiteTopics: ["Joins", "Aggregation"], status: "pending", attempts: 0 },
  { id: 8, title: "Rising Temperature", difficulty: "Easy", topics: ["Joins", "Date/Time"], url: "https://leetcode.com/problems/rising-temperature/", source: "LeetCode" as SqlSource, prerequisiteTopics: ["Joins"], status: "pending", attempts: 0 },

  // Aggregation
  { id: 9, title: "Not Boring Movies", difficulty: "Easy", topics: ["Aggregation", "Math"], url: "https://leetcode.com/problems/not-boring-movies/", source: "LeetCode" as SqlSource, prerequisiteTopics: ["Aggregation"], status: "pending", attempts: 0 },
  { id: 10, title: "Average Selling Price", difficulty: "Easy", topics: ["Aggregation", "Joins"], url: "https://leetcode.com/problems/average-selling-price/", source: "LeetCode" as SqlSource, prerequisiteTopics: ["Aggregation"], status: "pending", attempts: 0 },
  { id: 11, title: "Project Employees I", difficulty: "Easy", topics: ["Aggregation", "Joins"], url: "https://leetcode.com/problems/project-employees-i/", source: "LeetCode" as SqlSource, prerequisiteTopics: ["Aggregation"], status: "pending", attempts: 0 },
  { id: 12, title: "Percentage of Users Attended a Contest", difficulty: "Easy", topics: ["Aggregation"], url: "https://leetcode.com/problems/percentage-of-users-attended-a-contest/", source: "LeetCode" as SqlSource, prerequisiteTopics: ["Aggregation"], status: "pending", attempts: 0 },

  // Subqueries & CTEs
  { id: 13, title: "Employees Whose Manager Left the Company", difficulty: "Easy", topics: ["Subqueries"], url: "https://leetcode.com/problems/employees-whose-manager-left-the-company/", source: "LeetCode" as SqlSource, prerequisiteTopics: ["Advanced Queries"], status: "pending", attempts: 0 },
  { id: 14, title: "Exchange Seats", difficulty: "Medium", topics: ["CTEs", "CASE"], url: "https://leetcode.com/problems/exchange-seats/", source: "LeetCode" as SqlSource, prerequisiteTopics: ["Advanced Queries"], status: "pending", attempts: 0 },
  { id: 15, title: "Movie Rating", difficulty: "Medium", topics: ["CTEs", "Joins", "Aggregation"], url: "https://leetcode.com/problems/movie-rating/", source: "LeetCode" as SqlSource, prerequisiteTopics: ["Advanced Queries"], status: "pending", attempts: 0 },
  { id: 16, title: "Restaurant Growth", difficulty: "Medium", topics: ["CTEs", "Window Functions"], url: "https://leetcode.com/problems/restaurant-growth/", source: "LeetCode" as SqlSource, prerequisiteTopics: ["Advanced Queries", "Window Functions"], status: "pending", attempts: 0 },

  // Window Functions
  { id: 17, title: "Department Top Three Salaries", difficulty: "Hard", topics: ["Window Functions", "Joins"], url: "https://leetcode.com/problems/department-top-three-salaries/", source: "LeetCode" as SqlSource, prerequisiteTopics: ["Window Functions"], status: "pending", attempts: 0 },
  { id: 18, title: "Investments in 2016", difficulty: "Medium", topics: ["Window Functions"], url: "https://leetcode.com/problems/investments-in-2016/", source: "LeetCode" as SqlSource, prerequisiteTopics: ["Window Functions"], status: "pending", attempts: 0 },
  { id: 19, title: "Game Play Analysis IV", difficulty: "Medium", topics: ["Window Functions"], url: "https://leetcode.com/problems/game-play-analysis-iv/", source: "LeetCode" as SqlSource, prerequisiteTopics: ["Window Functions"], status: "pending", attempts: 0 },
  
  // Advanced & Postgres Specific
  { id: 20, title: "User Activity for the Past 30 Days I", difficulty: "Easy", topics: ["Date/Time", "Aggregation"], url: "https://leetcode.com/problems/user-activity-for-the-past-30-days-i/", source: "LeetCode" as SqlSource, prerequisiteTopics: ["PostgreSQL Specifics"], status: "pending", attempts: 0 },
  { id: 21, title: "Group Sold Products By The Date", difficulty: "Easy", topics: ["Strings", "Aggregation"], url: "https://leetcode.com/problems/group-sold-products-by-the-date/", source: "LeetCode" as SqlSource, prerequisiteTopics: ["PostgreSQL Specifics"], status: "pending", attempts: 0 },
  { id: 22, title: "List the Products Ordered in a Period", difficulty: "Easy", topics: ["Date/Time", "Joins"], url: "https://leetcode.com/problems/list-the-products-ordered-in-a-period/", source: "LeetCode" as SqlSource, prerequisiteTopics: ["PostgreSQL Specifics"], status: "pending", attempts: 0 },
];
