# Expense Tracker App

This is an expense tracking application built with Nuxt. Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## LLM Integration with Ollama

This project uses Large Language Models (LLMs) with Ollama for intelligent features:

### Setup Ollama

1. Install Ollama from the [official website](https://ollama.ai)

2. Pull the model you want to use:

```bash
# Example: Pull Llama 2 model
ollama pull llama2

# Or for a smaller model
ollama pull mistral
```

3. Ollama will automatically start a local server to serve the model on `http://localhost:11434`.

4. Ensure the Ollama server is running before starting the Nuxt app.

### Using LLM Features

The app leverages LLM capabilities for:

- Smart expense categorization suggestions
- Natural language processing for expense descriptions
- Chatbot assistance for budget planning

Configure LLM settings in the app settings panel.

### Note from Dev

>For now, the app is designed to be a simple yet effective expense tracker with potential for future enhancements using AI capabilities.
So im using LLM with minimal features for now like `llama3.2:1b` or `gemma3:1b` models, which are lightweight and suitable for basic tasks.

This project is a work in progress. The LLM features are experimental and may require further tuning based on your specific use case. Feel free to contribute or suggest improvements!

