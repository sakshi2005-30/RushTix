/*
  Warnings:

  - A unique constraint covering the columns `[eventId,row,seatNo]` on the table `Seat` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Seat_eventId_seatNo_key";

-- CreateIndex
CREATE UNIQUE INDEX "Seat_eventId_row_seatNo_key" ON "Seat"("eventId", "row", "seatNo");
