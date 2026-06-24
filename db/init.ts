import { db } from "./index";
import { problems, userStats, sqlProblems, sqlPrerequisites } from "./schema";
import { sql } from "drizzle-orm";
import { SQL_PROBLEMS, SQL_PREREQUISITES } from "./sqlData";


// Grind 169 problem list embedded at build time so no filesystem access needed at runtime
const PROBLEMS = [
  { id: 1, title: "Two Sum", difficulty: "Easy", topics: ["Array"], url: "https://leetcode.com/problems/two-sum", status: "pending", attempts: 0 },
  { id: 2, title: "Valid Parentheses", difficulty: "Easy", topics: ["Stack"], url: "https://leetcode.com/problems/valid-parentheses", status: "pending", attempts: 0 },
  { id: 3, title: "Merge Two Sorted Lists", difficulty: "Easy", topics: ["Linked List"], url: "https://leetcode.com/problems/merge-two-sorted-lists", status: "pending", attempts: 0 },
  { id: 4, title: "Best Time to Buy and Sell Stock", difficulty: "Easy", topics: ["Array"], url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock", status: "pending", attempts: 0 },
  { id: 5, title: "Valid Palindrome", difficulty: "Easy", topics: ["String"], url: "https://leetcode.com/problems/valid-palindrome", status: "pending", attempts: 0 },
  { id: 6, title: "Invert Binary Tree", difficulty: "Easy", topics: ["Binary Tree"], url: "https://leetcode.com/problems/invert-binary-tree", status: "pending", attempts: 0 },
  { id: 7, title: "Valid Anagram", difficulty: "Easy", topics: ["String"], url: "https://leetcode.com/problems/valid-anagram", status: "pending", attempts: 0 },
  { id: 8, title: "Binary Search", difficulty: "Easy", topics: ["Binary Search"], url: "https://leetcode.com/problems/binary-search", status: "pending", attempts: 0 },
  { id: 9, title: "Flood Fill", difficulty: "Easy", topics: ["Graph"], url: "https://leetcode.com/problems/flood-fill", status: "pending", attempts: 0 },
  { id: 10, title: "Lowest Common Ancestor of a Binary Search Tree", difficulty: "Easy", topics: ["Binary Search Tree"], url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree", status: "pending", attempts: 0 },
  { id: 11, title: "Balanced Binary Tree", difficulty: "Easy", topics: ["Binary Tree"], url: "https://leetcode.com/problems/balanced-binary-tree", status: "pending", attempts: 0 },
  { id: 12, title: "Linked List Cycle", difficulty: "Easy", topics: ["Linked List"], url: "https://leetcode.com/problems/linked-list-cycle", status: "pending", attempts: 0 },
  { id: 13, title: "Implement Queue using Stacks", difficulty: "Easy", topics: ["Stack"], url: "https://leetcode.com/problems/implement-queue-using-stacks", status: "pending", attempts: 0 },
  { id: 14, title: "First Bad Version", difficulty: "Easy", topics: ["Binary Search"], url: "https://leetcode.com/problems/first-bad-version", status: "pending", attempts: 0 },
  { id: 15, title: "Ransom Note", difficulty: "Easy", topics: ["Hash Table"], url: "https://leetcode.com/problems/ransom-note", status: "pending", attempts: 0 },
  { id: 16, title: "Climbing Stairs", difficulty: "Easy", topics: ["Dynamic Programming"], url: "https://leetcode.com/problems/climbing-stairs", status: "pending", attempts: 0 },
  { id: 17, title: "Longest Palindrome", difficulty: "Easy", topics: ["String"], url: "https://leetcode.com/problems/longest-palindrome", status: "pending", attempts: 0 },
  { id: 18, title: "Reverse Linked List", difficulty: "Easy", topics: ["Linked List"], url: "https://leetcode.com/problems/reverse-linked-list", status: "pending", attempts: 0 },
  { id: 19, title: "Majority Element", difficulty: "Easy", topics: ["Array"], url: "https://leetcode.com/problems/majority-element", status: "pending", attempts: 0 },
  { id: 20, title: "Add Binary", difficulty: "Easy", topics: ["Binary"], url: "https://leetcode.com/problems/add-binary", status: "pending", attempts: 0 },
  { id: 21, title: "Diameter of Binary Tree", difficulty: "Easy", topics: ["Binary Tree"], url: "https://leetcode.com/problems/diameter-of-binary-tree", status: "pending", attempts: 0 },
  { id: 22, title: "Middle of the Linked List", difficulty: "Easy", topics: ["Linked List"], url: "https://leetcode.com/problems/middle-of-the-linked-list", status: "pending", attempts: 0 },
  { id: 23, title: "Maximum Depth of Binary Tree", difficulty: "Easy", topics: ["Binary Tree"], url: "https://leetcode.com/problems/maximum-depth-of-binary-tree", status: "pending", attempts: 0 },
  { id: 24, title: "Contains Duplicate", difficulty: "Easy", topics: ["Array"], url: "https://leetcode.com/problems/contains-duplicate", status: "pending", attempts: 0 },
  { id: 25, title: "Meeting Rooms", difficulty: "Easy", topics: ["Array"], url: "https://leetcode.com/problems/meeting-rooms", status: "pending", attempts: 0 },
  { id: 26, title: "Roman to Integer", difficulty: "Easy", topics: ["Math"], url: "https://leetcode.com/problems/roman-to-integer", status: "pending", attempts: 0 },
  { id: 27, title: "Backspace String Compare", difficulty: "Easy", topics: ["Stack"], url: "https://leetcode.com/problems/backspace-string-compare", status: "pending", attempts: 0 },
  { id: 28, title: "Counting Bits", difficulty: "Easy", topics: ["Binary"], url: "https://leetcode.com/problems/counting-bits", status: "pending", attempts: 0 },
  { id: 29, title: "Same Tree", difficulty: "Easy", topics: ["Binary Tree"], url: "https://leetcode.com/problems/same-tree", status: "pending", attempts: 0 },
  { id: 30, title: "Number of 1 Bits", difficulty: "Easy", topics: ["Binary"], url: "https://leetcode.com/problems/number-of-1-bits", status: "pending", attempts: 0 },
  { id: 31, title: "Longest Common Prefix", difficulty: "Easy", topics: ["String"], url: "https://leetcode.com/problems/longest-common-prefix", status: "pending", attempts: 0 },
  { id: 32, title: "Single Number", difficulty: "Easy", topics: ["Binary"], url: "https://leetcode.com/problems/single-number", status: "pending", attempts: 0 },
  { id: 33, title: "Palindrome Linked List", difficulty: "Easy", topics: ["Linked List"], url: "https://leetcode.com/problems/palindrome-linked-list", status: "pending", attempts: 0 },
  { id: 34, title: "Move Zeroes", difficulty: "Easy", topics: ["Array"], url: "https://leetcode.com/problems/move-zeroes", status: "pending", attempts: 0 },
  { id: 35, title: "Symmetric Tree", difficulty: "Easy", topics: ["Binary Tree"], url: "https://leetcode.com/problems/symmetric-tree", status: "pending", attempts: 0 },
  { id: 36, title: "Missing Number", difficulty: "Easy", topics: ["Binary"], url: "https://leetcode.com/problems/missing-number", status: "pending", attempts: 0 },
  { id: 37, title: "Palindrome Number", difficulty: "Easy", topics: ["Math"], url: "https://leetcode.com/problems/palindrome-number", status: "pending", attempts: 0 },
  { id: 38, title: "Convert Sorted Array to Binary Search Tree", difficulty: "Easy", topics: ["Binary Search Tree"], url: "https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree", status: "pending", attempts: 0 },
  { id: 39, title: "Reverse Bits", difficulty: "Easy", topics: ["Binary"], url: "https://leetcode.com/problems/reverse-bits", status: "pending", attempts: 0 },
  { id: 40, title: "Subtree of Another Tree", difficulty: "Easy", topics: ["Binary Tree"], url: "https://leetcode.com/problems/subtree-of-another-tree", status: "pending", attempts: 0 },
  { id: 41, title: "Squares of a Sorted Array", difficulty: "Easy", topics: ["Array"], url: "https://leetcode.com/problems/squares-of-a-sorted-array", status: "pending", attempts: 0 },
  { id: 42, title: "Maximum Subarray", difficulty: "Medium", topics: ["Dynamic Programming"], url: "https://leetcode.com/problems/maximum-subarray", status: "pending", attempts: 0 },
  { id: 43, title: "Insert Interval", difficulty: "Medium", topics: ["Array"], url: "https://leetcode.com/problems/insert-interval", status: "pending", attempts: 0 },
  { id: 44, title: "01 Matrix", difficulty: "Medium", topics: ["Graph"], url: "https://leetcode.com/problems/01-matrix", status: "pending", attempts: 0 },
  { id: 45, title: "K Closest Points to Origin", difficulty: "Medium", topics: ["Heap"], url: "https://leetcode.com/problems/k-closest-points-to-origin", status: "pending", attempts: 0 },
  { id: 46, title: "Longest Substring Without Repeating Characters", difficulty: "Medium", topics: ["String"], url: "https://leetcode.com/problems/longest-substring-without-repeating-characters", status: "pending", attempts: 0 },
  { id: 47, title: "3Sum", difficulty: "Medium", topics: ["Array"], url: "https://leetcode.com/problems/3sum", status: "pending", attempts: 0 },
  { id: 48, title: "Binary Tree Level Order Traversal", difficulty: "Medium", topics: ["Binary Tree"], url: "https://leetcode.com/problems/binary-tree-level-order-traversal", status: "pending", attempts: 0 },
  { id: 49, title: "Clone Graph", difficulty: "Medium", topics: ["Graph"], url: "https://leetcode.com/problems/clone-graph", status: "pending", attempts: 0 },
  { id: 50, title: "Evaluate Reverse Polish Notation", difficulty: "Medium", topics: ["Stack"], url: "https://leetcode.com/problems/evaluate-reverse-polish-notation", status: "pending", attempts: 0 },
  { id: 51, title: "Course Schedule", difficulty: "Medium", topics: ["Graph"], url: "https://leetcode.com/problems/course-schedule", status: "pending", attempts: 0 },
  { id: 52, title: "Implement Trie (Prefix Tree)", difficulty: "Medium", topics: ["Trie"], url: "https://leetcode.com/problems/implement-trie-prefix-tree", status: "pending", attempts: 0 },
  { id: 53, title: "Coin Change", difficulty: "Medium", topics: ["Dynamic Programming"], url: "https://leetcode.com/problems/coin-change", status: "pending", attempts: 0 },
  { id: 54, title: "Product of Array Except Self", difficulty: "Medium", topics: ["Array"], url: "https://leetcode.com/problems/product-of-array-except-self", status: "pending", attempts: 0 },
  { id: 55, title: "Min Stack", difficulty: "Medium", topics: ["Stack"], url: "https://leetcode.com/problems/min-stack", status: "pending", attempts: 0 },
  { id: 56, title: "Validate Binary Search Tree", difficulty: "Medium", topics: ["Binary Search Tree"], url: "https://leetcode.com/problems/validate-binary-search-tree", status: "pending", attempts: 0 },
  { id: 57, title: "Number of Islands", difficulty: "Medium", topics: ["Graph"], url: "https://leetcode.com/problems/number-of-islands", status: "pending", attempts: 0 },
  { id: 58, title: "Rotting Oranges", difficulty: "Medium", topics: ["Graph"], url: "https://leetcode.com/problems/rotting-oranges", status: "pending", attempts: 0 },
  { id: 59, title: "Search in Rotated Sorted Array", difficulty: "Medium", topics: ["Binary Search"], url: "https://leetcode.com/problems/search-in-rotated-sorted-array", status: "pending", attempts: 0 },
  { id: 60, title: "Combination Sum", difficulty: "Medium", topics: ["Array"], url: "https://leetcode.com/problems/combination-sum", status: "pending", attempts: 0 },
  { id: 61, title: "Permutations", difficulty: "Medium", topics: ["Recursion"], url: "https://leetcode.com/problems/permutations", status: "pending", attempts: 0 },
  { id: 62, title: "Merge Intervals", difficulty: "Medium", topics: ["Array"], url: "https://leetcode.com/problems/merge-intervals", status: "pending", attempts: 0 },
  { id: 63, title: "Lowest Common Ancestor of a Binary Tree", difficulty: "Medium", topics: ["Binary Tree"], url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree", status: "pending", attempts: 0 },
  { id: 64, title: "Time Based Key-Value Store", difficulty: "Medium", topics: ["Binary Search"], url: "https://leetcode.com/problems/time-based-key-value-store", status: "pending", attempts: 0 },
  { id: 65, title: "Accounts Merge", difficulty: "Medium", topics: ["Graph"], url: "https://leetcode.com/problems/accounts-merge", status: "pending", attempts: 0 },
  { id: 66, title: "Sort Colors", difficulty: "Medium", topics: ["Array"], url: "https://leetcode.com/problems/sort-colors", status: "pending", attempts: 0 },
  { id: 67, title: "Word Break", difficulty: "Medium", topics: ["Trie"], url: "https://leetcode.com/problems/word-break", status: "pending", attempts: 0 },
  { id: 68, title: "Partition Equal Subset Sum", difficulty: "Medium", topics: ["Dynamic Programming"], url: "https://leetcode.com/problems/partition-equal-subset-sum", status: "pending", attempts: 0 },
  { id: 69, title: "String to Integer (atoi)", difficulty: "Medium", topics: ["String"], url: "https://leetcode.com/problems/string-to-integer-atoi", status: "pending", attempts: 0 },
  { id: 70, title: "Spiral Matrix", difficulty: "Medium", topics: ["Matrix"], url: "https://leetcode.com/problems/spiral-matrix", status: "pending", attempts: 0 },
  { id: 71, title: "Subsets", difficulty: "Medium", topics: ["Recursion"], url: "https://leetcode.com/problems/subsets", status: "pending", attempts: 0 },
  { id: 72, title: "Binary Tree Right Side View", difficulty: "Medium", topics: ["Binary Tree"], url: "https://leetcode.com/problems/binary-tree-right-side-view", status: "pending", attempts: 0 },
  { id: 73, title: "Longest Palindromic Substring", difficulty: "Medium", topics: ["String"], url: "https://leetcode.com/problems/longest-palindromic-substring", status: "pending", attempts: 0 },
  { id: 74, title: "Unique Paths", difficulty: "Medium", topics: ["Dynamic Programming"], url: "https://leetcode.com/problems/unique-paths", status: "pending", attempts: 0 },
  { id: 75, title: "Construct Binary Tree from Preorder and Inorder Traversal", difficulty: "Medium", topics: ["Binary Tree"], url: "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal", status: "pending", attempts: 0 },
  { id: 76, title: "Container With Most Water", difficulty: "Medium", topics: ["Array"], url: "https://leetcode.com/problems/container-with-most-water", status: "pending", attempts: 0 },
  { id: 77, title: "Letter Combinations of a Phone Number", difficulty: "Medium", topics: ["Recursion"], url: "https://leetcode.com/problems/letter-combinations-of-a-phone-number", status: "pending", attempts: 0 },
  { id: 78, title: "Word Search", difficulty: "Medium", topics: ["Graph"], url: "https://leetcode.com/problems/word-search", status: "pending", attempts: 0 },
  { id: 79, title: "Find All Anagrams in a String", difficulty: "Medium", topics: ["String"], url: "https://leetcode.com/problems/find-all-anagrams-in-a-string", status: "pending", attempts: 0 },
  { id: 80, title: "Minimum Height Trees", difficulty: "Medium", topics: ["Graph"], url: "https://leetcode.com/problems/minimum-height-trees", status: "pending", attempts: 0 },
  { id: 81, title: "Task Scheduler", difficulty: "Medium", topics: ["Heap"], url: "https://leetcode.com/problems/task-scheduler", status: "pending", attempts: 0 },
  { id: 82, title: "LRU Cache", difficulty: "Medium", topics: ["Linked List"], url: "https://leetcode.com/problems/lru-cache", status: "pending", attempts: 0 },
  { id: 83, title: "Kth Smallest Element in a BST", difficulty: "Medium", topics: ["Binary Search Tree"], url: "https://leetcode.com/problems/kth-smallest-element-in-a-bst", status: "pending", attempts: 0 },
  { id: 84, title: "Daily Temperatures", difficulty: "Medium", topics: ["Stack"], url: "https://leetcode.com/problems/daily-temperatures", status: "pending", attempts: 0 },
  { id: 85, title: "House Robber", difficulty: "Medium", topics: ["Dynamic Programming"], url: "https://leetcode.com/problems/house-robber", status: "pending", attempts: 0 },
  { id: 86, title: "Gas Station", difficulty: "Medium", topics: ["Array"], url: "https://leetcode.com/problems/gas-station", status: "pending", attempts: 0 },
  { id: 87, title: "Next Permutation", difficulty: "Medium", topics: ["Array"], url: "https://leetcode.com/problems/next-permutation", status: "pending", attempts: 0 },
  { id: 88, title: "Valid Sudoku", difficulty: "Medium", topics: ["Matrix"], url: "https://leetcode.com/problems/valid-sudoku", status: "pending", attempts: 0 },
  { id: 89, title: "Group Anagrams", difficulty: "Medium", topics: ["String"], url: "https://leetcode.com/problems/group-anagrams", status: "pending", attempts: 0 },
  { id: 90, title: "Maximum Product Subarray", difficulty: "Medium", topics: ["Dynamic Programming"], url: "https://leetcode.com/problems/maximum-product-subarray", status: "pending", attempts: 0 },
  { id: 91, title: "Design Add and Search Words Data Structure", difficulty: "Medium", topics: ["Trie"], url: "https://leetcode.com/problems/design-add-and-search-words-data-structure", status: "pending", attempts: 0 },
  { id: 92, title: "Pacific Atlantic Water Flow", difficulty: "Medium", topics: ["Graph"], url: "https://leetcode.com/problems/pacific-atlantic-water-flow", status: "pending", attempts: 0 },
  { id: 93, title: "Remove Nth Node From End of List", difficulty: "Medium", topics: ["Linked List"], url: "https://leetcode.com/problems/remove-nth-node-from-end-of-list", status: "pending", attempts: 0 },
  { id: 94, title: "Shortest Path to Get Food", difficulty: "Medium", topics: ["Graph"], url: "https://leetcode.com/problems/shortest-path-to-get-food", status: "pending", attempts: 0 },
  { id: 95, title: "Find the Duplicate Number", difficulty: "Medium", topics: ["Binary Search"], url: "https://leetcode.com/problems/find-the-duplicate-number", status: "pending", attempts: 0 },
  { id: 96, title: "Encode and Decode Strings", difficulty: "Medium", topics: ["String"], url: "https://leetcode.com/problems/encode-and-decode-strings", status: "pending", attempts: 0 },
  { id: 97, title: "Series of Fibonacci Numbers", difficulty: "Medium", topics: ["Dynamic Programming"], url: "https://leetcode.com/problems/fibonacci-number", status: "pending", attempts: 0 },
  { id: 98, title: "Meeting Rooms II", difficulty: "Medium", topics: ["Heap"], url: "https://leetcode.com/problems/meeting-rooms-ii", status: "pending", attempts: 0 },
  { id: 99, title: "Top K Frequent Elements", difficulty: "Medium", topics: ["Heap"], url: "https://leetcode.com/problems/top-k-frequent-elements", status: "pending", attempts: 0 },
  { id: 100, title: "Sort List", difficulty: "Medium", topics: ["Linked List"], url: "https://leetcode.com/problems/sort-list", status: "pending", attempts: 0 },
  { id: 101, title: "Non-overlapping Intervals", difficulty: "Medium", topics: ["Array"], url: "https://leetcode.com/problems/non-overlapping-intervals", status: "pending", attempts: 0 },
  { id: 102, title: "Jump Game", difficulty: "Medium", topics: ["Dynamic Programming"], url: "https://leetcode.com/problems/jump-game", status: "pending", attempts: 0 },
  { id: 103, title: "Add Two Numbers", difficulty: "Medium", topics: ["Linked List"], url: "https://leetcode.com/problems/add-two-numbers", status: "pending", attempts: 0 },
  { id: 104, title: "Reorder List", difficulty: "Medium", topics: ["Linked List"], url: "https://leetcode.com/problems/reorder-list", status: "pending", attempts: 0 },
  { id: 105, title: "Partition into Equal Sum Subsets", difficulty: "Medium", topics: ["Dynamic Programming"], url: "https://leetcode.com/problems/partition-equal-subset-sum", status: "pending", attempts: 0 },
  { id: 106, title: "Kth Largest Element in an Array", difficulty: "Medium", topics: ["Heap"], url: "https://leetcode.com/problems/kth-largest-element-in-an-array", status: "pending", attempts: 0 },
  { id: 107, title: "Swap Nodes in Pairs", difficulty: "Medium", topics: ["Linked List"], url: "https://leetcode.com/problems/swap-nodes-in-pairs", status: "pending", attempts: 0 },
  { id: 108, title: "Path Sum II", difficulty: "Medium", topics: ["Binary Tree"], url: "https://leetcode.com/problems/path-sum-ii", status: "pending", attempts: 0 },
  { id: 109, title: "Longest Increasing Subsequence", difficulty: "Medium", topics: ["Dynamic Programming"], url: "https://leetcode.com/problems/longest-increasing-subsequence", status: "pending", attempts: 0 },
  { id: 110, title: "Graph Valid Tree", difficulty: "Medium", topics: ["Graph"], url: "https://leetcode.com/problems/graph-valid-tree", status: "pending", attempts: 0 },
  { id: 111, title: "Course Schedule II", difficulty: "Medium", topics: ["Graph"], url: "https://leetcode.com/problems/course-schedule-ii", status: "pending", attempts: 0 },
  { id: 112, title: "Swap Nodes", difficulty: "Medium", topics: ["Linked List"], url: "https://leetcode.com/problems/swapping-nodes-in-a-linked-list", status: "pending", attempts: 0 },
  { id: 113, title: "Unique Binary Search Trees", difficulty: "Medium", topics: ["Dynamic Programming"], url: "https://leetcode.com/problems/unique-binary-search-trees", status: "pending", attempts: 0 },
  { id: 114, title: "Number of Connected Components in an Undirected Graph", difficulty: "Medium", topics: ["Graph"], url: "https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph", status: "pending", attempts: 0 },
  { id: 115, title: "Minimum Knight Moves", difficulty: "Medium", topics: ["Graph"], url: "https://leetcode.com/problems/minimum-knight-moves", status: "pending", attempts: 0 },
  { id: 116, title: "Subarray Sum Equals K", difficulty: "Medium", topics: ["Array"], url: "https://leetcode.com/problems/subarray-sum-equals-k", status: "pending", attempts: 0 },
  { id: 117, title: "Odd Even Linked List", difficulty: "Medium", topics: ["Linked List"], url: "https://leetcode.com/problems/odd-even-linked-list", status: "pending", attempts: 0 },
  { id: 118, title: "Path Sum III", difficulty: "Medium", topics: ["Binary Tree"], url: "https://leetcode.com/problems/path-sum-iii", status: "pending", attempts: 0 },
  { id: 119, title: "Decode String", difficulty: "Medium", topics: ["Stack"], url: "https://leetcode.com/problems/decode-string", status: "pending", attempts: 0 },
  { id: 120, title: "Contiguous Array", difficulty: "Medium", topics: ["Array"], url: "https://leetcode.com/problems/contiguous-array", status: "pending", attempts: 0 },
  { id: 121, title: "Maximum Width of Binary Tree", difficulty: "Medium", topics: ["Binary Tree"], url: "https://leetcode.com/problems/maximum-width-of-binary-tree", status: "pending", attempts: 0 },
  { id: 122, title: "Find K Closest Elements", difficulty: "Medium", topics: ["Binary Search"], url: "https://leetcode.com/problems/find-k-closest-elements", status: "pending", attempts: 0 },
  { id: 123, title: "BST Iterator", difficulty: "Medium", topics: ["Binary Search Tree"], url: "https://leetcode.com/problems/binary-search-tree-iterator", status: "pending", attempts: 0 },
  { id: 124, title: "Maximum Average Subarray I", difficulty: "Easy", topics: ["Array"], url: "https://leetcode.com/problems/maximum-average-subarray-i", status: "pending", attempts: 0 },
  { id: 125, title: "Minimum Depth of Binary Tree", difficulty: "Easy", topics: ["Binary Tree"], url: "https://leetcode.com/problems/minimum-depth-of-binary-tree", status: "pending", attempts: 0 },
  { id: 126, title: "Number of Recent Calls", difficulty: "Easy", topics: ["Queue"], url: "https://leetcode.com/problems/number-of-recent-calls", status: "pending", attempts: 0 },
  { id: 127, title: "Find the Town Judge", difficulty: "Easy", topics: ["Graph"], url: "https://leetcode.com/problems/find-the-town-judge", status: "pending", attempts: 0 },
  { id: 128, title: "Sum of Left Leaves", difficulty: "Easy", topics: ["Binary Tree"], url: "https://leetcode.com/problems/sum-of-left-leaves", status: "pending", attempts: 0 },
  { id: 129, title: "Minimum Absolute Difference in BST", difficulty: "Easy", topics: ["Binary Search Tree"], url: "https://leetcode.com/problems/minimum-absolute-difference-in-bst", status: "pending", attempts: 0 },
  { id: 130, title: "Maximum Difference Between Node and Ancestor", difficulty: "Medium", topics: ["Binary Tree"], url: "https://leetcode.com/problems/maximum-difference-between-node-and-ancestor", status: "pending", attempts: 0 },
  { id: 131, title: "Number of Provinces", difficulty: "Medium", topics: ["Graph"], url: "https://leetcode.com/problems/number-of-provinces", status: "pending", attempts: 0 },
  { id: 132, title: "Minimum Number of Steps to Make Two Strings Anagram", difficulty: "Medium", topics: ["String"], url: "https://leetcode.com/problems/minimum-number-of-steps-to-make-two-strings-anagram", status: "pending", attempts: 0 },
  { id: 133, title: "Count Good Nodes in Binary Tree", difficulty: "Medium", topics: ["Binary Tree"], url: "https://leetcode.com/problems/count-good-nodes-in-binary-tree", status: "pending", attempts: 0 },
  { id: 134, title: "Furthest Building You Can Reach", difficulty: "Medium", topics: ["Heap"], url: "https://leetcode.com/problems/furthest-building-you-can-reach", status: "pending", attempts: 0 },
  { id: 135, title: "Find the Most Competitive Subsequence", difficulty: "Medium", topics: ["Stack"], url: "https://leetcode.com/problems/find-the-most-competitive-subsequence", status: "pending", attempts: 0 },
  { id: 136, title: "Reduce Array Size to The Half", difficulty: "Medium", topics: ["Array"], url: "https://leetcode.com/problems/reduce-array-size-to-the-half", status: "pending", attempts: 0 },
  { id: 137, title: "Map of Highest Peak", difficulty: "Medium", topics: ["Graph"], url: "https://leetcode.com/problems/map-of-highest-peak", status: "pending", attempts: 0 },
  { id: 138, title: "Minimum Operations to Reduce X to Zero", difficulty: "Medium", topics: ["Array"], url: "https://leetcode.com/problems/minimum-operations-to-reduce-x-to-zero", status: "pending", attempts: 0 },
  { id: 139, title: "As Far from Land as Possible", difficulty: "Medium", topics: ["Graph"], url: "https://leetcode.com/problems/as-far-from-land-as-possible", status: "pending", attempts: 0 },
  { id: 140, title: "Keys and Rooms", difficulty: "Medium", topics: ["Graph"], url: "https://leetcode.com/problems/keys-and-rooms", status: "pending", attempts: 0 },
  { id: 141, title: "Binary Tree Zigzag Level Order Traversal", difficulty: "Medium", topics: ["Binary Tree"], url: "https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal", status: "pending", attempts: 0 },
  { id: 142, title: "Validate Stack Sequences", difficulty: "Medium", topics: ["Stack"], url: "https://leetcode.com/problems/validate-stack-sequences", status: "pending", attempts: 0 },
  { id: 143, title: "Satisfiability of Equality Equations", difficulty: "Medium", topics: ["Graph"], url: "https://leetcode.com/problems/satisfiability-of-equality-equations", status: "pending", attempts: 0 },
  { id: 144, title: "Minimum Cost to Connect Sticks", difficulty: "Medium", topics: ["Heap"], url: "https://leetcode.com/problems/minimum-cost-to-connect-sticks", status: "pending", attempts: 0 },
  { id: 145, title: "Jump Game II", difficulty: "Medium", topics: ["Dynamic Programming"], url: "https://leetcode.com/problems/jump-game-ii", status: "pending", attempts: 0 },
  { id: 146, title: "Shortest Path in Binary Matrix", difficulty: "Medium", topics: ["Graph"], url: "https://leetcode.com/problems/shortest-path-in-binary-matrix", status: "pending", attempts: 0 },
  { id: 147, title: "Kth Largest Element in a Stream", difficulty: "Easy", topics: ["Heap"], url: "https://leetcode.com/problems/kth-largest-element-in-a-stream", status: "pending", attempts: 0 },
  { id: 148, title: "Find Minimum in Rotated Sorted Array", difficulty: "Medium", topics: ["Binary Search"], url: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array", status: "pending", attempts: 0 },
  { id: 149, title: "Increasing Order Search Tree", difficulty: "Easy", topics: ["Binary Search Tree"], url: "https://leetcode.com/problems/increasing-order-search-tree", status: "pending", attempts: 0 },
  { id: 150, title: "All Nodes Distance K in Binary Tree", difficulty: "Medium", topics: ["Binary Tree"], url: "https://leetcode.com/problems/all-nodes-distance-k-in-binary-tree", status: "pending", attempts: 0 },
  { id: 151, title: "Trapping Rain Water", difficulty: "Hard", topics: ["Array"], url: "https://leetcode.com/problems/trapping-rain-water", status: "pending", attempts: 0 },
  { id: 152, title: "Find Median from Data Stream", difficulty: "Hard", topics: ["Heap"], url: "https://leetcode.com/problems/find-median-from-data-stream", status: "pending", attempts: 0 },
  { id: 153, title: "Word Ladder", difficulty: "Hard", topics: ["Graph"], url: "https://leetcode.com/problems/word-ladder", status: "pending", attempts: 0 },
  { id: 154, title: "Basic Calculator", difficulty: "Hard", topics: ["Stack"], url: "https://leetcode.com/problems/basic-calculator", status: "pending", attempts: 0 },
  { id: 155, title: "Maximum Profit in Job Scheduling", difficulty: "Hard", topics: ["Binary Search"], url: "https://leetcode.com/problems/maximum-profit-in-job-scheduling", status: "pending", attempts: 0 },
  { id: 156, title: "Merge k Sorted Lists", difficulty: "Hard", topics: ["Heap"], url: "https://leetcode.com/problems/merge-k-sorted-lists", status: "pending", attempts: 0 },
  { id: 157, title: "Largest Rectangle in Histogram", difficulty: "Hard", topics: ["Stack"], url: "https://leetcode.com/problems/largest-rectangle-in-histogram", status: "pending", attempts: 0 },
  { id: 158, title: "Binary Tree Maximum Path Sum", difficulty: "Hard", topics: ["Binary Tree"], url: "https://leetcode.com/problems/binary-tree-maximum-path-sum", status: "pending", attempts: 0 },
  { id: 159, title: "Maximum Frequency Stack", difficulty: "Hard", topics: ["Stack"], url: "https://leetcode.com/problems/maximum-frequency-stack", status: "pending", attempts: 0 },
  { id: 160, title: "LFU Cache", difficulty: "Hard", topics: ["Linked List"], url: "https://leetcode.com/problems/lfu-cache", status: "pending", attempts: 0 },
  { id: 161, title: "Alien Dictionary", difficulty: "Hard", topics: ["Graph"], url: "https://leetcode.com/problems/alien-dictionary", status: "pending", attempts: 0 },
  { id: 162, title: "Jump Game VI", difficulty: "Medium", topics: ["Dynamic Programming"], url: "https://leetcode.com/problems/jump-game-vi", status: "pending", attempts: 0 },
  { id: 163, title: "Find the Winner of an Array Game", difficulty: "Medium", topics: ["Array"], url: "https://leetcode.com/problems/find-the-winner-of-an-array-game", status: "pending", attempts: 0 },
  { id: 164, title: "Minimum Remove to Make Valid Parentheses", difficulty: "Medium", topics: ["Stack"], url: "https://leetcode.com/problems/minimum-remove-to-make-valid-parentheses", status: "pending", attempts: 0 },
  { id: 165, title: "Stone Game", difficulty: "Medium", topics: ["Dynamic Programming"], url: "https://leetcode.com/problems/stone-game", status: "pending", attempts: 0 },
  { id: 166, title: "Vertical Order Traversal of a Binary Tree", difficulty: "Hard", topics: ["Binary Tree"], url: "https://leetcode.com/problems/vertical-order-traversal-of-a-binary-tree", status: "pending", attempts: 0 },
  { id: 167, title: "Serialize and Deserialize Binary Tree", difficulty: "Hard", topics: ["Binary Tree"], url: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree", status: "pending", attempts: 0 },
  { id: 168, title: "Edit Distance", difficulty: "Hard", topics: ["Dynamic Programming"], url: "https://leetcode.com/problems/edit-distance", status: "pending", attempts: 0 },
  { id: 169, title: "Minimum Window Substring", difficulty: "Hard", topics: ["String"], url: "https://leetcode.com/problems/minimum-window-substring", status: "pending", attempts: 0 },
] as const;

let initialized = false;

export async function initDb() {
  if (initialized) return;
  initialized = true;

  // Create tables if they don't exist
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS problems (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      topics TEXT NOT NULL,
      company_tags TEXT,
      url TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      attempts INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      solve_time INTEGER DEFAULT 0,
      solved_at TEXT,
      review_date TEXT,
      confidence INTEGER
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS user_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      daily_goal INTEGER NOT NULL DEFAULT 3,
      streak INTEGER NOT NULL DEFAULT 0,
      last_active_date TEXT,
      problem_order TEXT NOT NULL DEFAULT 'EasyFirst'
    )
  `);

  // Add problem_order column if it doesn't exist (migration for existing DBs)
  try {
    await db.run(sql`ALTER TABLE user_stats ADD COLUMN problem_order TEXT NOT NULL DEFAULT 'EasyFirst'`);
  } catch { /* column already exists */ }

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS sql_problems (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      topics TEXT NOT NULL,
      company_tags TEXT,
      url TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'LeetCode',
      prerequisite_topics TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      attempts INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      solve_time INTEGER DEFAULT 0,
      solved_at TEXT,
      review_date TEXT,
      confidence INTEGER
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS sql_prerequisites (
      id INTEGER PRIMARY KEY,
      topic TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      doc_url TEXT,
      completed INTEGER NOT NULL DEFAULT 0
    )
  `);

  // Seed DSA problems (INSERT OR IGNORE so existing user progress is preserved)
  const rows = PROBLEMS.map((p) => ({
    id: p.id,
    title: p.title,
    difficulty: p.difficulty as "Easy" | "Medium" | "Hard",
    topics: [...p.topics] as string[],
    companyTags: null,
    url: p.url,
    status: p.status as "pending",
    attempts: p.attempts,
  }));

  await db.insert(problems).values(rows).onConflictDoNothing();

  // Seed SQL problems
  const sqlRows = SQL_PROBLEMS.map((p) => ({
    id: p.id,
    title: p.title,
    difficulty: p.difficulty as "Easy" | "Medium" | "Hard",
    topics: [...p.topics] as string[],
    companyTags: null,
    url: p.url,
    source: p.source as "LeetCode" | "DataLemur" | "StratasScratch" | "Conceptual",
    prerequisiteTopics: [...(p.prerequisiteTopics || [])] as string[],
    status: p.status as "pending",
    attempts: p.attempts,
  }));

  await db.insert(sqlProblems).values(sqlRows).onConflictDoNothing();

  // Seed SQL prerequisites
  await db.insert(sqlPrerequisites).values(SQL_PREREQUISITES).onConflictDoNothing();

  // Seed default user stats if none exist
  const existing = await db.select().from(userStats).limit(1);
  if (existing.length === 0) {
    await db.insert(userStats).values({ dailyGoal: 3, streak: 0 });
  }
}

