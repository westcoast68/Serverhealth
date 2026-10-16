import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import {
  getFallbackQuizQuestions,
  getFallbackDiagnostic,
  getFallbackCopilotAnswer
} from "./server/fallbackGenerator";

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

const FALLBACK_MODELS = [
  "gemini-3.7-flash",
  "gemini-2.5-flash",
  "gemini-flash-latest"
];

/**
 * Resilient helper to call Gemini with multi-model fallback and backoff retries.
 */
async function generateWithFallback(options: {
  prompt: string;
  systemInstruction?: string;
  responseMimeType?: string;
  temperature?: number;
}): Promise<string> {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error("Gemini API key is not configured");
  }

  let lastError: any = null;

  for (const model of FALLBACK_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: options.prompt,
          config: {
            systemInstruction: options.systemInstruction,
            responseMimeType: options.responseMimeType,
            temperature: options.temperature ?? 0.3,
          },
        });

        if (response.text) {
          return response.text;
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        console.warn(`[Gemini Attempt Failed] model: ${model}, attempt: ${attempt + 1}: ${errMsg}`);
        
        // If 503 (high demand) or 429 (rate limit), wait briefly before retrying or switching models
        if (errMsg.includes("503") || errMsg.includes("429") || errMsg.includes("UNAVAILABLE")) {
          await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
        } else {
          // If non-transient, try next model immediately
          break;
        }
      }
    }
  }

  throw lastError || new Error("All Gemini model attempts exhausted");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString(),
    });
  });

  // 1. AI Quiz Question Generator (Targeting Weakest Services & Specific Gaps)
  app.post("/api/aws/generate-quiz", async (req, res) => {
    const { targetServices = ["EC2", "Lambda", "ECS"], count = 3, difficulty = "Associate", focusNotes } = req.body;
    
    try {
      const prompt = `Generate ${count} realistic, high-quality scenario-based AWS certification quiz questions targeting the user's weakest AWS Compute services: ${JSON.stringify(targetServices)}.
Difficulty level: ${difficulty}.
Specific focus / gap notes: ${focusNotes || "Hit tricky Compute tradeoffs, sizing, concurrency, Auto Scaling lifecycle hooks, task definitions, Spot pricing, and Fargate security."}

Target AWS services eligible:
- Compute: EC2, Lambda, ECS

Return a JSON array of question objects matching this exact structure:
[
  {
    "id": "ai-q-1",
    "domain": "ec2_instances",
    "service": "EC2",
    "difficulty": "Associate",
    "scenario": "A company is designing...",
    "options": [
      { "id": "A", "text": "Option A text" },
      { "id": "B", "text": "Option B text" },
      { "id": "C", "text": "Option C text" },
      { "id": "D", "text": "Option D text" }
    ],
    "correctOptionId": "B",
    "explanation": "Detailed explanation of why B is correct...",
    "architectureTip": "Actionable AWS compute architectural best practice...",
    "whyWrong": {
      "A": "Why A is incorrect...",
      "C": "Why C is incorrect...",
      "D": "Why D is incorrect..."
    },
    "tags": ["EC2", "Auto Scaling", "Compute"]
  }
]`;

      const responseText = await generateWithFallback({
        prompt,
        systemInstruction: `You are an AWS Principal Solutions Architect and Senior AWS Certification Exam Author (AWS Certified Solutions Architect & DevOps Pro).
You create realistic, scenario-based exam questions that test real architectural judgment rather than simple vocabulary trivia.
Make sure every question has 4 distinct options (A, B, C, D), a crystal-clear explanation, an architecture pro-tip, and specific explanations for why each wrong option fails.
Output valid JSON only.`,
        responseMimeType: "application/json",
        temperature: 0.3,
      });

      const parsed = JSON.parse(responseText || "[]");
      if (Array.isArray(parsed) && parsed.length > 0) {
        return res.json({ questions: parsed, source: "gemini" });
      }
      throw new Error("Empty question list returned from model");
    } catch (err: any) {
      console.warn("Falling back to built-in high-yield scenario bank due to upstream AI demand:", err.message);
      // Graceful fallback to rich offline questions
      const fallbackQuestions = getFallbackQuizQuestions(targetServices, count);
      return res.json({
        questions: fallbackQuestions,
        source: "fallback",
        notice: "Generated from AWS High-Yield Scenario Engine during temporary peak AI load"
      });
    }
  });

  // 2. AI Flashcards Generator (High-Yield Contrast & Nuances)
  app.post("/api/aws/generate-flashcards", async (req, res) => {
    const { targetServices = ["EC2", "Lambda", "ECS"], count = 4, focusTopic } = req.body;

    try {
      const prompt = `Generate ${count} high-yield active-recall AWS Compute flashcards focusing on critical differences, limits, and exam traps for: ${JSON.stringify(targetServices)}.
Specific topic focus: ${focusTopic || "Contrasting EC2 vs Lambda vs ECS, scaling limits, Nitro features, Spot interruption handling, and execution environments."}

Return a JSON array of flashcard objects matching this exact structure:
[
  {
    "id": "ai-fc-1",
    "domain": "ec2_instances",
    "service": "EC2",
    "front": "EC2 Spot Instances vs On-Demand vs Savings Plans: When to use which?",
    "back": "Key points:\n• Spot: Up to 90% discount for stateless/fault-tolerant batch jobs with 2-min termination notice.\n• Savings Plans: Up to 72% discount for 1-3 yr committed continuous compute.\n• On-Demand: Full price for unpredictable, spiky, non-interruptible workloads.",
    "architectureContext": "Cost optimization and compute purchasing options.",
    "examGotcha": "Spot instances can be reclaimed at any time; never use them for stateful databases without replication.",
    "boxLevel": 1,
    "consecutiveCorrect": 0,
    "status": "new"
  }
]`;

      const responseText = await generateWithFallback({
        prompt,
        systemInstruction: `You are an AWS Master Instructor preparing students to achieve top scores in AWS Compute.
Your flashcards emphasize high-yield distinctions, gotchas, numbers/limits (e.g. 15 min Lambda timeout, 10 GB Lambda memory, 2 min EC2 Spot notice, awsvpc vs bridge mode), and architectural tradeoffs.
Output valid JSON only.`,
        responseMimeType: "application/json",
        temperature: 0.3,
      });

      const parsed = JSON.parse(responseText || "[]");
      return res.json({ flashcards: parsed, source: "gemini" });
    } catch (err: any) {
      console.warn("Generating flashcards fallback due to upstream status:", err.message);
      return res.json({
        flashcards: [
          {
            id: `offline-fc-${Date.now()}-1`,
            domain: "lambda_serverless",
            service: "Lambda",
            front: "Reserved Concurrency vs Provisioned Concurrency in AWS Lambda",
            back: "• Reserved Concurrency: Guarantees a dedicated slice of unreserved account concurrency AND sets a hard ceiling to prevent downstream database exhaustion.\n• Provisioned Concurrency: Keeps initialized execution environments warm 24/7 to eliminate cold start latency.",
            architectureContext: "Serverless concurrency scaling and latency management.",
            examGotcha: "Setting Reserved Concurrency to 0 blocks all incoming invocations for that function.",
            boxLevel: 1,
            consecutiveCorrect: 0,
            status: "new"
          },
          {
            id: `offline-fc-${Date.now()}-2`,
            domain: "ecs_fargate",
            service: "ECS",
            front: "ECS on EC2 vs AWS Fargate: What is the core architectural differentiator?",
            back: "• Fargate: Serverless container compute engine where AWS manages VM provisioning, kernel patching, and cluster scaling with task-level VM boundary isolation.\n• ECS on EC2: Customer manages and patches the underlying EC2 host instances, Docker daemon, and ECS agent.",
            architectureContext: "Container orchestration management model.",
            examGotcha: "Fargate does not allow GPU instances, EC2 daemon services, or privileged container flags.",
            boxLevel: 1,
            consecutiveCorrect: 0,
            status: "new"
          },
          {
            id: `offline-fc-${Date.now()}-3`,
            domain: "ec2_instances",
            service: "EC2",
            front: "EC2 Spot Instances: How much advance warning is given before termination?",
            back: "AWS provides a 2-minute interruption notice via Amazon CloudWatch Events / EventBridge and the EC2 Instance Metadata Service (IMDS) at http://169.254.169.254/latest/meta-data/spot/instance-action.",
            architectureContext: "Fault-tolerant distributed compute architecture.",
            examGotcha: "Spot Rebalance Recommendation events provide earlier signals before the 2-minute mark.",
            boxLevel: 1,
            consecutiveCorrect: 0,
            status: "new"
          }
        ],
        source: "fallback",
        notice: "Generated from AWS High-Yield Compute Flashcard Engine during peak AI load"
      });
    }
  });

  // 3. AI Deep Gap Diagnostic & Real-Time Prescription
  app.post("/api/aws/gap-diagnostic", async (req, res) => {
    const { userProgress } = req.body;

    try {
      const prompt = `Analyze this student's real-time AWS Core Fundamentals performance data and generate a surgical, gap-targeting diagnostic report and study prescription:
User Performance State:
${JSON.stringify(userProgress, null, 2)}

Return a single JSON object matching this structure:
{
  "overallReadinessScore": 680,
  "readinessVerdict": "Moderate Gap Risk",
  "topWeaknesses": [
    {
      "service": "VPC",
      "domain": "networking",
      "estimatedGap": "Struggling with stateless NACL return rules and NAT Gateway placement in public subnets.",
      "suggestedFocus": "Drill public vs private route tables and Security Group vs NACL statefulness."
    }
  ],
  "topStrengths": [
    {
      "service": "IAM",
      "domain": "security",
      "mastery": "Strong grasp of IAM Roles, STS temporary credentials, and policy evaluation logic."
    }
  ],
  "strategicPrescription": [
    "1. Stop reviewing IAM and S3 Standard—your mastery is solid.",
    "2. Dedicate 20 minutes to VPC routing and NAT Gateway architecture.",
    "3. Practice EFS vs EBS Multi-Attach scenarios."
  ],
  "targetedActionPlan": "Detailed paragraph explaining the fastest path to 85%+ exam readiness by eliminating the top 3 gap areas."
}`;

      const responseText = await generateWithFallback({
        prompt,
        systemInstruction: `You are an elite AWS Training Architect and Exam Coach.
Analyze the user's lowest-scoring services, mistake patterns, and study recency to provide an honest, hyper-actionable, gap-closing study prescription.
Score scale is 100 to 1000 (720 is the official AWS passing threshold).
Output valid JSON only.`,
        responseMimeType: "application/json",
        temperature: 0.2,
      });

      const parsed = JSON.parse(responseText || "{}");
      return res.json({ report: parsed, source: "gemini" });
    } catch (err: any) {
      console.warn("Serving diagnostic fallback due to upstream demand:", err.message);
      const fallbackReport = getFallbackDiagnostic(userProgress);
      return res.json({
        report: fallbackReport,
        source: "fallback",
        notice: "Diagnostic calculated via Real-Time Mathematical Engine"
      });
    }
  });

  // 4. AWS Cloud Architect Copilot Q&A / Tradeoff Clarifier
  app.post("/api/aws/architecture-ask", async (req, res) => {
    const { question, currentContext } = req.body;

    try {
      const prompt = `Student AWS Question: "${question}"
Context: Current Domain/Service focus: ${JSON.stringify(currentContext || {})}

Provide a concise, ultra-clear explanation with:
1. Direct Answer & Core Rule
2. Key Architectural Comparison / Tradeoff Table or Bullet Points
3. AWS Exam Tip / Gotcha (how this appears on real certification exams)
4. Memory Anchor (a simple trick to remember it forever)`;

      const responseText = await generateWithFallback({
        prompt,
        systemInstruction: `You are an AWS Principal Solutions Architect & Master Cloud Educator.
Explain concepts clearly, precisely, and concisely. Use formatting like bullet points, markdown bolding, and code blocks where helpful.
Always connect theory to actual exam question scenarios.`,
        temperature: 0.2,
      });

      return res.json({ reply: responseText || "No response generated.", source: "gemini" });
    } catch (err: any) {
      console.warn("Serving copilot fallback due to upstream demand:", err.message);
      const fallbackReply = getFallbackCopilotAnswer(question || "");
      return res.json({
        reply: fallbackReply,
        source: "fallback"
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AWS Mastery Engine Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();

