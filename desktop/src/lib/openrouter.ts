import OpenAI from "openai";

export const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: "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",
  dangerouslyAllowBrowser: true
});

export const MODELS = {
  fast: "minimax/minimax-m1",
  smart: "minimax/minimax-m3",
  reasoning: "deepseek/deepseek-r1",
  premium: "openai/gpt-5",
};

export async function generateSocraticSupport(topic: string): Promise<string> {
  try {
    const response = await client.chat.completions.create({
      model: MODELS.smart,
      messages: [
        {
          role: "system",
          content: "You are the APEX Socratic Challenger. A student is currently in 'Distraction Lockdown' because they are stuck and overwhelmed. Help them get unblocked on their task. Keep your response under 3 sentences. Be highly encouraging and provide a direct hint or next step. Use markdown formatting."
        },
        {
          role: "user",
          content: `I'm stuck on: ${topic}`
        }
      ],
    });

    return response.choices[0]?.message?.content || "I couldn't process that right now, but take a deep breath and let's break it down into smaller steps.";
  } catch (error) {
    console.error("OpenRouter Error:", error);
    return "The Socratic Support link is currently experiencing interference, but try breaking your task into two smaller chunks.";
  }
}
