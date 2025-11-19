# Quick Start Guide - AI Provider Setup

Choose your AI provider and follow the steps:

## 🚀 Option 1: Ollama (Recommended for Development)

**Fastest setup for local development**

```bash
# 1. Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 2. Start Ollama server
ollama serve

# 3. Pull the latest model (in new terminal)
ollama pull llama3.2

# 4. Configure .env
cp .env.example .env
# Edit .env and set:
# AI_PROVIDER=ollama
# OLLAMA_MODEL=llama3.2

# 5. Start the app
npm run dev
```

**✅ You're done!** Open http://localhost:5000

---

## ⚡ Option 2: Google Gemini (Fastest Responses)

**Best for production - latest Gemini 2.0**

```bash
# 1. Get API key
# Visit: https://aistudio.google.com/app/apikey
# Click: "Get API Key" → "Create API key in new project"
# Copy the key

# 2. Configure .env
cp .env.example .env
# Edit .env and set:
# AI_PROVIDER=gemini
# GEMINI_API_KEY=your_api_key_here
# GEMINI_MODEL=gemini-2.0-flash-exp

# 3. Start the app
npm run dev
```

**✅ Done!** You're using Gemini 2.0 (experimental, free)

---

## 🎯 Option 3: GitHub Models (Best Quality)

**Latest OpenAI GPT-4o with GitHub token**

```bash
# 1. Get GitHub token
# Visit: https://github.com/settings/tokens
# Click: "Generate new token (classic)"
# Scopes: No special scopes needed
# Copy the token

# 2. Configure .env
cp .env.example .env
# Edit .env and set:
# AI_PROVIDER=github
# GITHUB_TOKEN=ghp_your_token_here
# GITHUB_MODEL=gpt-4o

# 3. Start the app
npm run dev
```

**✅ Done!** You're using GPT-4o

---

## 📊 Which Should I Choose?

| Scenario | Provider | Model | Why |
|----------|----------|-------|-----|
| **Just trying it out** | Ollama | llama3.2 | No API key needed |
| **Building a demo** | Ollama | llama3.2 | Free, private |
| **Production app (speed)** | Gemini | gemini-2.0-flash-exp | Fastest |
| **Production app (quality)** | GitHub | gpt-4o | Best quality |
| **Privacy required** | Ollama | llama3.2 | Local only |
| **Multilingual** | Ollama | qwen2.5 | Best multilingual |
| **Route optimization** | GitHub | o1-mini | Best reasoning |

---

## 🔍 Verify Setup

```bash
# Check which provider is active
curl http://localhost:5000/api/provider-info

# Should return:
# {
#   "provider": "ollama",
#   "model": "llama3.2",
#   "configured": true,
#   "url": "http://localhost:11434"
# }
```

---

## 🎛️ Advanced Configuration

Add to your `.env` file:

```env
# Control creativity (0.0 = factual, 1.0 = creative)
AI_TEMPERATURE=0.7

# Max response length
AI_MAX_TOKENS=500
```

**Temperature guide:**
- `0.1-0.3`: Route calculations, factual
- `0.7`: Default, balanced
- `0.8-0.9`: Creative travel suggestions

---

## 🆘 Troubleshooting

### Ollama not working?
```bash
# Check if Ollama is running
ollama list

# If not installed, install it
curl -fsSL https://ollama.com/install.sh | sh

# Pull the model
ollama pull llama3.2
```

### Gemini errors?
- Check API key at https://aistudio.google.com/app/apikey
- Ensure no extra spaces in .env
- Check quota limits (very generous free tier)

### GitHub Models errors?
- Verify token at https://github.com/settings/tokens
- Token should start with `ghp_`
- No special scopes needed

---

## 📚 More Information

See [AI_PROVIDERS.md](./AI_PROVIDERS.md) for:
- Complete model list
- Best practices
- Rate limits
- Pricing
- Detailed troubleshooting
