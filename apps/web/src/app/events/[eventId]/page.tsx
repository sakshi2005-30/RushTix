"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, MapPin, ShieldCheck, Ticket, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ErrorNotice } from "@/components/notice";
import { PageShell } from "@/components/page-shell";
import { ApiError, api } from "@/lib/api";
import { formatDate, getErrorMessage } from "@/lib/format";
import type { Event, Seat } from "@/lib/types";

export default function EventDetailsPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selected, setSelected] = useState<Seat | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const refreshSeats = useCallback(async () => setSeats(await api.seats(eventId)), [eventId]);
  const loadEvent = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [eventData, seatData] = await Promise.all([api.event(eventId), api.seats(eventId)]);
      setEvent(eventData);
      setSeats(seatData);
    } catch (reason) { setError(getErrorMessage(reason)); }
    finally { setLoading(false); }
  }, [eventId]);

  useEffect(() => { void loadEvent(); }, [loadEvent]);
  useEffect(() => {
    if (!selected) return;
    const closeOnEscape = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === "Escape") setSelected(null);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [selected]);

  const rows = useMemo(() => {
    const grouped = new Map<number, Seat[]>();
    for (const seat of seats) grouped.set(seat.row, [...(grouped.get(seat.row) ?? []), seat]);
    return [...grouped.entries()].sort(([a], [b]) => a - b).map(([row, rowSeats]) => [row, rowSeats.sort((a, b) => a.seatNo - b.seatNo)] as const);
  }, [seats]);

  async function confirmBooking() {
    if (!selected || selected.status !== "AVAILABLE") return;
    setBooking(true);
    setError("");
    try {
      await api.book(eventId, selected.id);
      setSuccess(`Row ${selected.row}, seat ${selected.seatNo} is yours. See you at the show!`);
      setSelected(null);
      await refreshSeats();
    } catch (reason) {
      const message = getErrorMessage(reason);
      const needsLogin = reason instanceof ApiError && (reason.status === 401 || /please login|must be logged in|invalid or expired token|please log in again/i.test(message));
      const isPotentialSeatConflict = reason instanceof ApiError && (reason.status === 409 || reason.status === 500 || /seat available/i.test(message));
      const updatedSeats = await api.seats(eventId).catch(() => null);
      if (updatedSeats) setSeats(updatedSeats);
      const isNowBooked = updatedSeats?.some((seat) => seat.id === selected.id && seat.status === "BOOKED") ?? false;
      if (needsLogin) {
        setError("Please sign in to book a seat.");
        setSelected(null);
      } else if (isPotentialSeatConflict && isNowBooked) {
        setError("Someone just booked this seat. We’ve refreshed the map—please choose another.");
        setSelected(null);
      } else {
        setError(message);
      }
    } finally { setBooking(false); }
  }

  if (loading) return <PageShell><div className="detail-loading"><div className="skeleton-line short" /><div className="skeleton-line wide" /><div className="seat-map-skeleton" /></div></PageShell>;
  if (error && !event) return <PageShell><div className="page-topline"><Link className="back-link" href="/events"><ArrowLeft size={15} /> All events</Link></div><ErrorNotice message={error} onRetry={() => void loadEvent()} /></PageShell>;
  if (!event) return null;

  const availableCount = seats.filter((seat) => seat.status === "AVAILABLE").length;
  const totalCount = seats.length;
  return (
    <PageShell>
      <div className="page-topline"><Link className="back-link" href="/events"><ArrowLeft size={15} /> All events</Link><span className="detail-breadcrumb">Events <span>/</span> {event.name}</span></div>
      <section className="event-detail-hero">
        <div className="detail-copy"><span className="eyebrow"><span className="live-dot" /> LIVE EVENT</span><h1>{event.name}</h1><p className="detail-description">{event.description}</p><div className="detail-facts"><span><CalendarDays size={17} />{formatDate(event.date)}</span><span><MapPin size={17} />{event.venue}</span><span><Clock3 size={17} />Doors open at showtime</span></div></div>
        <div className="detail-aside"><span className="aside-icon"><Ticket size={21} /></span><span className="eyebrow">YOUR NIGHT, SORTED</span><p>Pick your seat and get ready for a night of live music.</p><a href="#seat-selection" className="button button-primary">Choose a seat <ArrowRight size={16} /></a></div>
      </section>
      <section className="seat-section" id="seat-selection">
        <div className="section-heading seat-heading"><div><span className="eyebrow">MAKE IT YOURS</span><h2>Choose your seat<span className="heading-period">.</span></h2><p>Tap any available seat to see your booking details.</p></div><div className="availability-pill"><span className="available-dot" /> {availableCount} of {totalCount || event.totalSeats} seats available</div></div>
        {error && <div className="inline-alert" role="alert"><span>{error}</span>{error.includes("sign in") && <Link href="/login">Sign in <ArrowRight size={14} /></Link>}</div>}
        {success && <div className="success-alert" role="status"><Check size={17} /><span>{success}</span><Link href="/bookings">View booking <ArrowRight size={14} /></Link><button aria-label="Dismiss success message" onClick={() => setSuccess("")}><X size={16} /></button></div>}
        {seats.length === 0 ? <div className="empty-seat-map"><Ticket size={22} /><h3>Seats are not available yet</h3><p>Seat selection hasn’t opened for this event. Please check back later.</p></div> : <div className="seat-map-card">
          <div className="stage-wrap"><div className="stage-line" /><span>STAGE</span></div>
          <div className="seat-legend"><span><i className="legend-seat free" /> Available</span><span><i className="legend-seat taken" /> Booked</span><span><i className="legend-seat chosen" /> Selected</span></div>
          <div className="seating-grid" role="group" aria-label={`Seat map for ${event.name}`}>
            {rows.map(([row, rowSeats]) => <div className="seat-row" key={row}><span className="row-label">{row}</span><div className="row-seats">{rowSeats.map((seat) => <button key={seat.id} className={`seat ${seat.status === "BOOKED" ? "seat-booked" : "seat-available"} ${selected?.id === seat.id ? "seat-selected" : ""}`} aria-label={`Row ${seat.row}, seat ${seat.seatNo}, ${seat.status === "BOOKED" ? "booked" : "available"}`} aria-pressed={selected?.id === seat.id} disabled={seat.status !== "AVAILABLE"} onClick={() => { setSuccess(""); setSelected(seat); }} title={`Row ${seat.row}, seat ${seat.seatNo}`}>{seat.seatNo}</button>)}</div><span className="row-label">{row}</span></div>)}
          </div>
          <div className="map-footer"><span><ShieldCheck size={16} /> Your seat is only confirmed after booking.</span><span>{rows.length} {rows.length === 1 ? "row" : "rows"}</span></div>
        </div>}
      </section>
      {selected && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><section className="booking-modal" role="dialog" aria-modal="true" aria-labelledby="booking-title"><button className="modal-close" aria-label="Close booking confirmation" autoFocus onClick={() => setSelected(null)}><X size={19} /></button><span className="modal-icon"><Ticket size={22} /></span><span className="eyebrow">ONE GOOD NIGHT AWAITS</span><h2 id="booking-title">Make it official.</h2><p className="modal-event-name">{event.name}</p><div className="modal-seat-details"><span><CalendarDays size={16} />{formatDate(event.date)}</span><span><MapPin size={16} />{event.venue}</span><span><Ticket size={16} />Row {selected.row} · Seat {selected.seatNo}</span></div><p className="modal-note">Confirm to reserve this seat. We’ll show your ticket once RushTix confirms the booking.</p><div className="modal-actions"><button className="button button-secondary" onClick={() => setSelected(null)} disabled={booking}>Cancel</button><button className="button button-primary" onClick={() => void confirmBooking()} disabled={booking}>{booking ? <><span className="spinner" /> Booking…</> : <>Confirm booking <ArrowRight size={16} /></>}</button></div></section></div>}
    </PageShell>
  );
}
