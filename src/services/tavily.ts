import { tavily } from "@tavily/core";
import type { ResearchSummary } from "@/lib/types";

interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
}

interface TavilyResponse {
  results: TavilySearchResult[];
  answer?: string;
}

export async function searchKeyword(
  keyword: string,
  apiKey: string
): Promise<TavilyResponse> {
  const client = tavily({ apiKey });

  const response = await client.search(keyword, {
    searchDepth: "advanced",
    maxResults: 10,
    includeAnswer: true,
  });

  return {
    results: response.results.map((result) => ({
      title: result.title,
      url: result.url,
      content: result.content,
    })),
    answer: response.answer,
  };
}
