import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const MODEL = "google/gemini-3-flash-preview";

function gateway() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key);
}

async function run(system: string, prompt: string) {
  const { text } = await generateText({
    model: gateway()(MODEL),
    system,
    prompt,
  });
  return { text };
}

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        recipient: z.string().min(1).max(200),
        objective: z.string().min(1).max(2000),
        tone: z.enum(["Formal", "Informal", "Persuasive"]),
      })
      .parse(d),
  )
  .handler(async ({ data }) =>
    run(
      "You are an expert workplace email writer. Produce a complete, ready-to-send email draft with a clear subject line on the first line as 'Subject: ...' followed by the body. Match the requested tone precisely. No commentary.",
      `Recipient: ${data.recipient}\nTone: ${data.tone}\nObjective: ${data.objective}`,
    ),
  );

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ transcript: z.string().min(1).max(20000) }).parse(d),
  )
  .handler(async ({ data }) =>
    run(
      "You summarize messy meeting transcripts. Output markdown with these exact sections: '## Summary' (3-5 bullet points of key discussion), '## Decisions' (bullets), '## Action Items' (a markdown table with columns | Task | Owner | Deadline |). If owner or deadline is unclear, write 'Unassigned' or 'TBD'.",
      data.transcript,
    ),
  );

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        goal: z.string().min(1).max(2000),
        horizon: z.enum(["Daily", "Weekly"]).default("Weekly"),
      })
      .parse(d),
  )
  .handler(async ({ data }) =>
    run(
      `You are a senior project planner. Produce a prioritized ${data.horizon.toLowerCase()} roadmap in markdown. Group tasks under day or week headings (e.g. '## Day 1' or '## Week 1'). Each task: '- [P1] Task — short rationale (est. time)'. Priorities P1 (critical), P2, P3. End with '## Risks & Dependencies'.`,
      `Project goal: ${data.goal}`,
    ),
  );

export const researchBrief = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ topic: z.string().min(1).max(8000) }).parse(d),
  )
  .handler(async ({ data }) =>
    run(
      "You are an executive research analyst. Produce a concise executive brief in markdown with sections: '## TL;DR' (2-3 sentences), '## Key Insights' (5 bullets), '## Opportunities', '## Risks', '## Recommended Next Steps'. Be neutral, factual, and avoid speculation.",
      data.topic,
    ),
  );
