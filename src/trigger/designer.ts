import { task } from "@trigger.dev/sdk/v3";
import type { DesignerPayload } from "@/lib/types";
import { SETTING_KEYS } from "@/lib/constants";
import { getSetting, createStepLog, completeStepLog, failStepLog } from "@/db/queries";
import { generateInfographicPrompt } from "@/services/gemini";
import { generateInfographic } from "@/services/kie-ai";

export const agentDesigner = task({
  id: "gist-agent-designer",
  retry: {
    maxAttempts: 2,
  },
  run: async (payload: DesignerPayload): Promise<string> => {
    const { runId, researchData, linkedinPost } = payload;
    const stepLog = await createStepLog(runId, "design");

    try {
      // 1. Fetch keys
      const geminiApiKey = await getSetting(SETTING_KEYS.GEMINI_API_KEY);
      if (!geminiApiKey) {
        throw new Error(
          "Gemini API key is missing. Please save it in settings."
        );
      }

      const kieAiApiKey = await getSetting(SETTING_KEYS.KIE_AI_API_KEY);
      if (!kieAiApiKey) {
        throw new Error(
          "Kie.ai API key is missing. Please save it in settings."
        );
      }

      // 2. Generate infographic image prompt
      const visualPrompt = await generateInfographicPrompt(
        researchData,
        linkedinPost,
        geminiApiKey
      );

      // 3. Generate infographic image via Kie.ai
      const imageUrl = await generateInfographic(visualPrompt, kieAiApiKey);

      // 4. Complete step log
      await completeStepLog(stepLog.id, {
        visualPrompt,
        imageUrl,
      });

      return imageUrl;
    } catch (error: any) {
      const errMsg = error.message || String(error);
      await failStepLog(stepLog.id, errMsg);
      throw error;
    }
  },
});
export default agentDesigner;
