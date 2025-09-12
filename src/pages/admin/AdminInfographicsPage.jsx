import { useEffect, useState } from 'react';
import { infographicsAPI } from '../../utils/api';

function ObjectEditor({ label, value, onChange }) {
  const [json, setJson] = useState('');
  useEffect(() => { setJson(JSON.stringify(value || {}, null, 2)); }, [value]);
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <textarea className="w-full border rounded px-3 py-2 font-mono" rows={8} value={json} onChange={(e) => setJson(e.target.value)} />
      <div className="text-xs text-gray-500 mt-1">Masukkan objek JSON. Contoh: {`{"SD": 10}`}</div>
      <button type="button" className="mt-2 border px-3 py-1 rounded" onClick={() => {
        try { onChange(JSON.parse(json)); } catch { alert('JSON tidak valid'); }
      }}>Terapkan</button>
    </div>
  );
}

export default function AdminInfographicsPage() {
  const [form, setForm] = useState({
    total_population: 0,
    total_families: 0,
    male_population: 0,
    female_population: 0,
    age_groups: {},
    education_levels: {},
    occupations: {},
    marital_status: {},
    religions: {},
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await infographicsAPI.get();
        setForm((f) => ({ ...f, ...res.data }));
      } catch (e) { console.error(e); }
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await infographicsAPI.update(form);
      alert('Tersimpan');
    } catch (e) { console.error(e); alert('Gagal menyimpan'); }
    finally { setSaving(false); }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Manajemen Infografis</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm mb-1">Penduduk</label>
            <input className="w-full border rounded px-3 py-2" value={form.total_population} onChange={(e) => setForm({ ...form, total_population: Number(e.target.value) || 0 })} />
          </div>
          <div>
            <label className="block text-sm mb-1">KK</label>
            <input className="w-full border rounded px-3 py-2" value={form.total_families} onChange={(e) => setForm({ ...form, total_families: Number(e.target.value) || 0 })} />
          </div>
          <div>
            <label className="block text-sm mb-1">Laki-laki</label>
            <input className="w-full border rounded px-3 py-2" value={form.male_population} onChange={(e) => setForm({ ...form, male_population: Number(e.target.value) || 0 })} />
          </div>
          <div>
            <label className="block text-sm mb-1">Perempuan</label>
            <input className="w-full border rounded px-3 py-2" value={form.female_population} onChange={(e) => setForm({ ...form, female_population: Number(e.target.value) || 0 })} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ObjectEditor label="Kelompok Umur" value={form.age_groups} onChange={(v) => setForm({ ...form, age_groups: v })} />
          <ObjectEditor label="Pendidikan" value={form.education_levels} onChange={(v) => setForm({ ...form, education_levels: v })} />
          <ObjectEditor label="Pekerjaan" value={form.occupations} onChange={(v) => setForm({ ...form, occupations: v })} />
          <ObjectEditor label="Perkawinan" value={form.marital_status} onChange={(v) => setForm({ ...form, marital_status: v })} />
          <ObjectEditor label="Agama" value={form.religions} onChange={(v) => setForm({ ...form, religions: v })} />
        </div>

        <div>
          <button disabled={saving} className="bg-primary-600 text-white px-4 py-2 rounded disabled:opacity-50">Simpan</button>
        </div>
      </form>
    </div>
  );
}


