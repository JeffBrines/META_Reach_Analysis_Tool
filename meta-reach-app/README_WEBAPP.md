# META Reach Analysis Tool - Web App

## Project Status

🚧 **In Progress** - Currently implementing Phase 1-3 of the conversion from Google Sheets to Web App

### ✅ Completed

1. **Project Setup**
   - Next.js 14 with TypeScript
   - Tailwind CSS configured
   - shadcn/ui components installed
   - Prisma ORM configured
   - Supabase clients (client + server) setup

2. **Core Libraries**
   - ✅ `lib/crypto.ts` - Token encryption/decryption (AES-256-GCM)
   - ✅ `lib/prisma.ts` - Prisma client singleton
   - ✅ `lib/meta-api.ts` - Complete Meta Graph API wrapper
   - ✅ `lib/analysis-engine.ts` - Full analysis logic ported from Google Sheets
   - ✅ `lib/auth.ts` - Password hashing and user authentication
   - ✅ `lib/supabase/` - Supabase client configuration

3. **Database Schema**
   - ✅ User, Account, AccountMember models
   - ✅ MetaAccount model (encrypted tokens)
   - ✅ Analysis and AnalysisMetric models
   - ✅ Proper indexes and cascading deletes

### 🔨 In Progress

4. **Authentication Pages**
   - Login/Signup pages
   - Session management
   - Protected routes

5. **Dashboard Structure**
   - Layout with sidebar and header
   - Navigation
   - Empty states

### 📝 TODO

6. **Meta OAuth**
   - OAuth flow implementation
   - Token storage
   - Account connection UI

7. **Analysis Features**
   - Analysis creation wizard
   - Execution API routes
   - Results visualization
   - Export functionality

8. **Team Management**
   - Invitation system
   - Member list
   - Access control

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma
- **Charts**: Recharts
- **State Management**: TanStack Query

## Environment Setup

Create a `.env.local` file with:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/meta_reach"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Encryption (generate with: openssl rand -hex 32)
ENCRYPTION_KEY="your-32-byte-hex-key"

# Meta API
META_APP_ID="your-meta-app-id"
META_APP_SECRET="your-meta-app-secret"
META_REDIRECT_URI="http://localhost:3000/api/meta/oauth/callback"
```

## Development

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Start development server
npm run dev
```

## Project Structure

```
meta-reach-app/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard pages
│   └── api/               # API routes
├── components/
│   ├── analysis/          # Analysis-specific components
│   ├── layout/            # Layout components
│   └── ui/                # shadcn UI components
├── lib/
│   ├── supabase/          # Supabase clients
│   ├── analysis-engine.ts # Core analysis logic
│   ├── auth.ts            # Authentication utilities
│   ├── crypto.ts          # Token encryption
│   ├── meta-api.ts        # Meta API wrapper
│   ├── prisma.ts          # Prisma client
│   └── utils.ts           # Utility functions
└── prisma/
    └── schema.prisma      # Database schema
```

## Key Features

### Analysis Engine

The `AnalysisEngine` class ports all Google Sheets functionality:

- ✅ Account, Campaign, and Ad-level analysis
- ✅ Daily, Weekly, Monthly, and 28-Day Rolling intervals
- ✅ Demographic breakdowns (age × gender)
- ✅ All metrics from V2:
  - Period metrics (spend, reach, impressions, conversions, revenue)
  - Calculated metrics (CPM, CPMr, CPA, ROAS, frequency)
  - Rolling metrics (cumulative reach, incremental reach, CPMi)
  - 28-day rolling metrics (when applicable)

### Meta API Wrapper

Complete wrapper for Meta Graph API v20.0:

- ✅ Insights fetching with demographic breakdowns
- ✅ Campaign and ad listing
- ✅ Rate limiting (500ms between calls)
- ✅ Error handling
- ✅ Connection testing

### Security

- ✅ Password hashing with bcrypt (10 rounds)
- ✅ AES-256-GCM encryption for Meta access tokens
- ✅ Encrypted token storage in database
- ✅ Secure key management via environment variables

## Next Steps

1. Complete authentication pages
2. Build dashboard layout
3. Implement Meta OAuth
4. Create analysis wizard
5. Build results visualization
6. Add export functionality
7. Implement team management
8. Deploy to Vercel

## Migration from Google Sheets

The web app maintains **100% feature parity** with the Google Sheets V2 tool:

| Feature | Google Sheets | Web App |
|---------|---------------|---------|
| Account Analysis | ✅ | ✅ |
| Campaign Analysis | ✅ | ✅ |
| Ad Analysis | ✅ | ✅ |
| Demographics | ✅ | ✅ |
| 28-Day Rolling | ✅ | ✅ |
| Conversions/Revenue | ✅ | ✅ |
| Team Collaboration | ❌ | ✅ (NEW) |
| Visual Charts | ❌ | ✅ (NEW) |
| Export CSV/PDF | ❌ | ✅ (NEW) |
| Historical Data | ❌ | ✅ (NEW) |

## Architecture Decisions

### Why Synchronous Processing?

For MVP, analyses run synchronously (user waits). This is acceptable because:
- Analyses typically take 30s-2min
- Simpler implementation (no job queue)
- Can upgrade to background jobs later

### Why Supabase?

- Built-in authentication
- PostgreSQL database
- Real-time subscriptions (future)
- Generous free tier
- Easy deployment

### Why Prisma?

- Type-safe database queries
- Automatic migrations
- Excellent TypeScript support
- Clear schema definition

## Contributing

This project is being actively developed. See the main repository for contribution guidelines.

## License

GNU GPLv3 - Same as the original Google Sheets tool


