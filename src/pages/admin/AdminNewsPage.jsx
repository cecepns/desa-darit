import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { newsAPI } from '../../utils/api';

export default function AdminNewsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const res = await newsAPI.getAll({ limit: 50 });
      setItems(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Hapus berita ini?')) return;
    try {
      await newsAPI.delete(id);
      await load();
    } catch (e) {
      console.error(e);
      alert('Gagal menghapus');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Manajemen Berita</h1>
        <button className="bg-primary-600 text-white px-3 py-2 rounded" onClick={() => navigate('/admin/berita/tambah')}>Tambah</button>
      </div>
      {loading ? (
        <div>Memuat…</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-3">Judul</th>
                <th className="p-3">Status</th>
                <th className="p-3 w-40">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((n) => (
                <tr key={n.id} className="border-t">
                  <td className="p-3">
                    <Link className="text-primary-600 hover:underline" to={`/berita/${n.id}`} target="_blank" rel="noreferrer">{n.title}</Link>
                  </td>
                  <td className="p-3">{n.status}</td>
                  <td className="p-3 space-x-2">
                    <button className="px-2 py-1 border rounded" onClick={() => navigate(`/admin/berita/edit/${n.id}`)}>Edit</button>
                    <button className="px-2 py-1 border rounded text-red-600" onClick={() => handleDelete(n.id)}>Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


