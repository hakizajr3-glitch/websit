import { useEffect, useState } from "react";
import { getCurrentUser, logout, updateProfile } from "@/lib/auth";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const current = getCurrentUser();
  const [name, setName] = useState(current?.name ?? "");
  const [email, setEmail] = useState(current?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!current) {
      navigate("/login");
    }
  }, [current, navigate]);

  if (!current) return null;

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    // Determine if sensitive ops are requested
    const changingEmail = email.trim().toLowerCase() !== current.email.toLowerCase();
    const changingPassword = !!newPassword;

    if ((changingEmail || changingPassword) && !currentPassword) {
      setError("Enter current password to change email or password.");
      return;
    }

    setLoading(true);
    const res = await updateProfile({
      id: current.id,
      name: name.trim(),
      email: email.trim(),
      currentPasswordForSensitiveOps: currentPassword || undefined,
      newPassword: newPassword || undefined,
    });
    setLoading(false);

    if (res.error) setError(res.error);
    else {
      setMessage("Profile updated.");
      setCurrentPassword("");
      setNewPassword("");
    }
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl mb-4">Your profile</h1>
      <form onSubmit={handleSaveProfile} className="flex flex-col gap-3">
        <label>
          <div className="text-sm mb-1">Full name</div>
          <input className="input" value={name} onChange={e => setName(e.target.value)} />
        </label>

        <label>
          <div className="text-sm mb-1">Email</div>
          <input className="input" value={email} onChange={e => setEmail(e.target.value)} type="email" />
        </label>

        <hr className="my-2" />

        <label>
          <div className="text-sm mb-1">Current password (required to change email/password)</div>
          <input className="input" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} type="password" />
        </label>

        <label>
          <div className="text-sm mb-1">New password (leave blank to keep)</div>
          <input className="input" value={newPassword} onChange={e => setNewPassword(e.target.value)} type="password" />
        </label>

        {error && <div className="text-red-600">{error}</div>}
        {message && <div className="text-green-700">{message}</div>}

        <div className="flex gap-2">
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save changes"}
          </button>
          <button type="button" className="btn-ghost" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </form>
    </main>
  );
}