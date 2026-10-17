"use client";

import { ArrowDown, ArrowUpRight, Search, Sparkles } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { EventCard } from "@/components/event-card";
import { ErrorNotice, LoadingGrid } from "@/components/notice";
import { PageShell } from "@/components/page-shell";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/format";
import type { Event } from "@/lib/types";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadEvents(search = query) {
    setLoading(true);
    setError("");
    try { setEvents(await api.events({ search, limit: 100 })); }
    catch (reason) { setError(getErrorMessage(reason)); }
    finally { setLoading(false); }
  }

  useEffect(() => { void loadEvents(""); }, []);

  function searchEvents(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = searchInput.trim();
    setQuery(nextQuery);
    void loadEvents(nextQuery);
  }

  return (
    <PageShell>
      <section className="events-hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="live-dot" /> THE LIVE MUSIC EDITION</div>
          <h1>Find your next<br /><em>live</em> moment.</h1>
          <p>The room goes dark. The first note lands. Find a show that makes the rest of the week worth it.</p>
          <a href="#upcoming" className="text-link">Explore what’s on <ArrowDown size={16} /></a>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-backdrop"><span className="hero-rings" /><span className="hero-moon" /><span className="hero-glow" /></div>
          <div className="hero-postcard"><div className="postcard-top"><span>RUSHTIX PRESENTS</span><Sparkles size={17} /></div><div className="postcard-art"><i /><i /><i /><i /><i /></div><div className="postcard-bottom"><span>MAKE<br />IT A<br /><b>LIVE ONE.</b></span><ArrowUpRight size={19} /></div></div>
          <span className="hero-caption">THE BEST NIGHTS ARE LIVE</span>
        </div>
      </section>
      <section className="events-section" id="upcoming">
        <div className="section-heading"><div><span className="eyebrow">THE LINEUP</span><h2>Shows worth showing up for<span className="heading-period">.</span></h2><p>Find your next reason to leave the house.</p></div><form className="search-form" onSubmit={searchEvents}><Search size={17} /><input aria-label="Search events" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search artists, venues…" /><button aria-label="Submit search" type="submit"><ArrowUpRight size={16} /></button></form></div>
        {loading ? <LoadingGrid /> : error ? <ErrorNotice message={error} onRetry={() => void loadEvents()} /> : events.length === 0 ? <div className="empty-events"><span className="empty-icon"><Search size={21} /></span><h3>{query ? "No shows found" : "The stage is waiting."}</h3><p>{query ? "Try another artist, venue, or search term." : "There are no upcoming events just yet. Check back soon for the latest lineup."}</p>{query && <button className="button button-secondary" onClick={() => { setSearchInput(""); setQuery(""); void loadEvents(""); }}>Clear search</button>}</div> : <div className="event-grid">{events.map((event, index) => <EventCard key={event.id} event={event} index={index} />)}</div>}
      </section>
    </PageShell>
  );
}
