import { Topic } from "./types";

export const systemDesignTopics: Topic[] = [
  {
    id: "caching-strategies",
    name: "Caching Strategies",
    emoji: "💾",
    category: "Databases",
    difficulty: 3,
    description: "Learn different caching strategies, eviction policies, and their trade-offs in distributed systems.",
    whyItMatters: "Caching is critical for reducing latency and improving throughput in high-scale systems.",
    learningObjectives: [
      "Understand cache invalidation techniques (LRU, LFU, TTL)",
      "Learn about cache warming and preheating strategies",
      "Know when to use write-through vs write-behind caching"
    ],
    keyConcepts: ["LRU", "Eviction Policies", "TTL", "Cache Invalidation", "Consistency", "Write-through", "Write-back"],
    resources: [
      {
        id: "netflix-cache-001",
        type: "blog",
        title: "How Netflix Scaled Their Caching Layer to Billions of Requests",
        company: "Netflix",
        url: "https://netflixtechblog.com/scaling-caching-at-netflix-91b6fbcf2b5a",
        readTime: 8,
        tags: ["Cache", "Performance", "Scalability"],
        publishedDate: "2023-06-15",
        relevance: "high"
      },
      {
        id: "redis-caching-video",
        type: "video",
        title: "Redis Caching Strategy Deep Dive",
        company: "System Design Interview",
        url: "https://www.youtube.com/watch?v=U3RkDLtI7uY",
        duration: 32,
        tags: ["Cache", "Redis", "Eviction"]
      },
      {
        id: "meta-memcached",
        type: "paper",
        title: "Scaling Memcache at Facebook",
        company: "Meta",
        url: "https://research.facebook.com/publications/scaling-memcache-at-facebook/",
        readTime: 45,
        tags: ["Memcached", "Architecture", "Paper"]
      }
    ],
    relatedTopics: ["load-balancing", "cdn-architecture", "database-sharding"],
    interviewQuestions: ["design-youtube", "design-twitter"]
  },
  {
    id: "database-sharding",
    name: "Database Sharding",
    emoji: "🧩",
    category: "Databases",
    difficulty: 3,
    description: "Understand how to partition data across multiple databases to scale write-heavy applications.",
    whyItMatters: "When a single database instance runs out of storage or compute, sharding becomes necessary to scale horizontally.",
    learningObjectives: [
      "Understand horizontal vs vertical scaling",
      "Learn common sharding strategies (Hash, Range, Directory)",
      "Identify the drawbacks of sharding (Joins, Resharding, Transactions)"
    ],
    keyConcepts: ["Horizontal Partitioning", "Consistent Hashing", "Hotspots", "Cross-shard Joins"],
    resources: [
      {
        id: "uber-sharding",
        type: "blog",
        title: "How Uber Scaled Its Real-Time Infrastructure",
        company: "Uber",
        url: "https://www.uber.com/en-IN/blog/real-time-infrastructure/",
        readTime: 12,
        tags: ["Sharding", "Databases", "Scalability"]
      },
      {
        id: "sharding-concept-video",
        type: "video",
        title: "Database Sharding Explained",
        url: "https://www.youtube.com/watch?v=5faMjKuB9bc",
        duration: 15,
        tags: ["Concepts", "Databases"]
      }
    ],
    relatedTopics: ["caching-strategies", "replication-consistency", "distributed-transactions"],
    interviewQuestions: ["design-instagram", "design-twitter"]
  },
  {
    id: "load-balancing",
    name: "Load Balancing",
    emoji: "⚖️",
    category: "Scalability",
    difficulty: 2,
    description: "Distribute incoming network traffic across multiple servers to ensure no single server bears too much demand.",
    whyItMatters: "Essential for high availability, reliability, and maximizing throughput in any distributed system.",
    learningObjectives: [
      "L4 vs L7 load balancing",
      "Routing algorithms (Round Robin, Least Connections, IP Hash)",
      "Health checks and failover mechanisms"
    ],
    keyConcepts: ["Layer 4", "Layer 7", "Round Robin", "Reverse Proxy", "High Availability"],
    resources: [
      {
        id: "cloudflare-load-balancing",
        type: "blog",
        title: "What is Load Balancing?",
        company: "Cloudflare",
        url: "https://www.cloudflare.com/learning/performance/what-is-load-balancing/",
        readTime: 10,
        tags: ["Networking", "Concepts"]
      },
      {
        id: "discord-load-balancing",
        type: "blog",
        title: "How Discord Scaled Elixir to 5,000,000 Concurrent Users",
        company: "Discord",
        url: "https://discord.com/blog/how-discord-scaled-elixir-to-5-000-000-concurrent-users",
        readTime: 15,
        tags: ["WebSockets", "Elixir", "Load Balancing"]
      }
    ],
    relatedTopics: ["api-design", "caching-strategies", "high-availability"],
    interviewQuestions: ["design-youtube", "design-uber"]
  },
  {
    id: "message-queues",
    name: "Message Queues",
    emoji: "✉️",
    category: "APIs & Communication",
    difficulty: 2,
    description: "Decouple microservices and process tasks asynchronously using message queues and event streaming.",
    whyItMatters: "Improves system resilience, enables asynchronous processing, and smooths out traffic spikes.",
    learningObjectives: [
      "Understand point-to-point vs publish-subscribe models",
      "Learn when to use Kafka vs RabbitMQ vs SQS",
      "Handling consumer failures and dead-letter queues"
    ],
    keyConcepts: ["Pub/Sub", "Kafka", "Asynchronous Processing", "Dead-letter Queue", "At-least-once delivery"],
    resources: [
      {
        id: "linkedin-kafka",
        type: "blog",
        title: "Building LinkedIn's Real-time Activity Data Pipeline",
        company: "LinkedIn",
        url: "https://engineering.linkedin.com/blog/2020/building-linkedins-real-time-activity-data-pipeline",
        readTime: 14,
        tags: ["Kafka", "Streaming", "Events"]
      },
      {
        id: "message-queue-basics",
        type: "video",
        title: "Message Queues Explained",
        url: "https://www.youtube.com/watch?v=oUJbuFMyBDk",
        duration: 12,
        tags: ["RabbitMQ", "Architecture"]
      }
    ],
    relatedTopics: ["real-time-systems", "api-design", "distributed-transactions"],
    interviewQuestions: ["design-uber", "design-discord"]
  },
  {
    id: "cdn-architecture",
    name: "CDN Architecture",
    emoji: "🌍",
    category: "Scalability",
    difficulty: 2,
    description: "Deliver content faster by caching it at the edge of the network, closer to the users.",
    whyItMatters: "Reduces latency for static and media assets, decreasing the load on origin servers.",
    learningObjectives: [
      "Push vs Pull CDNs",
      "Edge caching and PoPs (Points of Presence)",
      "Dynamic content acceleration"
    ],
    keyConcepts: ["Edge Computing", "Latency", "Points of Presence (PoP)", "Origin Server"],
    resources: [
      {
        id: "netflix-cdn",
        type: "blog",
        title: "Netflix Open Connect: Content Delivery at Global Scale",
        company: "Netflix",
        url: "https://netflixtechblog.com/netflix-open-connect-content-delivery-at-global-scale-166c3c528659",
        readTime: 9,
        tags: ["CDN", "Video Streaming"]
      }
    ],
    relatedTopics: ["caching-strategies", "load-balancing"],
    interviewQuestions: ["design-youtube", "design-instagram"]
  },
  {
    id: "replication-consistency",
    name: "Replication & Consistency",
    emoji: "👯",
    category: "Distributed Systems",
    difficulty: 3,
    description: "Maintain multiple copies of data and ensure they stay synchronized across distributed nodes.",
    whyItMatters: "Essential for data durability and high availability, but introduces consistency trade-offs (CAP theorem).",
    learningObjectives: [
      "Single-leader, Multi-leader, and Leaderless replication",
      "Understand Eventual Consistency vs Strong Consistency",
      "Quorum reads/writes and the CAP theorem"
    ],
    keyConcepts: ["CAP Theorem", "PACELC", "Eventual Consistency", "Quorum", "Leader Election", "Split Brain"],
    resources: [
      {
        id: "amazon-dynamo-paper",
        type: "paper",
        title: "Dynamo: Amazon's Highly Available Key-value Store",
        company: "Amazon",
        url: "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf",
        readTime: 60,
        tags: ["Paper", "NoSQL", "Consistency"]
      },
      {
        id: "consistency-models",
        type: "video",
        title: "Strong vs Eventual Consistency",
        url: "https://www.youtube.com/watch?v=kYJjEEBvQAI",
        duration: 18,
        tags: ["CAP Theorem", "Distributed Systems"]
      }
    ],
    relatedTopics: ["database-sharding", "distributed-transactions"],
    interviewQuestions: ["design-uber", "design-youtube"]
  },
  {
    id: "rate-limiting",
    name: "Rate Limiting",
    emoji: "🚦",
    category: "APIs & Communication",
    difficulty: 2,
    description: "Control the rate of traffic sent or received on a network interface to prevent abuse and overload.",
    whyItMatters: "Protects services from DDoS attacks, brute-force attacks, and noisy neighbor problems.",
    learningObjectives: [
      "Token Bucket, Leaky Bucket, Fixed Window, Sliding Window algorithms",
      "Implementing rate limiting with Redis",
      "Client-side vs Server-side rate limiting"
    ],
    keyConcepts: ["Token Bucket", "Sliding Window Log", "DDoS Protection", "Redis", "Throttling"],
    resources: [
      {
        id: "stripe-rate-limiting",
        type: "blog",
        title: "Scaling your API with rate limiters",
        company: "Stripe",
        url: "https://stripe.com/blog/rate-limiters",
        readTime: 11,
        tags: ["APIs", "Algorithms", "Redis"]
      }
    ],
    relatedTopics: ["api-design", "load-balancing"],
    interviewQuestions: ["design-twitter", "design-discord"]
  },
  {
    id: "distributed-transactions",
    name: "Distributed Transactions",
    emoji: "🤝",
    category: "Distributed Systems",
    difficulty: 3,
    description: "Ensure ACID properties across multiple independent databases or microservices.",
    whyItMatters: "Microservice architectures often require transactions that span multiple services (e.g., placing an order and charging a credit card).",
    learningObjectives: [
      "Understand the Two-Phase Commit (2PC) protocol and its flaws",
      "Learn the Saga Pattern (Choreography vs Orchestration)",
      "Outbox Pattern for reliable event publishing"
    ],
    keyConcepts: ["Saga Pattern", "Two-Phase Commit (2PC)", "Event Sourcing", "Outbox Pattern", "Compensating Transactions"],
    resources: [
      {
        id: "uber-saga",
        type: "blog",
        title: "Distributed Tracing and Transactions at Uber",
        company: "Uber",
        url: "https://www.uber.com/en-IN/blog/distributed-tracing/",
        readTime: 16,
        tags: ["Microservices", "Transactions"]
      },
      {
        id: "saga-pattern-video",
        type: "video",
        title: "Saga Architecture Pattern Explained",
        url: "https://www.youtube.com/watch?v=xDuwrtwYHu8",
        duration: 20,
        tags: ["Saga", "Microservices"]
      }
    ],
    relatedTopics: ["message-queues", "database-sharding", "replication-consistency"],
    interviewQuestions: ["design-uber"]
  },
  {
    id: "api-design",
    name: "API Design",
    emoji: "🔌",
    category: "APIs & Communication",
    difficulty: 2,
    description: "Design clean, scalable, and secure APIs for communication between clients and backend services.",
    whyItMatters: "APIs are the contract between services; poorly designed APIs lead to coupling, security flaws, and performance issues.",
    learningObjectives: [
      "RESTful principles and HTTP methods",
      "When to choose gRPC or GraphQL over REST",
      "API Versioning, Pagination (Cursor vs Offset), and Authentication"
    ],
    keyConcepts: ["REST", "GraphQL", "gRPC", "Cursor Pagination", "Idempotency", "API Gateway"],
    resources: [
      {
        id: "github-api-design",
        type: "blog",
        title: "GitHub's API Design Guidelines",
        company: "GitHub",
        url: "https://docs.github.com/en/rest/guides/best-practices-for-integrators",
        readTime: 12,
        tags: ["REST", "Best Practices"]
      }
    ],
    relatedTopics: ["rate-limiting", "load-balancing"],
    interviewQuestions: ["design-twitter", "design-instagram"]
  },
  {
    id: "real-time-systems",
    name: "Real-time Systems",
    emoji: "⚡",
    category: "Real-time Systems",
    difficulty: 3,
    description: "Design systems that process data and push updates to clients with sub-second latency.",
    whyItMatters: "Crucial for chat applications, live dashboards, gaming, and collaborative tools.",
    learningObjectives: [
      "Polling vs Long-Polling vs WebSockets vs Server-Sent Events (SSE)",
      "Connection management at scale",
      "Presence features and conflict resolution (CRDTs/OT)"
    ],
    keyConcepts: ["WebSockets", "Server-Sent Events", "Long Polling", "Connection Management", "CRDTs"],
    resources: [
      {
        id: "discord-real-time",
        type: "blog",
        title: "How Discord stores billions of messages",
        company: "Discord",
        url: "https://discord.com/blog/how-discord-stores-billions-of-messages",
        readTime: 18,
        tags: ["Cassandra", "Real-time", "Chat"]
      }
    ],
    relatedTopics: ["message-queues", "api-design"],
    interviewQuestions: ["design-discord", "design-uber"]
  }
];
