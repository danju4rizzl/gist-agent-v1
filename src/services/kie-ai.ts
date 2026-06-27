import {
  KIE_AI_BASE_URL,
  KIE_AI_MODEL,
  KIE_AI_POLL_INTERVAL_MS,
  KIE_AI_MAX_POLL_DURATION_MS,
} from "@/lib/constants";
import type { KieAiSubmitResponse, KieAiPollResponse } from "@/lib/types";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function submitImageGeneration(
  prompt: string,
  apiKey: string
): Promise<string> {
  const url = `${KIE_AI_BASE_URL}/api/v1/generate`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: KIE_AI_MODEL,
      prompt,
      aspectRatio: "1:1",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to submit Kie.ai image generation. HTTP status: ${response.status}. Error: ${errorText}`
    );
  }

  const result = (await response.json()) as KieAiSubmitResponse;
  if (result.code !== 200 || !result.data?.task_id) {
    throw new Error(
      `Kie.ai returned error code: ${result.code}. Msg: ${result.msg}`
    );
  }

  return result.data.task_id;
}

export async function pollImageResult(
  taskId: string,
  apiKey: string
): Promise<string> {
  const url = `${KIE_AI_BASE_URL}/api/v1/jobs/recordInfo?taskId=${taskId}`;
  const startTime = Date.now();

  while (Date.now() - startTime < KIE_AI_MAX_POLL_DURATION_MS) {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      console.warn(
        `Kie.ai polling HTTP error: ${response.status}. Retrying...`
      );
      await sleep(KIE_AI_POLL_INTERVAL_MS);
      continue;
    }

    const result = (await response.json()) as KieAiPollResponse;
    if (result.code !== 200) {
      throw new Error(
        `Kie.ai polling error. Code: ${result.code}, Msg: ${result.msg}`
      );
    }

    const state = result.data?.state?.toLowerCase();
    if (state === "success" && result.data?.image_url) {
      return result.data.image_url;
    }

    if (state === "failed") {
      throw new Error(`Kie.ai image generation task failed (task_id: ${taskId})`);
    }

    // Keep polling
    await sleep(KIE_AI_POLL_INTERVAL_MS);
  }

  throw new Error(
    `Kie.ai image generation timed out after ${KIE_AI_MAX_POLL_DURATION_MS / 1000}s`
  );
}

export async function generateInfographic(
  prompt: string,
  apiKey: string
): Promise<string> {
  const taskId = await submitImageGeneration(prompt, apiKey);
  return await pollImageResult(taskId, apiKey);
}
