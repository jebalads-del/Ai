import { useState, useCallback } from "react";

export function useAdminUsers() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    totalRevenue: 0,
    todayUsage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/users?search=${encodeURIComponent(search)}&page=${page}`,
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsers(data.users || []);
      setStats({
        total: data.total,
        verified: data.verified,
        totalRevenue: data.totalRevenue,
        todayUsage: data.todayUsage,
      });
      setPages(data.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  const handleDelete = async (userId, showToast) => {
    if (typeof window !== "undefined" && !window.confirm("حذف المستخدم؟"))
      return;
    setDeletingId(userId);
    try {
      await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      setUsers((p) => p.filter((u) => u.id !== userId));
      showToast("تم الحذف ✓");
    } catch {
      showToast("فشل الحذف", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleVerify = async (userId, showToast) => {
    setVerifyingId(userId);
    try {
      const res = await fetch("/api/admin/verify-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل");
      setUsers((p) =>
        p.map((u) =>
          u.id === userId
            ? { ...u, email_verified: new Date().toISOString() }
            : u,
        ),
      );
      setStats((s) => ({ ...s, verified: s.verified + 1 }));
      showToast("تم التحقق ✓");
    } catch (e) {
      showToast("فشل: " + e.message, "error");
    } finally {
      setVerifyingId(null);
    }
  };

  return {
    users,
    stats,
    loading,
    search,
    setSearch,
    page,
    setPage,
    pages,
    deletingId,
    verifyingId,
    fetchUsers,
    handleDelete,
    handleVerify,
  };
}
