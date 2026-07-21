/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { BlogPost } from "./src/types";

const app = express();
const PORT = 3000;
const POSTS_FILE = path.join(process.cwd(), "src", "posts.json");
const BLOG_ASSETS_DIR = path.join(process.cwd(), "blog-assets");

// Ensure blog-assets directory exists
if (!fs.existsSync(BLOG_ASSETS_DIR)) {
  fs.mkdirSync(BLOG_ASSETS_DIR, { recursive: true });
}

// Middleware to parse JSON
app.use(express.json({ limit: '15mb' }));

// Serve static blog assets
app.use("/blog-assets", express.static(BLOG_ASSETS_DIR));

// Helper to load posts
function loadPosts(): BlogPost[] {
  try {
    if (!fs.existsSync(POSTS_FILE)) {
      fs.writeFileSync(POSTS_FILE, JSON.stringify([], null, 2), "utf8");
      return [];
    }
    const data = fs.readFileSync(POSTS_FILE, "utf8");
    return JSON.parse(data) as BlogPost[];
  } catch (err) {
    console.error("Error loading posts:", err);
    return [];
  }
}

// Helper to save posts
function savePosts(posts: BlogPost[]) {
  try {
    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), "utf8");
  } catch (err) {
    console.error("Error saving posts:", err);
  }
}

// API Routes
app.get("/api/posts", (req, res) => {
  const posts = loadPosts();
  res.json(posts);
});

app.post("/api/posts", (req, res) => {
  try {
    const newPost: BlogPost = req.body;
    if (!newPost.id || !newPost.title || !newPost.category) {
       res.status(400).json({ error: "Missing required fields (id, title, category)" });
       return;
    }
    
    const posts = loadPosts();
    const index = posts.findIndex(p => p.id === newPost.id);
    if (index >= 0) {
      posts[index] = newPost;
    } else {
      posts.unshift(newPost); // Add newest at start
    }
    savePosts(posts);
    res.json({ success: true, post: newPost });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/posts/:id", (req, res) => {
  try {
    const { id } = req.params;
    const posts = loadPosts();
    const filtered = posts.filter(p => p.id !== id);
    savePosts(filtered);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Blog Assets management APIs
app.get("/api/posts/:slug/assets", (req, res) => {
  try {
    const { slug } = req.params;
    const postDir = path.join(BLOG_ASSETS_DIR, slug);
    if (!fs.existsSync(postDir)) {
      fs.mkdirSync(postDir, { recursive: true });
    }
    const files = fs.readdirSync(postDir);
    const assets = files.map(file => {
      const filePath = path.join(postDir, file);
      const stats = fs.statSync(filePath);
      const ext = path.extname(file).toLowerCase();
      let type = "file";
      if ([".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"].includes(ext)) {
        type = "image";
      } else if ([".js", ".ts", ".py", ".sh", ".json", ".txt", ".csv"].includes(ext)) {
        type = "code";
      }
      return {
        name: file,
        size: stats.size,
        type,
        url: `/blog-assets/${slug}/${file}`,
        updatedAt: stats.mtime
      };
    });
    res.json(assets);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/posts/:slug/assets", (req, res) => {
  try {
    const { slug } = req.params;
    const { filename, content } = req.body;
    if (!filename || !content) {
       res.status(400).json({ error: "Missing required fields (filename, content)" });
       return;
    }
    const postDir = path.join(BLOG_ASSETS_DIR, slug);
    if (!fs.existsSync(postDir)) {
      fs.mkdirSync(postDir, { recursive: true });
    }
    const filePath = path.join(postDir, filename);
    const buffer = Buffer.from(content, "base64");
    fs.writeFileSync(filePath, buffer);

    const stats = fs.statSync(filePath);
    const ext = path.extname(filename).toLowerCase();
    let type = "file";
    if ([".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"].includes(ext)) {
      type = "image";
    } else if ([".js", ".ts", ".py", ".sh", ".json", ".txt", ".csv"].includes(ext)) {
      type = "code";
    }

    res.json({
      success: true,
      asset: {
        name: filename,
        size: stats.size,
        type,
        url: `/blog-assets/${slug}/${filename}`,
        updatedAt: stats.mtime
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/posts/:slug/assets/:filename", (req, res) => {
  try {
    const { slug, filename } = req.params;
    const filePath = path.join(BLOG_ASSETS_DIR, slug, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Asset not found" });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// AI Threat Intel Assistant Copilot endpoint
app.post("/api/gemini/assist", async (req, res) => {
  try {
    const { action, text, context } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({ error: "Gemini API key is not configured in this workspace's Secrets panel." });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    let systemPrompt = "You are a professional security researcher and scientific writer, assisting in drafting markdown technical blogs.";
    let promptText = "";

    if (action === "summarize") {
      systemPrompt = "You are a threat intelligence analyst summarizing complex technical research. Write a concise, 2-3 sentence high-impact executive summary/abstract of the technical text provided. Keep it clinical, authoritative, and direct.";
      promptText = `Provide an executive summary for this article text:\n\n${text}`;
    } else if (action === "generate-outline") {
      systemPrompt = "You are a lead security researcher. Draft a pristine, highly structured Markdown research blog outline for a new threat or research paper. Include standard sections like Executive Summary, Technical Deep Dive, Exploit Flow, MITRE ATT&CK Mapping, and Indicators of Compromise (IoCs).";
      promptText = `Draft an exhaustive technical blog outline for: "${text}". Context or raw notes:\n\n${context || "No extra context provided."}`;
    } else if (action === "extract-iocs") {
      systemPrompt = `You are a cyber threat intelligence parser. Examine the provided raw logs, incident report, or text and extract Indicators of Compromise (IoCs). Return ONLY a JSON list matching the schema array: { type: "sha256" | "md5" | "ip" | "domain" | "url", value: string, description: string }. Do not include any other conversational text or markdown formatting outside the JSON array itself.`;
      promptText = `Extract IoCs from this raw technical text:\n\n${text}`;
    } else if (action === "mitre-map") {
      systemPrompt = `You are a threat analyst mapping adversary behavior to the MITRE ATT&CK framework. Examine the text and identify standard MITRE techniques. Return ONLY a JSON list matching the schema array: { tactic: string, technique: string, id: string } (e.g. { tactic: "Execution", technique: "Command and Scripting Interpreter", id: "T1059" }). Avoid formatting outside the JSON block.`;
      promptText = `Identify MITRE ATT&CK techniques in this description or script:\n\n${text}`;
    } else {
      res.status(400).json({ error: "Invalid assistant action" });
       return;
    }

    // Call Gemini
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
        // If it requires structured JSON, request it
        responseMimeType: (action === "extract-iocs" || action === "mitre-map") ? "application/json" : "text/plain",
      },
    });

    res.json({ output: response.text });
  } catch (err: any) {
    console.error("Gemini assistant error:", err);
    res.status(500).json({ error: err.message || "An error occurred in the Gemini Copilot" });
  }
});

// Vite Middleware & Static Serves
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite HMR middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode serving static client build...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully listening on http://localhost:${PORT}`);
  });
}

startServer();
