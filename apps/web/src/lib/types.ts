export type Event = {
  id: string;
  name: string;
  description: string;
  venue: string;
  date: string;
  totalSeats: number;
};

export type Seat = {
  id: string;
  eventId: string;
  row: number;
  seatNo: number;
  status: "AVAILABLE" | "BOOKED";
  createdAt: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "CUSTOMER";
  createdAt: string;
};

export type Booking = {
  id: string;
  userId: string;
  eventId: string;
  seatId: string;
  status: "CONFIRMED" | "CANCELLED";
  createdAt: string;
  event?: Event;
  seat?: Seat;
};
