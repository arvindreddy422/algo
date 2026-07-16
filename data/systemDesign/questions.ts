import { InterviewQuestion } from "./types";

export const systemDesignQuestions: InterviewQuestion[] = [
  {
    id: "design-youtube",
    question: "Design YouTube. How would you handle video uploads and streaming at scale?",
    difficulty: "hard",
    companies: ["Google", "Meta", "Amazon"],
    estimatedTime: 60,
    keyConcepts: ["Video Streaming", "CDN", "Database Sharding", "Message Queues", "Caching"],
    relatedTopics: ["cdn-architecture", "database-sharding", "message-queues"],
    resources: [
      {
        id: "youtube-design-blog",
        type: "blog",
        title: "How YouTube Stores Billions of Hours of Video",
        company: "Google Blog",
        url: "https://blog.youtube/inside-youtube/how-youtube-works-infrastructure/",
        relevance: "high",
        tags: ["Architecture", "Video"]
      }
    ],
    interviewTips: [
      "Start by understanding the scale: 500 hours of video uploaded per minute",
      "Discuss trade-offs between consistency and availability (availability is preferred here)",
      "Focus on bottlenecks: video processing (transcoding), storage, bandwidth",
      "Explain how a CDN offloads traffic from the origin servers"
    ]
  },
  {
    id: "design-instagram",
    question: "Design Instagram. Focus on the news feed and photo storage.",
    difficulty: "hard",
    companies: ["Meta", "Snapchat", "TikTok"],
    estimatedTime: 60,
    keyConcepts: ["News Feed Generation", "Fanout", "Object Storage", "Database Sharding", "Caching"],
    relatedTopics: ["database-sharding", "caching-strategies", "message-queues"],
    resources: [
      {
        id: "instagram-architecture",
        type: "blog",
        title: "Instagram Architecture: How We Store Billions of Photos",
        company: "Instagram Engineering",
        url: "https://instagram-engineering.com/sharding-ids-at-instagram-1cf5a71e5a5c",
        relevance: "high",
        tags: ["Sharding", "Databases"]
      }
    ],
    interviewTips: [
      "Distinguish between push vs pull models for feed generation (fanout-on-write vs fanout-on-read)",
      "Discuss hybrid fanout for celebrities (Justin Bieber problem)",
      "Use object storage (S3) for photos and a CDN to serve them",
      "Explain how to efficiently paginate through a feed (Cursor-based pagination)"
    ]
  },
  {
    id: "design-uber",
    question: "Design Uber. How do you match drivers with riders efficiently?",
    difficulty: "hard",
    companies: ["Uber", "Lyft", "Grab"],
    estimatedTime: 60,
    keyConcepts: ["Geospatial Indexing", "Quadtrees", "WebSockets", "Distributed Transactions"],
    relatedTopics: ["real-time-systems", "distributed-transactions", "database-sharding"],
    resources: [
      {
        id: "uber-geospatial",
        type: "blog",
        title: "Uber’s Real-Time Dispatch System",
        company: "Uber Engineering",
        url: "https://www.uber.com/en-IN/blog/how-uber-matches-riders/",
        relevance: "high",
        tags: ["Geospatial", "Matching"]
      }
    ],
    interviewTips: [
      "Geospatial indexing is the core challenge. Discuss QuadTrees or Geohashes",
      "Explain how to handle frequent driver location updates (WebSockets + Redis)",
      "Address the dispatching logic and locking mechanisms (Distributed Locks/Sagas) to prevent double-booking a driver"
    ]
  },
  {
    id: "design-discord",
    question: "Design Discord. Focus on the real-time chat and presence features.",
    difficulty: "hard",
    companies: ["Discord", "Slack", "Microsoft"],
    estimatedTime: 60,
    keyConcepts: ["WebSockets", "Pub/Sub", "Presence", "Cassandra", "Consistent Hashing"],
    relatedTopics: ["real-time-systems", "message-queues", "load-balancing"],
    resources: [
      {
        id: "discord-messages",
        type: "blog",
        title: "How Discord Stores Billions of Messages",
        company: "Discord Engineering",
        url: "https://discord.com/blog/how-discord-stores-billions-of-messages",
        relevance: "high",
        tags: ["Cassandra", "ScyllaDB", "Chat"]
      }
    ],
    interviewTips: [
      "Real-time communication requires persistent connections (WebSockets)",
      "Discuss how to scale WebSocket servers and route messages (Pub/Sub with Redis or Kafka)",
      "Explain how to store chat history efficiently (Wide-column stores like Cassandra)",
      "Handling 'Presence' (online/offline status) at scale requires efficient fanout"
    ]
  },
  {
    id: "design-twitter",
    question: "Design Twitter (X). Focus on the timeline and handling viral tweets.",
    difficulty: "hard",
    companies: ["Twitter", "Meta", "LinkedIn"],
    estimatedTime: 60,
    keyConcepts: ["Feed Generation", "Caching", "Load Balancing", "Eventual Consistency"],
    relatedTopics: ["caching-strategies", "load-balancing", "api-design"],
    resources: [
      {
        id: "twitter-timeline",
        type: "video",
        title: "System Design: Twitter Timeline",
        company: "InfoQ",
        url: "https://www.infoq.com/presentations/Twitter-Timeline-Scale/",
        relevance: "high",
        tags: ["Timeline", "Architecture"]
      }
    ],
    interviewTips: [
      "Similar to Instagram, but text-focused. Fanout is the main bottleneck.",
      "Discuss the 'celebrity problem' where someone with 100M followers tweets.",
      "Use Redis to cache timelines for active users",
      "Mention eventual consistency—it's okay if a tweet takes a few seconds to appear for some users"
    ]
  }
];
