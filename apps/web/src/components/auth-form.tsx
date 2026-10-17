"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Disc3, Music2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/format";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const signup = mode === "signup";
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (signup && name.trim().length < 2) { setError("Please enter your name."); return; }
    setSubmitting(true);
    try {
      if (signup) await api.signup({ name: name.trim(), email: email.trim(), password });
      else await api.signin({ email: email.trim(), password });
      const requestedNext = !signup ? new URLSearchParams(window.location.search).get("next") : null;
      const destination = requestedNext?.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/events";
      router.replace(destination);
      router.refresh();
    } catch (reason) {
      setError(getErrorMessage(reason));
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-story">
        <Link className="brand auth-brand" href="/events"><span className="brand-mark"><Disc3 size={18} /></span><span>rush<span className="brand-light">tix</span></span></Link>
        <div className="story-content">
          <span className="eyebrow light-eyebrow"><span className="live-dot" /> YOUR NEXT NIGHT OUT</span>
          <h1>Good nights<br />start <em>here.</em></h1>
          <p>Find the shows you’ll talk about long after the lights come up.</p>
          <div className="story-art"><div className="story-disc"><div className="disc-hole" /></div><div className="story-ticket"><Music2 size={21} /><span>LIVE MUSIC</span><b>ONE NIGHT<br />ONLY</b><small>ADMIT ONE</small></div><span className="story-spark spark-a">✳</span><span className="story-spark spark-b">✳</span></div>
        </div>
        <p className="story-footer">Find your people. Feel the music.</p>
      </section>
      <section className="auth-panel">
        <div className="auth-panel-top"><Link href="/events" className="back-link"><ArrowLeft size={15} /> Browse events</Link><span>{signup ? "Already have an account?" : "New to RushTix?"} <Link href={signup ? "/login" : "/signup"}>{signup ? "Sign in" : "Create an account"}</Link></span></div>
        <div className="auth-form-wrap">
          <span className="eyebrow">{signup ? "YOUR FRONT ROW STARTS NOW" : "WELCOME BACK"}</span>
          <h2>{signup ? "Join the crowd." : "Pick up where\nthe music left off."}</h2>
          <p className="auth-subtitle">{signup ? "Create your account and make your next night out count." : "Sign in to find your tickets and upcoming shows."}</p>
          <form className="auth-form" onSubmit={submit}>
            {signup && <label className="field-label">Your name<input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex Morgan" required minLength={2} /></label>}
            <label className="field-label">Email address<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></label>
            <label className="field-label">Password<input type="password" autoComplete={signup ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required /></label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button button-primary auth-submit" disabled={submitting} type="submit">{submitting ? <><span className="spinner" /> {signup ? "Creating your account…" : "Signing you in…"}</> : <>{signup ? "Create account" : "Sign in"} <ArrowRight size={17} /></>}</button>
          </form>
          <p className="auth-terms">By continuing, you agree to our <span>Terms of Service</span> and <span>Privacy Policy</span>.</p>
        </div>
        <p className="mobile-auth-foot">© {new Date().getFullYear()} RushTix</p>
      </section>
    </main>
  );
}
