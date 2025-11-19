/**
 * AI Provider Abstraction Layer
 * Supports multiple AI providers: Ollama, GitHub Models (OpenAI), and Google Gemini
 */

const axios = require("axios");
const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ============================================================
// CONFIGURATION
// ============================================================

const AI_PROVIDER = process.env.AI_PROVIDER || "ollama";

// Ollama Configuration
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";

// GitHub Models Configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_MODEL = process.env.GITHUB_MODEL || "gpt-4o";

// Gemini Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash-exp";

// Generation Parameters
const TEMPERATURE = parseFloat(process.env.AI_TEMPERATURE) || 0.7;
const MAX_TOKENS = parseInt(process.env.AI_MAX_TOKENS) || 500;

// ============================================================
// PROVIDER INITIALIZATION
// ============================================================

let githubClient = null;
let geminiClient = null;

// Initialize GitHub Models client
if (AI_PROVIDER === "github" && GITHUB_TOKEN) {
  githubClient = new OpenAI({
    baseURL: "https://models.inference.ai.azure.com",
    apiKey: GITHUB_TOKEN,
  });
}

// Initialize Gemini client
if (AI_PROVIDER === "gemini" && GEMINI_API_KEY) {
  geminiClient = new GoogleGenerativeAI(GEMINI_API_KEY);
}

// ============================================================
// OLLAMA PROVIDER
// ============================================================

/**
 * Stream response from Ollama
 * @param {string} userMessage - User's message
 * @param {Function} onChunk - Callback for each chunk
 * @param {Function} onError - Error callback
 * @param {Function} onComplete - Completion callback
 */
async function streamOllama(userMessage, onChunk, onError, onComplete) {
  const postData = {
    model: OLLAMA_MODEL,
    messages: [
      {
        role: "user",
        content: userMessage,
      },
    ],
    stream: true,
  };

  try {
    const response = await axios.post(`${OLLAMA_URL}/api/chat`, postData, {
      headers: {
        "Content-Type": "application/json",
      },
      responseType: "stream",
      timeout: 30000,
    });

    response.data.on("data", (chunk) => {
      try {
        const parsedChunk = JSON.parse(chunk.toString());
        if (parsedChunk.message && parsedChunk.message.content) {
          onChunk(parsedChunk.message.content);
        }
        if (parsedChunk.done) {
          onComplete();
        }
      } catch (parseError) {
        console.error("Failed to parse Ollama chunk:", parseError.message);
      }
    });

    response.data.on("error", (error) => {
      console.error("Ollama stream error:", error.message);
      onError(error);
    });
  } catch (error) {
    console.error("Ollama API error:", error.message);
    if (error.code === "ECONNREFUSED") {
      onError(new Error("Cannot connect to Ollama. Please ensure Ollama is running."));
    } else {
      onError(error);
    }
  }
}

// ============================================================
// GITHUB MODELS (OpenAI) PROVIDER
// ============================================================

/**
 * Stream response from GitHub Models (OpenAI API)
 * @param {string} userMessage - User's message
 * @param {Function} onChunk - Callback for each chunk
 * @param {Function} onError - Error callback
 * @param {Function} onComplete - Completion callback
 */
async function streamGitHubModels(userMessage, onChunk, onError, onComplete) {
  if (!githubClient) {
    onError(new Error("GitHub Models client not initialized. Please set GITHUB_TOKEN."));
    return;
  }

  try {
    // Check if using reasoning models (o1-preview, o1-mini)
    const isReasoningModel = GITHUB_MODEL.startsWith("o1");

    const requestParams = {
      model: GITHUB_MODEL,
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
      stream: true,
      max_tokens: MAX_TOKENS,
    };

    // Reasoning models don't support temperature parameter
    if (!isReasoningModel) {
      requestParams.temperature = TEMPERATURE;
    }

    const stream = await githubClient.chat.completions.create(requestParams);

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        onChunk(content);
      }

      // Check if stream is done
      if (chunk.choices[0]?.finish_reason === "stop") {
        onComplete();
      }
    }
  } catch (error) {
    console.error("GitHub Models API error:", error.message);
    if (error.status === 429) {
      onError(new Error("Rate limit exceeded. Please wait before trying again."));
    } else if (error.status === 401) {
      onError(new Error("Invalid GitHub token. Please check your GITHUB_TOKEN."));
    } else {
      onError(error);
    }
  }
}

// ============================================================
// GOOGLE GEMINI PROVIDER
// ============================================================

/**
 * Stream response from Google Gemini
 * @param {string} userMessage - User's message
 * @param {Function} onChunk - Callback for each chunk
 * @param {Function} onError - Error callback
 * @param {Function} onComplete - Completion callback
 */
async function streamGemini(userMessage, onChunk, onError, onComplete) {
  if (!geminiClient) {
    onError(new Error("Gemini client not initialized. Please set GEMINI_API_KEY."));
    return;
  }

  try {
    const model = geminiClient.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        temperature: TEMPERATURE,
        maxOutputTokens: MAX_TOKENS,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    });

    const result = await model.generateContentStream(userMessage);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        onChunk(chunkText);
      }
    }

    onComplete();
  } catch (error) {
    console.error("Gemini API error:", error.message);

    // Handle specific Gemini errors
    if (error.message?.includes("quota")) {
      onError(new Error("Gemini API quota exceeded. Please check your quota limits."));
    } else if (error.message?.includes("API key")) {
      onError(new Error("Invalid Gemini API key. Please check your GEMINI_API_KEY."));
    } else if (error.message?.includes("safety")) {
      onError(new Error("Content was blocked by Gemini safety filters."));
    } else {
      onError(error);
    }
  }
}

// ============================================================
// UNIFIED PROVIDER INTERFACE
// ============================================================

/**
 * Stream AI response from the configured provider
 * @param {string} userMessage - User's message
 * @param {Function} onChunk - Callback for each chunk of text
 * @param {Function} onError - Error callback
 * @param {Function} onComplete - Completion callback
 */
async function streamAIResponse(userMessage, onChunk, onError, onComplete) {
  console.log(`Using AI provider: ${AI_PROVIDER}`);

  switch (AI_PROVIDER.toLowerCase()) {
    case "ollama":
      await streamOllama(userMessage, onChunk, onError, onComplete);
      break;

    case "github":
      await streamGitHubModels(userMessage, onChunk, onError, onComplete);
      break;

    case "gemini":
      await streamGemini(userMessage, onChunk, onError, onComplete);
      break;

    default:
      onError(
        new Error(
          `Unknown AI provider: ${AI_PROVIDER}. Valid options are: ollama, github, gemini`
        )
      );
  }
}

/**
 * Get current AI provider configuration
 * @returns {Object} Provider configuration details
 */
function getProviderInfo() {
  const info = {
    provider: AI_PROVIDER,
    model: null,
    configured: false,
  };

  switch (AI_PROVIDER.toLowerCase()) {
    case "ollama":
      info.model = OLLAMA_MODEL;
      info.configured = true;
      info.url = OLLAMA_URL;
      break;

    case "github":
      info.model = GITHUB_MODEL;
      info.configured = !!GITHUB_TOKEN;
      info.url = "https://models.inference.ai.azure.com";
      break;

    case "gemini":
      info.model = GEMINI_MODEL;
      info.configured = !!GEMINI_API_KEY;
      break;
  }

  return info;
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  streamAIResponse,
  getProviderInfo,
  AI_PROVIDER,
};
