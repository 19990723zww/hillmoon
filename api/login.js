import { isAuthed, checkLogin, sessionCookie, clearCookie } from "./_utils.js";

export default function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({ authed: isAuthed(req) });
  }

  if (req.method === "POST") {
    const { user, pass } = req.body || {};
    if (checkLogin(user, pass)) {
      res.setHeader("Set-Cookie", sessionCookie());
      return res.status(200).json({ ok: true });
    }
    return res.status(401).json({ ok: false, error: "账号或密码不正确" });
  }

  if (req.method === "DELETE") {
    res.setHeader("Set-Cookie", clearCookie());
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", "GET, POST, DELETE");
  return res.status(405).json({ error: "method not allowed" });
}
