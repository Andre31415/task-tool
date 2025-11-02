import type { GoogleCalendarEvent, GoogleCalendar } from '../types';

declare const gapi: any;
declare const google: any;

export class GoogleCalendarService {
  private isInitialized = false;
  private isSignedIn = false;
  private clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  private apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  private discoveryDocs = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];
  private scopes = 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events';

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      // Load Google API
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        gapi.load('client:auth2', async () => {
          try {
            await gapi.client.init({
              apiKey: this.apiKey,
              clientId: this.clientId,
              discoveryDocs: this.discoveryDocs,
              scope: this.scopes,
            });

            // Listen for sign-in state changes
            gapi.auth2.getAuthInstance().isSignedIn.listen((isSignedIn: boolean) => {
              this.isSignedIn = isSignedIn;
            });

            this.isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
            this.isInitialized = true;
            resolve();
          } catch (error) {
            console.error('Error initializing Google API:', error);
            reject(error);
          }
        });
      };
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  async signIn(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      await gapi.auth2.getAuthInstance().signIn();
      this.isSignedIn = true;
      return true;
    } catch (error) {
      console.error('Error signing in:', error);
      return false;
    }
  }

  async signOut(): Promise<void> {
    if (!this.isInitialized) return;

    try {
      await gapi.auth2.getAuthInstance().signOut();
      this.isSignedIn = false;
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  getIsSignedIn(): boolean {
    return this.isSignedIn;
  }

  async getCalendars(): Promise<GoogleCalendar[]> {
    if (!this.isSignedIn) {
      throw new Error('Not signed in to Google');
    }

    try {
      const response = await gapi.client.calendar.calendarList.list();
      
      return response.result.items.map((cal: any, index: number) => ({
        id: cal.id,
        name: cal.summary,
        color: cal.backgroundColor || this.getColorForIndex(index),
        visible: true,
      }));
    } catch (error) {
      console.error('Error fetching calendars:', error);
      return [];
    }
  }

  async getEvents(
    calendarIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<GoogleCalendarEvent[]> {
    if (!this.isSignedIn) {
      throw new Error('Not signed in to Google');
    }

    try {
      const eventPromises = calendarIds.map(async (calendarId) => {
        const response = await gapi.client.calendar.events.list({
          calendarId,
          timeMin: startDate.toISOString(),
          timeMax: endDate.toISOString(),
          singleEvents: true,
          orderBy: 'startTime',
        });

        const calendar = await this.getCalendarById(calendarId);

        return response.result.items.map((event: any) => ({
          id: event.id,
          summary: event.summary || 'Untitled Event',
          description: event.description || '',
          start: event.start.dateTime || event.start.date,
          end: event.end.dateTime || event.end.date,
          calendar_id: calendarId,
          calendar_name: calendar?.name || 'Unknown Calendar',
          color: calendar?.color || '#3b82f6',
        }));
      });

      const eventsArrays = await Promise.all(eventPromises);
      return eventsArrays.flat();
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }

  async getCalendarById(calendarId: string): Promise<GoogleCalendar | null> {
    try {
      const calendars = await this.getCalendars();
      return calendars.find((cal) => cal.id === calendarId) || null;
    } catch (error) {
      console.error('Error fetching calendar:', error);
      return null;
    }
  }

  async createEvent(
    calendarId: string,
    title: string,
    description: string,
    start: Date,
    end: Date
  ): Promise<boolean> {
    if (!this.isSignedIn) {
      throw new Error('Not signed in to Google');
    }

    try {
      await gapi.client.calendar.events.insert({
        calendarId,
        resource: {
          summary: title,
          description,
          start: {
            dateTime: start.toISOString(),
          },
          end: {
            dateTime: end.toISOString(),
          },
        },
      });

      return true;
    } catch (error) {
      console.error('Error creating event:', error);
      return false;
    }
  }

  async updateEvent(
    calendarId: string,
    eventId: string,
    updates: {
      title?: string;
      description?: string;
      start?: Date;
      end?: Date;
    }
  ): Promise<boolean> {
    if (!this.isSignedIn) {
      throw new Error('Not signed in to Google');
    }

    try {
      const event: any = {};
      if (updates.title) event.summary = updates.title;
      if (updates.description) event.description = updates.description;
      if (updates.start) event.start = { dateTime: updates.start.toISOString() };
      if (updates.end) event.end = { dateTime: updates.end.toISOString() };

      await gapi.client.calendar.events.patch({
        calendarId,
        eventId,
        resource: event,
      });

      return true;
    } catch (error) {
      console.error('Error updating event:', error);
      return false;
    }
  }

  async deleteEvent(calendarId: string, eventId: string): Promise<boolean> {
    if (!this.isSignedIn) {
      throw new Error('Not signed in to Google');
    }

    try {
      await gapi.client.calendar.events.delete({
        calendarId,
        eventId,
      });

      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      return false;
    }
  }

  private getColorForIndex(index: number): string {
    const colors = [
      '#3b82f6', // blue
      '#ef4444', // red
      '#10b981', // green
      '#f59e0b', // orange
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#06b6d4', // cyan
      '#84cc16', // lime
    ];
    return colors[index % colors.length];
  }
}

export const googleCalendarService = new GoogleCalendarService();

