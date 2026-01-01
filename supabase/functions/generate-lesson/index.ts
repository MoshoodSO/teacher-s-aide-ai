import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, classLevel, country, topic, topicContent, additionalNotes, week, weekDate, imageBase64 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const isJSS = classLevel.startsWith("JSS");
    const isMathSubject = subject === "General Mathematics" || subject === "Further Mathematics" || subject === "Mathematics";
    
    const levelDescription = isJSS 
      ? "junior secondary school (ages 10-14), use simple language, relatable examples, and focus on foundational concepts"
      : "senior secondary school (ages 15-18), use advanced terminology, critical analysis, and prepare students for external exams like WAEC/NECO";

    // Use topicContent if provided (from file upload), otherwise use topic
    let fullTopicContent = topicContent || topic;

    // If there's an image, use AI vision to analyze it
    let imageAnalysis = "";
    if (imageBase64) {
      console.log("Analyzing uploaded image with AI vision...");
      
      const visionResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this educational content image. Extract all text, topics, concepts, diagrams, and any educational material visible. Provide a comprehensive description of what should be taught based on this image. If it contains a curriculum or syllabus, list all topics mentioned."
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageBase64
                  }
                }
              ]
            }
          ],
        }),
      });

      if (visionResponse.ok) {
        const visionData = await visionResponse.json();
        imageAnalysis = visionData.choices?.[0]?.message?.content || "";
        console.log("Image analysis completed:", imageAnalysis.substring(0, 200));
        
        // Combine image analysis with any existing content
        fullTopicContent = imageAnalysis + (fullTopicContent ? `\n\nAdditional context: ${fullTopicContent}` : "");
      } else {
        console.error("Vision API error:", await visionResponse.text());
      }
    }

    const weekInfo = week ? `Week ${week}` : "";
    const dateInfo = weekDate ? weekDate : "";
    
    // For math subjects, include LaTeX formatting instructions
    const mathInstructions = isMathSubject ? `
IMPORTANT: Since this is a Mathematics subject, you MUST:
1. Use LaTeX notation for ALL mathematical expressions, equations, and formulas
2. Wrap inline math with single dollar signs: $expression$
3. Wrap display/block math with double dollar signs: $$expression$$
4. Examples:
   - Inline: The quadratic formula is $x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$
   - Block: $$\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$
5. Use proper LaTeX commands for fractions (\\frac{}{}), roots (\\sqrt{}), summations (\\sum), integrals (\\int), etc.
6. Ensure all mathematical steps are clearly shown with proper LaTeX formatting
` : "";

    const systemPrompt = `You are an expert Nigerian/Ghanaian curriculum education specialist creating detailed lesson notes. 
You create comprehensive, engaging lesson plans tailored to ${country || "Nigerian"} education standards.
The target audience is ${levelDescription}.
Generate content that is culturally relevant, uses local examples, and follows the approved curriculum structure.
IMPORTANT: Base your lesson note EXACTLY on the topic/content provided by the user. Do not deviate from the given topic.
CRITICAL: Do NOT use ** for bold text or any markdown formatting. Output plain text only.
${mathInstructions}`;

    const userPrompt = `Create a detailed lesson note for:

Subject: ${subject}
Class: ${classLevel}
Country: ${country || "Nigeria"}
${weekInfo ? `Week: ${weekInfo}` : ""}
Topic/Content to teach: ${fullTopicContent}

IMPORTANT: Generate the lesson note based EXACTLY on the topic/content provided above. The lesson should cover this specific topic thoroughly.

Use this EXACT format:

LESSON NOTE
============

Date: ${dateInfo || "[Today's date]"}
${weekInfo ? `\nWeek: ${weekInfo}` : ""}

Class: ${classLevel}

Subject: ${subject}

Topic: ${topic}

Sub-topic: [Generate an appropriate sub-topic based on the provided content]

Time: 40 minutes

Duration: 1 Period

Period/Day: First Period / Monday

Reference Book(s):
- [List 2-3 relevant approved textbooks for ${country || "Nigeria"}]
- ${country || "Nigeria"} National Curriculum

Instructional Material(s):
- [List 4-5 specific, relevant teaching aids for this topic]

Entry Behaviour:
[Describe what students should already know before this lesson - 2-3 sentences]

Behavioural Objectives:
By the end of this lesson, students should be able to:
1. [Specific, measurable objective using action verbs]
2. [Second objective]
3. [Third objective]
4. [Fourth objective]

Content:
[Provide comprehensive, detailed content covering:
- Clear definitions related to the topic
- Key concepts and principles from the provided topic
- Detailed explanations (at least 300 words)
- Examples relevant to ${country || "Nigerian"} context
- Important facts and figures
${isMathSubject ? "- ALL mathematical expressions must use LaTeX notation" : ""}]

Presentation in Steps:

Step I - Introduction (5 minutes):
[Detailed teacher activities and student engagement strategies]

Step II - Explanation/Development (15 minutes):
[Main teaching content with interactive elements${isMathSubject ? ", using LaTeX for all math expressions" : ""}]

Step III - Discussion/Activity (10 minutes):
[Group activities, demonstrations, or practical exercises]

Step IV - Application (5 minutes):
[How students apply what they learned]

Step V - Summary (5 minutes):
[Consolidation of key learning points]

Conclusion:
[2-3 sentences summarizing the lesson and linking to future topics]

Evaluation:
1. [Question aligned with objective 1${isMathSubject ? " - use LaTeX for any math" : ""}]
2. [Question aligned with objective 2]
3. [Question aligned with objective 3]
4. [Question aligned with objective 4]

Assignment:
1. [Take-home task 1]
2. [Take-home task 2]
3. [Research or practical task]

${additionalNotes ? `Additional Requirements: ${additionalNotes}` : ""}

---
Generated by Teacher's Aid`;

    console.log("Calling Lovable AI Gateway for lesson generation...");
    console.log("Topic:", topic);
    console.log("Week:", week);
    console.log("Is Math Subject:", isMathSubject);
    console.log("Topic content length:", fullTopicContent?.length || 0);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content;

    if (!generatedContent) {
      throw new Error("No content generated from AI");
    }

    console.log("Lesson generated successfully");

    return new Response(JSON.stringify({ 
      content: generatedContent,
      isMathSubject,
      hasLatex: isMathSubject
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-lesson function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
