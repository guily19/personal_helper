import JiraApi from "jira-client";
import axios from "axios";
import { JiraTicket } from "../types/index.js";

/**
 * Initialize JIRA client
 */
function getJiraClient(): JiraApi {
  const host = process.env.JIRA_HOST;
  const email = process.env.JIRA_EMAIL;
  const apiToken = process.env.JIRA_API_TOKEN;

  if (!host || !email || !apiToken) {
    throw new Error(
      "Missing JIRA credentials. Please set JIRA_HOST, JIRA_EMAIL, and JIRA_API_TOKEN in .env"
    );
  }

  return new JiraApi({
    protocol: "https",
    host: host,
    username: email,
    password: apiToken,
    apiVersion: "2",
    strictSSL: true,
  });
}

/**
 * Extract ticket ID from various formats
 */
export function extractJiraTicketId(input: string): string | null {
  const regex = /([A-Z]{2,}-\d+)/;
  const match = input.match(regex);
  return match ? match[1] : null;
}

/**
 * Extract acceptance criteria from JIRA issue
 */
function extractAcceptanceCriteria(issue: any): string {
  const description = issue.fields.description || "";
  
  // Check customfield_10115 first (known AC field)
  const acField = issue.fields["customfield_10115"];
  if (acField && typeof acField === "string" && acField.trim()) {
    return acField.trim();
  }
  
  // Try other common custom fields
  const possibleFields = [
    "customfield_10000", "customfield_10001", "customfield_10002", 
    "customfield_10003", "customfield_10004", "customfield_10005",
    "customfield_10100", "customfield_10101", "customfield_10102",
  ];
  
  for (const fieldId of possibleFields) {
    const value = issue.fields[fieldId];
    if (value && typeof value === "string" && value.trim()) {
      if (value.toLowerCase().includes("accept") ||
          value.toLowerCase().includes("criteria") ||
          value.toLowerCase().includes("given") ||
          value.toLowerCase().includes("when") ||
          value.toLowerCase().includes("then")) {
        return value;
      }
    }
  }
  
  // Parse from description
  const lines = description.split("\n");
  let inAC = false;
  let acLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.match(/^h\d\.\s*acceptance criteria/i) ||
        trimmed.match(/^#+\s*acceptance criteria/i) ||
        trimmed.match(/^\*?acceptance criteria:?\*?$/i)) {
      inAC = true;
      continue;
    }
    
    if (inAC) {
      if (trimmed.startsWith("{") || trimmed.match(/^h\d\./) || trimmed.match(/^#+\s/)) {
        break;
      }
      if (trimmed) acLines.push(line);
    }
  }

  if (acLines.length > 0) {
    const extracted = acLines.join("\n").trim();
    if (!extracted.startsWith("{") && extracted.length > 10) {
      return extracted;
    }
  }
  
  return "No acceptance criteria found";
}

/**
 * Extract linked GitHub PRs from JIRA issue
 */
function extractLinkedPRs(issue: any): string[] {
  const prUrls: Set<string> = new Set();
  
  // Check remote links
  if (issue.fields.issuelinks) {
    for (const link of issue.fields.issuelinks) {
      if (link.object?.url) {
        const url = link.object.url;
        if (url.includes('github.com') && url.includes('/pull/')) {
          prUrls.add(url);
        }
      }
    }
  }
  
  // Check description for PR URLs
  const description = issue.fields.description || "";
  const githubPRRegex = /https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/g;
  let match;
  
  while ((match = githubPRRegex.exec(description)) !== null) {
    prUrls.add(match[0]);
  }
  
  return Array.from(prUrls);
}

/**
 * Fetch JIRA ticket with all information
 */
export async function getJiraTicket(ticketId: string): Promise<JiraTicket> {
  const jira = getJiraClient();
  
  try {
    const issue = await jira.findIssue(ticketId, 'issuelinks,remotelinks');
    
    // Try to get remote links
    let remoteLinks: any[] = [];
    try {
      const links = await jira.getRemoteLinks(ticketId);
      remoteLinks = Array.isArray(links) ? links : [];
    } catch (e) {
      // Continue without remote links
    }
    
    // Extract PRs from remote links
    const prsFromRemoteLinks: string[] = [];
    for (const link of remoteLinks) {
      if (link.object?.url) {
        const url = link.object.url;
        if (url.includes('github.com') && url.includes('/pull/')) {
          prsFromRemoteLinks.push(url);
        }
      }
    }
    
    // Combine PRs from all sources
    const prsFromIssue = extractLinkedPRs(issue);
    const allPRs = [...new Set([...prsFromRemoteLinks, ...prsFromIssue])];
    
    return {
      key: issue.key,
      summary: issue.fields.summary || "",
      description: issue.fields.description || "No description provided",
      acceptanceCriteria: extractAcceptanceCriteria(issue),
      status: issue.fields.status?.name || "Unknown",
      assignee: issue.fields.assignee?.displayName || null,
      priority: issue.fields.priority?.name || "Unknown",
      issueType: issue.fields.issuetype?.name || "Unknown",
    };
  } catch (error: any) {
    throw new Error(`Failed to fetch JIRA ticket ${ticketId}: ${error.message}`);
  }
}

/**
 * Get linked PRs from JIRA ticket
 */
export async function getLinkedPRs(ticketId: string): Promise<string[]> {
  const jira = getJiraClient();
  
  try {
    const issue = await jira.findIssue(ticketId, 'issuelinks,remotelinks');
    
    let remoteLinks: any[] = [];
    try {
      const links = await jira.getRemoteLinks(ticketId);
      remoteLinks = Array.isArray(links) ? links : [];
    } catch (e) {
      // Continue without remote links
    }
    
    const prsFromRemoteLinks: string[] = [];
    for (const link of remoteLinks) {
      if (link.object?.url) {
        const url = link.object.url;
        if (url.includes('github.com') && url.includes('/pull/')) {
          prsFromRemoteLinks.push(url);
        }
      }
    }
    
    const prsFromIssue = extractLinkedPRs(issue);
    return [...new Set([...prsFromRemoteLinks, ...prsFromIssue])];
  } catch (error: any) {
    throw new Error(`Failed to get linked PRs for ${ticketId}: ${error.message}`);
  }
}

/**
 * Create a JIRA ticket
 */
export async function createJiraTicket(ticketContent: any): Promise<any> {
  const host = process.env.JIRA_HOST;
  const email = process.env.JIRA_EMAIL;
  const apiKey = process.env.JIRA_API_TOKEN;

  if (!host || !email || !apiKey) {
    throw new Error("Missing JIRA credentials");
  }

  const auth = Buffer.from(`${email}:${apiKey}`).toString('base64');
  const url = `https://${host}/rest/api/2/issue`;

  try {
    const response = await axios.post(url, ticketContent, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    return response.data;
  } catch (error: any) {
    throw new Error(`Failed to create ticket: ${error.response?.data?.errors || error.message}`);
  }
}

