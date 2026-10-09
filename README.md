# AKN Gigs 🎶

## Project Description

**AKN Gigs** is a full-stack web application designed to enhance the live performance experience of independent artist **AKN**. It transforms a traditional setlist into an interactive digital platform where audiences can browse songs, search for what they want to hear, and submit requests directly from their mobile devices.

The platform also provides a private performer environment for managing songs, viewing lyrics and chords, navigating the setlist during performances, and receiving audience requests in real time.

Built specifically around the workflow of a solo live performer, the system combines **digital setlist management, audience interaction, performance tools, and artist support** into one platform.

---

## ✨ Feature Summary

### 🎵 Digital Setlist
- Browse the current setlist
- Search songs by title or artist
- Filter songs by artist
- Display only active songs

### 🎤 Song Requests
- Request songs directly from the setlist
- Search for songs before requesting
- Submit custom song requests
- Optionally provide a requester name
- 30-second per-browser cooldown to prevent repeated requests

### 🔔 Real-Time Request Queue
- Receive new requests instantly
- View requested song and artist
- View requester information
- Mark requests as played
- Dismiss requests
- Keep request history

### 🎹 Performance Mode
- Dedicated performer interface
- Large, readable lyrics
- Chord display
- Previous/next song navigation
- Swipe navigation
- Adjustable font size
- Toggle chord visibility
- Screen wake lock
- Real-time request notifications
- Cached songs for unreliable connections

### 🎼 Lyrics & Chords
- Store lyrics for each song
- Store chord arrangements
- Inline chord notation
- Song section support such as Verse, Chorus, Bridge, Intro, and Outro
- Automatic chord parsing for the performance interface

### 🛠️ Song Management
- Add songs
- Edit songs
- Delete songs
- Activate/deactivate songs
- Manage lyrics and chords
- Search the song library
- Preview song information

### 💰 Artist Support
- GCash QR code integrated into the request flow
- Allows audiences to optionally support the artist while requesting a song

### 🔐 Authentication & Security
- Supabase email/password authentication
- Admin-only song management
- Protected performer functionality
- Row Level Security (RLS) for database operations

### 📱 Mobile-First Experience
- Designed primarily for smartphones and tablets
- Simple audience interface for quick song requests
- Performance interface optimized for reading while playing
- Responsive layout for larger screens

### 💾 Offline-Friendly Performance
- Active songs are cached locally
- Previously loaded songs remain accessible during temporary connectivity issues
- Real-time requests require an active internet connection

---

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Routing:** React Router
- **Backend:** Supabase
- **Database:** PostgreSQL
- **Authentication:** Supabase Auth
- **Real-Time Updates:** Supabase Realtime
- **Security:** Row Level Security (RLS)
- **Styling:** CSS
- **Deployment:** Vercel
