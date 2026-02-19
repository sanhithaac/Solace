# Solace - Mental Health Platform Implementation Plan

## Architecture

### Routing Structure
```
app/
  auth/page.tsx              ✅ DONE
  dashboard/
    layout.tsx               → Sidebar + topbar wrapper
    page.tsx                 → Overview dashboard
    journal/page.tsx         → Journal entries + AI sentiment
    mood/page.tsx            → Mood tracker + period cycle
    chat/page.tsx            → AI Chatbot (RAG + NLP)
    feed/page.tsx            → Interactive understanding feed
    todos/page.tsx           → To-do list + scheduler
    doctors/page.tsx         → Doctor booking
    anonymous/page.tsx       → Anonymous tweeting board
    communities/page.tsx     → Interest-based communities
    pomodoro/page.tsx        → Study pomodoro timer
    wellness/page.tsx        → Yoga, books, exercises
    heatmap/page.tsx         → Mood heatmap calendar
    profile/page.tsx         → User profile + levels/XP
    stories/page.tsx         → Success stories + empowerment
  crisis/page.tsx            → Crisis SOS (full-screen, no sidebar)
```

### Shared Infrastructure
- `context/ThemeContext.tsx` → Student/Women theme toggle persisted
- `components/Sidebar.tsx`  → Navigation sidebar
- `components/CrisisFloat.tsx` → Floating crisis button (always visible)

### Tech Stack
- **Frontend**: Next.js 14, React, Framer Motion, Tailwind
- **AI/ML**: NLP for journal sentiment, RAG chatbot, mood prediction
- **APIs**: Sentiment analysis, period prediction, content scraping
- **Gamification**: XP system, levels, streaks, badges

## Feature Details

### 1. Journal (NLP + Sentiment Analysis)
- Write daily entries with rich text
- AI analyzes mood/sentiment from text
- Mood tags auto-generated
- Past entries browsable by date

### 2. Mood + Period Cycle
- Daily mood logging (emoji-based)
- Period cycle tracking calendar
- Predictive cycle dates
- Mood trends over time

### 3. AI Chatbot (RAG)
- Conversational AI for mental health support
- RAG-powered responses from curated resources
- Empathetic, non-judgmental tone
- Context-aware follow-ups

### 4. Interactive Feed
- Curated mental health content
- Interactive exercises
- Daily challenges
- Personalized recommendations

### 5. To-Do + Scheduler
- Task management with priorities
- Calendar scheduling
- Reminders and deadlines
- Integration with pomodoro

### 6. Doctor Booking
- Browse therapists/counselors
- Filter by specialty, availability
- Book appointments
- Video call integration placeholder

### 7. Anonymous Tweeting
- Post thoughts anonymously
- React/support others' posts
- Content moderation (AI)
- Hashtag-based discovery

### 8. Communities
- Interest-based groups
- Join/leave communities
- Group discussions
- Shared resources

### 9. Study Pomodoro
- Configurable timer (25/5, 50/10)
- Session tracking
- Focus music integration
- Stats and streaks

### 10. Wellness (Yoga/Books/Exercises)
- Yoga routine suggestions
- Book recommendations
- Mental health exercises
- Breathing techniques

### 11. Crisis Button
- Full-screen SOS mode
- Emergency hotline numbers
- Grounding exercises
- Immediate support resources

### 12. Mood Heatmap
- GitHub-style calendar heatmap
- Color-coded mood visualization
- Yearly/monthly views
- Trend analysis

### 13. User Profile + Gamification
- XP and level system
- Daily task rewards
- Streak tracking
- Achievement badges

### 14. Success Stories
- Community success stories
- Scraped empowerment stories
- Daily quotes
- Filter by category
