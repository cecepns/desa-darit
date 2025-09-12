import { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import '../../components/common/ReactQuillStyles.css';
import { useNavigate, useParams } from 'react-router-dom';
import { BASE_IMAGE_URL, shopAPI } from '../../utils/api';

export default function AdminShopForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', description: '', price: '', category: '', phone: '', status: 'active' });
  const [imageFile, setImageFile] = useState(null);
  const [image, setImage] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res = await shopAPI.getById(id);
        const p = res.data;
        setForm({ name: p.name || '', description: p.description || '', price: String(p.price || ''), category: p.category || '', phone: p.phone || '', status: p.status || 'active' });
        setImage(p.image || '');
      } catch (e) { console.error(e); }
    })();
  }, [id, isEdit]);

  // Build preview URL for existing or newly selected image
  useEffect(() => {
    const UPLOAD_BASE = BASE_IMAGE_URL;
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
    if (image) {
      setPreviewUrl(`${UPLOAD_BASE}/${image}`);
      return;
    }
    setPreviewUrl('');
  }, [imageFile, image]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
  };

  const handleUpload = async () => {
    if (!imageFile) return '';
    const res = await shopAPI.uploadImage(imageFile);
    return res.data.filename;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let filename = image;
      if (imageFile) filename = await handleUpload();
      const payload = { ...form, price: Number(form.price) || 0, image: filename };
      if (isEdit) await shopAPI.update(id, payload); else await shopAPI.create(payload);
      navigate('/admin/toko');
    } catch (e) { console.error(e); alert('Gagal menyimpan'); }
    finally { setSaving(false); }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">{isEdit ? 'Edit' : 'Tambah'} Produk</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Nama</label>
            <input className="w-full border rounded px-3 py-2" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Kategori</label>
            <input className="w-full border rounded px-3 py-2" value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} />
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Deskripsi</label>
          <ReactQuill
            theme="snow"
            value={form.description}
            onChange={(val) => setForm((prev) => ({ ...prev, description: val }))}
            className="bg-white"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">Harga</label>
            <input className="w-full border rounded px-3 py-2" value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm mb-1">No. HP (WhatsApp)</label>
            <input className="w-full border rounded px-3 py-2" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm mb-1">Status</label>
            <select className="w-full border rounded px-3 py-2" value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Gambar</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {previewUrl ? (
            <div className="mt-3">
              <img
                src={previewUrl}
                alt="Preview gambar produk"
                className="h-40 w-40 object-cover rounded border"
              />
            </div>
          ) : null}
        </div>
        <div className="flex gap-2">
          <button disabled={saving} className="bg-primary-600 text-white px-4 py-2 rounded disabled:opacity-50" type="submit">Simpan</button>
          <button type="button" className="border px-4 py-2 rounded" onClick={() => navigate(-1)}>Batal</button>
        </div>
      </form>
    </div>
  );
}


