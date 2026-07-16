import { CurriculumWeek } from "./types";

export const systemDesignCurriculum: CurriculumWeek[] = [
  {
    id: "week-1",
    title: "Week 1",
    focusArea: "Foundations & Scalability",
    description: "Start with the basics of scaling a web application from zero to millions of users.",
    topics: ["load-balancing", "caching-strategies", "database-sharding", "cdn-architecture"]
  },
  {
    id: "week-2",
    title: "Week 2",
    focusArea: "Data Storage & Consistency",
    description: "Deep dive into databases, replication, and the trade-offs in distributed data storage.",
    topics: ["replication-consistency", "distributed-transactions"]
  },
  {
    id: "week-3",
    title: "Week 3",
    focusArea: "Communication & Real-time",
    description: "Learn how microservices communicate efficiently and how to handle real-time data.",
    topics: ["api-design", "message-queues", "real-time-systems", "rate-limiting"]
  },
  {
    id: "week-4",
    title: "Week 4",
    focusArea: "Interview Practice",
    description: "Apply your knowledge by solving real-world system design interview questions.",
    topics: [] // This week focuses on the interview questions rather than topics
  }
];
