import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authenticate } from "@/lib/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await authenticate(email.trim(), password);
    setLoading(false);
    if (res.error) setError(res.error);
    else navigate("/profile");
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl mb-4">Log in</h1>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <label>
          <div className="text-sm mb-1">Email</div>
          <input className="input" value={email} onChange={e => setEmail(e.target.value)} type="email" />
        </label>
        <label>
          <div className="text-sm mb-1">Password</div>
          <input className="input" value={password} onChange={e => setPassword(e.target.value)} type="password" />
        </label>

        {error && <div className="text-red-600">{error}</div>}

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}