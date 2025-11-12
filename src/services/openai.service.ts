import OpenAI from "openai";

const MODEL = "gpt-5-mini";

let openai: OpenAI;

export function initializeOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }
  openai = new OpenAI({ apiKey });
}

/**
 * Generate AI content using OpenAI
 */
export async function generateAIContent(
  systemPrompt: string,
  userPrompt: string
): Promise<any> {
  if (!openai) {
    initializeOpenAI();
  }

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content?.trim();
    return content ? JSON.parse(content) : null;
  } catch (error: any) {
    throw new Error(`Error generating AI content: ${error.message}`);
  }
}

/**
 * Create JIRA ticket content
 */
export async function createJiraTicketContent(
  taskDescription: string,
  projectId: string,
  labels: string
): Promise<any> {
  const systemPrompt = `You are a Product Manager creating Jira tickets.
Your response must be ONLY valid JSON, nothing else.`;

  const userPrompt = `Create a Jira ticket JSON for: ${taskDescription}

Required values:
- issuetype.id must be "10000"
- project.id must be "${projectId}"
- labels must be ["${labels}"]
- Include summary, description, and acceptance criteria (customfield_10115)

Respond with ONLY the JSON object.`;

  return await generateAIContent(systemPrompt, userPrompt);
}

/**
 * Chat service functions for AI Assistant
 */
export async function processChatMessage(
  messages: any[],
  systemPrompt: string
): Promise<string> {
  if (!openai) {
    initializeOpenAI();
  }

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.7,
      max_tokens: 300,
    });

    return response.choices[0].message.content?.trim() || "";
  } catch (error: any) {
    throw new Error(`Error processing chat message: ${error.message}`);
  }
}

