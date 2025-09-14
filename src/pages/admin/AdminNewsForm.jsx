import { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import { useNavigate, useParams } from 'react-router-dom';
import { newsAPI } from '../../utils/api';
import { getImageUrl } from '../../utils/helpers';

export default function AdminNewsForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [status, setStatus] = useState('published');
  const [imageFile, setImageFile] = useState(null);
  const [image, setImage] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res = await newsAPI.getById(id);
        const n = res.data;
        setTitle(n.title || '');
        setContent(n.content || '');
        setExcerpt(n.excerpt || '');
        setStatus(n.status || 'draft');
        setImage(n.image || '');
      } catch (e) { console.error(e); }
    })();
  }, [id, isEdit]);

  // Cleanup preview URL when file changes or component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleUpload = async () => {
    if (!imageFile) return '';
    const res = await newsAPI.uploadImage(imageFile, isEdit ? id : null);
    return res.data.filename;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let filename = image;
      if (imageFile) {
        filename = await handleUpload();
      }
      const payload = { title, content, excerpt, image: filename, status };
      if (isEdit) {
        await newsAPI.update(id, payload);
      } else {
        await newsAPI.create(payload);
      }
      navigate('/admin/berita');
    } catch (e) {
      console.error(e);
      alert('Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">{isEdit ? 'Edit' : 'Tambah'} Berita</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
        <div>
          <label className="block text-sm mb-1">Judul</label>
          <input className="w-full border rounded px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Ringkasan</label>
          <textarea className="w-full border rounded px-3 py-2" rows={3} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Konten</label>
          <ReactQuill theme="snow" value={content} onChange={setContent} className="bg-white" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Gambar</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setImageFile(file);
                if (previewUrl) URL.revokeObjectURL(previewUrl);
                setPreviewUrl(file ? URL.createObjectURL(file) : '');
              }}
            />
            {(previewUrl || (isEdit && image)) && (
              <div className="mt-3">
                <div className="text-xs text-gray-600 mb-1">Preview</div>
                <img
                  src={previewUrl || getImageUrl(image)}
                  alt="Preview gambar"
                  className="h-32 w-32 object-cover rounded border"
                />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm mb-1">Status</label>
            <select className="w-full border rounded px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="published">Terbit</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <button disabled={saving} className="bg-primary-600 text-white px-4 py-2 rounded disabled:opacity-50" type="submit">Simpan</button>
          <button type="button" className="border px-4 py-2 rounded" onClick={() => navigate(-1)}>Batal</button>
        </div>
      </form>
    </div>
  );
}


