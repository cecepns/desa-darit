import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { shopAPI } from '../../utils/api';

export default function AdminShopPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const res = await shopAPI.getAll({ limit: 50 });
      setItems(res.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Hapus produk ini?')) return;
    try { await shopAPI.delete(id); await load(); }
    catch (e) { console.error(e); alert('Gagal menghapus'); }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Manajemen Toko</h1>
        <button className="bg-primary-600 text-white px-3 py-2 rounded" onClick={() => navigate('/admin/toko/tambah')}>Tambah</button>
      </div>
      {loading ? (
        <div>Memuat…</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-3">Nama</th>
                <th className="p-3">Harga</th>
                <th className="p-3">Telepon</th>
                <th className="p-3 w-40">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((n) => (
                <tr key={n.id} className="border-t">
                  <td className="p-3">{n.name}</td>
                  <td className="p-3">Rp {Number(n.price).toLocaleString('id-ID')}</td>
                  <td className="p-3">{n.phone}</td>
                  <td className="p-3 space-x-2">
                    <button className="px-2 py-1 border rounded" onClick={() => navigate(`/admin/toko/edit/${n.id}`)}>Edit</button>
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


