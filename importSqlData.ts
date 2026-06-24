import * as fs from 'fs';
import * as path from 'path';

const sqlDataPath = path.join(__dirname, 'db', 'sqlData.ts');
const tempJsonPath = path.join(__dirname, 'temp_json.json');

const rawJson = fs.readFileSync(tempJsonPath, 'utf8');
const data = JSON.parse(rawJson);

// Read current sqlData.ts
let sqlDataContent = fs.readFileSync(sqlDataPath, 'utf8');

// The file currently ends with:
//   { id: 22, title: "List the Products Ordered in a Period", difficulty: "Easy", topics: ["Date/Time", "Joins"], url: "https://leetcode.com/problems/list-the-products-ordered-in-a-period/", source: "LeetCode" as SqlSource, prerequisiteTopics: ["PostgreSQL Specifics"], status: "pending", attempts: 0 },
// ];

let maxId = 22;

const newLines = data.problems.map((p: any) => {
  maxId++;
  const topicsStr = JSON.stringify(p.tags);
  const prereqStr = JSON.stringify(p.tags); // mapping tags to prereqs
  const companyTagsStr = p.companies && p.companies.length > 0 ? JSON.stringify(p.companies) : 'null';
  
  let source = "LeetCode";
  if (p.platform === "DataLemur") source = "DataLemur";
  else if (p.platform === "StrataScratch" || p.platform === "StratasScratch") source = "StratasScratch";
  
  return `  { id: ${maxId}, title: ${JSON.stringify(p.title)}, difficulty: ${JSON.stringify(p.difficulty)}, topics: ${topicsStr}, companyTags: ${companyTagsStr}, url: ${JSON.stringify(p.link)}, source: "${source}" as SqlSource, prerequisiteTopics: ${prereqStr}, status: "pending", attempts: 0 },`;
});

// insert before the last "];"
const insertionIndex = sqlDataContent.lastIndexOf('];');
if (insertionIndex !== -1) {
  const newContent = sqlDataContent.slice(0, insertionIndex) + newLines.join('\n') + '\n' + sqlDataContent.slice(insertionIndex);
  fs.writeFileSync(sqlDataPath, newContent);
  console.log(`Added ${newLines.length} problems to sqlData.ts`);
} else {
  console.error("Could not find '];' to insert before.");
}
