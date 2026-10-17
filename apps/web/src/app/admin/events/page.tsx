"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, Check, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { api, ApiError } from "@/lib/api";
import { formatDate, getErrorMessage } from "@/lib/format";
import type { Event, Seat, User } from "@/lib/types";

type Access = "checking" | "admin" | "customer" | "signed-out" | "error";
type EventForm = { name: string; description: string; venue: string; date: string; totalSeats: string };
const emptyForm: EventForm = { name: "", description: "", venue: "", date: "", totalSeats: "100" };

function localDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export default function ManageEventsPage() {
  const [access, setAccess] = useState<Access>("checking");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [editing, setEditing] = useState<Event | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [created, setCreated] = useState<{ event: Event; seats: Seat[] } | null>(null);
  const [deleting, setDeleting] = useState<Event | null>(null);

  async function loadEvents() {
    setLoading(true);
    setPageError("");
    try { setEvents(await api.events({ limit: 100 })); }
    catch (error) { setPageError(getErrorMessage(error)); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    let active = true;
    api.me().then((user: User) => {
      if (!active) return;
      if (user.role !== "ADMIN") { setAccess("customer"); return; }
      setAccess("admin");
      void loadEvents();
    }).catch((error: unknown) => {
      if (!active) return;
      if (error instanceof ApiError && (error.status === 400 || error.status === 401 || error.status === 403)) setAccess("signed-out");
      else { setPageError(getErrorMessage(error)); setAccess("error"); }
    });
    return () => { active = false; };
  }, []);

  function resetForm() {
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
  }

  function startEdit(event: Event) {
    setEditing(event);
    setForm({ name: event.name, description: event.description, venue: event.venue, date: localDateTime(event.date), totalSeats: String(event.totalSeats) });
    setFormError("");
    setSuccess("");
    setCreated(null);
  }

  async function submitEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    setSuccess("");
    try {
      const details = { name: form.name.trim(), description: form.description.trim(), venue: form.venue.trim(), date: new Date(form.date).toISOString() };
      if (editing) {
        const updated = await api.updateEvent(editing.id, details);
        setEvents((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        );
        setSuccess(`“${updated.name}” has been updated.`);
        resetForm();
      } else {
        const added = await api.createEvent({
          ...details,
          totalSeats: Number(form.totalSeats),
        });

        setEvents((current) => [added, ...current]);
        resetForm();

        try {
          const seats = await api.seats(added.id);

          setCreated({ event: added, seats });

          setSuccess(
            seats.length === added.totalSeats
              ? `“${added.name}” was created with all ${seats.length} seats ready.`
              : `“${added.name}” was created, but only ${seats.length} of ${added.totalSeats} seats were returned.`,
          );
        } catch (error) {
          setCreated({ event: added, seats: [] });

          setPageError(
            `The event was created, but its seats could not be loaded: ${getErrorMessage(error)}`,
          );
        }
      }
    } catch (error) { setFormError(getErrorMessage(error)); }
    finally { setSaving(false); }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setSaving(true);
    setPageError("");
    try {
      await api.deleteEvent(deleting.id);
      setEvents((current) => current.filter((event) => event.id !== deleting.id));
      if (created?.event.id === deleting.id) setCreated(null);
      setSuccess(`“${deleting.name}” has been deleted.`);
      setDeleting(null);
    } catch (error) { setPageError(getErrorMessage(error)); setDeleting(null); }
    finally { setSaving(false); }
  }

  const heading = <><div className="page-topline"><Link href="/events" className="back-link"><ArrowLeft size={15} /> Back to events</Link><span>ADMINISTRATION</span></div><section className="admin-hero"><div><span className="eyebrow">RUSHTIX · ADMIN</span><h1>Manage events<span className="heading-period">.</span></h1><p>Create and update the shows on your lineup.</p></div><span className="admin-event-count">{events.length}<small> events</small></span></section></>;

  if (access === "checking") return <PageShell><div className="admin-page">{heading}<div className="admin-loading"><span className="spinner small" /> Checking your account…</div></div></PageShell>;
  if (access === "customer") return <PageShell><div className="admin-page">{heading}<section className="empty-events admin-access"><h2>Admin access required</h2><p>This page is available to event administrators only.</p><Link className="button button-primary" href="/events">Browse events</Link></section></div></PageShell>;
  if (access === "signed-out") return <PageShell><div className="admin-page">{heading}<section className="empty-events admin-access"><h2>Sign in to continue</h2><p>Sign in with an administrator account to manage events.</p><Link className="button button-primary" href="/login">Sign in</Link></section></div></PageShell>;
  if (access === "error") return <PageShell><div className="admin-page">{heading}<div className="notice error-notice" role="alert"><div><strong>Could not verify administrator access</strong><p>{pageError}</p></div><button className="button button-secondary button-small" onClick={() => { setAccess("checking"); window.location.reload(); }}>Try again</button></div></div></PageShell>;

  return (
    <PageShell>
      <div className="admin-page">
        {heading}
        {success && <div className="success-alert admin-alert"><span className="success-icon"><Check size={17} /></span><span>{success}</span><button aria-label="Dismiss success message" onClick={() => setSuccess("")}>×</button></div>}
        {pageError && <div className="notice error-notice" role="alert"><div><strong>Event management request failed</strong><p>{pageError}</p></div><button className="button button-secondary button-small" onClick={() => { setPageError(""); void loadEvents(); }}>Try again</button></div>}

        {created && <section className="created-event-panel" aria-label="Created event and generated seats">
          <div className="created-event-heading"><div><span className="eyebrow">EVENT CREATED · SEATS GENERATED</span><h2>{created.event.name}</h2><p>{formatDate(created.event.date)} · {created.event.venue}</p></div><button className="button button-secondary button-small" onClick={() => setCreated(null)}>Close</button></div>
          <div className="created-seat-summary"><strong>{created.seats.length}</strong> of {created.event.totalSeats} generated seats loaded <span>· 10 seats per row</span></div>
          {created.seats.length > 0 ? <div className="admin-seat-map">{Array.from(new Set(created.seats.map((seat) => seat.row))).sort((a, b) => a - b).map((row) => <div className="admin-seat-row" key={row}><span>Row {row}</span><div>{created.seats.filter((seat) => seat.row === row).sort((a, b) => a.seatNo - b.seatNo).map((seat) => <span className={`admin-seat ${seat.status === "BOOKED" ? "booked" : ""}`} title={`Row ${seat.row}, seat ${seat.seatNo}: ${seat.status.toLowerCase()}`} key={seat.id}>{seat.seatNo}</span>)}</div></div>)}</div> : <p className="admin-seat-empty">The event was created, but the seat list is unavailable. Refresh the page to try again.</p>}
        </section>}

        <div className="admin-content-grid">
          <section className="admin-form-card">
            <div className="admin-card-heading"><div><span className="eyebrow">{editing ? "EVENT DETAILS" : "NEW LISTING"}</span><h2>{editing ? "Edit event" : "Create an event"}</h2></div>{editing ? <button className="text-button" onClick={resetForm}>Cancel edit</button> : <Plus size={19} />}</div>
            <form className="admin-event-form" onSubmit={(event) => void submitEvent(event)}>
              <label className="field-label">Event name<input required maxLength={120} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. An evening with…" /></label>
              <label className="field-label">Description<textarea required maxLength={2000} rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Tell guests what to expect" /></label>
              <label className="field-label">Date and time<input required type="datetime-local" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></label>
              <label className="field-label">Venue<input required maxLength={160} value={form.venue} onChange={(event) => setForm({ ...form, venue: event.target.value })} placeholder="Venue name and location" /></label>
              {!editing && <label className="field-label">Total seats<input required type="number" min="1" max="1000" step="1" value={form.totalSeats} onChange={(event) => setForm({ ...form, totalSeats: event.target.value })} /><small>Seats are generated in rows of 10 when the event is created (maximum 1,000).</small></label>}
              {editing && <p className="admin-form-note">Seat count cannot be changed after seats have been generated.</p>}
              {formError && <p className="form-error" role="alert">{formError}</p>}
              <button className="button button-primary admin-submit" disabled={saving}>{saving ? <><span className="spinner" /> Saving…</> : editing ? "Save event changes" : "Create event"}</button>
            </form>
          </section>

          <section className="admin-list-section">
            <div className="admin-card-heading"><div><span className="eyebrow">THE LINEUP</span><h2>All events</h2></div><button className="button button-secondary button-small" onClick={() => void loadEvents()} disabled={loading}>{loading ? "Loading…" : "Refresh"}</button></div>
            {loading ? <div className="admin-loading"><span className="spinner small" /> Loading events…</div> : pageError ? null : events.length === 0 ? <div className="empty-events admin-empty"><h3>No events yet</h3><p>Create your first listing to get the lineup started.</p></div> : <div className="admin-event-list">{events.map((event) => <article className="admin-event-row" key={event.id}><div className="admin-event-copy"><span className="admin-event-date">{formatDate(event.date, { weekday: undefined })}</span><h3>{event.name}</h3><p><MapPin size={13} /> {event.venue} <span>·</span> {event.totalSeats} seats</p></div><div className="admin-event-actions"><button aria-label={`Edit ${event.name}`} title="Edit event" className="icon-action" onClick={() => startEdit(event)}><Pencil size={15} /></button><button aria-label={`Delete ${event.name}`} title="Delete event" className="icon-action delete-action" onClick={() => setDeleting(event)}><Trash2 size={15} /></button></div></article>)}</div>}
          </section>
        </div>
      </div>
      {deleting && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setDeleting(null); }}><section className="booking-modal" role="dialog" aria-modal="true" aria-labelledby="delete-event-title"><button className="modal-close" aria-label="Close delete confirmation" onClick={() => setDeleting(null)} disabled={saving}>×</button><span className="eyebrow">REMOVE FROM LINEUP</span><h2 id="delete-event-title">Delete this event?</h2><p className="modal-event-name">{deleting.name}</p><p className="modal-note">Events with any booking history cannot be deleted. If deletion is allowed, its generated seats will also be removed.</p><div className="modal-actions"><button className="button button-secondary" disabled={saving} onClick={() => setDeleting(null)}>Keep event</button><button className="button button-danger" disabled={saving} onClick={() => void confirmDelete()}>{saving ? <><span className="spinner" /> Deleting…</> : <>Delete event <Trash2 size={15} /></>}</button></div></section></div>}
    </PageShell>
  );
}
