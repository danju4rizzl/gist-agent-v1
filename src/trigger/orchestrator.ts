import { task } from "@trigger.dev/sdk/v3";
import type { OrchestratorPayload } from "@/lib/types";
import { SETTING_KEYS } from "@/lib/constants";
import {
  getSetting,
  updateRunStatus,
  createStepLog,
  completeStepLog,
  failStepLog,
} from "@/db/queries";
import { archiveToNotion } from "@/services/notion";
import { sendMessage } from "@/services/telegram";

export const taskOrchestrator = task({
  id: "gist-agent-orchestrator",
  retry: {
    maxAttempts: 1,
  },
  run: async (payload: OrchestratorPayload): Promise<void> => {
    const { keyword, runId, source, telegramChatId } = payload;

    try {
      // 1. Research Step
      await updateRunStatus(runId, "researching");
      const researcherTask = await import("./researcher");
      const researchOutput = await researcherTask.agentResearcher.triggerAndWait({
        keyword,
        runId,
      });

      if (!researchOutput.ok) {
        throw new Error(`Research step failed: ${(researchOutput.error as any)?.message || String(researchOutput.error)}`);
      }
      const researchData = researchOutput.output;

      // 2. Writing Step
      await updateRunStatus(runId, "writing", { researchData });
      const writerTask = await import("./writer");
      const writerOutput = await writerTask.agentCopywriter.triggerAndWait({
        keyword,
        runId,
        researchData,
      });

      if (!writerOutput.ok) {
        throw new Error(`Copywriting step failed: ${(writerOutput.error as any)?.message || String(writerOutput.error)}`);
      }
      const linkedinPost = writerOutput.output;

      // 3. Design Step
      await updateRunStatus(runId, "designing", { linkedinPost });
      const designerTask = await import("./designer");
      const designerOutput = await designerTask.agentDesigner.triggerAndWait({
        keyword,
        runId,
        researchData,
        linkedinPost,
      });

      if (!designerOutput.ok) {
        throw new Error(`Design step failed: ${(designerOutput.error as any)?.message || String(designerOutput.error)}`);
      }
      const infographicUrl = designerOutput.output;

      // 4. Archive Step
      await updateRunStatus(runId, "archiving", { infographicUrl });
      const notionStepLog = await createStepLog(runId, "notion_archive");

      try {
        const notionApiKey = await getSetting(SETTING_KEYS.NOTION_API_KEY);
        const notionDbId = await getSetting(SETTING_KEYS.NOTION_DATABASE_ID);

        if (notionApiKey && notionDbId) {
          await archiveToNotion(notionApiKey, notionDbId, {
            keyword,
            linkedinPost,
            infographicUrl,
          });
          await completeStepLog(notionStepLog.id, { archived: true });
        } else {
          await completeStepLog(notionStepLog.id, {
            archived: false,
            reason: "Notion credentials not configured. Skipping.",
          });
        }
      } catch (notionError: any) {
        console.error("Notion archive error:", notionError);
        await failStepLog(
          notionStepLog.id,
          notionError.message || String(notionError)
        );
        // Do not fail the whole pipeline just because Notion archiving failed
      }

      // 5. Complete Run
      await updateRunStatus(runId, "completed");

      // 6. Notify via Telegram if needed
      if (source === "telegram" && telegramChatId) {
        const telegramToken = await getSetting(SETTING_KEYS.TELEGRAM_BOT_TOKEN);
        if (telegramToken) {
          const chatNumber = parseInt(telegramChatId, 10);
          const notificationText = `✅ *Gist Agent pipeline completed!*

*Topic:* ${keyword}

*LinkedIn Draft:*
${linkedinPost}

${infographicUrl ? `*Visual Infographic:* [Preview Infographic](${infographicUrl})` : ""}
`;
          await sendMessage(telegramToken, chatNumber, notificationText);
        }
      }
    } catch (error: any) {
      const errMsg = error.message || String(error);
      await updateRunStatus(runId, "failed", { errorMessage: errMsg });

      if (source === "telegram" && telegramChatId) {
        const telegramToken = await getSetting(SETTING_KEYS.TELEGRAM_BOT_TOKEN);
        if (telegramToken) {
          const chatNumber = parseInt(telegramChatId, 10);
          await sendMessage(
            telegramToken,
            chatNumber,
            `❌ *Gist Agent pipeline failed for:* ${keyword}\n\n*Error:* ${errMsg}`
          );
        }
      }

      throw error;
    }
  },
});
export default taskOrchestrator;
