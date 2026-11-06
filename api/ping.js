/**
 * GET /api/ping — health check for the Node backend (BUILD 86).
 * Zero imports: if this answers, functions run at all in this project
 * and the fault is in the other endpoints' imports; if this 500s too,
 * functions are broken at project level.
 */
export default function handler(req, res) {
  res.status(200).json({ ok: true, build: 86 });
}
