import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-3-5-sonnet-20241022";

let anthropic: Anthropic;

export function initializeAnthropic() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY environment variable is not set");
  }
  anthropic = new Anthropic({ apiKey });
}

/**
 * Generate AI content using Claude
 */
export async function generateClaudeContent(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 4000
): Promise<string> {
  if (!anthropic) {
    initializeAnthropic();
  }

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    return textBlock && "text" in textBlock ? textBlock.text : "";
  } catch (error: any) {
    throw new Error(`Error calling Claude API: ${error.message}`);
  }
}

/**
 * Analyze PR code with Claude
 */
export async function analyzePRCode(
  prInfo: any,
  changes: string,
  acceptanceCriteria?: string
): Promise<string> {
  const systemPrompt = `You are an expert code reviewer. Analyze the PR changes and provide detailed feedback.`;

  let userPrompt = `Analyze this PR:\n\nTitle: ${prInfo.title}\nFiles: ${prInfo.filesCount}\n\n`;
  
  if (acceptanceCriteria) {
    userPrompt += `Acceptance Criteria:\n${acceptanceCriteria}\n\n`;
    userPrompt += `Validate if the code meets ALL acceptance criteria.\n\n`;
  }
  
  userPrompt += `Code Changes:\n\`\`\`\n${changes}\n\`\`\`\n\n`;
  userPrompt += `Provide analysis on: bugs, security issues, code quality, best practices, and AC validation (if provided).`;

  return await generateClaudeContent(systemPrompt, userPrompt, 4000);
}

/**
 * Parse acceptance criteria into test scenarios
 */
export async function parseAcceptanceCriteria(
  acceptanceCriteria: string,
  summary: string,
  description: string
): Promise<any> {
  const systemPrompt = `You are a QA engineer. Convert acceptance criteria into executable test scenarios.
Return JSON format: {"scenarios": [{"description": "...", "action": "check_style|click|check_text|check_visibility", "target": "CSS selector", "expected": "...", "value": "optional"}]}`;

  const userPrompt = `Ticket: ${summary}\n\nDescription: ${description}\n\nAcceptance Criteria:\n${acceptanceCriteria}\n\nGenerate test scenarios.`;

  const response = await generateClaudeContent(systemPrompt, userPrompt, 2000);
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { scenarios: [] };
  } catch (e) {
    return { scenarios: [] };
  }
}

/**
 * Generate test report
 */
export async function generateTestReport(
  ticketKey: string,
  summary: string,
  testResults: any[]
): Promise<string> {
  const systemPrompt = `You are a QA analyst. Generate a comprehensive test report.`;

  const userPrompt = `Ticket: ${ticketKey} - ${summary}\n\nTest Results:\n${JSON.stringify(testResults, null, 2)}\n\nProvide analysis and recommendations.`;

  return await generateClaudeContent(systemPrompt, userPrompt, 1500);
}

