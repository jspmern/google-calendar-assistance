# Google Calendar AI Assistant

## Overview

This project is an AI-powered assistant for interacting with Google Calendar using natural language queries. Built with Node.js and TypeScript, it leverages LangChain and LangGraph for orchestrating conversational AI workflows, integrated with Google's Calendar API for event management. The assistant can retrieve, create, and delete calendar events based on user inputs, making it a practical tool for personal or professional calendar management.

The core idea is to provide a seamless, conversational interface where users can ask questions like "Do I have any meetings tomorrow?" or "Schedule a meeting with John at 3 PM," and the AI handles the logic, API calls, and responses automatically. It's designed to be extensible, secure, and production-ready, with proper error handling and authentication.

This assistant uses a state graph (via LangGraph) to manage conversation flow, ensuring that tool calls (e.g., API requests) are executed conditionally and responses are generated intelligently. It's not just a simple chatbot; it's a full-fledged agent that can perform actions on your behalf.

## Features

- **Natural Language Interaction**: Query your calendar in plain English, e.g., "What's on my schedule today?" or "Create an event for tomorrow at 10 AM."
- **Event Management**: Supports fetching, creating, and deleting calendar events.
- **Time Zone Awareness**: Handles local time zones and converts dates appropriately.
- **Conversational Memory**: Uses LangGraph's checkpointer for maintaining context across interactions.
- **Secure Authentication**: Integrates with Google OAuth 2.0 for API access.
- **Terminal-Based Interface**: Interactive CLI for real-time queries.
- **Error Handling**: Graceful handling of API failures, authentication issues, and invalid inputs.
- **Extensible Architecture**: Easy to add more tools or integrate with other APIs.
- **Industry-Ready Practices**: Includes input validation with Zod, environment variable management, and modular code structure.

## Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (version 18 or higher): Required for running the TypeScript code.
- **npm** or **yarn**: For package management.
- **Google Cloud Account**: To set up OAuth credentials for Google Calendar API.
- **TypeScript**: The project is written in TypeScript, so ensure it's installed globally (`npm install -g typescript`).

You'll also need to enable the Google Calendar API and set up OAuth 2.0 credentials in the Google Cloud Console. This involves creating a project, enabling the API, and generating client ID/secret.

## Installation

1. **Clone or Download the Repository**:
   - Navigate to your desired directory and clone the project:
     ```
     git clone https://github.com/yourusername/google-calendar-ai-assistant.git
     cd google-calendar-ai-assistant
     ```
     (Replace with your actual repo URL if hosted.)

2. **Install Dependencies**:
   - Run the following command to install all required packages:
     ```
     npm install
     ```
     This will install libraries like `@langchain/groq`, `@langchain/langgraph`, `googleapis`, `zod`, and others as defined in [`package.json`](package.json).

3. **Set Up Environment Variables**:
   - Create a [`.env`](.env) file in the root directory.
   - Add your Google OAuth credentials and other secrets:
     ```
     GOOGLE_CLIENT_ID=your_google_client_id
     GOOGLE_CLIENT_SECRET=your_google_client_secret
     GROQ_API_KEY=your_groq_api_key
     ```
     - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: Obtained from Google Cloud Console after setting up OAuth 2.0.
     - `GROQ_API_KEY`: Your API key from Groq for accessing the LLM model.

## Setup

### Google OAuth Configuration

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Enable the Google Calendar API.
4. Create OAuth 2.0 credentials (Client ID and Secret).
5. Set up the redirect URI (e.g., `http://localhost:3000/oauth2callback` if using a web server for auth).
6. In your code, you'll need to handle the OAuth flow to obtain an access token. The project assumes you have a way to get the token (e.g., via a separate auth script). For production, consider using a library like `google-auth-library` to manage tokens securely.

### Authentication Flow

The project uses Google's OAuth 2.0 for secure access. Here's a high-level overview:

- The user is redirected to Google's consent screen.
- After approval, an authorization code is exchanged for an access token.
- The access token is used in API requests.

In the code, the `tools.ts` file (assumed to handle API calls) should include token management. For example:

```typescript
import { google } from 'googleapis';

const auth = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/oauth2callback'
);

// Set credentials (access token)
auth.setCredentials({ access_token: 'your_access_token' });

const calendar = google.calendar({ version: 'v3', auth });
```

Ensure tokens are refreshed automatically to avoid expiration. For a complete OAuth flow, you might need additional code to handle the redirect and token exchange.

## Usage

1. **Build the Project**:
   - Compile TypeScript to JavaScript:
     ```
     npx tsc
     ```

2. **Run the Assistant**:
   - Execute the main script:
     ```
     node dist/index.js
     ```
     (Assuming your output directory is `dist`.)

3. **Interact via Terminal**:
   - The CLI will prompt: "Enter your query (or 'bye' to exit):"
   - Example interactions:
     - Input: "Do I have any meetings tomorrow?"
       - Output: Assistant fetches events and responds accordingly.
     - Input: "Create a meeting with himanshu@gmail.com at 2 PM tomorrow."
       - Output: Assistant creates the event and confirms.
     - Input: "bye"
       - Output: "Goodbye!" and exits.

The assistant uses a while loop to keep the session active until "bye" is entered.

## Project Structure

```
google-calendar/
├── src/
│   ├── index.ts          # Main entry point: Sets up LangGraph, LLM, and CLI loop.
│   ├── app.ts            # Additional app logic if needed.
│   ├── tool/
│   │   └── tools.ts      # Defines calendar tools (get, create, delete events).
│   └── credential.json   # OAuth credentials (ensure not committed).
├── package.json          # Dependencies and scripts.
├── tsconfig.json         # TypeScript configuration.
├── .env                  # Environment variables (not committed).
├── see.js                # Utility script.
└── README.md             # This file.
```

- **`index.ts`**: Initializes the LangGraph state graph, binds tools to the LLM, and runs the interactive loop. It defines nodes for model calls and tool execution.
- **`tools.ts`**: Contains the actual Google Calendar API integrations. Each tool is a function that takes parameters (e.g., via Zod schemas) and performs API calls.
- **`credential.json`**: Stores OAuth credentials securely.

## How It Works (In Depth)

### Architecture

The project uses **LangGraph** for state management in conversational AI. LangGraph is a framework for building agents with graphs, where nodes represent actions (e.g., calling the LLM or executing tools), and edges define flow based on conditions.

- **State Graph**: Defined in `index.ts`, it has nodes for "callModel" (invokes the LLM) and "tools" (executes API calls). Edges route based on whether tool calls are present.
- **LLM Integration**: Uses `ChatGroq` from LangChain, bound with tools. The model (e.g., "openai/gpt-oss-120b") generates responses and decides when to call tools.
- **Tools**: Custom functions for calendar operations. Each tool has a Zod schema for input validation.

### Conversation Flow

1. User inputs a query.
2. System message (including current date/time and timezone) is prepended.
3. LLM processes the message and may output tool calls (e.g., `getCalendarEvents`).
4. If tool calls exist, the graph routes to the "tools" node, executing the API.
5. Tool results are fed back to the LLM for a final response.
6. Output is displayed, and the loop continues.

Example Code Snippet from `index.ts`:

```typescript
const whereToGoNext = async (state) => {
  const lastMessage = state.messages[state.messages.length - 1];
  if (lastMessage.tool_calls?.length) {
    return "tools";
  }
  return "__end__";
};

const graph = new StateGraph(MessagesAnnotation)
  .addNode("callModel", callModel)
  .addNode("tools", toolNodes)
  .addEdge("__start__", "callModel")
  .addConditionalEdges("callModel", whereToGoNext, {
    __end__: END,
    tools: "tools"
  })
  .addEdge("tools", "callModel");

const agent = graph.compile({ checkpointer });
```

### Tools Explanation

- **getCalendarEvents**: Fetches events from Google Calendar. Parameters: `timeMin`, `timeMax`, `q` (search query). Returns a list of events or an error message.
- **createCalendarEvent**: Creates a new event. Parameters: `summary`, `start`, `end`, `attendees`, etc.
- **deleteCalendarEvent**: Deletes an event by ID.

Each tool uses the `googleapis` library. For example, in `tools.ts`:

```typescript
import { google } from 'googleapis';

export const getCalendarEvents = async (params: { timeMin?: string; timeMax?: string; q?: string }) => {
  const calendar = google.calendar({ version: 'v3', auth: /* your auth */ });
  try {
    const response = await calendar.events.list({
      calendarId: 'primary',
      ...params,
    });
    return response.data.items;
  } catch (error) {
    return "Error fetching events.";
  }
};
```

### Error Handling and Best Practices

- **Authentication Errors**: As seen in your logs, ensure valid tokens. Implement token refresh.
- **API Limits**: Google Calendar has quotas; handle rate limits with retries.
- **Input Validation**: Use Zod schemas to validate tool inputs, preventing invalid API calls.
- **Security**: Never commit `.env` or `credential.json` files. Use environment variables for secrets.
- **Logging**: Add console logs or a logger (e.g., Winston) for debugging.
- **Testing**: Write unit tests for tools using Jest or Mocha.
- **Performance**: For large calendars, paginate API responses.

## Improvements and Additions

To make this industry-ready, consider:
- **Web Interface**: Replace CLI with a web app using Express.js and a frontend (e.g., React).
- **Database Integration**: Store conversation history in MongoDB or PostgreSQL for multi-session memory.
- **Multi-User Support**: Allow multiple users with separate auth and isolated calendars.
- **Advanced Features**: Add reminders, recurring events, or integration with other tools like email (Gmail API).
- **Deployment**: Use Docker for containerization and deploy to AWS/Heroku/Vercel.
- **Monitoring**: Integrate with tools like Sentry for error tracking and analytics.
- **CI/CD**: Set up GitHub Actions for automated testing and deployment.
- **Documentation**: Add API docs with Swagger if exposing endpoints.

## Troubleshooting

- **401 Unauthorized**: Check OAuth tokens; they may have expired. Refresh them.
- **Empty Events List**: Verify time ranges and search queries. Ensure events exist in the specified period.
- **Build Errors**: Ensure TypeScript is configured correctly and all dependencies are installed.
- **LLM Errors**: Check your Groq API key and model availability.

## Contributing

Contributions are welcome! Fork the repo, make changes, and submit a pull request. Ensure code follows TypeScript best practices and includes tests.

## License

This project is licensed under the MIT License. See LICENSE file for details.

---

This README provides a comprehensive guide. If you need clarifications or additions, feel free to ask!