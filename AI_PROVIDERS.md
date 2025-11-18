# AI Provider Configuration Guide

ExploreEase now supports multiple AI providers for generating travel recommendations. You can easily switch between Ollama (local), GitHub Models (OpenAI), and Google Gemini.

## Available Providers

### 1. Ollama (Local AI)
**Best for:** Privacy, offline use, no API costs

**Setup:**
1. Install Ollama from https://ollama.ai
2. Pull a model: `ollama pull gemma2`
3. Configure in `.env`:
```env
AI_PROVIDER=ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=gemma2
```

**Supported Models:**
- `gemma2` (recommended)
- `llama3.2`
- `mistral`
- `phi3`
- And many more from https://ollama.ai/library

---

### 2. GitHub Models (OpenAI)
**Best for:** High-quality responses, ease of setup

**Setup:**
1. Get a GitHub Personal Access Token:
   - Go to https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Select scopes (no special scopes needed)
   - Copy the token

2. Configure in `.env`:
```env
AI_PROVIDER=github
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_MODEL=gpt-4o-mini
```

**Available Models:**
- `gpt-4o` - Most capable, slower
- `gpt-4o-mini` - Fast and cost-effective (recommended)
- `gpt-3.5-turbo` - Fastest, basic capabilities
- `gpt-4-turbo` - Advanced reasoning

**Pricing:** Free tier available with rate limits
**Docs:** https://github.com/marketplace/models

---

### 3. Google Gemini
**Best for:** Latest Google AI, good balance of speed and quality

**Setup:**
1. Get an API key:
   - Go to https://aistudio.google.com/app/apikey
   - Click "Create API Key"
   - Copy the key

2. Configure in `.env`:
```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash
```

**Available Models:**
- `gemini-1.5-pro` - Most capable, advanced reasoning
- `gemini-1.5-flash` - Fast and efficient (recommended)
- `gemini-pro` - Previous generation

**Pricing:** Free tier available with daily limits
**Docs:** https://ai.google.dev/

---

## Configuration

### Environment Variables

Create a `.env` file in the root directory (use `.env.example` as template):

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# AI Provider Selection
AI_PROVIDER=ollama  # Change to: ollama, github, or gemini

# Provider-specific settings (configure based on your choice)
# ... see provider sections above
```

### Switching Providers

1. Edit your `.env` file
2. Change `AI_PROVIDER` to your desired provider
3. Ensure the corresponding API keys/configuration are set
4. Restart the server: `npm run dev`

### Checking Current Provider

The server logs show the current provider on startup:
```
✅ Server is running on http://localhost:5000
📍 Environment: development
🤖 AI Provider: ollama
📦 Model: gemma2
```

You can also check via API:
```bash
curl http://localhost:5000/api/provider-info
```

Response:
```json
{
  "provider": "ollama",
  "model": "gemma2",
  "configured": true,
  "url": "http://localhost:11434"
}
```

---

## Comparison

| Feature | Ollama | GitHub Models | Gemini |
|---------|--------|---------------|--------|
| **Cost** | Free | Free tier + paid | Free tier + paid |
| **Privacy** | ✅ Fully local | ❌ Cloud-based | ❌ Cloud-based |
| **Speed** | Fast | Fast | Very Fast |
| **Quality** | Good | Excellent | Excellent |
| **Setup** | Moderate | Easy | Easy |
| **Offline** | ✅ Yes | ❌ No | ❌ No |
| **API Key** | ❌ Not needed | ✅ Required | ✅ Required |

---

## Troubleshooting

### Ollama Issues

**Error: "Cannot connect to Ollama"**
- Ensure Ollama is running: `ollama serve`
- Check the URL in `.env` matches your Ollama instance
- Verify the model is installed: `ollama list`

### GitHub Models Issues

**Error: "GitHub Models client not initialized"**
- Check `GITHUB_TOKEN` is set in `.env`
- Verify token has not expired
- Ensure no extra spaces in the token

**Error: "Rate limit exceeded"**
- You've hit the free tier limit
- Wait for the rate limit to reset (usually 1 hour)
- Consider upgrading to a paid plan

### Gemini Issues

**Error: "Gemini client not initialized"**
- Check `GEMINI_API_KEY` is set in `.env`
- Verify API key is valid at https://aistudio.google.com
- Ensure no extra spaces in the key

**Error: "Resource exhausted"**
- You've hit the daily quota
- Wait until quota resets (usually 24 hours)
- Check your quota at https://aistudio.google.com/app/apikey

---

## Best Practices

1. **Development:** Use Ollama for local development (privacy + no costs)
2. **Production:** Use GitHub Models or Gemini for better quality
3. **Keep secrets safe:** Never commit `.env` to version control
4. **Monitor usage:** Check your API usage regularly to avoid surprise costs
5. **Test switching:** Ensure your app works with all providers before deploying

---

## Additional Resources

- Ollama: https://ollama.ai/
- GitHub Models: https://github.com/marketplace/models
- Google Gemini: https://ai.google.dev/
- OpenAI API Docs: https://platform.openai.com/docs/
