import Link from "next/link";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import type { Event } from "@/lib/types";
import { formatDate } from "@/lib/format";

const artwork = ["artwork-coral", "artwork-blue", "artwork-olive", "artwork-plum", "artwork-amber", "artwork-indigo"];

export function EventCard({ event, index = 0 }: { event: Event; index?: number }) {
  const date = new Date(event.date);
  const day = Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat(undefined, { day: "2-digit" }).format(date);
  const month = Number.isNaN(date.getTime()) ? "TBA" : new Intl.DateTimeFormat(undefined, { month: "short" }).format(date).toUpperCase();
  return (
    <Link href={`/events/${event.id}`} className="event-card">
      <div className={`event-art ${artwork[index % artwork.length]}`} aria-hidden="true">
        <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="art-grain" />
        <span className="art-label">LIVE · {month}</span>
        <span className="event-date-stamp"><b>{day}</b><small>{month}</small></span>
        <span className="art-caption">An evening<br />worth remembering</span>
      </div>
      <div className="event-card-content">
        <div className="event-card-meta"><span><CalendarDays size={14} /> {formatDate(event.date, { weekday: undefined })}</span><span className="seat-count">{event.totalSeats} seats</span></div>
        <h2>{event.name}</h2>
        <p className="event-venue"><MapPin size={15} /> {event.venue}</p>
        <div className="event-card-bottom"><span className="event-description">{event.description}</span><span className="card-arrow"><ArrowUpRight size={18} /></span></div>
      </div>
    </Link>
  );
}
