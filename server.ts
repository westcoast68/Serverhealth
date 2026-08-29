import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

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
    try {
      const { targetServices, count = 3, difficulty = "Associate", focusNotes } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.status(503).json({
          error: "Gemini API key is not configured in server environment.",
        });
      }

      const prompt = `Generate ${count} realistic, high-quality scenario-based AWS certification quiz questions targeting the user's weakest AWS services: ${JSON.stringify(targetServices || ["VPC", "EFS", "KMS"])}.
Difficulty level: ${difficulty}.
Specific focus / gap notes: ${focusNotes || "Hit tricky architecture tradeoffs, limits, security gotchas, and multi-service design patterns."}

Target AWS services eligible:
- Compute: EC2, Lambda, ECS
- Storage: S3, EBS, EFS
- Networking: VPC, Route 53, CloudFront
- Database: RDS, DynamoDB
- Security: IAM, KMS
- Management: CloudWatch, CloudTrail

Return a JSON array of question objects matching this exact structure:
[
  {
    "id": "ai-q-1",
    "domain": "networking",
    "service": "VPC",
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
    "architectureTip": "Actionable AWS architectural best practice...",
    "whyWrong": {
      "A": "Why A is incorrect...",
      "C": "Why C is incorrect...",
      "D": "Why D is incorrect..."
    },
    "tags": ["VPC", "Subnets", "Security"]
  }
]`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          systemInstruction: `You are an AWS Principal Solutions Architect and Senior AWS Certification Exam Author (AWS Certified Solutions Architect & DevOps Pro).
You create realistic, scenario-based exam questions that test real architectural judgment rather than simple vocabulary trivia.
Make sure every question has 4 distinct options (A, B, C, D), a crystal-clear explanation, an architecture pro-tip, and specific explanations for why each wrong option fails.
Output valid JSON only.`,
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      const parsed = JSON.parse(response.text || "[]");
      res.json({ questions: parsed });
    } catch (err: any) {
      console.error("Generate Quiz Error:", err);
      res.status(500).json({
        error: err.message || "Failed to generate AWS quiz questions.",
      });
    }
  });

  // 2. AI Flashcards Generator (High-Yield Contrast & Nuances)
  app.post("/api/aws/generate-flashcards", async (req, res) => {
    try {
      const { targetServices, count = 4, focusTopic } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.status(503).json({
          error: "Gemini API key is not configured in server environment.",
        });
      }

      const prompt = `Generate ${count} high-yield active-recall AWS flashcards focusing on critical differences, limits, and exam traps for: ${JSON.stringify(targetServices || ["EBS", "EFS", "S3", "KMS"])}.
Specific topic focus: ${focusTopic || "Contrasting similar AWS services, hard limits, and security best practices."}

Return a JSON array of flashcard objects matching this exact structure:
[
  {
    "id": "ai-fc-1",
    "domain": "storage",
    "service": "EFS",
    "front": "When should you choose Amazon EFS over EBS and S3?",
    "back": "Key points:\n• EFS: Multi-AZ POSIX Linux NFS file system mounted concurrently by 1000s of EC2/Lambda.\n• EBS: Single AZ raw block volume for a single EC2.\n• S3: Global REST API object storage for media/static files.",
    "architectureContext": "Shared storage across Availability Zones.",
    "examGotcha": "EFS is for Linux only; use FSx for Windows File Server on Windows.",
    "boxLevel": 1,
    "consecutiveCorrect": 0,
    "status": "new"
  }
]`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          systemInstruction: `You are an AWS Master Instructor preparing students to achieve top scores.
Your flashcards emphasize high-yield distinctions, gotchas, numbers/limits (e.g. 15 min Lambda timeout, 11 9s durability, 5 reserved IPs in VPC subnet), and architectural tradeoffs.
Output valid JSON only.`,
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      const parsed = JSON.parse(response.text || "[]");
      res.json({ flashcards: parsed });
    } catch (err: any) {
      console.error("Generate Flashcards Error:", err);
      res.status(500).json({
        error: err.message || "Failed to generate AWS flashcards.",
      });
    }
  });

  // 3. AI Deep Gap Diagnostic & Real-Time Prescription
  app.post("/api/aws/gap-diagnostic", async (req, res) => {
    try {
      const { userProgress } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.status(503).json({
          error: "Gemini API key is not configured in server environment.",
        });
      }

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

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          systemInstruction: `You are an elite AWS Training Architect and Exam Coach.
Analyze the user's lowest-scoring services, mistake patterns, and study recency to provide an honest, hyper-actionable, gap-closing study prescription.
Score scale is 100 to 1000 (720 is the official AWS passing threshold).
Output valid JSON only.`,
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json({ report: parsed });
    } catch (err: any) {
      console.error("Gap Diagnostic Error:", err);
      res.status(500).json({
        error: err.message || "Failed to generate gap diagnostic report.",
      });
    }
  });

  // 4. AWS Cloud Architect Copilot Q&A / Tradeoff Clarifier
  app.post("/api/aws/architecture-ask", async (req, res) => {
    try {
      const { question, currentContext } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.status(503).json({
          error: "Gemini API key is not configured in server environment.",
        });
      }

      const prompt = `Student AWS Question: "${question}"
Context: Current Domain/Service focus: ${JSON.stringify(currentContext || {})}

Provide a concise, ultra-clear explanation with:
1. Direct Answer & Core Rule
2. Key Architectural Comparison / Tradeoff Table or Bullet Points
3. AWS Exam Tip / Gotcha (how this appears on real certification exams)
4. Memory Anchor (a simple trick to remember it forever)`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          systemInstruction: `You are an AWS Principal Solutions Architect & Master Cloud Educator.
Explain concepts clearly, precisely, and concisely. Use formatting like bullet points, markdown bolding, and code blocks where helpful.
Always connect theory to actual exam question scenarios.`,
          temperature: 0.2,
        },
      });

      res.json({ reply: response.text || "No response generated." });
    } catch (err: any) {
      console.error("Architect Ask Error:", err);
      res.status(500).json({
        error: err.message || "Failed to answer AWS architecture question.",
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

