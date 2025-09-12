import { useEffect, useState } from "react";
import { contactSettingsAPI } from "../../utils/api";

export default function AdminContactSettingsPage() {
  const [form, setForm] = useState({
    address: "",
    phone: "",
    email: "",
    facebook_url: "",
    instagram_url: "",
    youtube_url: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await contactSettingsAPI.get();
        setForm({
          address: res.data.address || "",
          phone: res.data.phone || "",
          email: res.data.email || "",
          facebook_url: res.data.facebook_url || "",
          instagram_url: res.data.instagram_url || "",
          youtube_url: res.data.youtube_url || "",
        });
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await contactSettingsAPI.update(form);
      alert("Pengaturan kontak berhasil disimpan");
    } catch (e) {
      console.error(e);
      alert("Gagal menyimpan pengaturan kontak");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">Pengaturan Kontak & Media Sosial</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Informasi Kontak</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alamat
              </label>
              <textarea
                name="address"
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={form.address}
                onChange={handleChange}
                placeholder="Masukkan alamat lengkap desa..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Gunakan baris baru untuk memisahkan bagian alamat
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Telepon
                </label>
                <input
                  type="text"
                  name="phone"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+62 123 4567 8900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="info@desadarit.id"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Media Sosial</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facebook URL
              </label>
              <input
                type="url"
                name="facebook_url"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={form.facebook_url}
                onChange={handleChange}
                placeholder="https://facebook.com/desadarit"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram URL
              </label>
              <input
                type="url"
                name="instagram_url"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={form.instagram_url}
                onChange={handleChange}
                placeholder="https://instagram.com/desadarit"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube URL
              </label>
              <input
                type="url"
                name="youtube_url"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={form.youtube_url}
                onChange={handleChange}
                placeholder="https://youtube.com/@desadarit"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Preview Footer</h3>
          <div className="bg-gray-900 text-white p-4 rounded-lg">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-4 h-4 bg-primary-400 rounded-full mt-1 flex-shrink-0"></div>
                <p className="text-gray-300 text-sm">
                  {form.address ? form.address.split('\n').map((line, index) => (
                    <span key={index}>
                      {line}
                      {index < form.address.split('\n').length - 1 && <br />}
                    </span>
                  )) : "Alamat belum diisi"}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-primary-400 rounded-full flex-shrink-0"></div>
                <p className="text-gray-300 text-sm">{form.phone || "Nomor telepon belum diisi"}</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-primary-400 rounded-full flex-shrink-0"></div>
                <p className="text-gray-300 text-sm">{form.email || "Email belum diisi"}</p>
              </div>
            </div>
            <div className="flex space-x-4 mt-4">
              {form.facebook_url && (
                <a href={form.facebook_url} className="text-gray-300 hover:text-primary-400">
                  Facebook
                </a>
              )}
              {form.instagram_url && (
                <a href={form.instagram_url} className="text-gray-300 hover:text-primary-400">
                  Instagram
                </a>
              )}
              {form.youtube_url && (
                <a href={form.youtube_url} className="text-gray-300 hover:text-primary-400">
                  YouTube
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </div>
      </form>
    </div>
  );
}
