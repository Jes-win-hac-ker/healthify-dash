// Setup type definitions for Supabase Edge Runtime (provides Deno types in TS)
// Type hints for Supabase Edge Runtime (Deno compatibility in local tooling)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// Use serve from Deno std; local type resolver may complain but runtime is fine.
// Provide a minimal declaration fallback to silence TS if remote types aren't resolved.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// Fallback declaration for Deno to satisfy type checking in Node tooling.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Deno: any;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    // Allow overriding the model from environment; default to a stable, widely available model
    const GEMINI_MODEL = Deno.env.get("GEMINI_MODEL") ?? "gemini-2.0-flash-exp";

    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    console.log("Using Gemini model:", GEMINI_MODEL);

    // Convert messages to Gemini format
    const geminiMessages = messages.map((msg: any) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));

    const streamUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`;
    const nonStreamUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    let response = await fetch(streamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: geminiMessages,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
        systemInstruction: {
          parts: [{
            text: "You are a helpful AI health assistant. Provide clear, concise health advice while emphasizing that users should consult healthcare professionals for serious concerns. Keep responses friendly and supportive."
          }]
        }
      }),
    });

    // If streaming fails with a 4xx (not auth) fallback to non-streaming endpoint once
    if (!response.ok && response.status !== 401 && response.status !== 403 && response.status !== 429) {
      const fallback = await fetch(nonStreamUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: geminiMessages,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
          systemInstruction: {
            parts: [{
              text: "You are a helpful AI health assistant. Provide clear, concise health advice while emphasizing that users should consult healthcare professionals for serious concerns. Keep responses friendly and supportive."
            }]
          }
        }),
      });
      if (fallback.ok) {
        const json = await fallback.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        const openAIFormat = { choices: [{ delta: { content: text } }] };
        return new Response(`data: ${JSON.stringify(openAIFormat)}\n\ndata: [DONE]\n\n`, {
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
      } else {
        response = fallback; // propagate fallback error
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      const rateHeaders = {
        "x-ratelimit-limit": response.headers.get("x-ratelimit-limit"),
        "x-ratelimit-remaining": response.headers.get("x-ratelimit-remaining"),
        "x-ratelimit-reset": response.headers.get("x-ratelimit-reset"),
      } as Record<string, string | null>;

      console.error("Gemini API error:", response.status, rateHeaders, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Rate limits exceeded (Gemini upstream).",
            details: errorText,
            rateHeaders,
            source: "gemini"
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402 || response.status === 403) {
        return new Response(
          JSON.stringify({
            error: "API quota exceeded or invalid API key. Please check your Gemini API configuration.",
            details: errorText,
            source: "gemini"
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ error: "Gemini API error", details: errorText, source: "gemini" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create a transform stream to convert Gemini format to OpenAI format
    const transformStream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          let buffer = "";
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() || "";

              for (let line of lines) {
                if (line.startsWith("data: ")) {
                  const jsonStr = line.slice(6).trim();
                  if (jsonStr === "[DONE]") continue;

                  try {
                    const parsed = JSON.parse(jsonStr);
                    console.log("Gemini response chunk:", JSON.stringify(parsed));
                    const candidates = parsed.candidates;
                    if (candidates && candidates[0] && candidates[0].content && candidates[0].content.parts) {
                      const content = candidates[0].content.parts[0]?.text;
                      if (content) {
                        console.log("Extracted content:", content);
                        // Send in OpenAI-compatible format for the frontend
                        const openAIFormat = {
                          choices: [{
                            delta: { content }
                          }]
                        };
                        controller.enqueue(`data: ${JSON.stringify(openAIFormat)}\n\n`);
                      } else {
                        console.warn("No text content found in chunk");
                      }
                    } else {
                      console.warn("Unexpected structure:", JSON.stringify(parsed));
                    }
                  } catch (e) {
                    console.error("Error parsing Gemini response:", e, "Line:", line);
                  }
                }
              }
            }
            controller.enqueue(`data: [DONE]\n\n`);
          } finally {
            controller.close();
            reader.releaseLock();
          }
        }
      }
    });

    return new Response(transformStream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
