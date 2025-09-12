import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { bannersAPI } from '../../utils/api';
import { getImageUrl } from '../../utils/helpers';

export default function AdminBannerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    link: '',
    image: '',
    status: 'active',
    sort_order: 0,
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        const res = await bannersAPI.getById(id);
        setForm({
          title: res.data.title || '',
          description: res.data.description || '',
          link: res.data.link || '',
          image: res.data.image || '',
          status: res.data.status || 'active',
          sort_order: res.data.sort_order || 0,
        });
      } catch (e) {
        console.error(e);
      }
    })();
  }, [id]);

  const handleUpload = async () => {
    if (!imageFile) return form.image;
    const res = await bannersAPI.uploadImage(imageFile);
    return res.data.filename;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const filename = await handleUpload();
      const payload = { ...form, image: filename };
      if (id) await bannersAPI.update(id, payload);
      else await bannersAPI.create(payload);
      navigate('/admin/banner');
    } catch (e) {
      console.error(e);
      alert('Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">{id ? 'Edit' : 'Tambah'} Banner</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Judul</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Link (opsional)</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              placeholder="https://..."
            />
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Deskripsi</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">Status</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Urutan</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
            />
          </div>
        </div>
        <div className="card p-4">
          <label className="block text-sm mb-2 font-medium">Gambar</label>
          <div className="w-full h-48 bg-gray-100 rounded flex items-center justify-center overflow-hidden mb-3">
            {preview || form.image ? (
              <img src={preview || getImageUrl(form.image)} alt="Banner" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400">Tidak ada gambar</span>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setImageFile(file);
              setPreview(file ? URL.createObjectURL(file) : '');
            }}
          />
        </div>
        <div>
          <button disabled={saving} className="bg-primary-600 text-white px-4 py-2 rounded disabled:opacity-50">
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
}


