import type { Booking, Event, Seat, User } from "@/lib/types";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "/api/v1").replace(/\/$/, "");

type ApiEnvelope<T> = { data: T; message?: string; success?: boolean };

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "ApiError";
  }
}

type SignInUser = Omit<User, "role">;

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError("Could not reach RushTix. Check that the backend is running and try again.", 0);
  }

  const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) {
    const message = typeof payload.message === "string"
      ? payload.message
      : response.status === 401 || response.status === 403
        ? "Your session has expired. Please sign in again."
        : response.status === 404
          ? "We could not find what you were looking for."
          : response.status === 409
            ? "This seat is no longer available. Please choose another seat."
            : "Something went wrong. Please try again.";
    throw new ApiError(message, response.status);
  }
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiEnvelope<T>).data;
  }
  return payload as T;
}

export const api = {
  signup: (body: { name: string; email: string; password: string }) =>
    request<User>("/auth/signup", { method: "POST", body: JSON.stringify(body) }),
  signin: (body: { email: string; password: string }) =>
    request<SignInUser>("/auth/signin", { method: "POST", body: JSON.stringify(body) }),
  logout: () => request<{ message: string }>("/auth/logout", { method: "POST" }),
  me: () => request<User>("/auth/me"),
  events: (params: { search?: string; page?: number; limit?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    query.set("page", String(params.page ?? 1));
    query.set("limit", String(params.limit ?? 100));
    return request<Event[]>(`/events?${query.toString()}`);
  },
  event: (id: string) => request<Event>(`/events/${encodeURIComponent(id)}`),
  createEvent: (body: { name: string; description: string; venue: string; date: string; totalSeats: number }) =>
    request<Event>("/events", { method: "POST", body: JSON.stringify(body) }),
  updateEvent: (id: string, body: { name: string; description: string; venue: string; date: string }) =>
    request<Event>(`/events/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteEvent: (id: string) =>
    request<Event>(`/events/${encodeURIComponent(id)}`, { method: "DELETE" }),
  seats: (eventId: string) => request<Seat[]>(`/events/${encodeURIComponent(eventId)}/seats`),
  book: (eventId: string, seatId: string) =>
    request<Booking>(`/bookings/${encodeURIComponent(eventId)}`, { method: "POST", body: JSON.stringify({ seatId }) }),
  bookings: () => request<Booking[]>("/bookings"),
  cancelBooking: (bookingId: string) =>
    request<{ bookingId: string; status: string }>(`/bookings/${encodeURIComponent(bookingId)}`, { method: "PUT" }),
};
