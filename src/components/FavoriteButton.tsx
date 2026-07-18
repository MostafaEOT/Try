"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function FavoriteButton({ providerId }: { providerId: string }) {
  const { user } = useAuth();
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/favorites?userId=${user.id}`)
      .then((r) => r.json())
      .then((list: { id: string }[]) => {
        if (Array.isArray(list)) setFavorited(list.some((p) => p.id === providerId));
      })
      .catch(() => {});
  }, [user, providerId]);

  if (!user || user.role !== "customer") return null;

  const toggle = async () => {
    setLoading(true);
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, providerId }),
    }).then((r) => r.json()).catch(() => null);
    if (res) setFavorited(res.favorited);
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
        favorited
          ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
      }`}
      title={favorited ? "Remove from saved" : "Save provider"}
    >
      <span>{favorited ? "♥" : "♡"}</span>
      {favorited ? "Saved" : "Save"}
    </button>
  );
}
