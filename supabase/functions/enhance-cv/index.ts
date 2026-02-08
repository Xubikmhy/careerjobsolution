import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { candidate, template } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a professional CV/resume writer. Given candidate information, generate enhanced, professional CV content. Be specific, use action verbs, and make the content compelling. Do NOT fabricate facts — enhance and reword what's provided. If information is sparse, create professional filler based on the role/skills indicated.

Return a JSON object with these exact fields:
- careerObjective: A 2-3 sentence professional career objective
- professionalSummary: A 3-4 sentence professional summary highlighting experience and skills
- enhancedSkills: Array of skill strings (expand abbreviations, add related skills)
- workExperiences: Array of objects with { position, company, duration, responsibilities } - create professional descriptions
- declaration: A professional declaration statement

Template style: ${template || 'professional'}`;

    const userPrompt = `Candidate Details:
Name: ${candidate.fullName || 'Not provided'}
Phone: ${candidate.phone || 'Not provided'}
Address: ${candidate.address || 'Not provided'}
Experience: ${candidate.experienceYears || 0} years
Education: ${candidate.educationLevel || 'Not provided'}
Skills: ${(candidate.skills || []).join(', ') || 'Not provided'}
Expected Salary: NPR ${candidate.expectedSalary || 0}
Nationality: ${candidate.nationality || 'Nepali'}
Languages: ${(candidate.languages || []).join(', ') || 'Not provided'}
Career Objective: ${candidate.careerObjective || 'Not provided'}
Date of Birth: ${candidate.dateOfBirth || 'Not provided'}
Marital Status: ${candidate.maritalStatus || 'Not provided'}

Please enhance this candidate's CV content to make it professional and compelling.`;

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
              name: "generate_cv_content",
              description: "Generate enhanced CV content for a candidate",
              parameters: {
                type: "object",
                properties: {
                  careerObjective: { type: "string" },
                  professionalSummary: { type: "string" },
                  enhancedSkills: { type: "array", items: { type: "string" } },
                  workExperiences: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        position: { type: "string" },
                        company: { type: "string" },
                        duration: { type: "string" },
                        responsibilities: { type: "string" },
                      },
                      required: ["position", "company", "duration", "responsibilities"],
                    },
                  },
                  declaration: { type: "string" },
                },
                required: ["careerObjective", "professionalSummary", "enhancedSkills", "workExperiences", "declaration"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_cv_content" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate CV content");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    let cvContent;
    if (toolCall?.function?.arguments) {
      cvContent = typeof toolCall.function.arguments === 'string'
        ? JSON.parse(toolCall.function.arguments)
        : toolCall.function.arguments;
    } else {
      // Fallback: try to parse from message content
      const content = data.choices?.[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cvContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not parse AI response");
      }
    }

    return new Response(JSON.stringify(cvContent), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("enhance-cv error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
