# Personal Helper - Unified Developer Tools

A comprehensive web application that combines three powerful developer tools into one unified interface:

1. **🔍 PR Analyzer** - Analyze GitHub Pull Requests using AI to find bugs, security issues, and validate JIRA acceptance criteria
2. **🧪 QA Agent** - Automated QA testing that validates JIRA acceptance criteria against live portals using browser automation
3. **🎫 Ticket Creator** - Create comprehensive JIRA tickets with AI assistance through conversational chat or quick input

## 🌟 Features

### PR Analyzer
- Analyzes GitHub PRs using Claude AI
- Validates acceptance criteria from JIRA tickets
- Identifies bugs, console logs, security issues, and code quality problems
- Supports multiple PRs (multi-repo projects)
- Auto-detects PRs linked to JIRA tickets
- Generates downloadable markdown reports

### QA Agent
- Reads JIRA tickets and acceptance criteria
- Uses AI to generate test scenarios
- Automates testing using Puppeteer browser automation
- Tests live portals against acceptance criteria
- Provides detailed pass/fail reports with recommendations

### Ticket Creator
- **Quick Mode**: Fast ticket creation with direct input
- **AI Assistant Mode**: Conversational chat that guides you through creating comprehensive tickets
- **🎤 Voice Input**: NEW! Speak your responses instead of typing in AI Assistant mode
- Asks targeted questions about user stories, descriptions, and acceptance criteria
- Generates well-structured JIRA tickets
- Creates tickets directly in JIRA or preview first

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- JIRA account with API access
- Anthropic API key (for PR Analyzer & QA Agent)
- OpenAI API key (for Ticket Creator)
- GitHub token (optional, for PR Analyzer - increases rate limits)

## 🚀 Quick Start

### 1. Installation

```bash
cd personal_helper
npm install
```

### 2. Configuration

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Then edit `.env` and add your credentials:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# JIRA Configuration (Required for all tools)
JIRA_HOST=your-company.atlassian.net
JIRA_EMAIL=your.email@company.com
JIRA_API_TOKEN=your_jira_api_token
JIRA_PROJECT_ID=10000
JIRA_TICKET_LABELS=automation

# Anthropic API (Required for PR Analyzer and QA Agent)
ANTHROPIC_API_KEY=your_anthropic_api_key

# OpenAI API (Required for Ticket Creator)
OPENAI_API_KEY=your_openai_api_key

# GitHub Token (Optional, for PR Analyzer)
GITHUB_TOKEN=your_github_token

# Debug Flags (Optional)
DEBUG_JIRA=false
DEBUG_PUPPETEER=false
```

#### Getting API Keys

**JIRA API Token:**
1. Go to [https://id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click "Create API token"
3. Copy and add to `.env`

**Anthropic API Key:**
1. Go to [https://console.anthropic.com/](https://console.anthropic.com/)
2. Sign up or log in
3. Generate an API key
4. Copy and add to `.env`

**OpenAI API Key:**
1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy and add to `.env`

**GitHub Token (Optional):**
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate token with `repo` scope
3. Copy and add to `.env`

### 3. Run the Application

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Open your browser to **http://localhost:3000**

## 📖 Usage

### PR Analyzer

1. Navigate to the **PR Analyzer** tab
2. Enter the JIRA ticket ID (e.g., `PROJ-1234`)
3. Optionally enter PR URLs (one per line) or leave empty to auto-detect from JIRA
4. Click "Analyze Pull Requests"
5. View the analysis results
6. Download individual PR reports as markdown files

**Perfect for:**
- Code reviews with acceptance criteria validation
- Multi-repo projects (analyze frontend + backend + mobile together)
- Finding bugs and security issues before merge
- Ensuring all acceptance criteria are met

### QA Agent

1. Navigate to the **QA Agent** tab
2. Enter the JIRA ticket ID
3. Enter the portal URL to test (e.g., `https://qa.yoursite.com`)
4. Click "Run QA Tests"
5. Wait for automated tests to complete (30-60 seconds)
6. Review test results and AI-generated report

**Perfect for:**
- Automated acceptance testing
- Validating UI changes on live portals
- Regression testing
- Quick verification before deployment

### Ticket Creator

1. Navigate to the **Ticket Creator** tab
2. Choose your mode:
   
   **Quick Mode:**
   - Enter your task description directly
   - Click "Generate Preview" or "Create in JIRA"
   
   **AI Assistant Mode:**
   - Click "AI Assistant" button
   - Answer the AI's questions about your feature (type or use voice 🎤)
   - **NEW Voice Input**: Click the microphone button to speak your responses
   - AI guides you through user stories, description, and acceptance criteria
   - Click "Generate Preview" or "Create in JIRA" when complete

**Perfect for:**
- Creating comprehensive, well-documented tickets
- Ensuring all necessary information is captured
- Standardizing ticket format across team
- Training new team members on good ticket writing

## 🏗️ Project Structure

```
personal_helper/
├── src/
│   ├── services/          # Backend services
│   │   ├── jira.service.ts           # JIRA integration
│   │   ├── pr-analyzer.service.ts    # PR analysis logic
│   │   ├── qa-automation.service.ts  # QA testing automation
│   │   ├── ticket-creator.service.ts # Ticket creation
│   │   ├── anthropic.service.ts      # Claude AI integration
│   │   └── openai.service.ts         # OpenAI integration
│   ├── routes/            # API routes
│   │   ├── pr-analyzer.routes.ts
│   │   ├── qa-agent.routes.ts
│   │   └── ticket-creator.routes.ts
│   ├── types/             # TypeScript types
│   │   └── index.ts
│   ├── public/            # Frontend
│   │   ├── index.html
│   │   ├── css/
│   │   │   └── style.css
│   │   └── js/
│   │       └── app.js
│   └── server.ts          # Express server
├── reports/               # Generated analysis reports
├── package.json
├── tsconfig.json
├── .env.example
├── .env                   # Your configuration (create from .env.example)
├── .gitignore
└── README.md
```

## 🔌 API Endpoints

### PR Analyzer
- `POST /api/pr-analyzer/analyze` - Analyze PRs for a JIRA ticket

### QA Agent
- `POST /api/qa-agent/test` - Run automated tests

### Ticket Creator
- `POST /api/ticket-creator/generate` - Generate ticket preview
- `POST /api/ticket-creator/create` - Create ticket in JIRA
- `POST /api/ticket-creator/chat/start` - Start AI chat session
- `POST /api/ticket-creator/chat/message` - Send chat message
- `POST /api/ticket-creator/chat/generate` - Generate ticket from chat
- `POST /api/ticket-creator/chat/create` - Create JIRA ticket from chat

## 🎨 Technologies Used

- **Backend**: Node.js, TypeScript, Express
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **AI**: Anthropic Claude, OpenAI GPT-4
- **Browser Automation**: Puppeteer
- **APIs**: JIRA REST API, GitHub REST API

## 🔒 Security

- All API keys stored in `.env` (never commit to version control)
- `.gitignore` configured to exclude sensitive files
- Basic authentication for JIRA API
- Rate limiting considerations for API calls

## 🐛 Troubleshooting

**"Missing credentials" errors:**
- Ensure all required environment variables are set in `.env`
- Check that values don't have extra spaces or quotes

**"No acceptance criteria found":**
- Enable `DEBUG_JIRA=true` in `.env` to see available fields
- Acceptance criteria might be in a custom field
- Check JIRA ticket description format

**GitHub rate limit errors:**
- Add `GITHUB_TOKEN` to `.env` to increase limits (60 → 5000 requests/hour)

**Puppeteer timeout errors:**
- Portal might be slow to load
- Check your internet connection
- Enable `DEBUG_PUPPETEER=true` to see browser window

## 🎤 Voice Input Feature

The Ticket Creator now supports **voice input** in AI Assistant mode! Simply click the microphone button and speak your responses instead of typing.

**Quick Start:**
1. Navigate to Ticket Creator → AI Assistant
2. Click the 🎤 microphone button
3. Speak your message
4. Click ⏹️ to stop and review
5. Send your message

**For detailed information**, see [VOICE_FEATURE.md](VOICE_FEATURE.md)

## 📝 License

MIT

## 🤝 Contributing

This is a personal project. Feel free to fork and customize for your needs!

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section
2. Review console logs for detailed error messages
3. Ensure all prerequisites are properly configured
4. See [VOICE_FEATURE.md](VOICE_FEATURE.md) for voice input issues

---

**Built with ❤️ for developers by developers**

