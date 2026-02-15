export interface CalendarEvent {
  title: string;
  description: string;
  location: string;
  startTime: Date;
  endTime: Date;
}

/**
 * Generates a Google Calendar URL for the given event
 */
export const generateGoogleCalendarUrl = (event: CalendarEvent): string => {
  const formatTime = (date: Date) => date.toISOString().replace(/-|:|\"\.\d\d\d/g, '');
  const dates = `${formatTime(event.startTime)}/${formatTime(event.endTime)}`;
  
  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.append('action', 'TEMPLATE');
  url.searchParams.append('text', event.title);
  url.searchParams.append('details', event.description);
  url.searchParams.append('location', event.location);
  url.searchParams.append('dates', dates);
  
  return url.toString();
};

/**
 * Generates and triggers a download of an .ics file for the given event
 */
export const downloadIcsFile = (event: CalendarEvent): void => {
  const formatTime = (date: Date) => date.toISOString().replace(/-|:|\"\.\d\d\d/g, '');
  
  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PROID:-//EventFlow//Event Management//EN',
    'BEGIN:VEVENT',
    `DTSTART:${formatTime(event.startTime)}`,
    `DTEND:${formatTime(event.endTime)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
    `LOCATION:${event.location}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ];

  const blob = new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
