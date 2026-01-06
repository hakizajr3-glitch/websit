import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUser } from "@/lib/auth";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill all fields.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const res = await createUser(name.trim(), email.trim(), password);
    setLoading(false);
    if (res.error) setError(res.error);
    else navigate("/profile");
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl mb-4">Create an account</h1>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <label>
          <div className="text-sm mb-1">Full name</div>
          <input className="input" value={name} onChange={e => setName(e.target.value)} />
        </label>
        <label>
          <div className="text-sm mb-1">Email</div>
          <input className="input" value={email} onChange={e => setEmail(e.target.value)} type="email" />
        </label>
        <label>
          <div className="text-sm mb-1">Password</div>
          <input className="input" value={password} onChange={e => setPassword(e.target.value)} type="password" />
        </label>
        <label>
          <div className="text-sm mb-1">Confirm password</div>
          <input className="input" value={confirm} onChange={e => setConfirm(e.target.value)} type="password" />
        </label>

        {error && <div className="text-red-600">{error}</div>}

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>
    </main>
  );
}