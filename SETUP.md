# Personal Helper - Setup Guide

## Quick Setup

### 1. Install Dependencies

```bash
cd personal_helper
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Then edit `.env` and add your credentials.

### 3. Get API Keys

#### JIRA API Token
1. Go to: https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Copy the token

#### Anthropic API Key (for PR Analyzer & QA Agent)
1. Go to: https://console.anthropic.com/
2. Sign up or log in
3. Generate an API key
4. Copy the key

#### OpenAI API Key (for Ticket Creator)
1. Go to: https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key

#### GitHub Token (Optional - for PR Analyzer)
1. Go to: GitHub Settings → Developer settings → Personal access tokens
2. Generate token with `repo` scope
3. Copy the token

### 4. Update .env File

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# JIRA Configuration (Required for all tools)
JIRA_HOST=your-company.atlassian.net          # Without https://
JIRA_EMAIL=your.email@company.com
JIRA_API_TOKEN=your_jira_api_token_here
JIRA_PROJECT_ID=10000
JIRA_TICKET_LABELS=automation

# Anthropic API (Required for PR Analyzer and QA Agent)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# OpenAI API (Required for Ticket Creator)
OPENAI_API_KEY=your_openai_api_key_here

# GitHub Token (Optional, for PR Analyzer)
GITHUB_TOKEN=your_github_token_here

# Debug Flags (Optional)
DEBUG_JIRA=false
DEBUG_PUPPETEER=false
```

### 5. Run the Application

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

### 6. Access the Application

Open your browser to: **http://localhost:3000**

## Verification

### Check API Connection

Visit: http://localhost:3000/api/health

You should see:
```json
{
  "status": "ok",
  "message": "Personal Helper API is running",
  "services": {
    "prAnalyzer": true,
    "qaAgent": true,
    "ticketCreator": true
  }
}
```

## Troubleshooting

### "Missing credentials" errors
- Check that all required environment variables are set
- Ensure no extra spaces or quotes in `.env` values
- Verify JIRA_HOST doesn't include `https://`

### "No acceptance criteria found"
- Enable `DEBUG_JIRA=true` in `.env`
- Check your JIRA ticket format
- Acceptance criteria might be in a custom field

### GitHub rate limit errors
- Add `GITHUB_TOKEN` to `.env`
- This increases rate limit from 60 to 5000 requests/hour

### Puppeteer issues
- Enable `DEBUG_PUPPETEER=true` to see browser window
- Ensure you have Chrome/Chromium installed
- Check portal URL is accessible

## Testing Each Tool

### 1. PR Analyzer
1. Navigate to PR Analyzer tab
2. Enter a JIRA ticket ID (e.g., `PROJ-1234`)
3. Click "Analyze Pull Requests"
4. Wait for analysis results

### 2. QA Agent
1. Navigate to QA Agent tab
2. Enter JIRA ticket ID
3. Enter portal URL (e.g., `https://qa.yoursite.com`)
4. Click "Run QA Tests"
5. Wait 30-60 seconds for results

### 3. Ticket Creator
1. Navigate to Ticket Creator tab
2. Try Quick Mode: Enter task description and generate
3. Try AI Assistant: Answer questions and generate

## Next Steps

Once everything is working:
1. Bookmark the application URL
2. Share with your team
3. Customize as needed for your workflow

## Support

If you encounter issues:
1. Check the console logs
2. Review the troubleshooting section
3. Verify all prerequisites are met
4. Check environment variable configuration

---

**Happy developing! 🚀**

