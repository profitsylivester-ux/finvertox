"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Users, UserPlus, X } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("finance");

  const fetchData = async () => {
    try {
      const [usersRes, meRes] = await Promise.all([
        fetch("/api/users", { cache: "no-store" }),
        fetch("/api/auth/me", { cache: "no-store" })
      ]);
      const usersData = await usersRes.json();
      const meData = await meRes.json();
      
      setUsers(usersData.users || []);
      setCurrentUser(meData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email, password, role }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setFirstName(""); setLastName(""); setEmail(""); setPassword("");
    setIsAdding(false);
    fetchData();
  };

  const handleUpdateUser = async (userId: number, updates: { role?: string; status?: string }) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      
      if (!res.ok) {
        alert("Error: " + data.error); // This will show the exact error
        return;
      }
      fetchData(); // Refresh list on success
    } catch (err) {
      alert("Network error. Check if server is running.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 font-sans text-slate-800 dark:text-slate-200">
      <div className="max-w-5xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" /> Users & Roles
              </h1>
            </div>
            <button onClick={() => setIsAdding(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
              <UserPlus className="w-4 h-4" /> Invite User
            </button>
          </div>

          {isAdding && (
            <div className="p-6 border-b border-slate-200 bg-blue-50/10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Invite New Team Member</h2>
                <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
              </div>
              {error && <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded">{error}</div>}
              <form onSubmit={handleInvite} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">First Name</label><input required type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-3 py-2 border rounded-md" /></div>
                <div><label className="block text-sm font-medium mb-1">Last Name</label><input required type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-3 py-2 border rounded-md" /></div>
                <div><label className="block text-sm font-medium mb-1">Email</label><input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-md" /></div>
                <div><label className="block text-sm font-medium mb-1">Password</label><input required type="text" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded-md" /></div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select value={role} onChange={e => setRole(e.target.value)} className="w-full px-3 py-2 border rounded-md">
                    <option value="finance">Finance Officer</option>
                    <option value="auditor">Auditor</option>
                  </select>
                </div>
                <div className="md:col-span-2 flex justify-end"><button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold">Send Invitation</button></div>
              </form>
            </div>
          )}

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-12 text-center text-slate-500">Loading team...</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Name</th>
                    <th className="px-6 py-4 font-semibold">Role</th>
                    <th className="px-6 py-4 font-semibold">Status (Click to toggle)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => {
                    const isSelf = user.id === currentUser?.id;
                    const isSuspended = user.status === 'suspended';

                    return (
                      <tr key={user.id} className={isSuspended ? 'opacity-50' : ''}>
                        <td className="px-6 py-4">
                          <p className="font-bold">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          {isSelf ? (
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-100 text-blue-700 uppercase">CEO (Admin)</span>
                          ) : (
                            <select 
                              value={user.role} 
                              onChange={(e) => handleUpdateUser(user.id, { role: e.target.value })}
                              className="px-3 py-1.5 border rounded-md text-xs font-semibold"
                            >
                              <option value="finance">Finance Officer</option>
                              <option value="auditor">Auditor</option>
                            </select>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {isSelf ? (
                             <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase">Active</span>
                          ) : (
                            <button 
                              onClick={() => handleUpdateUser(user.id, { status: isSuspended ? 'active' : 'suspended' })}
                              className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-all hover:scale-105 ${
                                isSuspended ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {isSuspended ? 'Suspended' : 'Active'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}