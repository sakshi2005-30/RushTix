"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Check, MapPin, Ticket, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ErrorNotice } from "@/components/notice";
import { PageShell } from "@/components/page-shell";
import { ApiError, api } from "@/lib/api";
import { formatDate, getErrorMessage } from "@/lib/format";
import type { Booking } from "@/lib/types";

type Filter = "ALL" | "CONFIRMED" | "CANCELLED";

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("ALL");
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<Booking | null>(null);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const records = await api.bookings();
      const enriched = await Promise.all(records.map(async (booking) => {
        const [event, seat] = await Promise.all([
          api.event(booking.eventId).catch(() => undefined),
          api.seats(booking.eventId).then((seats) => seats.find((item) => item.id === booking.seatId)).catch(() => undefined),
        ]);
        return { ...booking, event, seat };
      }));
      setBookings(enriched);
    } catch (reason) {
      if (reason instanceof ApiError && (reason.status === 400 || reason.status === 401 || reason.status === 403 || /invalid or expired token|please log in again|please login/i.test(reason.message))) {
        router.replace("/login?next=%2Fbookings");
        return;
      }
      setError(getErrorMessage(reason));
    } finally { setLoading(false); }
  }, [router]);

  useEffect(() => { void loadBookings(); }, [loadBookings]);
  useEffect(() => {
    if (!confirmCancel) return;
    const closeOnEscape = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === "Escape" && !cancelling) setConfirmCancel(null);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [confirmCancel, cancelling]);

  const visible = useMemo(() => bookings.filter((booking) => filter === "ALL" || booking.status === filter), [bookings, filter]);

  async function cancelBooking() {
    if (!confirmCancel) return;
    const target = confirmCancel;
    setCancelling(target.id);
    setError("");
    try {
      await api.cancelBooking(target.id);
      setConfirmCancel(null);
      await loadBookings();
    } catch (reason) { setError(getErrorMessage(reason)); }
    finally { setCancelling(null); }
  }

  const counts: Record<Filter, number> = {
    ALL: bookings.length,
    CONFIRMED: bookings.filter((booking) => booking.status === "CONFIRMED").length,
    CANCELLED: bookings.filter((booking) => booking.status === "CANCELLED").length,
  };

  return (
    <PageShell>
      <section className="bookings-hero"><div><span className="eyebrow">YOUR RUSHTIX</span><h1>Your nights,<br /><em>all lined up.</em></h1><p>Every show you’ve booked, right here in one place.</p></div><span className="booking-hero-icon"><Ticket size={38} strokeWidth={1.25} /></span></section>
      <section className="bookings-section">
        <div className="booking-list-heading"><div><span className="eyebrow">YOUR TICKETS</span><h2>My bookings<span className="heading-period">.</span></h2></div><div className="booking-filters" role="tablist" aria-label="Filter bookings">{(["ALL", "CONFIRMED", "CANCELLED"] as const).map((item) => <button role="tab" aria-selected={filter === item} className={filter === item ? "filter-tab selected" : "filter-tab"} key={item} onClick={() => setFilter(item)}>{item === "ALL" ? "All" : item.charAt(0) + item.slice(1).toLowerCase()} <span>{counts[item]}</span></button>)}</div></div>
        {error && <ErrorNotice message={error} onRetry={() => void loadBookings()} />}
        {loading ? <div className="booking-skeleton-list">{[0, 1, 2].map((item) => <div className="booking-skeleton" key={item}><div className="skeleton-art small-art" /><div className="booking-skeleton-lines"><span className="skeleton-line wide" /><span className="skeleton-line" /><span className="skeleton-line short" /></div></div>)}</div> : visible.length === 0 ? <div className="empty-bookings"><span className="empty-icon"><Ticket size={21} /></span><h3>{bookings.length === 0 ? "Your next great night starts here." : `No ${filter.toLowerCase()} bookings`}</h3><p>{bookings.length === 0 ? "You haven’t booked anything yet. Find a show that speaks to you." : "There are no bookings in this category."}</p>{bookings.length === 0 && <Link className="button button-primary" href="/events">Explore events <ArrowRight size={16} /></Link>}</div> : <div className="booking-list">{visible.map((booking, index) => <article className={`booking-card booking-card-${index % 5}`} key={booking.id}><div className="booking-card-art"><span className="booking-art-mark">{booking.status === "CONFIRMED" ? <Check size={19} /> : <X size={19} />}</span><span>RUSHTIX</span></div><div className="booking-card-main"><div className="booking-card-top"><span className={`status-badge ${booking.status === "CONFIRMED" ? "status-confirmed" : "status-cancelled"}`}><i />{booking.status === "CONFIRMED" ? "Confirmed" : "Cancelled"}</span><span className="booking-date">Booked {formatDate(booking.createdAt, { weekday: undefined })}</span></div><h3>{booking.event?.name ?? "Event details unavailable"}</h3><div className="booking-facts"><span><CalendarDays size={15} />{booking.event ? formatDate(booking.event.date, { weekday: undefined }) : "Date unavailable"}</span><span><MapPin size={15} />{booking.event?.venue ?? "Venue unavailable"}</span><span><Ticket size={15} />{booking.seat ? `Row ${booking.seat.row} · Seat ${booking.seat.seatNo}` : "Seat details unavailable"}</span></div></div><div className="booking-card-actions">{booking.status === "CONFIRMED" ? <button className="cancel-booking" onClick={() => setConfirmCancel(booking)}>Cancel booking</button> : <span className="muted-label">No longer active</span>}{booking.event && <Link className="booking-view-link" href={`/events/${booking.eventId}`} aria-label={`View ${booking.event.name}`}><ArrowRight size={18} /></Link>}</div></article>)}</div>}
      </section>
      {confirmCancel && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirmCancel(null); }}><section className="booking-modal cancel-modal" role="dialog" aria-modal="true" aria-labelledby="cancel-title"><button className="modal-close" aria-label="Close cancellation confirmation" onClick={() => setConfirmCancel(null)}><X size={19} /></button><span className="modal-icon cancel-icon"><X size={22} /></span><span className="eyebrow">CHANGE OF PLANS?</span><h2 id="cancel-title">Cancel this booking?</h2><p className="modal-event-name">{confirmCancel.event?.name ?? "This event"}</p><div className="modal-seat-details"><span><CalendarDays size={16} />{confirmCancel.event ? formatDate(confirmCancel.event.date) : "Event date"}</span><span><Ticket size={16} />{confirmCancel.seat ? `Row ${confirmCancel.seat.row} · Seat ${confirmCancel.seat.seatNo}` : "Seat details"}</span></div><p className="modal-note">Your booking will be marked cancelled and the seat released if the request succeeds.</p><div className="modal-actions"><button className="button button-secondary" disabled={!!cancelling} onClick={() => setConfirmCancel(null)}>Keep booking</button><button className="button button-danger" disabled={!!cancelling} onClick={() => void cancelBooking()}>{cancelling ? <><span className="spinner" /> Cancelling…</> : <>Confirm cancellation <X size={16} /></>}</button></div></section></div>}
    </PageShell>
  );
}
