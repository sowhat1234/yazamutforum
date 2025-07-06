# YazamutForum MVP: 6-Week Development Plan

## 🎯 MVP Vision & Success Metrics

### Core Value Proposition
**"From idea to team in 30 days"** - A platform where users can post ideas, get community feedback, and form teams to build them.

### Success Metrics for MVP
- **50+ quality ideas posted** in first month
- **10+ meaningful comment threads** per idea
- **5+ team formation requests** generated
- **80%+ user engagement** (return visitors)
- **Average 3+ ideas per active user**

---

## 🏗️ MVP Tech Stack (Simplified for Speed)

```typescript
Core Stack (T3 + Essentials):
├── Next.js 15 (App Router)
├── TypeScript
├── tRPC (API layer)
├── Prisma + PostgreSQL
├── NextAuth.js (GitHub + Google)
├── Tailwind CSS + shadcn/ui
├── Vercel (deployment)
└── Uploadthing (file uploads)

Deferred for Post-MVP:
❌ Real-time notifications
❌ Advanced algorithms
❌ Team workspaces
❌ Complex skill matching
```

---

## 📊 MVP Database Schema (Minimal)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  username  String   @unique
  image     String?
  bio       String?
  skills    String[] // Simple string array
  
  ideas     Idea[]
  comments  Comment[]
  votes     Vote[]
  interests Interest[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Idea {
  id          String    @id @default(cuid())
  title       String
  description String    // Rich text as HTML
  category    Category
  tags        String[]
  
  // Simple engagement
  upvotes     Int       @default(0)
  downvotes   Int       @default(0)
  
  // Team formation (simple)
  wantsTeam   Boolean   @default(false)
  neededSkills String[] // What skills are needed
  
  author      User      @relation(fields: [authorId], references: [id])
  authorId    String
  comments    Comment[]
  votes       Vote[]
  interests   Interest[] // Users interested in joining team
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  idea      Idea     @relation(fields: [ideaId], references: [id])
  ideaId    String
  
  // Simple threading
  parent    Comment? @relation("CommentReplies", fields: [parentId], references: [id])
  parentId  String?
  replies   Comment[] @relation("CommentReplies")
  
  createdAt DateTime @default(now())
}

model Vote {
  id     String    @id @default(cuid())
  type   VoteType  // UP or DOWN
  
  user   User      @relation(fields: [userId], references: [id])
  userId String
  idea   Idea      @relation(fields: [ideaId], references: [id])
  ideaId String
  
  @@unique([userId, ideaId])
}

model Interest {
  id      String @id @default(cuid())
  message String? // Optional message when showing interest
  
  user    User   @relation(fields: [userId], references: [id])
  userId  String
  idea    Idea   @relation(fields: [ideaId], references: [id])
  ideaId  String
  
  createdAt DateTime @default(now())
  
  @@unique([userId, ideaId])
}

enum Category {
  SAAS
  MOBILE_APP
  WEB_APP
  HARDWARE
  SERVICE
  OTHER
}

enum VoteType {
  UP
  DOWN
}
```

---

## 🚀 6-Week Sprint Plan

### Week 1: Foundation & Auth (Core Setup)
**Goal**: Get basic app running with authentication

#### Day 1-2: Project Setup
- [ ] Initialize T3 Stack project
- [ ] Set up PostgreSQL database (local + Vercel)
- [ ] Configure environment variables
- [ ] Set up GitHub repository

#### Day 3-4: Authentication
- [ ] Configure NextAuth.js with GitHub & Google
- [ ] Create basic user profile pages
- [ ] Implement user registration flow
- [ ] Add username selection during signup

#### Day 5-7: Basic Layout & Navigation
- [ ] Create main layout with header/navigation
- [ ] Implement responsive design with Tailwind
- [ ] Add basic routing structure
- [ ] Create user dropdown menu

**Week 1 Deliverable**: Users can sign up, log in, and navigate the app

---

### Week 2: Core Idea System
**Goal**: Users can post and view ideas

#### Day 8-10: Idea Creation
- [ ] Build idea posting form with rich text
- [ ] Implement category selection
- [ ] Add tag system (simple input)
- [ ] Set up file upload for attachments

#### Day 11-12: Idea Display
- [ ] Create idea card component (Reddit-style)
- [ ] Build idea detail page
- [ ] Implement basic listing page
- [ ] Add idea author attribution

#### Day 13-14: Basic Filtering
- [ ] Add category filtering
- [ ] Implement search by title/tags
- [ ] Create "My Ideas" page
- [ ] Add sorting (newest, most voted)

**Week 2 Deliverable**: Users can post, view, and filter ideas

---

### Week 3: Voting & Engagement
**Goal**: Community can engage with ideas

#### Day 15-17: Voting System
- [ ] Implement upvote/downvote buttons
- [ ] Create voting API endpoints
- [ ] Add vote counts to idea cards
- [ ] Prevent multiple votes from same user

#### Day 18-19: Comment System
- [ ] Build comment form and display
- [ ] Implement simple comment threading (1 level)
- [ ] Add comment timestamps and authors
- [ ] Create comment API endpoints

#### Day 20-21: User Profiles
- [ ] Build public profile pages
- [ ] Show user's ideas and comments
- [ ] Add bio and skills editing
- [ ] Display user statistics

**Week 3 Deliverable**: Full community engagement features working

---

### Week 4: Team Formation (Simple)
**Goal**: Users can express interest in joining teams

#### Day 22-24: Interest System
- [ ] Add "I want to build this" button
- [ ] Show interested users on idea page
- [ ] Create interest notification system
- [ ] Add interested users list

#### Day 25-26: Contact System
- [ ] Enable idea authors to see interested users
- [ ] Add simple messaging/contact information
- [ ] Create "team formation" status for ideas
- [ ] Show skills of interested users

#### Day 27-28: Polish & UX
- [ ] Improve idea detail page layout
- [ ] Add loading states and error handling
- [ ] Implement basic success messages
- [ ] Add helpful empty states

**Week 4 Deliverable**: Basic team formation functionality

---

### Week 5: Polish & Performance
**Goal**: Make the app production-ready

#### Day 29-31: Performance & SEO
- [ ] Optimize database queries
- [ ] Add proper meta tags and OG images
- [ ] Implement image optimization
- [ ] Add loading skeletons

#### Day 32-33: Error Handling & Validation
- [ ] Add form validation throughout app
- [ ] Implement proper error pages (404, 500)
- [ ] Add error boundaries for React components
- [ ] Test all user flows

#### Day 34-35: Mobile Optimization
- [ ] Ensure responsive design works on all devices
- [ ] Optimize touch interactions
- [ ] Test mobile performance
- [ ] Add mobile-specific UX improvements

**Week 5 Deliverable**: Production-ready application

---

### Week 6: Launch Preparation
**Goal**: Deploy and prepare for first users

#### Day 36-38: Deployment & Testing
- [ ] Deploy to Vercel production
- [ ] Set up production database
- [ ] Configure production environment variables
- [ ] Run end-to-end testing

#### Day 39-40: Content & Community
- [ ] Seed database with example ideas
- [ ] Create launch announcement content
- [ ] Prepare user onboarding flow
- [ ] Set up basic analytics

#### Day 41-42: Launch!
- [ ] Soft launch to friends/network
- [ ] Monitor for bugs and issues
- [ ] Gather initial user feedback
- [ ] Plan post-MVP features

**Week 6 Deliverable**: Live application with first users

---

## 🎨 MVP User Interface Components

### Essential Pages (Wireframe Priority)
1. **Home/Feed** - List of ideas (Reddit-style cards)
2. **Idea Detail** - Full idea view with comments and team formation
3. **Post Idea** - Simple form to create new ideas
4. **User Profile** - Show user's ideas and interests
5. **Auth Pages** - Login/signup flows

### Core Components to Build
```typescript
// Essential MVP components
components/
├── Layout/
│   ├── Header.tsx              // Navigation with auth
│   └── Sidebar.tsx             // Categories, filters
├── Ideas/
│   ├── IdeaCard.tsx           // Reddit-style post card
│   ├── IdeaDetail.tsx         // Full idea view
│   ├── IdeaForm.tsx           // Create/edit ideas
│   └── VotingButtons.tsx      // Upvote/downvote
├── Comments/
│   ├── CommentList.tsx        // Display comments
│   ├── CommentForm.tsx        // Add new comment
│   └── CommentItem.tsx        // Single comment
├── TeamFormation/
│   ├── InterestButton.tsx     // "I want to build this"
│   ├── InterestedUsers.tsx    // List of interested users
│   └── SkillBadges.tsx        // Display user skills
└── User/
    ├── UserProfile.tsx        // Public profile
    ├── UserAvatar.tsx         // User avatar component
    └── SkillsEditor.tsx       // Edit user skills
```

---

## 🎯 MVP Feature Scope (What's IN vs OUT)

### ✅ MVP Features (MUST HAVE)
- User authentication (GitHub/Google)
- Post ideas with rich text and categories
- Upvote/downvote system
- Basic commenting (1-level threading)
- "I want to build this" interest system
- User profiles with skills
- Basic search and filtering
- Mobile-responsive design

### ❌ Post-MVP Features (NICE TO HAVE)
- Real-time notifications
- Advanced team workspaces
- Complex skill matching algorithms
- Direct messaging between users
- Advanced analytics and insights
- Email notifications
- Advanced comment threading
- Idea similarity detection
- Reputation/karma system

---

## 🚦 Success Criteria & Next Steps

### MVP Launch Success Indicators
1. **Technical**: App loads fast, no critical bugs, mobile-friendly
2. **User Engagement**: Users post ideas and comment within first week
3. **Team Formation**: At least 1 successful team formation request
4. **Growth**: Word-of-mouth sharing happens organically

### Post-MVP Roadmap (Priority Order)
1. **Enhanced Team Formation** - Direct messaging, team workspaces
2. **Notification System** - Email + in-app notifications
3. **Advanced Discovery** - Better algorithms, trending sections
4. **Community Features** - User reputation, achievements
5. **Monetization** - Premium features, promoted ideas

---

## 💻 Getting Started Command List

```bash
# 1. Initialize the project
npx create-t3-app@latest ideaforum --trpc --prisma --tailwind --nextAuth

# 2. Add essential dependencies
cd ideaforum
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder
npm install uploadthing @uploadthing/react
npm install lucide-react @radix-ui/react-dropdown-menu
npm install @tanstack/react-query

# 3. Set up database
npx prisma db push
npx prisma studio

# 4. Start development
npm run dev
```

This MVP plan balances ambition with achievability. The goal is to get a working platform that validates your core concept within 6 weeks, then iterate based on real user feedback.

**Ready to start Week 1? I can help you set up the T3 Stack project and walk through the initial implementation!**
