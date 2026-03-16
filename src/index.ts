
import { ChatGroq } from "@langchain/groq"
import { ToolNode } from "@langchain/langgraph/prebuilt";
import z from "zod"
import dotenv from "dotenv"
import { END, MemorySaver, MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { createCalendarEvent, deleteCalendarEvent, getCalendarEvents } from "./tool/tools.ts";
import * as readline from 'readline';
 
dotenv.config()
const checkpointer = new MemorySaver();


 const whereToGoNext=async(state)=>{
    const lastMessage = state.messages[state.messages.length - 1];
   if (lastMessage.tool_calls?.length) {
    // If there are tool calls, route to the "tools" node to execute them
    return "tools";
  }
  return "__end__";
 }
const tools = [getCalendarEvents, createCalendarEvent,deleteCalendarEvent]
const toolNodes= new ToolNode(tools)
const llm = new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature: 0,
    maxRetries: 2,
}).bindTools(tools)

//custom tools
const callModel=async(state)=>{
const result = await llm.invoke(state.messages);
  return { messages: [result] };
}

//creating the custom graph for handling calendar related queries
const graph=new StateGraph(MessagesAnnotation)
.addNode("callModel", callModel)
.addNode("tools", toolNodes)
.addEdge("__start__", "callModel")
.addConditionalEdges("callModel", whereToGoNext,{
    __end__: END,
    tools: "tools"
})
.addEdge("tools", "callModel")

const agent=graph.compile({ checkpointer })

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
async function main()
{
      const systemMessage = `You are a calendar assistant. Use the provided tools to handle user queries about calendar events. After using a tool, provide a clear final response to the user and treat time in localtimezone.
             date and time is :${new Date().toISOString().split('.')[0]}
             time zone is : ${Intl.DateTimeFormat().resolvedOptions().timeZone}`;
             while (true) {
    const userInput = await new Promise<string>((resolve) => {
      rl.question('Enter your query (or "bye" to exit): ', resolve);
    });

    if (userInput.toLowerCase() === 'bye') {
      console.log('Goodbye!');
      rl.close();
      break;
    }
    const response=await agent.invoke({
        messages:[
            {role: "system", content:  systemMessage},
            {role:"user", content:userInput},
        ]
    },{configurable: { thread_id: "1" },recursionLimit: 50})
    console.log('Assistant:', response.messages[response.messages.length-1].content)
}
}
main()