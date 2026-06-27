import { task } from "@trigger.dev/sdk/v3";
import type { ResearcherPayload, ResearchSummary } from "@/lib/types";
import { SETTING_KEYS } from "@/lib/constants";
import { getSetting, createStepLog, completeStepLog, failStepLog } from "@/db/queries";
import { searchKeyword } from "@/services/tavily";
import { summarizeResearch } from "@/services/gemini";

export const agentResearcher = task({
  id: "gist-agent-researcher",
  retry: {
    maxAttempts: 2,
  },
  run: async (payload: ResearcherPayload): Promise<ResearchSummary> => {
    const { keyword, runId } = payload;
    const stepLog = await createStepLog(runId, "research");

    try {
      // 1. Fetch Tavily Key
      const tavilyApiKey = await getSetting(SETTING_KEYS.TAVILY_API_KEY);
      if (!tavilyApiKey) {
        throw new Error(
          "Tavily API key is missing. Please save it in settings."
        );
      }

      // 2. Perform Web Search
      const searchResults = await searchKeyword(keyword, tavilyApiKey);

      // 3. Fetch Gemini Key
      const geminiApiKey = await getSetting(SETTING_KEYS.GEMINI_API_KEY);
      if (!geminiApiKey) {
        throw new Error(
          "Gemini API key is missing. Please save it in settings."
        );
      }

      // 4. Summarize Research
      const summary = await summarizeResearch(
        searchResults.results,
        keyword,
        geminiApiKey
      );

      // Add direct Tavily search answer if available
      if (searchResults.answer) {
        summary.searchAnswer = searchResults.answer;
      }

      // 5. Complete step
      await completeStepLog(stepLog.id, {
        summary: summary.summary,
        keyTrendsCount: summary.keyTrends.length,
        statisticsCount: summary.statistics.length,
      });

      return summary;
    } catch (error: any) {
      const errMsg = error.message || String(error);
      await failStepLog(stepLog.id, errMsg);
      throw error;
    }
  },
});
export default agentResearcher;
