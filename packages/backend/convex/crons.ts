import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Limpiar salas inactivas cada 15 minutos
crons.interval(
  "cleanup stale wavelength rooms",
  { minutes: 15 },
  internal.wavelength.cleanup.cleanupStaleRooms
);

export default crons;
