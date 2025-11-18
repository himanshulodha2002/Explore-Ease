# AI Provider Configuration Guide

ExploreEase supports multiple AI providers for generating travel recommendations. Choose between Ollama (local), GitHub Models (OpenAI), or Google Gemini based on your needs.

## 📊 Quick Comparison (Updated 2024)

| Provider | Best Model | Speed | Quality | Cost | Privacy | Best Use Case |
|----------|-----------|-------|---------|------|---------|---------------|
| **Ollama** | llama3.2 | Fast | Good | Free | ✅ Local | Development, Privacy |
| **GitHub** | gpt-4o | Fast | Excellent | Free tier | ❌ Cloud | Production, Quality |
| **Gemini** | gemini-2.0-flash-exp | Very Fast | Excellent | Free tier | ❌ Cloud | Speed, Latest features |

---

## Available Providers

### 1. Ollama (Local AI) 🏠
**Best for:** Privacy, offline use, no API costs, development

**Setup:**
1. Install Ollama from https://ollama.ai
2. Pull the latest model: `ollama pull llama3.2`
3. Configure in `.env`:
```env
AI_PROVIDER=ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=500
```

**Recommended Models (Latest):**
- ⭐ `llama3.2:latest` - Meta's latest, excellent quality (1B/3B params)
- ⭐ `qwen2.5:latest` - Alibaba's latest, great multilingual support
- `gemma2:latest` - Google's latest open model, good balance
- `mistral:latest` - Mistral AI's latest, efficient
- `phi3.5:latest` - Microsoft's efficient small model
- `deepseek-r1:latest` - Deep reasoning capabilities

**Pull multiple models:**
```bash
ollama pull llama3.2
ollama pull qwen2.5
ollama pull gemma2
```

**Best Practices:**
- Use llama3.2 for best quality/size balance
- Use qwen2.5 for multilingual travel planning
- Keep Ollama updated: `ollama update`
- Monitor resource usage with: `ollama ps`

---

### 2. GitHub Models (OpenAI) 🚀
**Best for:** Production quality, latest OpenAI models, ease of setup

**Setup:**
1. Get a GitHub Personal Access Token:
   - Go to https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Select scopes: No special scopes needed for GitHub Models
   - Copy the token (save it securely!)

2. Configure in `.env`:
```env
AI_PROVIDER=github
GITHUB_TOKEN=ghp_your_token_here
GITHUB_MODEL=gpt-4o
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=500
```

**Available Models (Latest):**

**Standard Models:**
- ⭐ `gpt-4o` - OpenAI's latest flagship model (recommended for production)
  - Best quality, multimodal, fast
  - Excellent for complex travel planning
  - Temperature: 0.7-1.0 for creative suggestions

- `gpt-4o-mini` - Fast and cost-effective
  - 80% cheaper than gpt-4o
  - Good for most tasks
  - Best for high-volume applications

**Reasoning Models (NEW):**
- ⭐ `o1-preview` - Advanced reasoning capabilities
  - Best for complex route optimization
  - Slower but more accurate
  - No temperature parameter (fixed reasoning)
  - Best for multi-step planning

- `o1-mini` - Faster reasoning model
  - 80% cheaper than o1-preview
  - Good balance of speed and reasoning
  - Ideal for route calculations

**Legacy Models:**
- `gpt-4-turbo` - Previous generation, still very capable
- `gpt-3.5-turbo` - Fastest, basic capabilities

**Best Practices:**
- **For travel recommendations:** Use `gpt-4o` with temperature=0.7-0.9
- **For route optimization:** Use `o1-preview` or `o1-mini`
- **For cost savings:** Use `gpt-4o-mini` with temperature=0.7
- **For production:** Start with `gpt-4o`, fallback to `gpt-4o-mini`
- **Monitor usage:** Check rate limits at https://github.com/marketplace/models

**Rate Limits (Free Tier):**
- gpt-4o: ~15 requests/minute
- gpt-4o-mini: ~30 requests/minute
- o1-preview: ~5 requests/minute

**Pricing:** Free tier available, pay-as-you-go options
**Docs:** https://github.com/marketplace/models

---

### 3. Google Gemini ⚡
**Best for:** Fastest responses, latest Google AI, multimodal capabilities

**Setup:**
1. Get an API key:
   - Go to https://aistudio.google.com/app/apikey
   - Click "Get API Key" → "Create API key in new project"
   - Copy the key (keep it secure!)

2. Configure in `.env`:
```env
AI_PROVIDER=gemini
GEMINI_API_KEY=AIza...your_key_here
GEMINI_MODEL=gemini-2.0-flash-exp
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=500
```

**Available Models (Latest 2024):**

**Gemini 2.0 (NEW - Experimental):**
- ⭐ `gemini-2.0-flash-exp` - Latest experimental model (recommended)
  - Fastest response times
  - Excellent quality
  - Multimodal capabilities
  - Free during preview

**Gemini 1.5 (Stable):**
- `gemini-1.5-pro` - Most capable, best quality
  - 2M token context window
  - Best for complex multi-step planning
  - Supports grounding with Google Search

- ⭐ `gemini-1.5-flash` - Fast and efficient (production recommended)
  - 1M token context window
  - Great balance of speed/quality
  - Best for real-time applications

- `gemini-1.5-flash-8b` - Smallest, fastest
  - Most cost-effective
  - Good for simple queries
  - Ultra-low latency

**Best Practices:**
- **For production:** Use `gemini-2.0-flash-exp` (currently free)
- **For stability:** Use `gemini-1.5-flash` (stable, proven)
- **For complex planning:** Use `gemini-1.5-pro`
- **For high volume:** Use `gemini-1.5-flash-8b`
- **Enable safety settings:** Already configured in code
- **Use streaming:** For better UX (already enabled)
- **Temperature:** 0.7-0.9 for creative travel suggestions
- **System instructions:** Use for consistent behavior

**Safety Settings:**
- ✅ Harassment: BLOCK_MEDIUM_AND_ABOVE
- ✅ Hate speech: BLOCK_MEDIUM_AND_ABOVE
- ✅ Sexually explicit: BLOCK_MEDIUM_AND_ABOVE
- ✅ Dangerous content: BLOCK_MEDIUM_AND_ABOVE

**Rate Limits (Free Tier):**
- gemini-1.5-flash: 15 requests/minute, 1M requests/day
- gemini-1.5-pro: 2 requests/minute, 50 requests/day
- gemini-2.0-flash-exp: Generous limits during preview

**Pricing:**
- Free tier: Very generous limits
- Pay-as-you-go: $0.35-$1.25 per 1M tokens
**Docs:** https://ai.google.dev/gemini-api/docs

---

## Advanced Configuration

### Generation Parameters

Control the AI output with these optional parameters:

```env
# Temperature (0.0-2.0): Controls randomness
# - 0.0-0.3: Factual, deterministic (route calculations)
# - 0.7-0.9: Creative, varied (travel recommendations)
# - 1.0-2.0: Very creative, experimental
AI_TEMPERATURE=0.7

# Max tokens: Maximum response length
# - 200-300: Short responses
# - 500: Default, good balance
# - 1000+: Detailed itineraries
AI_MAX_TOKENS=500
```

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

## Detailed Comparison

| Feature | Ollama | GitHub (OpenAI) | Gemini |
|---------|--------|-----------------|--------|
| **Latest Model** | llama3.2 | gpt-4o / o1-preview | gemini-2.0-flash-exp |
| **Cost** | 💰 Free (always) | 💰 Free tier + $$ | 💰 Free tier + $$ |
| **Privacy** | ✅ Fully local | ❌ Cloud-based | ❌ Cloud-based |
| **Speed** | ⚡ Fast | ⚡⚡ Fast | ⚡⚡⚡ Very Fast |
| **Quality** | ⭐⭐⭐ Good | ⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐ Excellent |
| **Setup** | 🔧 Moderate | 🔧 Easy | 🔧 Easy |
| **Offline** | ✅ Yes | ❌ No | ❌ No |
| **API Key** | ❌ Not needed | ✅ Required | ✅ Required |
| **Context Window** | 8K-128K | 128K | 1M-2M |
| **Multimodal** | ✅ Some models | ✅ Yes | ✅ Yes |
| **Reasoning** | ❌ Basic | ✅ o1 models | ✅ Advanced |
| **Rate Limits** | ♾️ Unlimited | ~15-30 req/min | ~15 req/min |
| **Production Ready** | ⚠️ Development | ✅ Yes | ✅ Yes |

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

## 🎯 Model Selection Guide

### For Different Use Cases:

**🚀 Quick Prototyping & Development:**
- Provider: Ollama
- Model: llama3.2
- Why: Free, private, no API keys needed

**💼 Production Travel App:**
- Provider: Gemini
- Model: gemini-2.0-flash-exp
- Why: Fastest, free tier, excellent quality

**🎨 Creative Travel Recommendations:**
- Provider: GitHub Models
- Model: gpt-4o
- Temperature: 0.8-0.9
- Why: Best creative output, natural language

**🧮 Route Optimization & Planning:**
- Provider: GitHub Models
- Model: o1-preview or o1-mini
- Why: Advanced reasoning for complex calculations

**💰 Cost-Sensitive Applications:**
- Provider: Gemini
- Model: gemini-1.5-flash-8b
- Why: Most cost-effective, still good quality

**🌍 Multilingual Travel Planning:**
- Provider: Ollama
- Model: qwen2.5
- Why: Excellent multilingual support

**🔒 Privacy-First Applications:**
- Provider: Ollama
- Model: llama3.2
- Why: Fully local, no data leaves your server

---

## Best Practices

### 🔐 Security
1. **Never commit API keys:** Use `.env` files (already in `.gitignore`)
2. **Rotate tokens regularly:** Update GitHub tokens and Gemini keys periodically
3. **Use environment-specific keys:** Different keys for dev/staging/production
4. **Monitor for leaks:** Use tools like `git-secrets` to scan commits

### ⚡ Performance
1. **Start with faster models:** Use gpt-4o-mini or gemini-2.0-flash-exp
2. **Upgrade for quality:** Switch to gpt-4o or gemini-1.5-pro if needed
3. **Cache responses:** Implement caching for repeated queries
4. **Use streaming:** Already enabled for better UX

### 💰 Cost Optimization
1. **Development:** Always use Ollama (free, unlimited)
2. **Production:** Monitor API usage dashboards
3. **Set budgets:** Configure spending limits in API consoles
4. **Use appropriate models:** Don't use gpt-4o when gpt-4o-mini works
5. **Implement rate limiting:** Already configured (100 req/15min)

### 🎛️ Configuration Tips
1. **Temperature settings:**
   - Route calculations: 0.1-0.3
   - General chat: 0.7
   - Creative suggestions: 0.8-0.9
   - Very creative: 1.0+

2. **Max tokens:**
   - Short answers: 200-300
   - Default: 500
   - Detailed: 1000+
   - Full itineraries: 2000+

3. **Testing:**
   - Test with all three providers
   - Compare response quality
   - Measure response times
   - Monitor error rates

### 📊 Monitoring
1. **Check provider status:**
   ```bash
   curl http://localhost:5000/api/provider-info
   ```

2. **Monitor logs:** Watch for API errors and rate limits

3. **Track metrics:**
   - Response times
   - Error rates
   - API costs
   - User satisfaction

---

## Additional Resources

- Ollama: https://ollama.ai/
- GitHub Models: https://github.com/marketplace/models
- Google Gemini: https://ai.google.dev/
- OpenAI API Docs: https://platform.openai.com/docs/
