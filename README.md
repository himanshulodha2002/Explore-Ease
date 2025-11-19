# ExploreEase - Comprehensive Trip Planner

ExploreEase is an innovative AI-powered chatbot designed to revolutionize the travel planning experience by using **Kruskal's algorithm** to optimize travel routes between multiple destinations and offer personalized travel recommendations based on user preferences.

## Features

- **Multi-AI Provider Support**: Choose between Ollama (local), GitHub Models (OpenAI), or Google Gemini
- **Optimized Travel Routes**: Uses Kruskal's algorithm to calculate the shortest and most efficient travel routes
- **Personalized Recommendations**: AI-powered tailored suggestions for attractions, accommodations, and dining
- **Interactive Chatbot Interface**: Real-time streaming responses with user-friendly interface
- **Interactive Map Visualization**: Live route rendering with Leaflet.js and OpenStreetMap
- **Geolocation Support**: Real-time location tracking and route updates
- **Security-First**: Built with Helmet.js, CORS, and rate limiting
- **Responsive UI**: Mobile-friendly design that works on any device

## Technology Stack

- **Frontend**: HTML5, CSS3 (with CSS Variables), JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **AI Providers**:
  - Ollama (local models)
  - GitHub Models (OpenAI API)
  - Google Gemini API
- **Mapping**: Leaflet.js, Leaflet Routing Machine, OpenStreetMap
- **Algorithms**: Kruskal's algorithm for route optimization
- **Security**: Helmet.js, CORS, Express Rate Limit

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18.0.0 or higher)
- npm (Node package manager)
- One of the following AI providers:
  - **Ollama** (local, free) - Recommended for development
  - **GitHub Token** (for GitHub Models/OpenAI)
  - **Google Gemini API Key**

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/himanshulodha2002/Explore-Ease.git
   cd Explore-Ease
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure AI Provider**

   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

   Choose your preferred AI provider and configure:

   **Option A: Ollama (Local, Free)**
   ```bash
   # Install Ollama
   curl -fsSL https://ollama.com/install.sh | sh
   ollama serve

   # In a new terminal, pull a model
   ollama pull gemma2
   ```

   Your `.env` should have:
   ```env
   AI_PROVIDER=ollama
   OLLAMA_URL=http://localhost:11434
   OLLAMA_MODEL=gemma2
   ```

   **Option B: GitHub Models (OpenAI)**

   Get a token from https://github.com/settings/tokens

   Your `.env` should have:
   ```env
   AI_PROVIDER=github
   GITHUB_TOKEN=your_github_token_here
   GITHUB_MODEL=gpt-4o-mini
   ```

   **Option C: Google Gemini**

   Get an API key from https://aistudio.google.com/app/apikey

   Your `.env` should have:
   ```env
   AI_PROVIDER=gemini
   GEMINI_API_KEY=your_api_key_here
   GEMINI_MODEL=gemini-1.5-flash
   ```

4. **Start the application**
   ```bash
   # Production
   npm start

   # Development (with auto-reload)
   npm run dev
   ```

5. **Open in browser**

   Navigate to `http://localhost:5000`

For detailed AI provider configuration, see [AI_PROVIDERS.md](./AI_PROVIDERS.md)

## Key Functionalities

- **Route Optimization**: Input multiple destinations and visualize optimized travel routes using Kruskal's algorithm
- **AI-Powered Chatbot**: Real-time streaming responses with personalized travel recommendations
- **Interactive Map**: Live route visualization with geolocation tracking
- **Multi-Provider Support**: Switch between Ollama, GitHub Models, or Gemini with a simple config change
- **Security Features**: Rate limiting, CORS protection, and secure headers

## API Endpoints

- `POST /optimize-route` - Optimize travel route based on destinations
- `GET /stream` - Server-Sent Events endpoint for AI chat streaming
- `GET /health` - Health check endpoint
- `GET /api/provider-info` - Get current AI provider configuration

## Development

### Project Structure
```
Explore-Ease/
├── app.js                 # Main server file
├── aiProviders.js         # AI provider abstraction layer
├── public/
│   ├── index.html         # Main page
│   ├── about.html         # About page
│   ├── browser-app.js     # Frontend JavaScript
│   └── style.css          # Styles with CSS variables
├── .env.example           # Environment variables template
├── AI_PROVIDERS.md        # AI provider documentation
└── package.json           # Dependencies and scripts
```

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Troubleshooting

### AI Provider Issues

Check if your provider is configured:
```bash
curl http://localhost:5000/api/provider-info
```

See [AI_PROVIDERS.md](./AI_PROVIDERS.md) for detailed troubleshooting.

## Future Enhancements

- Complete Kruskal's algorithm implementation for route optimization
- Real-time traffic and weather data integration
- Mobile application development
- Database integration for saving itineraries
- User authentication and profiles
- Multi-language support
- Enhanced ML-based recommendation engine

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Acknowledgments

- Ollama for local AI models
- GitHub Models for OpenAI API access
- Google Gemini for advanced AI capabilities
- Leaflet.js for interactive maps
- OpenStreetMap for map tiles
