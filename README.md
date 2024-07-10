# Steps to Run

1. Clone the repository.
2. Ensure you have Node.js installed.
3. Change directory (cd) into the main folder.
4. Run `npm install` to install dependencies.
5. Setup Ollama server:
   - Run the following commands in your terminal:
     ```
     curl -fsSL https://ollama.com/install.sh | sh
     ollama serve
     ```
   - In a new terminal, run:
     ```
     ollama pull gemma2
     ```
6. Run `npm start` to start the application.
