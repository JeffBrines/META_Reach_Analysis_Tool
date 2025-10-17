# META Reach Analysis Tool - Web Application

A modern SaaS web application for analyzing Meta (Facebook/Instagram) ad performance with demographic insights, 28-day rolling metrics, and team collaboration.

## 🎯 Overview

This application enables performance marketers to:
- Analyze Meta ad reach, impressions, and frequency at account, campaign, and ad levels
- Track demographic performance (age × gender breakdowns)
- Monitor audience saturation with 28-day rolling incremental reach metrics
- Visualize trends with interactive charts
- Export data for further analysis
- Collaborate with team members

**Built by**: Kevin Luby ([@luby_k](https://x.com/luby_k))  
**Tech Stack**: Next.js 14, TypeScript, Supabase, Prisma, Recharts  
**License**: GNU GPLv3

---

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your Supabase and Meta API credentials

# Generate Prisma client
npx prisma generate

# Push database schema to Supabase
npx prisma db push

# Start development server
npm run dev
```

Visit `http://localhost:3000`

### Environment Variables Required

See `.env.example` or `SETUP_GUIDE.md` for complete list.

**Required**:
- `DATABASE_URL` - Supabase PostgreSQL connection
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service key
- `ENCRYPTION_KEY` - 32-byte hex for token encryption
- `META_APP_ID` - Meta Developer App ID
- `META_APP_SECRET` - Meta App Secret
- `META_REDIRECT_URI` - OAuth callback URL

---

## 📖 Documentation

Comprehensive guides included:

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete local setup instructions
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Deploy to Vercel step-by-step
- **[IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md)** - Full feature list
- **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - Development timeline
- **[SUPABASE_AUTH_SETUP.md](./SUPABASE_AUTH_SETUP.md)** - Auth configuration
- **[DATABASE_CONNECTION_FIX.md](./DATABASE_CONNECTION_FIX.md)** - Connection troubleshooting

---

## ✨ Key Features

### Analysis Capabilities

- **Three Analysis Levels**: Account-wide, specific campaign, or individual ad
- **Four Interval Types**: Daily, 7-Day, 28-Day, or Daily with 28-Day Rolling
- **Demographic Breakdowns**: 21 age × gender combinations
- **20+ Metrics**: Spend, reach, impressions, conversions, revenue, CPM, CPMr, CPA, ROAS, and more
- **28-Day Rolling**: Novel metric tracking incremental reach with floating window

### User Experience

- **Beautiful UI**: Modern design with Tailwind CSS and shadcn/ui
- **Interactive Charts**: Reach trends, CPMi saturation detection
- **Sortable Tables**: Click columns to sort, explore data
- **Export Options**: CSV and PDF download
- **Team Collaboration**: Invite colleagues, share analyses

### Security

- **Supabase Auth**: Enterprise-grade authentication
- **Encrypted Tokens**: Meta tokens encrypted at rest (AES-256-GCM)
- **Access Control**: Team-based permissions
- **Protected Routes**: Middleware-based security

---

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 14 (React), TypeScript, Tailwind CSS
- **UI Library**: shadcn/ui components
- **Charts**: Recharts
- **Backend**: Next.js API Routes (serverless)
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **Auth**: Supabase Auth
- **Deployment**: Vercel

### Database Schema

6 tables: User, Account, AccountMember, MetaAccount, Analysis, AnalysisMetric

See `prisma/schema.prisma` for complete schema.

### Project Structure

```
meta-reach-app/
├── app/
│   ├── (auth)/              # Login, signup
│   ├── dashboard/           # Protected pages
│   └── api/                 # API routes
├── components/
│   ├── analysis/            # Analysis components
│   ├── layout/              # Sidebar, header
│   ├── team/                # Team components
│   └── ui/                  # shadcn/ui
├── lib/
│   ├── analysis-engine.ts   # Core analysis logic
│   ├── meta-api.ts          # Meta API wrapper
│   ├── crypto.ts            # Token encryption
│   └── ...
└── prisma/
    └── schema.prisma        # Database schema
```

---

## 📊 Google Sheets V2 to Web App Comparison

| Feature | Google Sheets | Web App |
|---------|---------------|---------|
| Account Analysis | ✅ | ✅ |
| Campaign Analysis | ✅ | ✅ |
| Ad Analysis | ✅ | ✅ |
| Demographics | ✅ | ✅ |
| 28-Day Rolling | ✅ | ✅ |
| All Metrics | ✅ | ✅ |
| Team Collaboration | ❌ | ✅ NEW |
| Visual Charts | ❌ | ✅ NEW |
| Export CSV/PDF | ❌ | ✅ NEW |
| OAuth Connection | ❌ | ✅ NEW |
| Historical Data | ❌ | ✅ NEW |
| Mobile-Friendly | ❌ | ✅ NEW |

**Result**: 100% feature parity + 6 major enhancements!

---

## 🧪 Testing

### Local Testing Flows

1. **Authentication**: Sign up → Log in → Log out
2. **Meta Connection**: Connect account via OAuth
3. **Analysis Creation**: Create account-level daily analysis
4. **Results Viewing**: View charts and data tables
5. **Export**: Download CSV and PDF
6. **Team**: Invite member, verify access

See `IMPLEMENTATION_COMPLETE.md` for detailed testing checklist.

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Set root directory to `meta-reach-app`
4. Configure environment variables
5. Deploy!

See `DEPLOYMENT_GUIDE.md` for complete step-by-step instructions.

---

## 🤝 Contributing

This is an open-source project. Contributions welcome!

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📝 License

GNU GPLv3 - Same as the original Google Sheets tool

---

## 🙏 Acknowledgments

- Original Google Sheets tool by Kevin Luby
- Built with assistance from Claude Sonnet 4.5
- Powered by Meta Marketing API
- UI components from shadcn/ui
- Database by Supabase

---

## 📞 Support

- **Issues**: Open a GitHub issue
- **Questions**: Contact [@luby_k](https://x.com/luby_k)
- **Documentation**: See guides in this directory

---

## 🎊 Status

**Current Version**: 1.0.0 (Web App)  
**Status**: ✅ Feature Complete  
**Last Updated**: October 2025  

**Ready for production deployment!** 🚀
