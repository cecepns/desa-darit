import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { bannersAPI } from '../../utils/api';
import { getImageUrl, formatDateTime } from '../../utils/helpers';

export default function AdminBannerPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const res = await bannersAPI.getAll({ limit: 100, search });
      setBanners(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Hapus banner ini?')) return;
    try {
      await bannersAPI.delete(id);
      setBanners((prev) => prev.filter((b) => b.id !== id));
    } catch (e) {
      console.error(e);
      alert('Gagal menghapus');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Manajemen Banner</h1>
        <Link to="/admin/banner/tambah" className="btn-primary px-4 py-2">Tambah Banner</Link>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <input
          className="border rounded px-3 py-2 w-full md:w-80"
          placeholder="Cari judul/deskripsi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="border px-3 py-2 rounded" onClick={fetchData}>Cari</button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-3">Gambar</th>
                <th className="p-3">Judul</th>
                <th className="p-3">Status</th>
                <th className="p-3">Urutan</th>
                <th className="p-3">Diperbarui</th>
                <th className="p-3 w-40">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((b) => (
                <tr key={b.id} className="border-t">
                  <td className="p-3">
                    {b.image ? (
                      <img src={getImageUrl(b.image)} alt={b.title} className="w-20 h-12 object-cover rounded" />
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="p-3">
                    <div className="font-medium">{b.title}</div>
                    <div className="text-xs text-gray-500 line-clamp-1">{b.description}</div>
                    {b.link && (
                      <a href={b.link} target="_blank" rel="noreferrer" className="text-xs text-primary-600">
                        {b.link}
                      </a>
                    )}
                  </td>
                  <td className="p-3">{b.status}</td>
                  <td className="p-3">{b.sort_order}</td>
                  <td className="p-3">{formatDateTime(b.updated_at)}</td>
                  <td className="p-3 space-x-2">
                    <button className="px-2 py-1 border rounded" onClick={() => navigate(`/admin/banner/edit/${b.id}`)}>Edit</button>
                    <button className="px-2 py-1 border rounded text-red-600" onClick={() => handleDelete(b.id)}>Hapus</button>
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


