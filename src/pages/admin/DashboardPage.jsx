import { useEffect, useState } from 'react';
import { dashboardAPI } from '../../utils/api';

function Card({ label, value }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-gray-500 text-sm">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await dashboardAPI.getStats();
        if (active) setStats(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  if (loading) return <div className="p-6">Memuat…</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card label="Berita" value={stats?.news_count ?? 0} />
        <Card label="Produk Aktif" value={stats?.products_count ?? 0} />
        <Card label="Pengguna" value={stats?.users_count ?? 0} />
        <Card label="Penduduk" value={stats?.population ?? 0} />
      </div>
    </div>
  );
}


