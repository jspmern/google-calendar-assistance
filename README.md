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
- **LangSmith Observability**: Full tracing and monitoring of LLM calls, tool executions, and agent decisions with detailed analytics and debugging capabilities.
- **Production Monitoring**: Real-time insights into agent performance, latency, and errors.
- **Industry-Ready Practices**: Includes input validation with Zod, environment variable management, and modular code structure.

## Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (version 18 or higher): Required for running the TypeScript code.
  - Verify installation: `node --version`
- **npm** or **yarn**: For package management.
  - Verify installation: `npm --version`
- **Google Cloud Account**: To set up OAuth credentials for Google Calendar API.
  - Free tier available: [https://console.cloud.google.com](https://console.cloud.google.com)
- **TypeScript**: The project is written in TypeScript, so ensure it's installed globally.
  - Install: `npm install -g typescript`
- **Git**: For version control and cloning the repository.
- **LangSmith Account** (Optional but Recommended): For observability and debugging.
  - Free tier available: [https://smith.langchain.com](https://smith.langchain.com)

You'll also need to:
- Enable the Google Calendar API in your Google Cloud project.
- Set up OAuth 2.0 credentials (Client ID and Secret).
- Create a LangSmith API key for observability (optional).

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
     ```env
     # Google OAuth Configuration
     GOOGLE_CLIENT_ID=your_google_client_id
     GOOGLE_CLIENT_SECRET=your_google_client_secret
     GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback

     # Groq API Configuration
     GROQ_API_KEY=your_groq_api_key

     # LangSmith Configuration (Optional but recommended)
     LANGSMITH_API_KEY=your_langsmith_api_key
     LANGSMITH_PROJECT=google-calendar-assistant
     LANGSMITH_TRACING=true

     # Application Configuration
     NODE_ENV=development
     LOG_LEVEL=info
     ```
     - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: Obtained from Google Cloud Console after setting up OAuth 2.0.
     - `GROQ_API_KEY`: Your API key from Groq for accessing the LLM model.
     - `LANGSMITH_API_KEY`: Your API key from LangSmith for observability (optional).
     - `LANGSMITH_PROJECT`: Project name in LangSmith (optional).
     - `LANGSMITH_TRACING`: Enable/disable LangSmith tracing (optional).

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
│   ├── index.ts                 # Main entry point: LangGraph setup, CLI loop, LangSmith init
│   ├── app.ts                   # Additional app logic if needed
│   ├── tool/
│   │   └── tools.ts             # Calendar tools (get, create, delete, edit events)
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces and types
│   ├── utils/
│   │   ├── auth.ts              # Google OAuth authentication utilities
│   │   ├── langsmith.ts         # LangSmith configuration and tracing
│   │   └── logger.ts            # Centralized logging utility
│   ├── config/
│   │   └── constants.ts         # Application constants and configuration
│   └── credential.json          # OAuth credentials (ensure not committed)
├── dist/                        # Compiled JavaScript output (generated)
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── .env                         # Environment variables (not committed)
├── .env.example                 # Template for environment variables
├── .env.example                 # Template for environment variables
├── .gitignore                   # Git ignore rules
├── see.js                       # Utility script
└── README.md                    # This file
```

### File Descriptions

- **[`src/index.ts`](src/index.ts)**: The main application entry point. Sets up the LangGraph state graph, initializes the LLM with bound tools, manages the interactive terminal loop, and initializes LangSmith for observability.

- **[`src/tool/tools.ts`](src/tool/tools.ts)**: Contains the actual Google Calendar API integrations. Each tool (getCalendarEvents, createCalendarEvent, deleteCalendarEvent, editCalendarEvent) is defined here with Zod schemas for input validation and proper error handling.

- **[`src/types/index.ts`](src/types/index.ts)**: TypeScript interfaces for type safety, including message types, event schemas, and API response types.

- **[`src/utils/auth.ts`](src/utils/auth.ts)**: Handles Google OAuth authentication, token refresh, and credential management with automatic token renewal.

- **[`src/utils/langsmith.ts`](src/utils/langsmith.ts)**: Configures LangSmith tracing for observability and debugging, including custom metrics and trace generation.

- **[`src/utils/logger.ts`](src/utils/logger.ts)**: Centralized logging utility with different log levels (debug, info, warn, error) for consistent application logging.

- **[`src/config/constants.ts`](src/config/constants.ts)**: Application-wide constants including API limits, validation rules, error messages, and default configurations.

- **[`src/credential.json`](src/credential.json)**: Stores OAuth credentials securely (ensure not committed to version control).

## How It Works (In Depth)

### Architecture

The project uses **LangGraph** for state management in conversational AI and **LangSmith** for comprehensive observability. LangGraph is a framework for building agents with graphs, where nodes represent actions (e.g., calling the LLM or executing tools), and edges define flow based on conditions.

- **State Graph**: Defined in `index.ts`, it has nodes for "callModel" (invokes the LLM) and "tools" (executes API calls). Edges route based on whether tool calls are present.
- **LLM Integration**: Uses `ChatGroq` from LangChain, bound with tools. The model (e.g., "openai/gpt-oss-120b") generates responses and decides when to call tools.
- **Tools**: Custom functions for calendar operations. Each tool has a Zod schema for input validation and comprehensive error handling.
- **LangSmith Observability**: All interactions are automatically traced, providing detailed insights into LLM calls, tool executions, and agent performance.
- **Authentication Manager**: Handles Google OAuth token refresh and credential management automatically.
- **Centralized Logging**: Structured logging with different levels for debugging and monitoring.

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
- **editCalendarEvent**: Updates existing events with new details.

Each tool uses the `googleapis` library with proper authentication and error handling.

### Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          User Interface (CLI)                           │
│                  Prompt: "Enter your query (or 'bye')"                  │
└──────────────────────────────────────────┬──────────────────────────────┘
                                           │
                    ┌──────────────────────▼──────────────────┐
                    │   Input Validation & Processing        │
                    │   - Check for "bye" command             │
                    │   - Validate input not empty            │
                    │   - Log to LangSmith                    │
                    └──────────────────────┬──────────────────┘
                                           │
    ┌──────────────────────────────────────▼──────────────────────────────┐
    │                    LangGraph State Management                        │
    │  ┌──────────────────────────────────────────────────────────────┐   │
    │  │              Message State (MessagesAnnotation)             │   │
    │  │  - System message (context, timezone, current date/time)   │   │
    │  │  - User messages                                            │   │
    │  │  - AI responses and tool calls                              │   │
    │  │  - Tool results                                             │   │
    │  └──────────────────────────────────────────────────────────────┘   │
    └──────────────────────────────────────────┬───────────────────────────┘
                                               │
              ┌────────────────────────────────▼────────────────────────┐
              │            START: callModel Node                         │
              │  ┌──────────────────────────────────────────────────┐   │
              │  │  LLM Call (ChatGroq)                            │   │
              │  │  - Process all messages                         │   │
              │  │  - Decide if tool call needed                  │   │
              │  │  - Generate response or tool invocation        │   │
              │  │  - LangSmith traces this step                  │   │
              │  └──────────────────────────────────────────────────┘   │
              └────────────────────────────────────┬────────────────────┘
                                                   │
                         ┌─────────────────────────▼──────────────────┐
                         │   whereToGoNext: Routing Decision          │
                         │   if (lastMessage.tool_calls?.length) {    │
                         │     return "tools"                         │
                         │   } else {                                 │
                         │     return "__end__"                       │
                         │   }                                        │
                         └──────┬──────────────────────────┬──────────┘
                                │                          │
                   ┌────────────▼────────────┐  ┌─────────▼────────────┐
                   │   TO TOOLS NODE         │  │   TO END             │
                   └────────────┬────────────┘  │   (Return Response)  │
                                │               └─────────────────────┘
                                │
                   ┌────────────▼──────────────────────────────────┐
                   │       tools Node: Execute Tool Call          │
                   │  ┌──────────────────────────────────────┐    │
                   │  │  ToolNode Processing                │    │
                   │  │  - Identify which tool to call      │    │
                   │  │  - Extract parameters               │    │
                   │  │  - Validate with Zod schema         │    │
                   │  │  - Call appropriate function:       │    │
                   │  │    • getCalendarEvents()            │    │
                   │  │    • createCalendarEvent()          │    │
                   │  │    • deleteCalendarEvent()          │    │
                   │  │    • editCalendarEvent()            │    │
                   │  │  - Capture result                   │    │
                   │  │  - Wrap in ToolMessage              │    │
                   │  │  - LangSmith logs tool execution    │    │
                   │  └──────────────────────────────────────┘    │
                   └────────────┬─────────────────────────────────┘
                                │
                   ┌────────────▼──────────────────────────────────┐
                   │   Google Calendar API Integration            │
                   │  ┌──────────────────────────────────────┐    │
                   │  │  Authentication Manager              │    │
                   │  │  - OAuth2Client setup                │    │
                   │  │  - Automatic token refresh           │    │
                   │  │  - Credential validation             │    │
                   │  │                                     │    │
                   │  │  API Calls                           │    │
                   │  │  - calendar.events.list()           │    │
                   │  │  - calendar.events.insert()         │    │
                   │  │  - calendar.events.delete()         │    │
                   │  │  - calendar.events.update()         │    │
                   │  └──────────────────────────────────────┘    │
                   └────────────┬─────────────────────────────────┘
                                │
                   ┌────────────▼──────────────────────────────────┐
                   │   Return to callModel with Tool Result       │
                   │   - Add ToolMessage to state                 │
                   │   - LangSmith records result                 │
                   └────────────┬─────────────────────────────────┘
                                │
                   ┌────────────▼──────────────────────────────────┐
                   │   Second LLM Call (callModel again)          │
                   │  - Now has tool result in messages           │
                   │  - Generates final response to user          │
                   │  - LangSmith traces this step too            │
                   └────────────┬─────────────────────────────────┘
                                │
                   ┌────────────▼──────────────────────────────────┐
                   │   whereToGoNext (second time)                │
                   │  - No more tool_calls                        │
                   │  - Returns "__end__"                         │
                   └────────────┬─────────────────────────────────┘
                                │
                   ┌────────────▼──────────────────────────────────┐
                   │   Final Response to User                     │
                   │   - Display: "Assistant: [response]"         │
                   │   - LangSmith logs complete trace            │
                   │   - Loop back to input prompt                │
                   └────────────────────────────────────────────────┘
```

### State Transitions

```
START
  │
  ├─→ callModel ─→ LLM generates response
  │       │
  │       ├─→ No tool calls? ──→ __end__ ──→ Return response
  │       │
  │       └─→ Has tool calls? ──→ tools ──→ Execute API
  │                                  │
  │                                  └─→ callModel ──→ Process result
  │                                         │
  │                                         └─→ whereToGoNext
  │                                              │
  │                                              └─→ __end__ ──→ Return
  │
END
```

### Error Handling and Best Practices

- **Authentication Errors**: As seen in your logs, ensure valid tokens. Implement token refresh.
- **API Limits**: Google Calendar has quotas; handle rate limits with retries.
- **Input Validation**: Use Zod schemas to validate tool inputs, preventing invalid API calls.
- **Security**: Never commit `.env` or `credential.json` files. Use environment variables for secrets.
- **Logging**: Add console logs or a logger (e.g., Winston) for debugging.
- **Testing**: Write unit tests for tools using Jest or Mocha.
- **Performance**: For large calendars, paginate API responses.

## LangSmith Integration

### What is LangSmith?

LangSmith is an enterprise-grade platform by LangChain for debugging, testing, and monitoring LLM applications. It provides:

- **Tracing**: Detailed logs of all LLM calls, including inputs, outputs, and intermediate steps.
- **Debugging**: Visual debugging interface to understand agent behavior.
- **Monitoring**: Production monitoring with performance metrics.
- **Testing**: Automated testing and evaluation of LLM responses.
- **Analytics**: Insights into token usage, latency, and error rates.

### Why We Use LangSmith

1. **Observability**: See exactly what's happening inside your AI agent at each step.
2. **Debugging**: When something goes wrong, you can see the exact inputs and outputs that led to the issue.
3. **Performance Monitoring**: Track latency, token usage, and costs in production.
4. **Optimization**: Identify bottlenecks and optimize prompts/tools based on real usage data.
5. **Error Tracking**: Automatically capture and track errors with full context.
6. **Evaluation**: Test your agent against benchmark datasets to ensure quality.
7. **Collaboration**: Share traces with team members for collaborative debugging.
8. **Compliance**: Maintain audit trails of all AI interactions for governance.

### Setting Up LangSmith

#### Create a LangSmith Account

1. Go to [LangSmith](https://smith.langchain.com)
2. Sign up for a free account (GitHub or Google authentication available)
3. Once logged in, go to the **Settings** page
4. Click on **API Keys** and create a new API key
5. Copy the API key

#### Configure LangSmith in Your Project

Add the LangSmith API key to your [`.env`](.env) file:

```env
LANGSMITH_API_KEY=your_langsmith_api_key
LANGSMITH_PROJECT=google-calendar-assistant
LANGSMITH_TRACING=true
```

LangSmith will automatically start tracing when these environment variables are set.

### Using LangSmith

#### View Traces in LangSmith Dashboard

1. Go to [https://smith.langchain.com](https://smith.langchain.com)
2. Navigate to your project
3. Click on "Traces"
4. You'll see all interactions with detailed information:
   - Input prompt
   - LLM model and parameters
   - Tool calls made
   - Output generated
   - Latency
   - Token usage
   - Cost

#### Example Trace Visualization

```
Trace: User Query → Calendar Check
├── Input Message
│   └── role: user
│       content: "Do I have any meetings tomorrow with himanshu@gmail.com?"
├── LLM Call (callModel node)
│   ├── Model: openai/gpt-oss-120b
│   ├── Temperature: 0
│   ├── Tokens Used: 364 input, 195 output
│   ├── Latency: 2.4s
│   └── Tool Calls: [getCalendarEvents]
├── Tool Execution (tools node)
│   ├── Tool: getCalendarEvents
│   ├── Parameters:
│   │   ├── timeMin: 2026-03-16T00:00:00Z
│   │   ├── timeMax: 2026-03-16T23:59:59Z
│   │   └── q: himanshu@gmail.com
│   ├── Result: No events found
│   └── Latency: 0.8s
└── Final Response
    ├── Content: "You don't have any meetings scheduled for tomorrow..."
    ├── Total Tokens: 800
    └── Total Latency: 3.3s
```

#### Creating Custom Evaluations

```typescript
import { evaluateRun } from "langsmith/evaluation";

// Evaluate if the response was correct
async function evaluateResponse(run, example) {
  const response = run.outputs.output;
  const expected = example.outputs.expected_output;

  return {
    score: response === expected ? 1.0 : 0.0,
    feedback: `Response: ${response}`,
  };
}
```

#### Monitoring in Production

LangSmith automatically captures:

- **Response Time**: How long each request takes
- **Error Rate**: Percentage of failed requests
- **Token Usage**: Total tokens consumed per day/month
- **Cost**: Estimated API costs based on token usage
- **User Feedback**: Manual feedback ratings on responses

You can set up alerts for:
- High latency (e.g., if response time > 5 seconds)
- High error rate (e.g., if > 5% of requests fail)
- Unusual token usage (e.g., spike in usage)

### Advanced LangSmith Features

#### A/B Testing

Compare different prompts or models:

```typescript
// Test version A
const modelA = new ChatGroq({ model: "model-v1" });

// Test version B
const modelB = new ChatGroq({ model: "model-v2" });

// LangSmith tracks which performs better
```

#### Custom Metrics

```typescript
import { Client } from "langsmith";

const client = new Client();

await client.create_feedback(
  run_id,
  "calendar_accuracy",
  score=0.9,
  feedback_source="user"
);
```

#### Batch Evaluation

Test your agent against a dataset:

```typescript
import { evaluate } from "langsmith/evaluation";

const results = await evaluate(
  agent,
  testDataset,
  {
    evaluators: [accuracy_evaluator, latency_evaluator],
  }
);
```

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

### Issue: "No events found" when you know you have events

**Root Causes**:
1. **Time zone mismatch**: Query uses UTC, but your events are in local time
2. **Search query too specific**: `q` parameter doesn't match event titles
3. **Date range incorrect**: `timeMin`/`timeMax` don't cover the event

**Debugging Steps**:

1. Check LangSmith traces to see exact query sent:
   - Go to LangSmith dashboard
   - Find the trace for getCalendarEvents
   - Review the parameters passed

2. Test directly with Google API:

```typescript
const calendar = google.calendar({ version: "v3", auth });
const response = await calendar.events.list({
  calendarId: "primary",
  maxResults: 20, // Get more results
  // Don't add q parameter first
});
console.log("All events:", response.data.items);
```

3. Verify timezone handling:

```typescript
console.log("Local timezone:", Intl.DateTimeFormat().resolvedOptions().timeZone);
console.log("Query timeMin (UTC):", timeMin);
console.log("Query timeMax (UTC):", timeMax);
```

### Issue: "Permission denied" errors

**Debugging**:

```typescript
try {
  const events = await calendar.events.list({...});
} catch (error) {
  if (error.status === 403) {
    console.error("Permissions issue:");
    console.error("- Verify calendar ID:", "primary");
    console.error("- Check OAuth scopes in Google Cloud Console");
    console.error("- Ensure calendar.events scope is added");
  }
}
```

### Issue: LangSmith not recording traces

**Checklist**:
- [ ] LANGSMITH_API_KEY is set in .env
- [ ] LANGSMITH_TRACING=true in .env
- [ ] LANGSMITH_PROJECT is set (optional but recommended)
- [ ] API key is valid (test on LangSmith dashboard)
- [ ] Network connectivity to smith.langchain.com

**Test Connection**:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" https://api.smith.langchain.com/healthz
```

### Issue: Out of memory or slow responses

**Debugging**:

```typescript
// Monitor message history growth
console.log(`Current messages: ${state.messages.length}`);
console.log(`Memory used: ${process.memoryUsage().heapUsed / 1024 / 1024} MB`);

// Implement message pruning
if (state.messages.length > 100) {
  // Keep only recent messages
  state.messages = state.messages.slice(-50);
}
```

### Common Issues and Solutions

- **401 Unauthorized**: Check OAuth tokens; they may have expired. Refresh them.
- **Empty Events List**: Verify time ranges and search queries. Ensure events exist in the specified period.
- **Build Errors**: Ensure TypeScript is configured correctly and all dependencies are installed.
- **LLM Errors**: Check your Groq API key and model availability.
- **Rate Limiting**: Google Calendar API has quotas. Implement exponential backoff.
- **Token Expiration**: Use the authentication manager for automatic token refresh.
- **Invalid Parameters**: Check Zod validation errors in LangSmith traces.



## 🚀 Why We Use Langfuse

This project integrates **Langfuse** to **monitor, debug, and analyze** our AI agent built using **LangGraph**.

### ✅ Purpose

Langfuse helps us:

* Track **user requests (traces)**
* Monitor **LLM calls (generations)**
* Debug **tool usage & agent flow**
* Measure **latency & performance**
* Analyze **token usage & cost**

👉 Without Langfuse → debugging AI is guesswork
👉 With Langfuse → full visibility of execution

---

## 🧠 Key Concepts

| Concept    | Meaning              |
| ---------- | -------------------- |
| Trace      | Full user request    |
| Span       | Step inside workflow |
| Generation | LLM call             |

---

## ⚙️ Why Langfuse Instead of Only LangSmith?

### Comparison

| Feature               | LangSmith      | Langfuse      |
| --------------------- | -------------- | ------------- |
| Best for              | LangChain apps | Any AI system |
| Open Source           | ❌              | ✅             |
| Self-hosting          | ❌              | ✅             |
| Production Monitoring | Good           | Excellent     |
| Flexibility           | Limited        | High          |

---

## 🧩 Why We Chose Langfuse

* Works with **custom LangGraph workflows**
* Supports **OpenTelemetry (OTEL)**
* Enables **production-grade monitoring**
* Can be **self-hosted**
* Tracks **entire agent lifecycle**

---

## 🛠️ Langfuse Integration in This Project

We use **two methods together**:

### 1️⃣ OpenTelemetry (Automatic Tracing)

```js
import { NodeSDK } from "@opentelemetry/sdk-node";
import { LangfuseSpanProcessor } from "@langfuse/otel";

const sdk = new NodeSDK({
  spanProcessors: [new LangfuseSpanProcessor()],
});

sdk.start();
```

### What this does:

* Automatically captures:

  * function execution
  * async operations
  * internal spans
* Sends all traces to Langfuse

---

### 2️⃣ LangChain Callback Handler

```js
import { CallbackHandler } from "@langfuse/langchain";

const langfuseHandler = new CallbackHandler({
  sessionId: "user-session-123",
  userId: "user-abc",
  tags: ["langchain-test"],
});
```

### What this does:

* Tracks:

  * LLM calls
  * tool usage
  * prompts & responses
* Links everything to a **user session**

---

## 🔗 Where It Is Used in Code

```js
const response = await agent.invoke(
  {
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: userInput },
    ],
  },
  {
    configurable: { thread_id: "1" },
    recursionLimit: 50,
    callbacks: [langfuseHandler], // 👈 important
  }
);
```

### Explanation

* `callbacks: [langfuseHandler]`

  * Sends all LangChain/LangGraph events to Langfuse

* `thread_id`

  * Groups conversation into one trace

* `recursionLimit`

  * Prevents infinite loops in agent

---

## 🔄 What Gets Tracked

For each user query:

```text
Trace (User Request)
 ├── LLM Call (Generation)
 ├── Tool Call (Span)
 ├── Tool Response
 └── Final Answer
```

---

## 📊 What You See in Langfuse Dashboard

* ✅ Full request traces
* ✅ Tool execution flow
* ✅ Prompt & response logs
* ✅ Latency per step
* ✅ Token usage
* ✅ Errors

---

## 📈 Example Flow (This Project)

```text
User Input
   ↓
callModel (LLM)
   ↓
Tool Decision
   ↓
Tool Execution
   ↓
LLM Final Response
```

👉 Every step is tracked as an **observation**

---

## 🎯 Advantages of Langfuse

* 🔍 Deep debugging of AI workflows
* ⚡ Performance monitoring (latency)
* 💰 Cost tracking (tokens)
* 🧠 Better prompt optimization
* 🏗 Works with any architecture
* 🔐 Self-hosting support

---

## 🧠 Summary

```text
LangSmith → Debug LangChain apps
Langfuse → Monitor & scale AI systems
```

👉 In this project, Langfuse helps us:

* understand agent behavior
* debug tool calls
* improve performance

---

## 📌 Final Note

Langfuse is essential for **production AI systems**, especially when using:

* custom agents
* LangGraph workflows
* tool-based architectures

---





## Contributing

Contributions are welcome! Fork the repo, make changes, and submit a pull request. Ensure code follows TypeScript best practices and includes tests.

## License

This project is licensed under the MIT License. See LICENSE file for details.

---

This README provides a comprehensive guide. If you need clarifications or additions, feel free to ask!