'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { useEffect, useMemo, useRef, useState } from 'react';

export type CalendarWeekEventKind = 'meeting' | 'focus';

export type CalendarWeekEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  kind: CalendarWeekEventKind;
  description?: string;
};

export interface FullCalendarMonthProps {
  startDate: Date;
  events: CalendarWeekEvent[];
}

const alignToMonday = (date: Date) => {
  const aligned = new Date(date);
  const offset = (aligned.getDay() + 6) % 7;
  aligned.setDate(aligned.getDate() - offset);
  aligned.setHours(0, 0, 0, 0);
  return aligned;
};

const viewOptions = [
  { key: 'dayGridMonth', label: 'Monat' },
  { key: 'timeGridWeek', label: 'Woche' },
  { key: 'timeGridDay', label: 'Tage' },
  { key: 'listYear', label: 'Jahr' },
];

export default function FullCalendarMonth({ startDate, events }: FullCalendarMonthProps) {
  const [currentView, setCurrentView] = useState(viewOptions[0].key);
  const calendarRef = useRef<FullCalendar | null>(null);

  const initialDate = useMemo(() => alignToMonday(startDate), [startDate]);

  useEffect(() => {
    calendarRef.current?.getApi().gotoDate(initialDate);
  }, [initialDate]);

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    calendarRef.current?.getApi().changeView(view);
  };

  const eventClassNames = (arg: { event: { extendedProps: { kind?: string } } }) => {
    const kind = arg.event.extendedProps.kind;
    if (kind === 'meeting') {
      return ['fc-event-meeting'];
    }
    return ['fc-event-focus'];
  };

  return (
    <div>
      <div className="calendar-view-toggle mb-4">
        {viewOptions.map((option) => (
          <button
            key={option.key}
            type="button"
            className={`calendar-view-toggle__item ${
              currentView === option.key ? 'calendar-view-toggle__item--active' : ''
            }`}
            onClick={() => handleViewChange(option.key)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
        initialView={currentView}
        initialDate={initialDate}
        locale="de"
        firstDay={1}
        timeZone="Europe/Berlin"
        headerToolbar={false}
        editable={false}
        eventDisplay="block"
        dayMaxEventRows={true}
        navLinks
        weekNumbers
        views={{
          listYear: {
            buttonText: 'Jahr',
          },
        }}
        events={events}
        eventClassNames={eventClassNames}
        height="auto"
      />
    </div>
  );
}
