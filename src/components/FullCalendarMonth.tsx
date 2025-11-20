'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import multiMonthPlugin from '@fullcalendar/multimonth';
import type { DatesSetArg } from '@fullcalendar/core';
import { useEffect, useMemo, useRef, useState } from 'react';

export type CalendarWeekEventKind = 'meeting' | 'focus' | 'break' | 'buffer';

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

const toFullCalendarEvents = (events: CalendarWeekEvent[]) =>
  events.map((event) => ({
    ...event,
    extendedProps: {
      kind: event.kind,
      description: event.description,
    },
  }));

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
  { key: 'timeGridDay', label: 'Tag' },
  { key: 'listWeek', label: 'Liste' },
  { key: 'multiMonthYear', label: 'Jahr' },
];

export default function FullCalendarMonth({ startDate, events }: FullCalendarMonthProps) {
  const [currentView, setCurrentView] = useState(viewOptions[0].key);
  const [hasUserSwitchedView, setHasUserSwitchedView] = useState(false);
  const [multiMonthColumns, setMultiMonthColumns] = useState(3);
  const calendarRef = useRef<FullCalendar | null>(null);

  const eventSource = useMemo(() => toFullCalendarEvents(events), [events]);
  const eventsKey = useMemo(
    () =>
      eventSource
        .map((item) => `${item.id}-${item.start}-${item.end}-${item.kind ?? ''}`)
        .join('|'),
    [eventSource]
  );

  const initialDate = useMemo(() => alignToMonday(startDate), [startDate]);
  const [currentTitle, setCurrentTitle] = useState(() =>
    initialDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
  );

  const syncTitle = () => {
    const api = calendarRef.current?.getApi();
    if (!api) {
      return;
    }
    setCurrentTitle(api.view.title);
  };

  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (!api) {
      return;
    }
    api.gotoDate(initialDate);
    setCurrentTitle(
      api.view.title ||
        initialDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
    );
  }, [initialDate]);

  const handleViewChange = (view: string) => {
    setHasUserSwitchedView(true);
    setCurrentView(view);
    calendarRef.current?.getApi().changeView(view);
    syncTitle();
  };

  const handleNavigation = (direction: 'prev' | 'next' | 'today') => {
    const api = calendarRef.current?.getApi();
    if (!api) {
      return;
    }
    if (direction === 'prev') api.prev();
    if (direction === 'next') api.next();
    if (direction === 'today') api.today();
    syncTitle();
  };

  const handleDatesSet = (args: DatesSetArg) => {
    setCurrentTitle(args.view.title);
  };

  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (!api) {
      return;
    }
    api.removeAllEvents();
    api.addEventSource(eventSource);
  }, [eventSource]);

  useEffect(() => {
    const applyResponsiveSettings = () => {
      const width = window.innerWidth;
      setMultiMonthColumns(width < 1024 ? 1 : 3);
      if (!hasUserSwitchedView) {
        const preferredView = width < 640 ? 'timeGridDay' : 'dayGridMonth';
        if (preferredView !== currentView) {
          setCurrentView(preferredView);
          calendarRef.current?.getApi().changeView(preferredView);
          syncTitle();
        }
      }
    };

    applyResponsiveSettings();
    window.addEventListener('resize', applyResponsiveSettings);
    return () => window.removeEventListener('resize', applyResponsiveSettings);
  }, [currentView, hasUserSwitchedView]);

  const eventClassNames = (arg: { event: { extendedProps: { kind?: string } } }) => {
    const kind = arg.event.extendedProps.kind;
    if (kind === 'meeting') {
      return ['fc-event-meeting'];
    }
    if (kind === 'break') {
      return ['fc-event-break'];
    }
    if (kind === 'buffer') {
      return ['fc-event-buffer'];
    }
    return ['fc-event-focus'];
  };

  return (
    <div className="calendar-shell w-full overflow-hidden rounded-2xl">
      <div className="calendar-header">
        <div className="calendar-nav">
          <button type="button" aria-label="Vorheriger Zeitraum" onClick={() => handleNavigation('prev')}>
            ‹
          </button>
          <button type="button" aria-label="Nächster Zeitraum" onClick={() => handleNavigation('next')}>
            ›
          </button>
          <button type="button" aria-label="Heute" onClick={() => handleNavigation('today')}>
            heute
          </button>
        </div>
        <div className="calendar-title">{currentTitle}</div>
        <div className="calendar-view-toggle">
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
      </div>
      <div className="calendar-scroll">
        <FullCalendar
          key={eventsKey}
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, multiMonthPlugin, interactionPlugin, listPlugin]}
          initialView={currentView}
          initialDate={initialDate}
          locale="de"
          firstDay={1}
          timeZone="Europe/Berlin"
          headerToolbar={false}
          editable={false}
          eventDisplay="block"
          dayMaxEventRows={currentView === 'dayGridMonth' ? 2 : 4}
          navLinks
          weekNumbers
          moreLinkContent={(arg) => `${arg.num + 2} Termine`}
          views={{
            multiMonthYear: {
              type: 'multiMonthYear',
              multiMonthMaxColumns: multiMonthColumns,
            },
            listWeek: {
              duration: { weeks: 1 },
            },
          }}
          events={eventSource}
          eventClassNames={eventClassNames}
          height="auto"
          datesSet={handleDatesSet}
        />
      </div>
    </div>
  );
}
