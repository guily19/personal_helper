import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { initializeAnthropic } from "./services/anthropic.service.js";
import { initializeOpenAI } from "./services/openai.service.js";

// Load environment variables
dotenv.config();

// Initialize AI services
try {
  if (process.env.ANTHROPIC_API_KEY) {
    initializeAnthropic();
    console.log("✓ Anthropic Claude initialized");
  }
  if (process.env.OPENAI_API_KEY) {
    initializeOpenAI();
    console.log("✓ OpenAI initialized");
  }
} catch (error: any) {
  console.warn(`Warning: AI service initialization: ${error.message}`);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../src/public")));

// Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "Personal Helper API is running",
    services: {
      prAnalyzer: !!process.env.ANTHROPIC_API_KEY && !!process.env.GITHUB_TOKEN,
      qaAgent: !!process.env.ANTHROPIC_API_KEY && !!process.env.JIRA_HOST,
      ticketCreator: !!process.env.OPENAI_API_KEY && !!process.env.JIRA_HOST,
    },
  });
});

// PR Analyzer endpoints
app.post("/api/pr-analyzer/analyze", async (req: Request, res: Response) => {
  try {
    const { Octokit } = await import("@octokit/rest");
    const { getJiraTicket, getLinkedPRs } = await import("./services/jira.service.js");
    const { analyzePRCode } = await import("./services/anthropic.service.js");

    const { ticketId, prUrls } = req.body;

    if (!ticketId) {
      return res.status(400).json({ error: "Missing ticketId" });
    }

    // Fetch JIRA ticket
    const ticket = await getJiraTicket(ticketId);

    // Get PR URLs (either from request or auto-detect)
    let prUrlArray: string[] = [];
    if (prUrls && typeof prUrls === "string") {
      prUrlArray = prUrls
        .split(/[\n,]/)
        .map((url: string) => url.trim())
        .filter((url: string) => url.length > 0);
    } else if (!prUrls || prUrlArray.length === 0) {
      // Auto-detect PRs from JIRA
      prUrlArray = await getLinkedPRs(ticketId);
    }

    if (prUrlArray.length === 0) {
      return res.status(400).json({ error: "No PRs found. Please provide PR URLs or link PRs to the JIRA ticket." });
    }

    // Analyze each PR
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    const results = [];

    for (const prUrl of prUrlArray) {
      const match = prUrl.match(/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/);
      if (!match) continue;

      const [, owner, repo, prNumber] = match;

      // Fetch PR details
      const { data: pr } = await octokit.pulls.get({
        owner,
        repo,
        pull_number: parseInt(prNumber),
      });

      // Fetch PR files
      const { data: files } = await octokit.pulls.listFiles({
        owner,
        repo,
        pull_number: parseInt(prNumber),
      });

      // Create changes summary
      const changes = files
        .map((file) => `File: ${file.filename}\nChanges: +${file.additions} -${file.deletions}\n${file.patch || ""}`)
        .join("\n\n");

      // Analyze with AI
      const analysis = await analyzePRCode(
        {
          owner,
          repo,
          number: prNumber,
          title: pr.title,
          url: prUrl,
          filesCount: files.length,
        },
        changes.substring(0, 50000), // Limit to avoid token limits
        ticket.acceptanceCriteria
      );

      results.push({
        prInfo: {
          owner,
          repo,
          number: prNumber,
          title: pr.title,
          url: prUrl,
        },
        filesCount: files.length,
        analysis,
      });
    }

    res.json({
      success: true,
      jiraTicket: ticket,
      results,
    });
  } catch (error: any) {
    console.error("Error in PR analysis:", error);
    res.status(500).json({ error: error.message });
  }
});

// QA Agent endpoints
app.post("/api/qa-agent/test", async (req: Request, res: Response) => {
  try {
    const { getJiraTicket } = await import("./services/jira.service.js");
    const { parseAcceptanceCriteria, generateTestReport } = await import("./services/anthropic.service.js");
    const puppeteer = await import("puppeteer");

    const { ticketId, portalUrl } = req.body;

    if (!ticketId || !portalUrl) {
      return res.status(400).json({ error: "Missing ticketId or portalUrl" });
    }

    // Fetch JIRA ticket
    const ticket = await getJiraTicket(ticketId);

    if (ticket.acceptanceCriteria === "No acceptance criteria found") {
      return res.status(400).json({
        error: "No acceptance criteria found in ticket",
        ticket: { key: ticket.key, summary: ticket.summary },
      });
    }

    // Parse acceptance criteria into test scenarios
    const parsedCriteria = await parseAcceptanceCriteria(
      ticket.acceptanceCriteria,
      ticket.summary,
      ticket.description
    );

    // Run automated tests
    const browser = await puppeteer.launch({
      headless: process.env.DEBUG_PUPPETEER !== "true",
    });
    const page = await browser.newPage();

    const testResults = [];

    try {
      await page.goto(portalUrl, { waitUntil: "networkidle0", timeout: 30000 });

      for (const scenario of parsedCriteria.scenarios) {
        try {
          let passed = false;
          let actual = "";

          if (scenario.action === "check_style") {
            const element = await page.$(scenario.target);
            if (element) {
              const styles = await page.evaluate((el: any) => {
                // @ts-ignore - window is available in browser context
                const computed = window.getComputedStyle(el);
                return {
                  backgroundColor: computed.backgroundColor,
                  color: computed.color,
                  fontSize: computed.fontSize,
                };
              }, element);
              actual = JSON.stringify(styles);
              passed = actual.toLowerCase().includes(scenario.expected.toLowerCase());
            }
          } else if (scenario.action === "check_text") {
            const text = await page.$eval(scenario.target, (el: any) => el.textContent);
            actual = text;
            passed = text.includes(scenario.expected);
          } else if (scenario.action === "check_visibility") {
            const visible = await page.$(scenario.target) !== null;
            actual = visible ? "visible" : "hidden";
            passed = scenario.expected.toLowerCase().includes(actual);
          } else if (scenario.action === "click") {
            await page.click(scenario.target);
            passed = true;
            actual = "clicked";
          }

          testResults.push({
            description: scenario.description,
            action: scenario.action,
            target: scenario.target,
            expected: scenario.expected,
            passed,
            actual,
          });
        } catch (error: any) {
          testResults.push({
            description: scenario.description,
            action: scenario.action,
            target: scenario.target,
            expected: scenario.expected,
            passed: false,
            error: error.message,
          });
        }
      }
    } finally {
      await browser.close();
    }

    // Generate test report
    const report = await generateTestReport(ticket.key, ticket.summary, testResults);

    const passedCount = testResults.filter((r) => r.passed).length;
    const totalCount = testResults.length;

    res.json({
      success: true,
      allTestsPassed: passedCount === totalCount,
      ticket: {
        key: ticket.key,
        summary: ticket.summary,
        status: ticket.status,
      },
      results: {
        total: totalCount,
        passed: passedCount,
        failed: totalCount - passedCount,
        tests: testResults,
      },
      report,
    });
  } catch (error: any) {
    console.error("Error in QA testing:", error);
    res.status(500).json({ error: error.message });
  }
});

// Ticket Creator endpoints
app.post("/api/ticket-creator/generate", async (req: Request, res: Response) => {
  try {
    const { createJiraTicketContent } = await import("./services/openai.service.js");

    const { taskDescription } = req.body;

    if (!taskDescription) {
      return res.status(400).json({ error: "Task description is required" });
    }

    const projectId = process.env.JIRA_PROJECT_ID || "10000";
    const labels = process.env.JIRA_TICKET_LABELS || "automation";

    const ticketContent = await createJiraTicketContent(taskDescription, projectId, labels);

    res.json({
      success: true,
      ticketContent,
    });
  } catch (error: any) {
    console.error("Error generating ticket:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/ticket-creator/create", async (req: Request, res: Response) => {
  try {
    const { createJiraTicketContent } = await import("./services/openai.service.js");
    const { createJiraTicket } = await import("./services/jira.service.js");

    const { taskDescription } = req.body;

    if (!taskDescription) {
      return res.status(400).json({ error: "Task description is required" });
    }

    const projectId = process.env.JIRA_PROJECT_ID || "10000";
    const labels = process.env.JIRA_TICKET_LABELS || "automation";

    // Generate ticket content
    const ticketContent = await createJiraTicketContent(taskDescription, projectId, labels);

    // Create in JIRA
    const jiraResponse = await createJiraTicket(ticketContent);

    res.json({
      success: true,
      ticketContent,
      jiraResponse,
    });
  } catch (error: any) {
    console.error("Error creating ticket:", error);
    res.status(500).json({ error: error.message });
  }
});

// Chat endpoints (for AI Assistant mode)
const chatSessions = new Map();

app.post("/api/ticket-creator/chat/start", (req: Request, res: Response) => {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const initialMessage = {
    role: "assistant",
    content: `Hi! I'm here to help you create a comprehensive Jira ticket. Let's start by understanding what you want to build.\n\nCan you briefly describe the task or feature you'd like to create a ticket for?`,
  };

  chatSessions.set(sessionId, {
    messages: [initialMessage],
    stage: "initial",
  });

  res.json({
    success: true,
    sessionId,
    message: initialMessage.content,
  });
});

app.post("/api/ticket-creator/chat/message", async (req: Request, res: Response) => {
  try {
    const { processChatMessage } = await import("./services/openai.service.js");

    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({ error: "Session ID and message are required" });
    }

    const session = chatSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Add user message
    session.messages.push({ role: "user", content: message });

    // Get AI response
    const systemPrompt = `You are a helpful Product Manager assistant helping users create comprehensive Jira tickets.
Ask ONE question at a time about: user stories (who, what, why), detailed description, and acceptance criteria.
Be conversational and friendly. After gathering enough information (around 8-10 exchanges), let the user know they can generate the ticket.`;

    const aiResponse = await processChatMessage(session.messages, systemPrompt);

    // Add AI response
    session.messages.push({ role: "assistant", content: aiResponse });

    // Check if conversation is complete (simple heuristic)
    const isComplete = session.messages.length >= 18;

    res.json({
      success: true,
      message: aiResponse,
      stage: session.stage,
      isComplete,
    });
  } catch (error: any) {
    console.error("Error processing chat message:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/ticket-creator/chat/generate", async (req: Request, res: Response) => {
  try {
    const { createJiraTicketContent } = await import("./services/openai.service.js");

    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    const session = chatSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Generate comprehensive description from chat
    const taskDescription = session.messages
      .filter((m: any) => m.role === "user")
      .map((m: any) => m.content)
      .join("\n\n");

    const projectId = process.env.JIRA_PROJECT_ID || "10000";
    const labels = process.env.JIRA_TICKET_LABELS || "automation";

    const ticketContent = await createJiraTicketContent(taskDescription, projectId, labels);

    res.json({
      success: true,
      ticketContent,
      taskDescription,
    });
  } catch (error: any) {
    console.error("Error generating ticket from chat:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/ticket-creator/chat/create", async (req: Request, res: Response) => {
  try {
    const { createJiraTicketContent } = await import("./services/openai.service.js");
    const { createJiraTicket } = await import("./services/jira.service.js");

    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    const session = chatSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Generate comprehensive description from chat
    const taskDescription = session.messages
      .filter((m: any) => m.role === "user")
      .map((m: any) => m.content)
      .join("\n\n");

    const projectId = process.env.JIRA_PROJECT_ID || "10000";
    const labels = process.env.JIRA_TICKET_LABELS || "automation";

    // Generate and create ticket
    const ticketContent = await createJiraTicketContent(taskDescription, projectId, labels);
    const jiraResponse = await createJiraTicket(ticketContent);

    // Clean up session
    chatSessions.delete(sessionId);

    res.json({
      success: true,
      ticketContent,
      jiraResponse,
      taskDescription,
    });
  } catch (error: any) {
    console.error("Error creating ticket from chat:", error);
    res.status(500).json({ error: error.message });
  }
});

// Serve the frontend
app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../src/public", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log("\n" + "═".repeat(80));
  console.log("  🚀 Personal Helper - Unified Developer Tools");
  console.log("═".repeat(80));
  console.log(`\n  Server running at: http://localhost:${PORT}`);
  console.log(`\n  Available Tools:`);
  console.log(`    📊 PR Analyzer    - Analyze GitHub PRs with AI`);
  console.log(`    🧪 QA Agent       - Automated acceptance testing`);
  console.log(`    🎫 Ticket Creator - AI-assisted ticket creation`);
  console.log(`\n  Press Ctrl+C to stop\n`);
  console.log("═".repeat(80) + "\n");
});

