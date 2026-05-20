function getDeepSeekConfig() {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  const apiUrl = (
    process.env.DEEPSEEK_API_URL?.trim() || "https://api.deepseek.com/v1"
  ).replace(/\/$/, "");
  const model = process.env.DEEPSEEK_MODEL?.trim() || "deepseek-chat";
  return { apiKey, apiUrl, model };
}

export function isDeepSeekConfigured(): boolean {
  return Boolean(getDeepSeekConfig().apiKey);
}

export async function chatJsonCompletion(
  system: string,
  user: string,
): Promise<{ content: string; model: string }> {
  const { apiKey, apiUrl, model } = getDeepSeekConfig();
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY no configurada.");
  }

  const res = await fetch(`${apiUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`DeepSeek HTTP ${res.status}: ${errText.slice(0, 800)}`);
  }

  const raw = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = raw.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("Respuesta DeepSeek sin contenido de mensaje.");
  }

  return { content, model };
}
