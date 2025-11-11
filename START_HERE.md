# 🚀 Start Here - Personal Helper

Welcome to **Personal Helper** - your unified developer toolbox!

## What is This?

A single web application that combines three powerful tools:
- 🔍 **PR Analyzer** - AI-powered GitHub PR analysis
- 🧪 **QA Agent** - Automated acceptance testing  
- 🎫 **Ticket Creator** - AI-assisted JIRA ticket creation

## Quick Start (5 Minutes)

### Step 1: Install
```bash
npm install
```

### Step 2: Configure
```bash
cp .env.example .env
```

Edit `.env` and add your API keys (see SETUP.md for details on getting keys).

### Step 3: Run
```bash
npm run dev
```

### Step 4: Open
Visit: **http://localhost:3000**

## That's It! 🎉

You now have access to all three tools in one place.

## Next Steps

- Read `README.md` for comprehensive documentation
- Check `SETUP.md` for detailed setup instructions
- See `PROJECT_SUMMARY.md` for technical details

## Need Help?

1. Verify all API keys are in `.env`
2. Check http://localhost:3000/api/health
3. Review console logs for errors
4. See troubleshooting in `SETUP.md`

## Architecture

```
personal_helper/
├── src/
│   ├── server.ts              # Main server
│   ├── services/              # Backend services
│   │   ├── jira.service.ts
│   │   ├── anthropic.service.ts
│   │   └── openai.service.ts
│   └── public/                # Frontend
│       ├── index.html
│       ├── css/style.css
│       └── js/app.js
├── package.json
├── tsconfig.json
├── .env.example
└── .env (create this!)
```

## Required API Keys

| Service | Required For | Get It From |
|---------|-------------|-------------|
| JIRA | All tools | [Atlassian](https://id.atlassian.com/manage-profile/security/api-tokens) |
| Anthropic | PR Analyzer, QA Agent | [Console](https://console.anthropic.com/) |
| OpenAI | Ticket Creator | [Platform](https://platform.openai.com/api-keys) |
| GitHub | PR Analyzer (optional) | [Settings](https://github.com/settings/tokens) |

## Commands

```bash
npm run dev      # Development mode (auto-reload)
npm start        # Production mode
npm run build    # Build TypeScript
```

## Features at a Glance

### 🔍 PR Analyzer
- Analyze multiple PRs at once
- Auto-detect PRs from JIRA tickets
- Find bugs, security issues, code quality problems
- Validate acceptance criteria

### 🧪 QA Agent
- Automated browser testing
- AI-generated test scenarios
- Test live portals
- Detailed reports

### 🎫 Ticket Creator
- Quick Mode: Direct input
- AI Assistant: Guided conversation
- Creates comprehensive tickets
- Generates acceptance criteria

## Tips

💡 **Pro Tip 1**: Use PR Analyzer's auto-detect feature by leaving PR URLs empty

💡 **Pro Tip 2**: Enable `DEBUG_JIRA=true` in `.env` to troubleshoot JIRA issues

💡 **Pro Tip 3**: Try the AI Assistant mode for better-structured tickets

💡 **Pro Tip 4**: Check http://localhost:3000/api/health to verify services are ready

## Support

- 📖 Full documentation: `README.md`
- 🔧 Setup guide: `SETUP.md`
- 📊 Project details: `PROJECT_SUMMARY.md`

---

**Ready? Let's go! Run `npm run dev` and visit http://localhost:3000** 🚀

