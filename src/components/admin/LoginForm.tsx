"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/admin";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      // replace + refresh: cookie je postavljen, server treba ponovo
      // izračunati zaštićene rute
      router.replace(next.startsWith("/admin") ? next : "/admin");
      router.refresh();
      return;
    }
    const data = await res.json().catch(() => ({}));
    setError(data?.error || "Prijava nije uspjela.");
    setBusy(false);
  }

  return (
    <form className="adm-login-box" onSubmit={submit}>
      <h1>Mali Istraživači — Admin</h1>
      <p>Unesite administratorsku lozinku.</p>

      {error ? <div className="adm-note adm-note-err">{error}</div> : null}

      <div className="adm-field">
        <label htmlFor="pw">Lozinka</label>
        <input
          id="pw"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          required
        />
      </div>

      <button className="adm-btn adm-btn-primary" disabled={busy || !password}>
        {busy ? "Prijavljujem…" : "PRIJAVI SE"}
      </button>
    </form>
  );
}
