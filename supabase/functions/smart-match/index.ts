import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { candidates, job } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert recruiter AI. Analyze candidate profiles against a job requirement and provide match scores and reasoning. Be precise and practical.`;

    const userPrompt = `Job Requirement:
- Role: ${job.role_title}
- Company: ${job.company_name}
- Required Skills: ${(job.required_skills || []).join(', ')}
- Salary: NPR ${job.salary_min} - ${job.salary_max}
- Location: ${job.location || 'Not specified'}
- Timing: ${job.timing || 'Day'}

Candidates:
${candidates.map((c: any, i: number) => `
${i + 1}. ${c.full_name}
   Skills: ${(c.skills || []).join(', ')}
   Experience: ${c.experience_years} years
   Expected Salary: NPR ${c.expected_salary}
   Education: ${c.education_level || 'Not specified'}
`).join('\n')}

For each candidate, provide a match score (0-100) and brief reasoning.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_match_scores",
              description: "Return match scores for candidates",
              parameters: {
                type: "object",
                properties: {
                  matches: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        candidateIndex: { type: "number" },
                        score: { type: "number" },
                        reasoning: { type: "string" },
                        strengths: { type: "array", items: { type: "string" } },
                        gaps: { type: "array", items: { type: "string" } },
                      },
                      required: ["candidateIndex", "score", "reasoning"],
                    },
                  },
                },
                required: ["matches"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_match_scores" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    let matchResults;
    if (toolCall?.function?.arguments) {
      matchResults = typeof toolCall.function.arguments === 'string'
        ? JSON.parse(toolCall.function.arguments)
        : toolCall.function.arguments;
    } else {
      matchResults = { matches: [] };
    }

    return new Response(JSON.stringify(matchResults), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("smart-match error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
