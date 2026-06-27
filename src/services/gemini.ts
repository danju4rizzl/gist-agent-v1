import { GoogleGenAI } from "@google/genai";
import type { ResearchSummary } from "@/lib/types";

export async function summarizeResearch(
  searchResults: { title: string; url: string; content: string }[],
  keyword: string,
  apiKey: string
): Promise<ResearchSummary> {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are an expert research agent. You are researching the keyword/topic: "${keyword}".
Below are the search results containing recent news, data points, trends, and articles about this topic.

Search Results:
${JSON.stringify(searchResults, null, 2)}

Provide a highly structured, objective summary of this research. It MUST be returned in the following JSON format:
{
  "keyword": "${keyword}",
  "summary": "A 2-3 sentence high-level overview of the current state of this topic.",
  "keyTrends": [
    "Trend 1 description",
    "Trend 2 description",
    "Trend 3 description"
  ],
  "statistics": [
    "Statistic/data point 1",
    "Statistic/data point 2"
  ],
  "notableCompanies": [
    "Company A (what they are doing)",
    "Company B"
  ],
  "recentNews": [
    { "title": "News Title", "url": "URL", "snippet": "Brief summary of this news item" }
  ],
  "searchAnswer": "A comprehensive answer summarizing the findings in 150-200 words."
}

Ensure your response is valid JSON and matches this schema exactly. Do not include any markdown backticks or explanations outside of the JSON.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Empty response from Gemini during research summarization.");
  }

  return JSON.parse(text) as ResearchSummary;
}

export async function generateLinkedInPost(
  researchSummary: ResearchSummary,
  apiKey: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are an expert Copywriter specializing in writing highly engaging, professional LinkedIn posts. 
Here is a structured research summary about the topic "${researchSummary.keyword}":

${JSON.stringify(researchSummary, null, 2)}

Write an impactful LinkedIn post based on this research.
Guidelines:
1. Hook the reader in the first 2 lines.
2. Structure the body with clear, readable bullet points highlighting the trends or statistics.
3. Keep the tone professional, analytical, yet engaging and thought-provoking.
4. Include 2-3 relevant hashtags at the very end.
5. Do NOT use emojis excessively (use them tastefully if at all).
6. End with a strong call-to-action or discussion question to prompt engagement.

Return ONLY the raw post content. No introductory text or conversational fillers.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text ?? "";
}

export async function generateInfographicPrompt(
  researchSummary: ResearchSummary,
  linkedinPost: string,
  apiKey: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are a creative Art Director and Designer. We are generating an infographic to accompany a LinkedIn post.
Topic: "${researchSummary.keyword}"
LinkedIn Post:
"${linkedinPost}"

Research Summary:
${JSON.stringify(researchSummary, null, 2)}

We need to generate a visual infographic using an image generation model. 
Please describe a highly detailed visual layout prompt for this infographic.
Guidelines:
1. It must be a square (1:1 aspect ratio) graphic.
2. Describe the layout, background (sleek, modern, dark tech theme), title text placement, key metric or data chart illustration, icons, and color scheme (e.g. vibrant teal, emerald green, slate dark).
3. Specify "clean typography, high-quality layout design, infographic vector, data visualization, minimalist dashboard interface, clean lines".
4. Do NOT request realistic human faces or chaotic scenes. Focus on structure, data elements, and clean composition.

Return ONLY the optimized image generation prompt. No introductory or trailing text.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text ?? "";
}
