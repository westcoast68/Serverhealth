import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
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

  // AI SysAdmin Copilot & Troubleshooting Assistant endpoint
  app.post("/api/sysadmin/copilot", async (req, res) => {
    try {
      const { prompt, contextType, systemState, errorLogs } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.status(503).json({
          error: "Gemini API key is not configured in server environment.",
        });
      }

      let systemInstruction = `You are a Senior Principal Systems Engineer, Linux Foundation Certified Engineer (LFCE), and Windows Server Enterprise Architect.
Your goal is to provide precise, hardened, production-grade advice to IT system administrators.
Your areas of expertise:
1. Server Patching (Debian/Ubuntu apt, RHEL/Rocky/Fedora dnf/yum, SUSE zypper, Arch pacman, Windows Server WSUS/SCCM/PSWindowsUpdate).
2. Application Installation & Services (systemd units, NGINX, Apache, PostgreSQL, MySQL, Redis, Docker, Podman, K8s, HAProxy, WireGuard, Fail2ban, UFW, SELinux, AppArmor).
3. Linux/Windows troubleshooting, kernel diagnostics, package conflict resolution, maintenance window automation, rollback playbooks, zero-downtime rolling upgrades.

Formatting rules:
- Always format code blocks clearly with the shell name (e.g. \`\`\`bash, \`\`\`powershell, \`\`\`ini, \`\`\`yaml).
- Include safety warnings (e.g. "Run snapshot before applying", "Verify port binding with \`ss -tulpn\`").
- Provide both short-term remediation commands and root-cause analysis.
- Be direct, professional, and practical.`;

      let contents = prompt;
      if (contextType === "log-diagnostic" && errorLogs) {
        contents = `[LOG DIAGNOSTIC REQUEST]
Please analyze this server error/patching log:
\`\`\`
${errorLogs}
\`\`\`
User Query: ${prompt || "Analyze the error, explain root cause, and provide exact fix steps."}`;
      } else if (contextType === "patch-advisory") {
        contents = `[PATCH ADVISORY]
Target System: ${JSON.stringify(systemState || {})}
Advisory Query: ${prompt}`;
      } else if (contextType === "deploy-script") {
        contents = `[AUTOMATION / DEPLOY SCRIPT GENERATION]
Task: ${prompt}
Target OS & Stack: ${JSON.stringify(systemState || {})}`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.2,
        },
      });

      res.json({
        reply: response.text || "No response generated.",
      });
    } catch (err: any) {
      console.error("Gemini Copilot Error:", err);
      res.status(500).json({
        error: err.message || "Failed to generate SysAdmin advice",
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
    console.log(`SysAdmin Server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
