# Climbing Social Media App - System Design Document

## Table of Contents
1. [Overview](#overview)
2. [Requirements Summary](#requirements-summary)
3. [High-Level Architecture](#high-level-architecture)
4. [Technology Stack](#technology-stack)
5. [Database Design](#database-design)
6. [Service Architecture](#service-architecture)
7. [API Design](#api-design)
8. [Infrastructure Components](#infrastructure-components)
9. [Scalability Considerations](#scalability-considerations)
10. [Security Considerations](#security-considerations)

---

## Overview

This document outlines the system design for a climbing-focused social media application with the following core features:
- Twitter-like feed with posts (text, images/videos, tags, likes/dislikes, reposts)
- User profiles
- Climbing journal for tracking climbs
- Direct messaging system (posts and text messages)

**Target Scale**: Medium to high (tens of thousands to hundreds of thousands of users)
**Platform**: Mobile (iOS/Android)

---

## Requirements Summary

### Functional Requirements
1. **Feed System**
   - Create posts with text, media (images/videos), and tags
   - Like/dislike posts
   - Repost functionality
   - View personalized feed

2. **User Profiles**
   - View user information
   - Display user's posts and climbing activity
   - Follow/friend system

3. **Climbing Journal**
   - Track individual climbs
   - Store climb details (date, location, grade, notes)
   - View climbing history and statistics

4. **Messaging System**
   - Send direct messages to friends or public accounts
   - Share posts via messages
   - Real-time message delivery

### Non-Functional Requirements
- **Availability**: 99.9% uptime
- **Scalability**: Handle 100K+ concurrent users
- **Performance**: Feed loads in <2 seconds, messages delivered in <1 second
- **Storage**: Support millions of posts and media files
- **Security**: Secure authentication, data privacy, encrypted messages

---

## High-Level Architecture

We'll use a **microservices architecture** for better scalability, maintainability, and independent deployment of features.

```
┌─────────────┐
│   Mobile    │
│  App Client │
│ (iOS/Android)│
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│     API Gateway (AWS API Gateway)   │
│   - Rate limiting                   │
│   - Authentication                  │
│   - Request routing                 │
└──────┬──────────────────────────────┘
       │
       ├──────────┬──────────┬──────────┬──────────┐
       ▼          ▼          ▼          ▼          ▼
  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
  │ User   │ │ Feed   │ │Journal │ │Message │ │ Media  │
  │Service │ │Service │ │Service │ │Service │ │Service │
  └────┬───┘ └────┬───┘ └────┬───┘ └────┬───┘ └────┬───┘
       │          │          │          │          │
       └──────────┴──────────┴──────────┴──────────┘
                           │
                           ▼
              ┌─────────────────────────┐
              │     Data Layer          │
              │  - PostgreSQL (RDS)     │
              │  - Redis (ElastiCache)  │
              │  - S3 (Media Storage)   │
              └─────────────────────────┘
```

### Why Microservices?

**Benefits:**
- **Independent Scaling**: Feed service (high read traffic) can scale differently than messaging service (high write traffic)
- **Technology Flexibility**: Can use different databases/tech for different services
- **Fault Isolation**: If one service fails, others continue working
- **Team Organization**: Different teams can own different services

**Tradeoffs:**
- More complex than monolith (but manageable at medium scale)
- Requires good monitoring and service mesh
- Network latency between services

**Decision**: For medium-to-high scale with distinct feature sets, microservices provide better long-term scalability despite added complexity.

---

## Technology Stack

### Backend Services
- **Language**: Node.js with TypeScript
  - **Why**:
    - Excellent for I/O-heavy operations (feeds, messaging)
    - Large ecosystem for social media features
    - TypeScript adds type safety for maintainability
    - Non-blocking I/O handles concurrent requests efficiently

- **Framework**: Express.js or NestJS
  - **Express**: Lightweight, flexible, large community
  - **NestJS**: Structured, built-in TypeScript, better for microservices
  - **Recommendation**: NestJS for better architecture and scalability

### Databases

#### Primary Database: PostgreSQL (AWS RDS)
- **Why**:
  - ACID compliance for user data, posts, relationships
  - Excellent for complex queries (feed generation, user relationships)
  - JSON support for flexible post metadata
  - Strong consistency for critical data (likes, follows)

#### Cache Layer: Redis (AWS ElastiCache)
- **Why**:
  - Cache frequently accessed data (user feeds, trending posts)
  - Session management
  - Real-time features (online status, typing indicators)
  - Pub/Sub for messaging system

#### Search: Elasticsearch (AWS OpenSearch)
- **Why**:
  - Full-text search for posts, users, tags
  - Fast tag-based filtering
  - Climbing route search
  - Analytics and trending calculations

### Storage

#### Media Storage: AWS S3
- **Why**:
  - Scalable object storage for images/videos
  - CDN integration (CloudFront) for fast media delivery
  - Cost-effective for large files
  - Automatic backup and versioning

### Message Queue: AWS SQS/SNS
- **Why**:
  - Async processing (video encoding, notifications)
  - Decouples services
  - Ensures message delivery reliability
  - Handles traffic spikes

### Real-Time Communication: Socket.io or AWS AppSync
- **Why**:
  - Real-time messaging
  - Live feed updates
  - Presence indicators
  - **Socket.io**: More control, runs on your servers
  - **AppSync**: Managed GraphQL with subscriptions, less maintenance

### API Gateway: AWS API Gateway
- **Why**:
  - Single entry point for all services
  - Built-in authentication (AWS Cognito integration)
  - Rate limiting and throttling
  - Request/response transformation

### Authentication: AWS Cognito
- **Why**:
  - Managed user authentication
  - OAuth/Social login support
  - JWT token management
  - Scalable user directory

### Monitoring & Logging
- **CloudWatch**: Metrics, logs, alarms
- **X-Ray**: Distributed tracing
- **Sentry**: Error tracking

---

## Database Design

### Schema Overview

We'll use a hybrid approach:
- **PostgreSQL**: Relational data (users, relationships, posts metadata)
- **S3**: Media files
- **Redis**: Cached data and real-time features
- **Elasticsearch**: Search indices

### PostgreSQL Schema

#### Users Table
```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    bio TEXT,
    profile_picture_url VARCHAR(500),
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
```

**Why these fields?**
- `UUID`: Better for distributed systems, prevents ID enumeration attacks
- `is_public`: Controls who can send messages and view profile
- Indexed username/email for fast lookups

#### Posts Table
```sql
CREATE TABLE posts (
    post_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id),
    content TEXT,
    media_urls JSONB,  -- Array of media URLs stored in S3
    tags JSONB,        -- Flexible tag structure
    climb_id UUID REFERENCES climbs(climb_id),  -- Optional link to journal entry
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_tags ON posts USING GIN(tags);
```

**Why JSONB for media_urls and tags?**
- Flexible structure (posts can have 0-10 images/videos)
- No need for separate junction tables
- GIN index for fast tag queries
- PostgreSQL JSONB is performant and queryable

#### Likes Table
```sql
CREATE TABLE post_likes (
    user_id UUID NOT NULL REFERENCES users(user_id),
    post_id UUID NOT NULL REFERENCES posts(post_id),
    is_like BOOLEAN NOT NULL,  -- true = like, false = dislike
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id)
);

CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);
```

**Why separate likes table?**
- Prevents race conditions (vs incrementing counter)
- Allows "unlike" functionality
- Can query "posts liked by user"
- Supports like/dislike distinction

#### Reposts Table
```sql
CREATE TABLE reposts (
    repost_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id),
    original_post_id UUID NOT NULL REFERENCES posts(post_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, original_post_id)  -- Can't repost same post twice
);

CREATE INDEX idx_reposts_user_id ON reposts(user_id);
CREATE INDEX idx_reposts_post_id ON reposts(original_post_id);
```

#### Followers Table
```sql
CREATE TABLE followers (
    follower_id UUID NOT NULL REFERENCES users(user_id),
    following_id UUID NOT NULL REFERENCES users(user_id),
    status VARCHAR(20) DEFAULT 'pending',  -- pending, accepted, blocked
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id),
    CHECK (follower_id != following_id)  -- Can't follow yourself
);

CREATE INDEX idx_followers_follower_id ON followers(follower_id);
CREATE INDEX idx_followers_following_id ON followers(following_id);
```

**Why status field?**
- Private accounts need approval
- Blocked users can't see content
- Pending requests visible in UI

#### Climbs Table (Journal)
```sql
CREATE TABLE climbs (
    climb_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id),
    route_name VARCHAR(200),
    location VARCHAR(200),
    grade VARCHAR(20),  -- V0-V17 for bouldering, 5.0-5.15 for sport
    climb_type VARCHAR(50),  -- boulder, sport, trad, top-rope
    completion_type VARCHAR(50),  -- onsight, flash, redpoint, project
    notes TEXT,
    date_climbed DATE NOT NULL,
    media_urls JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_climbs_user_id ON climbs(user_id);
CREATE INDEX idx_climbs_date ON climbs(date_climbed DESC);
CREATE INDEX idx_climbs_grade ON climbs(grade);
```

**Why these climb fields?**
- Climbing-specific: grade, type, completion style
- `date_climbed` separate from `created_at` (can log past climbs)
- Indexed for statistics queries (progression over time, grade distribution)

#### Messages Table
```sql
CREATE TABLE conversations (
    conversation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE conversation_participants (
    conversation_id UUID NOT NULL REFERENCES conversations(conversation_id),
    user_id UUID NOT NULL REFERENCES users(user_id),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(conversation_id),
    sender_id UUID NOT NULL REFERENCES users(user_id),
    content TEXT,
    shared_post_id UUID REFERENCES posts(post_id),  -- Optional shared post
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_by JSONB DEFAULT '[]'  -- Array of user_ids who read the message
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
```

**Why this messaging structure?**
- `conversations` table supports group messages (future feature)
- `read_by` JSONB allows read receipts without extra table
- `shared_post_id` enables sharing posts in messages
- Indexed for fast message history retrieval

### Redis Cache Structure

```
# User feed cache (pre-computed feed for fast loading)
feed:user:{user_id} -> List of post_ids (sorted by time)
TTL: 15 minutes

# Post metadata cache
post:{post_id} -> Hash of post data
TTL: 1 hour

# Like/repost counts (frequently updated)
post:{post_id}:likes -> Integer
post:{post_id}:dislikes -> Integer
post:{post_id}:reposts -> Integer
TTL: 5 minutes

# User session
session:{session_id} -> Hash of user data
TTL: 7 days

# Online users (for messaging presence)
online:users -> Set of user_ids
TTL: 5 minutes with refresh

# Message queue for real-time delivery
messages:queue:{user_id} -> List of message_ids
No TTL (clear on delivery)
```

**Why cache these specifically?**
- **Feeds**: Most expensive query, accessed frequently
- **Counts**: Updated often, read more often (cache write-through)
- **Sessions**: Reduce DB load for auth checks
- **Online status**: Real-time feature, doesn't need persistence

---

## Service Architecture

### 1. User Service

**Responsibilities:**
- User registration and authentication
- Profile management
- Follow/unfollow functionality
- Privacy settings

**Database Access:**
- PostgreSQL: users, followers tables
- Redis: session cache, user profile cache

**API Endpoints:**
- `POST /api/users/register`
- `POST /api/users/login`
- `GET /api/users/:userId`
- `PUT /api/users/:userId`
- `POST /api/users/:userId/follow`
- `DELETE /api/users/:userId/follow`
- `GET /api/users/:userId/followers`
- `GET /api/users/:userId/following`

### 2. Feed Service

**Responsibilities:**
- Create/edit/delete posts
- Like/dislike posts
- Repost functionality
- Generate personalized feeds
- Trending posts

**Database Access:**
- PostgreSQL: posts, post_likes, reposts tables
- Redis: feed cache, like counts
- Elasticsearch: post search, trending
- S3: media URLs (read-only)

**API Endpoints:**
- `POST /api/posts`
- `GET /api/posts/:postId`
- `PUT /api/posts/:postId`
- `DELETE /api/posts/:postId`
- `POST /api/posts/:postId/like`
- `DELETE /api/posts/:postId/like`
- `POST /api/posts/:postId/repost`
- `GET /api/feed` (personalized feed)
- `GET /api/feed/trending`
- `GET /api/posts/search?q=tag`

**Feed Generation Algorithm:**

```typescript
// Simplified feed generation
async function generateFeed(userId: string, page: number = 1) {
  // 1. Check Redis cache first
  const cachedFeed = await redis.get(`feed:user:${userId}`);
  if (cachedFeed) return paginate(cachedFeed, page);

  // 2. Get users this person follows
  const following = await getFollowing(userId);

  // 3. Get recent posts from followed users
  // Using fan-out-on-read approach (better for medium scale)
  const posts = await db.query(`
    SELECT p.*, u.username, u.profile_picture_url,
           (SELECT COUNT(*) FROM post_likes WHERE post_id = p.post_id AND is_like = true) as likes,
           (SELECT COUNT(*) FROM post_likes WHERE post_id = p.post_id AND is_like = false) as dislikes,
           (SELECT COUNT(*) FROM reposts WHERE original_post_id = p.post_id) as reposts
    FROM posts p
    JOIN users u ON p.user_id = u.user_id
    WHERE p.user_id = ANY($1)
    ORDER BY p.created_at DESC
    LIMIT 100
  `, [following]);

  // 4. Include reposts from followed users
  const reposts = await getRepostsFromFollowing(userId, following);

  // 5. Merge and rank by time (can add engagement score later)
  const feed = rankPosts([...posts, ...reposts]);

  // 6. Cache for 15 minutes
  await redis.setex(`feed:user:${userId}`, 900, JSON.stringify(feed));

  return paginate(feed, page);
}
```

**Why fan-out-on-read?**
- **Fan-out-on-write**: Write posts to all followers' feeds immediately
  - Pro: Fast read, just query pre-computed feed
  - Con: Slow write for users with many followers, complex to maintain

- **Fan-out-on-read**: Compute feed when user requests it
  - Pro: Fast write, simpler to implement, works well for medium scale
  - Con: Slower read (but mitigated with caching)

**Decision**: For medium scale (100K users), fan-out-on-read with aggressive caching is simpler and sufficient. Switch to hybrid approach if celebrities emerge.

### 3. Journal Service

**Responsibilities:**
- Create/edit/delete climb entries
- Retrieve climbing history
- Generate statistics (grade progression, frequency)

**Database Access:**
- PostgreSQL: climbs table
- S3: climb photos/videos

**API Endpoints:**
- `POST /api/journal/climbs`
- `GET /api/journal/climbs/:climbId`
- `PUT /api/journal/climbs/:climbId`
- `DELETE /api/journal/climbs/:climbId`
- `GET /api/journal/user/:userId/climbs`
- `GET /api/journal/user/:userId/stats`

**Statistics Example:**
```typescript
// Grade progression over time
async function getClimbingStats(userId: string) {
  return await db.query(`
    SELECT
      DATE_TRUNC('month', date_climbed) as month,
      grade,
      COUNT(*) as count,
      climb_type
    FROM climbs
    WHERE user_id = $1
    GROUP BY month, grade, climb_type
    ORDER BY month DESC
  `, [userId]);
}
```

### 4. Message Service

**Responsibilities:**
- Send/receive direct messages
- Real-time message delivery
- Message read receipts
- Sharing posts in messages

**Database Access:**
- PostgreSQL: conversations, messages tables
- Redis: message queue, online status
- WebSocket/Socket.io: real-time delivery

**API Endpoints:**
- `POST /api/messages/conversations` (start conversation)
- `GET /api/messages/conversations` (list user's conversations)
- `GET /api/messages/conversations/:conversationId` (message history)
- `POST /api/messages/conversations/:conversationId/messages`
- `PUT /api/messages/:messageId/read`
- WebSocket: `/ws/messages`

**Real-Time Flow:**
```
Client A                Server                  Client B
   │                      │                        │
   │──WebSocket Connect──>│                        │
   │<──Connected──────────│                        │
   │                      │<──WebSocket Connect────│
   │                      │────Connected──────────>│
   │                      │                        │
   │──Send Message──────>│                        │
   │   (REST API)         │                        │
   │                      │──Save to DB────>       │
   │                      │──Push via WS─────────>│
   │<──Message Saved──────│                        │
   │                      │<──Read Receipt─────────│
   │<──Read Receipt───────│                        │
```

**Why WebSocket for messaging?**
- HTTP polling: Wastes resources, high latency
- Server-Sent Events (SSE): One-way only
- WebSocket: Full-duplex, low latency, perfect for chat

### 5. Media Service

**Responsibilities:**
- Handle image/video uploads
- Generate thumbnails
- Video transcoding
- Serve media URLs

**Database Access:**
- S3: direct upload/download
- SQS: async processing queue

**API Endpoints:**
- `POST /api/media/upload/image`
- `POST /api/media/upload/video`
- `GET /api/media/:mediaId` (redirects to CloudFront URL)

**Upload Flow:**
```
Client                  Media Service            S3              SQS             Worker
  │                         │                     │               │                │
  │──Upload Request────────>│                     │               │                │
  │<──Presigned URL─────────│                     │               │                │
  │                         │                     │               │                │
  │──Upload directly────────────────────────────>│               │                │
  │<──Success───────────────────────────────────│               │                │
  │                         │                     │               │                │
  │──Confirm Upload────────>│                     │               │                │
  │                         │──Process Message──────────────────>│                │
  │                         │                     │               │──Transcode────>│
  │<──Media URL─────────────│                     │               │                │
  │                         │                     │<──Upload──────────────────────│
  │                         │                     │               │                │
```

**Why presigned URLs?**
- Client uploads directly to S3 (reduces server load)
- Secure (temporary, signed URLs)
- Faster uploads (no proxy through API)

**Video Transcoding:**
- Use AWS Elastic Transcoder or MediaConvert
- Generate multiple resolutions (480p, 720p, 1080p)
- Adaptive bitrate streaming (HLS)

---

## API Design

### API Standards

**RESTful Principles:**
- Use HTTP methods correctly (GET, POST, PUT, DELETE)
- Resource-based URLs (`/api/posts/:postId`)
- Proper status codes (200, 201, 400, 401, 404, 500)

**API Versioning:**
- URL versioning: `/api/v1/posts`
- Allows breaking changes without affecting mobile app

**Pagination:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 150,
    "hasNext": true
  }
}
```

**Error Responses:**
```json
{
  "error": {
    "code": "INVALID_POST_ID",
    "message": "Post not found",
    "details": {}
  }
}
```

### Authentication Flow

**JWT-based authentication with AWS Cognito:**

```
Mobile App              API Gateway           Cognito            User Service
    │                       │                    │                   │
    │──Login Request───────>│                    │                   │
    │   (username/password)  │───Authenticate────>│                   │
    │                       │<──JWT Tokens───────│                   │
    │<──Tokens──────────────│                    │                   │
    │   (access + refresh)   │                    │                   │
    │                       │                    │                   │
    │──API Request─────────>│                    │                   │
    │   (with access token)  │──Verify Token─────>│                   │
    │                       │<──Token Valid──────│                   │
    │                       │──Request──────────────────────────────>│
    │                       │<──Response─────────────────────────────│
    │<──Response────────────│                    │                   │
```

**Token Structure:**
- **Access Token**: Short-lived (1 hour), used for API requests
- **Refresh Token**: Long-lived (7 days), used to get new access token
- **ID Token**: Contains user claims (user_id, username, email)

### Rate Limiting

**API Gateway rate limits:**
- Per user: 100 requests/minute (general)
- Feed endpoint: 20 requests/minute (expensive query)
- Message send: 10 messages/minute (prevent spam)
- Media upload: 5 uploads/minute (large files)

**Implementation:**
```typescript
// Token bucket algorithm in API Gateway
{
  "throttle": {
    "burstLimit": 200,  // Max burst
    "rateLimit": 100    // Sustained rate per second
  }
}
```

---

## Infrastructure Components

### AWS Architecture Diagram

```
┌────────────────────────────────────────────────────────────┐
│                        CloudFront CDN                       │
│                    (Media Distribution)                     │
└────────────────────────┬───────────────────────────────────┘
                         │
┌────────────────────────┴───────────────────────────────────┐
│                     API Gateway                             │
│               (Authentication, Rate Limiting)               │
└────────────────────────┬───────────────────────────────────┘
                         │
           ┌─────────────┼─────────────┐
           │             │             │
    ┌──────▼──────┐ ┌───▼────┐ ┌─────▼──────┐
    │   ECS/EKS   │ │  ECS   │ │    ECS     │
    │  Services   │ │Services│ │  Services  │
    │ (User, Feed)│ │(Journal│ │ (Message,  │
    └──────┬──────┘ │ Media) │ │   Media)   │
           │        └───┬────┘ └─────┬──────┘
           │            │            │
    ┌──────┴────────────┴────────────┴───────┐
    │                                         │
┌───▼────────┐  ┌──────────┐  ┌────────────┐ │
│ RDS        │  │  Redis   │  │     S3     │ │
│PostgreSQL) │  │(Elasticac│  │   Bucket   │ │
│  (Multi-AZ)│  │   -he)   │  │  (Media)   │ │
└────────────┘  └──────────┘  └────────────┘ │
                                              │
    ┌──────────────┐  ┌──────────────┐       │
    │    SQS       │  │ OpenSearch   │       │
    │ (Job Queue)  │  │   (Search)   │       │
    └──────────────┘  └──────────────┘       │
                                              │
└─────────────────────────────────────────────┘
```

### Service Deployment

**Container Orchestration: AWS ECS (Elastic Container Service)**

**Why ECS over EKS (Kubernetes)?**
- Simpler to manage for medium scale
- Better AWS integration
- Lower operational overhead
- EKS is overkill for this scale (but good to learn later)

**Container Setup:**
```dockerfile
# Example Dockerfile for Node.js service
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

**ECS Task Definition:**
- Each microservice runs in separate ECS service
- Auto-scaling based on CPU/memory (scale 2-10 instances)
- Load balancer distributes traffic
- Health checks for automatic recovery

### Database Setup

**RDS PostgreSQL:**
- Multi-AZ deployment (high availability)
- Automated backups (daily, 7-day retention)
- Read replicas for read-heavy queries (feed generation)
- Instance: db.t3.large (start), scale to db.m5.xlarge

**ElastiCache Redis:**
- Cluster mode enabled (sharding for scale)
- Multi-AZ with automatic failover
- Instance: cache.t3.medium (start)

### Load Balancing

**Application Load Balancer (ALB):**
- Distributes traffic across ECS containers
- Health checks on each service
- SSL/TLS termination
- Path-based routing to services

**Example routing:**
```
/api/users/*    -> User Service
/api/posts/*    -> Feed Service
/api/journal/*  -> Journal Service
/api/messages/* -> Message Service
/api/media/*    -> Media Service
```

### CDN: CloudFront

**Why CloudFront?**
- Distribute media globally (low latency)
- Cache images/videos at edge locations
- Reduce S3 egress costs
- DDoS protection

**Cache policy:**
- Images: 7 days TTL
- Videos: 30 days TTL
- Thumbnails: 7 days TTL

---

## Scalability Considerations

### Vertical vs Horizontal Scaling

**Current Approach: Horizontal Scaling**
- Add more ECS containers (not bigger instances)
- Database read replicas (not bigger RDS instance initially)
- Redis sharding (not bigger cache)

**Why?**
- More cost-effective
- Better fault tolerance
- Easier to auto-scale

### Bottleneck Analysis

**1. Feed Generation (Most Likely Bottleneck)**

**Problem**: Computing feeds for many users is expensive

**Solutions:**
- **Caching**: Aggressive Redis caching (15-min TTL)
- **Precomputation**: Background job computes feeds during low traffic
- **Pagination**: Limit to 20 posts per page
- **Database Optimization**:
  - Index on `created_at` for time-based sorting
  - Materialized views for frequently accessed data
  - Read replicas for feed queries

**2. Media Storage & Delivery**

**Problem**: Videos consume storage and bandwidth

**Solutions:**
- **Compression**: Transcode videos to efficient codecs (H.265)
- **CDN**: CloudFront reduces S3 egress costs
- **Lazy Loading**: Load images as user scrolls
- **Thumbnail Generation**: Show thumbnails, load full size on demand

**3. Real-Time Messaging**

**Problem**: Many concurrent WebSocket connections

**Solutions:**
- **Horizontal Scaling**: Multiple message service instances
- **Sticky Sessions**: ALB routes user to same instance
- **Redis Pub/Sub**: Share messages across instances
- **Message Queuing**: Buffer messages in Redis during spikes

**Architecture for Scaled Messaging:**
```
User A ──WebSocket──> Message Service Instance 1 ──┐
                                                     │
                                                     ▼
User B ──WebSocket──> Message Service Instance 2 ──Redis Pub/Sub
                                                     ▲
                                                     │
User C ──WebSocket──> Message Service Instance 3 ──┘
```

### Database Scaling

**Phase 1: Vertical Scaling**
- Upgrade RDS instance size (db.t3.large -> db.m5.xlarge)

**Phase 2: Read Replicas**
- Add 2-3 read replicas
- Route all SELECT queries to replicas
- Keep writes on primary

**Phase 3: Sharding (if needed)**
- Shard by user_id (user 1-10000 -> DB1, 10001-20000 -> DB2)
- Use Vitess or Citus for PostgreSQL sharding
- Most complex, only if truly needed

### Caching Strategy

**Cache Hierarchy:**
1. **CDN (CloudFront)**: Static media
2. **Redis**: Dynamic data (feeds, counts, sessions)
3. **Application Cache**: In-memory cache in services
4. **Database Query Cache**: PostgreSQL query cache

**Cache Invalidation:**
- **Time-based**: TTL for most data
- **Event-based**: Invalidate on write (user posts -> clear feed cache)
- **Pattern**: Cache-aside pattern (check cache, query DB, update cache)

---

## Security Considerations

### Authentication & Authorization

**Authentication**: Who you are
- JWT tokens from AWS Cognito
- Token expiration and rotation
- Multi-factor authentication (optional)

**Authorization**: What you can do
- User can only edit their own posts/climbs
- Private accounts: check follower relationship
- Blocked users: prevent access

**Authorization Check Example:**
```typescript
async function canViewPost(userId: string, postId: string): Promise<boolean> {
  const post = await getPost(postId);
  const postAuthor = await getUser(post.user_id);

  // Public account: anyone can view
  if (postAuthor.is_public) return true;

  // Private account: must be follower
  const isFollower = await checkFollowerStatus(userId, postAuthor.user_id);
  return isFollower === 'accepted';
}
```

### Data Protection

**Encryption:**
- **In Transit**: HTTPS/TLS for all API calls
- **At Rest**:
  - RDS encryption enabled
  - S3 bucket encryption (AES-256)
  - Encrypted EBS volumes for ECS

**Data Privacy:**
- User passwords hashed (bcrypt with salt)
- Email addresses not exposed in API responses
- Private messages encrypted

**GDPR Compliance:**
- User data export API
- Account deletion (cascade delete all user data)
- Consent for data collection

### API Security

**Rate Limiting**: Prevent abuse (covered earlier)

**Input Validation:**
```typescript
// Validate post content
const postSchema = Joi.object({
  content: Joi.string().max(1000).required(),
  tags: Joi.array().items(Joi.string()).max(10),
  media_urls: Joi.array().items(Joi.string().uri()).max(10)
});
```

**SQL Injection Prevention:**
- Use parameterized queries (never string concatenation)
- ORM (TypeORM, Prisma) with prepared statements

**XSS Prevention:**
- Sanitize user input (DOMPurify)
- Content Security Policy headers

**CORS:**
- Restrict to mobile app domains only
- For mobile apps, use custom headers for verification

### Infrastructure Security

**VPC Configuration:**
- Services in private subnets
- Only API Gateway in public subnet
- Security groups restrict traffic between services

**Secrets Management:**
- AWS Secrets Manager for database credentials
- Environment variables for config
- No hardcoded secrets in code

**Monitoring & Alerts:**
- CloudWatch alarms for anomalies (traffic spikes, error rates)
- Failed login attempt monitoring
- Suspicious activity detection (many posts in short time)

---

## Implementation Roadmap

### Phase 1: MVP (Months 1-2)
1. Set up AWS infrastructure (VPC, RDS, S3)
2. Implement User Service (registration, login, profiles)
3. Implement basic Feed Service (create post, view feed)
4. Implement Media Service (image upload)
5. Basic mobile app (React Native or Flutter)

**Goal**: Users can register, create posts with images, view feed

### Phase 2: Social Features (Month 3)
1. Implement likes/dislikes
2. Implement reposts
3. Implement follow/unfollow
4. Personalized feed algorithm
5. Search functionality (Elasticsearch)

**Goal**: Full social media experience

### Phase 3: Climbing Journal (Month 4)
1. Implement Journal Service
2. Climb logging (CRUD operations)
3. Statistics and progression tracking
4. Link journal entries to posts

**Goal**: Users can track their climbing progress

### Phase 4: Messaging (Month 5)
1. Implement Message Service
2. WebSocket real-time messaging
3. Message history
4. Share posts in messages
5. Read receipts

**Goal**: Users can communicate privately

### Phase 5: Optimization & Scale (Month 6+)
1. Implement aggressive caching
2. Database query optimization
3. Load testing and performance tuning
4. CDN optimization
5. Monitoring and alerting
6. Auto-scaling configuration

**Goal**: Handle 100K+ users efficiently

---

## Monitoring & Observability

### Key Metrics to Track

**Application Metrics:**
- Request rate (requests/second)
- Error rate (4xx, 5xx)
- Response time (p50, p95, p99)
- Feed generation time
- Message delivery latency

**Infrastructure Metrics:**
- ECS container CPU/memory usage
- RDS CPU/memory/connections
- Redis hit rate
- S3 storage size and costs
- CloudFront bandwidth

**Business Metrics:**
- Daily active users (DAU)
- Monthly active users (MAU)
- Posts per day
- Messages sent per day
- Average session duration

### Logging Strategy

**Structured Logging:**
```typescript
logger.info('User created post', {
  userId: '123',
  postId: '456',
  hasMedia: true,
  tags: ['boulder', 'V8'],
  timestamp: new Date().toISOString()
});
```

**Log Aggregation:**
- CloudWatch Logs for all services
- Log groups per service
- Retention: 30 days

**Alerting:**
- Error rate > 5%: Page on-call engineer
- Response time > 3s: Warning
- Database connections > 80%: Warning
- Failed login attempts > 100/min: Security alert

---

## Cost Estimation (Monthly)

**For 50,000 active users:**

| Service | Configuration | Estimated Cost |
|---------|--------------|----------------|
| ECS (5 services, 3 containers each) | 15 × t3.medium | $450 |
| RDS PostgreSQL | db.m5.large, Multi-AZ | $350 |
| ElastiCache Redis | cache.m5.large | $200 |
| S3 Storage | 500 GB media | $12 |
| S3 Requests | 10M requests | $5 |
| CloudFront | 1 TB transfer | $85 |
| API Gateway | 100M requests | $350 |
| OpenSearch | t3.medium | $100 |
| Data Transfer | 2 TB | $180 |
| **TOTAL** | | **~$1,732/month** |

**Cost Optimization Tips:**
- Use Reserved Instances for RDS/ElastiCache (30-40% savings)
- S3 Intelligent-Tiering for old media
- CloudFront caching to reduce S3 requests
- Delete old video transcodes
- Right-size instances based on metrics

---

## Conclusion

This system design provides a scalable, maintainable architecture for a climbing social media app. Key decisions:

1. **Microservices**: Enables independent scaling and development
2. **PostgreSQL**: Strong consistency for relational data
3. **Redis**: Fast caching for frequently accessed data
4. **Fan-out-on-read**: Simpler feed generation for medium scale
5. **S3 + CloudFront**: Cost-effective media storage and delivery
6. **WebSocket**: Real-time messaging experience
7. **AWS Managed Services**: Reduces operational overhead

**Next Steps:**
1. Set up AWS account and infrastructure (use Infrastructure as Code: Terraform or AWS CDK)
2. Implement services incrementally (start with User Service)
3. Deploy to staging environment
4. Load test with realistic traffic
5. Iterate based on performance metrics

**Learning Resources:**
- System Design Primer: https://github.com/donnemartin/system-design-primer
- AWS Well-Architected Framework: https://aws.amazon.com/architecture/well-architected/
- Designing Data-Intensive Applications (book by Martin Kleppmann)

Good luck with your climbing app! Feel free to revisit this document as you build and adjust based on real-world learnings.