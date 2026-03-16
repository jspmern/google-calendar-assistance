import { tool } from "@langchain/core/tools"
import {google} from 'googleapis';
import credential from "../credential.json" with { type: "json" };
import z from "zod";

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);

oauth2Client.setCredentials({
    access_token: credential.token.access_token,
});
const calendar = google.calendar({version: 'v3', auth: oauth2Client});

//this the tool for getting calendar events based on a query and time range
 export const getCalendarEvents= tool(async({timeMax,timeMin,q})=>{
    console.log('Invoking getCalendarEvents with query:', { timeMax, timeMin, q });
 try {
    const params: any = {
      calendarId: 'primary',
      q
    };
    if (typeof timeMax === 'string') params.timeMax = timeMax;
    if (typeof timeMin === 'string') params.timeMin = timeMin;
   
    const result = await calendar.events.list(params);
    const response = result.data.items?.map((event) => {
                return {
                    id: event.id,
                    summary: event.summary,
                    status: event.status,
                    organiser: event.organizer,
                    start: event.start,
                    end: event.end,
                    attendees: event.attendees,
                    meetingLink: event.hangoutLink,
                    eventType: event.eventType,
                };
            });

            return JSON.stringify(response);
      
 } catch (error) {
    console.error('Error fetching calendar events:', error);
     return "Sorry, I encountered an error while fetching your calendar events. Please try again later.";  
 }
 },{
    name: "getCalendarEvents",
    description: "use this tool to get calendar events for the user. The input should be a query string describing the events you want to retrieve.",
    schema:z.object({
         timeMin: z.string().optional().describe("The start time for the events query in ISO 8601 format (e.g., '2023-10-01T00:00:00Z'). Defaults to current time if not provided."),
        timeMax: z.string().optional().describe("The end time for the events query in ISO 8601 format (e.g., '2023-10-31T23:59:59Z')."),
        q: z.string().describe("Free text search query. Searches in event summary, description, location, attendee's displayName, attendee's email, organizer's displayName, and organizer's email.")
    })
 })


 //this is the tool for creating calendar events based on the user query
 export const createCalendarEvent= tool(async({start,end,title,description,attendees})=>{
    const result = await calendar.events.insert({
        calendarId: 'primary',
        sendNotifications: true,
        sendUpdates: 'all',
        conferenceDataVersion:1,
        requestBody: {
            summary:title,
            description:description,
            start: start,
            end: end,
            attendees:attendees?.map((email:string) => ({ email })) || [],
             conferenceData: {
                    createRequest: {
                        requestId: crypto.randomUUID(),
                        conferenceSolutionKey: {
                            type: 'hangoutsMeet',
                        },
                    },
                },
        },
         
    })

    console.log('**************', result.data);
    return "Event created successfully with the following details: " + JSON.stringify({start,end,title,description,attendees})
 },{
    name: "createCalendarEvent",
    description: "use this tool to create a calendar event for the user. The input should be an object containing the event details such as title, date, time, duration, and attendees.",
    schema: z.object({
        start: z.any().describe("The start time for the event in ISO 8601 format (e.g., '2023-10-01T00:00:00Z')."),
        end: z.any().describe("The end time for the event in ISO 8601 format (e.g., '2023-10-01T01:00:00Z')."),
        title: z.string().describe("The title of the event."),
        description: z.string().optional().describe("A description of the event."),
        attendees: z.array(z.string()).optional().describe("A list of email addresses of attendees.")
    })
 })

 //this is the tools for deleting calendar events based 
export const deleteCalendarEvent = tool(async ({ eventId }) => {
    console.log('Invoking deleteCalendarEvent with eventId:', eventId);
    const response = await calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
     })
     console.log('Delete event response status:', response.status);
     if (response.status === 204) {
        return "Calendar event deleted successfully.";
     }
     return "Failed to delete calendar event. Please check the event ID and try again.";
   
},{
    name: "deleteCalendarEvent",
    description: "use this tool to delete a calendar event for the user. The input should be an object containing the eventId of the event to be deleted.",
    schema: z.object({
        eventId: z.string().describe("The ID of the calendar event to be deleted.")
    })
})

//this is the toools for the editing calendar events based on the user query
export const editCalendarEvent= tool(async({eventId, start,end,title,description,attendees})=>{
    console.log('Invoking editCalendarEvent with:', { eventId, start, end, title, description, attendees });
    const result = await calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        requestBody: {
            summary: title,
            description: description,
            start: start,
            end: end,
            attendees: attendees?.map((email:string) => ({ email })) || [],
        }
    });
    return "your event is updated successfully with the following details: " + JSON.stringify({start,end,title,description,attendees})

},{
    name: "editCalendarEvent",
    description: "use this tool to edit a calendar event for the user. The input should be an object containing the eventId of the event to be edited and the updated event details such as title, date, time, duration, and attendees.",
    schema: z.object({
        eventId: z.string().describe("The ID of the calendar event to be edited."),
        start: z.any().optional().describe("The updated start time for the event in ISO 8601 format (e.g., '2023-10-01T00:00:00Z')."),
        end: z.any().optional().describe("The updated end time for the event in ISO 8601 format (e.g., '2023-10-01T01:00:00Z')."),
        title: z.string().optional().describe("The updated title of the event."),
        description: z.string().optional().describe("An updated description of the event."),
        attendees: z.array(z.string()).optional().describe("An updated list of email addresses of attendees.")
    })
})