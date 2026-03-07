import { useState, useRef, useCallback } from "react";
import { DayPicker } from "react-day-picker";
import { format, isSameDay, parseISO } from "date-fns";
import { Upload, X, CalendarDays, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import "react-day-picker/dist/style.css";

export interface CalEvent {
  id: string;
  summary: string;
  description?: string;
  start: string; // ISO string
  end?: string;
  allDay?: boolean;
}

const STORAGE_KEY = "lusk-calendar-events";

function loadEvents(): CalEvent[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveEvents(events: CalEvent[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

/** Minimal ICS parser – handles VEVENT blocks */
function parseICS(text: string): CalEvent[] {
  const events: CalEvent[] = [];
  const blocks = text.split("BEGIN:VEVENT");
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];
    const get = (key: string) => {
      const m = block.match(new RegExp(`${key}[^:]*:([^\r\n]+)`));
      return m ? m[1].trim() : undefined;
    };
    const summary = get("SUMMARY") || "Untitled event";
    const rawStart = get("DTSTART");
    const rawEnd = get("DTEND");
    const description = get("DESCRIPTION")?.replace(/\\n/g, "\n");
    if (!rawStart) continue;

    const parseDate = (raw: string) => {
      if (raw.length === 8) {
        // All-day: YYYYMMDD
        return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}T00:00:00`;
      }
      // e.g. 20240310T090000Z or 20240310T090000
      const y = raw.slice(0, 4), mo = raw.slice(4, 6), d = raw.slice(6, 8);
      const h = raw.slice(9, 11), min = raw.slice(11, 13), s = raw.slice(13, 15);
      const utc = raw.endsWith("Z") ? "Z" : "";
      return `${y}-${mo}-${d}T${h}:${min}:${s}${utc}`;
    };

    events.push({
      id: `${Date.now()}-${i}`,
      summary,
      description,
      start: parseDate(rawStart),
      end: rawEnd ? parseDate(rawEnd) : undefined,
      allDay: rawStart.length === 8,
    });
  }
  return events;
}

export function CalendarView() {
  const [events, setEvents] = useState<CalEvent[]>(loadEvents);
  const [selected, setSelected] = useState<Date>(new Date());
  const fileRef = useRef<HTMLInputElement>(null);

  const dayEvents = events.filter((e) => {
    try { return isSameDay(parseISO(e.start), selected); } catch { return false; }
  });

  const eventDays = events.reduce<Set<string>>((acc, e) => {
    try { acc.add(format(parseISO(e.start), "yyyy-MM-dd")); } catch {}
    return acc;
  }, new Set());

  const handleImport = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const parsed = parseICS(ev.target?.result as string);
      setEvents((prev) => {
        const merged = [...prev, ...parsed];
        saveEvents(merged);
        return merged;
      });
    };
    reader.readAsText(file);
  }, []);

  const removeEvent = (id: string) => {
    setEvents((prev) => { const next = prev.filter((e) => e.id !== id); saveEvents(next); return next; });
  };

  const clearAll = () => { setEvents([]); saveEvents([]); };

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full">
      {/* Calendar */}
      <div className="flex-shrink-0">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={(d) => d && setSelected(d)}
            modifiers={{ hasEvent: (day) => eventDays.has(format(day, "yyyy-MM-dd")) }}
            modifiersClassNames={{ hasEvent: "has-event", selected: "rdp-selected" }}
            classNames={{
              root: "rdp-root",
              months: "rdp-months",
              month: "rdp-month",
              caption: "rdp-caption",
              caption_label: "text-sm font-semibold text-foreground",
              nav: "rdp-nav",
              nav_button: "rdp-nav_button h-7 w-7 bg-transparent hover:bg-accent rounded-md transition-colors",
              nav_button_previous: "rdp-nav_button_previous",
              nav_button_next: "rdp-nav_button_next",
              table: "rdp-table w-full border-collapse",
              head_row: "rdp-head_row",
              head_cell: "rdp-head_cell text-xs text-muted-foreground w-9 text-center pb-1",
              row: "rdp-row",
              cell: "rdp-cell text-center p-0",
              day: "rdp-day h-9 w-9 text-sm rounded-full hover:bg-accent transition-colors mx-auto flex items-center justify-center",
              day_today: "font-bold text-primary",
              day_outside: "opacity-30",
              day_disabled: "opacity-30",
            }}
          />
        </div>

        {/* import/clear buttons */}
        <div className="flex gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5 text-xs"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="w-3.5 h-3.5" />
            Import .ics
          </Button>
          {events.length > 0 && (
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={clearAll}>
              Clear all
            </Button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".ics,text/calendar"
            className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) handleImport(e.target.files[0]); e.target.value = ""; }}
          />
        </div>
      </div>

      {/* Events for selected day */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">{format(selected, "EEEE, MMMM d, yyyy")}</h3>
        </div>

        {dayEvents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No events on this day.
            <br />
            <span className="text-xs opacity-70">Import an .ics file to populate your calendar.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {dayEvents.map((ev) => (
              <div key={ev.id} className="group relative rounded-xl border border-border bg-card p-3 shadow-sm">
                <button
                  onClick={() => removeEvent(ev.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
                <p className="text-sm font-medium pr-6">{ev.summary}</p>
                {!ev.allDay && ev.start && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Clock className="w-3 h-3" />
                    {format(parseISO(ev.start), "h:mm a")}
                    {ev.end ? ` – ${format(parseISO(ev.end), "h:mm a")}` : ""}
                  </p>
                )}
                {ev.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ev.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
