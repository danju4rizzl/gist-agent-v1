import { task } from "@trigger.dev/sdk/v3";
import type { WriterPayload } from "@/lib/types";
import { SETTING_KEYS } from "@/lib/constants";
import { getSetting, createStepLog, completeStepLog, failStepLog } from "@/db/queries";
import { generateLinkedInPost } from "@/services/gemini";

export const agentCopywriter = task({
  id: "gist-agent-writer",
  retry: {
    maxAttempts: 2,
  },
  run: async (payload: WriterPayload): Promise<string> => {
    const { runId, researchData } = payload;
    const stepLog = await createStepLog(runId, "copywriting");

    try {
      // 1. Fetch Gemini Key
      const geminiApiKey = await getSetting(SETTING_KEYS.GEMINI_API_KEY);
      if (!geminiApiKey) {
        throw new Error(
          "Gemini API key is missing. Please save it in settings."
        );
      }

      // 2. Generate post content
      const postText = await generateLinkedInPost(researchData, geminiApiKey);

      // 3. Complete step log
      await completeStepLog(stepLog.id, {
        postLength: postText.length,
        wordCount: postText.split(/\s+/).length,
      });

      return postText;
    } catch (error: any) {
      const errMsg = error.message || String(error);
      await failStepLog(stepLog.id, errMsg);
      throw error;
    }
  },
});
export default agentCopywriter;
