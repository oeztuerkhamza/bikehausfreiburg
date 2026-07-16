// BikeHaus JWT doğrulama. Admin panel ile aynı JWT_SECRET_KEY kullanılır.
// Token kaynakları: Authorization: Bearer, ?token=, veya socket handshake.auth.token
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET_KEY || process.env.Jwt__Key || "";
const ISSUER = process.env.JWT_ISSUER || "BikeHausFreiburg";
const AUDIENCE = process.env.JWT_AUDIENCE || "BikeHausApp";

// Sır yoksa (yerel geliştirme) auth kapalı — kolay test için.
export const authRequired = !!SECRET;

export function verifyToken(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, SECRET, {
      issuer: ISSUER,
      audience: AUDIENCE,
      algorithms: ["HS256"],
    });
  } catch {
    return null;
  }
}

function extractToken(req) {
  const h = req.headers?.authorization || "";
  if (h.startsWith("Bearer ")) return h.slice(7);
  if (req.query && req.query.token) return String(req.query.token);
  return null;
}

// Express middleware: /api rotalarını korur.
export function requireAuth(req, res, next) {
  if (!authRequired) return next();
  const payload = verifyToken(extractToken(req));
  if (!payload) return res.status(401).json({ error: "yetkisiz" });
  req.user = payload;
  next();
}

// socket.io middleware
export function socketAuth(socket, next) {
  if (!authRequired) return next();
  const token =
    socket.handshake?.auth?.token ||
    socket.handshake?.query?.token ||
    null;
  if (!verifyToken(token)) return next(new Error("yetkisiz"));
  next();
}
