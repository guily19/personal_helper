// Common types used across all services

export interface JiraTicket {
  key: string;
  summary: string;
  description: string;
  acceptanceCriteria: string;
  status?: string;
  priority?: string;
  assignee?: string;
  issueType?: string;
}

export interface PRInfo {
  owner: string;
  repo: string;
  number: number;
  title: string;
  url: string;
}

export interface PRAnalysisResult {
  prInfo: PRInfo;
  title: string;
  filesCount: number;
  analysis: string;
  markdown: string;
}

export interface TestScenario {
  description: string;
  action: string;
  target: string;
  expected: string;
  value?: string;
}

export interface TestResult {
  description: string;
  action: string;
  target: string;
  expected: string;
  passed: boolean;
  actual?: string;
  error?: string;
}

export interface TicketContent {
  fields: {
    summary: string;
    description: any;
    project: { id: string };
    issuetype: { id: string };
    priority?: { name: string };
    labels?: string[];
    customfield_10115?: any; // Acceptance criteria field
  };
}

export interface ChatSession {
  sessionId: string;
  stage: string;
  messages: Array<{ role: string; content: string }>;
  collectedInfo: {
    overview: string;
    userStory: {
      who: string;
      what: string;
      why: string;
    };
    description: string;
    acceptanceCriteria: string[];
  };
}

