import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "../../components/common/ReactQuillStyles.css";
import { profileAPI } from "../../utils/api";
import { organizationAPI } from "../../utils/api";
import { getImageUrl } from "../../utils/helpers";

export default function AdminProfilePage() {
  const [form, setForm] = useState({
    description: "",
    vision: "",
    mission: "",
    history: "",
    area: "",
    population: "",
    families: "",
    dusun: "",
    north_border: "",
    east_border: "",
    south_border: "",
    west_border: "",
    name_head_village: "",
    description_head_village: "",
  });
  const [imageFiles, setImageFiles] = useState({
    main_image: null,
    structure_image: null,
    map_image: null,
    head_village_image: null,
  });
  const [imagePreviews, setImagePreviews] = useState({
    main_image: "",
    structure_image: "",
    map_image: "",
    head_village_image: "",
  });
  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState([]);
  const [memberForm, setMemberForm] = useState({
    id: null,
    name: "",
    position: "",
    image: "",
  });
  const [memberImageFile, setMemberImageFile] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await profileAPI.get();
        setForm((f) => ({ ...f, ...res.data }));
        const org = await organizationAPI.getAll({ limit: 100 });
        setMembers(org.data.data || []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleProfileImageChange = (type, file) => {
    setImageFiles((prev) => ({ ...prev, [type]: file }));
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreviews((prev) => ({ ...prev, [type]: url }));
    } else {
      setImagePreviews((prev) => ({ ...prev, [type]: "" }));
    }
  };

  const handleProfileImageUpload = async (type) => {
    try {
      const file = imageFiles[type];
      if (!file) return alert("Pilih file terlebih dahulu");
      
      console.log("Uploading image with type:", type);
      console.log("File:", file);
      
      // For head_village_image, try different approach if the server doesn't support it yet
      if (type === 'head_village_image') {
        try {
          const res = await profileAPI.uploadImage(file, type);
          const filename = res.data.filename;
          setForm((f) => ({ ...f, [type]: filename }));
          alert("Gambar berhasil diunggah");
          return;
        } catch (error) {
          if (error.response?.data?.message === 'Invalid image type') {
            // Fallback: use alternative upload method
            console.log("Fallback: using alternative upload method for head_village_image");
            const res = await profileAPI.uploadHeadVillageImage(file);
            const filename = res.data.filename;
            
            // Manually update the head_village_image field in the form
            setForm((f) => ({ ...f, head_village_image: filename }));
            
            // Also manually save to backend by updating the profile
            try {
              const updatedForm = {
                ...form,
                head_village_image: filename,
                population: Number(form.population) || 0,
                families: Number(form.families) || 0,
                dusun: Number(form.dusun) || 0,
                area: String(form.area || ""),
              };
              await profileAPI.update(updatedForm);
              alert("Gambar kepala desa berhasil diunggah");
              return;
            } catch (updateError) {
              console.error("Update error:", updateError);
              alert("Gambar berhasil diupload tapi gagal menyimpan ke profil. Silakan simpan profil secara manual.");
              return;
            }
          }
          throw error;
        }
      }
      
      const res = await profileAPI.uploadImage(file, type);
      const filename = res.data.filename;
      setForm((f) => ({ ...f, [type]: filename }));
      alert("Gambar berhasil diunggah");
    } catch (e) {
      console.error("Upload error:", e);
      console.error("Error response:", e.response?.data);
      alert(`Gagal mengunggah gambar: ${e.response?.data?.message || e.message}`);
    }
  };

  const handleQuillChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await profileAPI.update({
        ...form,
        population: Number(form.population) || 0,
        families: Number(form.families) || 0,
        dusun: Number(form.dusun) || 0,
        area: String(form.area || ""),
      });
      alert("Tersimpan");
    } catch (e) {
      console.error(e);
      alert("Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handleMemberUpload = async () => {
    if (!memberImageFile) return "";
    const res = await organizationAPI.uploadImage(memberImageFile, memberForm.id || null);
    return res.data.filename;
  };

  const handleMemberSubmit = async (e) => {
    e.preventDefault();
    try {
      let filename = memberForm.image;
      if (memberImageFile) filename = await handleMemberUpload();
      const payload = {
        name: memberForm.name,
        position: memberForm.position,
        image: filename,
      };
      if (memberForm.id) await organizationAPI.update(memberForm.id, payload);
      else await organizationAPI.create(payload);
      const org = await organizationAPI.getAll({ limit: 100 });
      setMembers(org.data.data || []);
      setMemberForm({ id: null, name: "", position: "", image: "" });
      setMemberImageFile(null);
    } catch (e) {
      console.error(e);
      alert("Gagal menyimpan anggota");
    }
  };

  const handleMemberEdit = (m) => {
    setMemberForm({
      id: m.id,
      name: m.name,
      position: m.position,
      image: m.image || "",
    });
    setMemberImageFile(null);
  };

  const handleMemberDelete = async (id) => {
    if (!confirm("Hapus anggota ini?")) return;
    try {
      await organizationAPI.delete(id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (e) {
      console.error(e);
      alert("Gagal menghapus anggota");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Manajemen Profil Desa</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm mb-1">Deskripsi</label>
            <ReactQuill
              theme="snow"
              value={form.description || ""}
              onChange={(value) => handleQuillChange("description", value)}
              style={{ minHeight: "120px" }}
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['link'],
                  ['clean']
                ],
              }}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Sejarah</label>
            <ReactQuill
              theme="snow"
              value={form.history || ""}
              onChange={(value) => handleQuillChange("history", value)}
              style={{ minHeight: "120px" }}
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['link'],
                  ['clean']
                ],
              }}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Visi</label>
            <ReactQuill
              theme="snow"
              value={form.vision || ""}
              onChange={(value) => handleQuillChange("vision", value)}
              style={{ minHeight: "100px" }}
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['link'],
                  ['clean']
                ],
              }}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Misi</label>
            <ReactQuill
              theme="snow"
              value={form.mission || ""}
              onChange={(value) => handleQuillChange("mission", value)}
              style={{ minHeight: "100px" }}
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['link'],
                  ['clean']
                ],
              }}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm mb-1">Batas Utara</label>
            <input
              name="north_border"
              className="w-full border rounded px-3 py-2"
              value={form.north_border || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Batas Timur</label>
            <input
              name="east_border"
              className="w-full border rounded px-3 py-2"
              value={form.east_border || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Batas Selatan</label>
            <input
              name="south_border"
              className="w-full border rounded px-3 py-2"
              value={form.south_border || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Batas Barat</label>
            <input
              name="west_border"
              className="w-full border rounded px-3 py-2"
              value={form.west_border || ""}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm mb-1">Luas (Ha)</label>
            <input
              name="area"
              className="w-full border rounded px-3 py-2"
              value={form.area || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Penduduk</label>
            <input
              name="population"
              type="number"
              className="w-full border rounded px-3 py-2"
              value={form.population || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Kepala Keluarga</label>
            <input
              name="families"
              type="number"
              className="w-full border rounded px-3 py-2"
              value={form.families || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Jumlah Dusun</label>
            <input
              name="dusun"
              type="number"
              className="w-full border rounded px-3 py-2"
              value={form.dusun || ""}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-4">
            <label className="block text-sm mb-2 font-medium">Main Image</label>
            <div className="w-full h-40 bg-gray-100 rounded flex items-center justify-center overflow-hidden mb-3">
              {imagePreviews.main_image || form.main_image ? (
                <img
                  src={imagePreviews.main_image || getImageUrl(form.main_image)}
                  alt="Main"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400">Tidak ada gambar</span>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleProfileImageChange("main_image", e.target.files?.[0] || null)}
            />
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                className="px-3 py-1 bg-primary-600 text-white rounded"
                onClick={() => handleProfileImageUpload("main_image")}
              >
                Upload
              </button>
            </div>
          </div>
          <div className="card p-4">
            <label className="block text-sm mb-2 font-medium">Structure Image</label>
            <div className="w-full h-40 bg-gray-100 rounded flex items-center justify-center overflow-hidden mb-3">
              {imagePreviews.structure_image || form.structure_image ? (
                <img
                  src={imagePreviews.structure_image || getImageUrl(form.structure_image)}
                  alt="Structure"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400">Tidak ada gambar</span>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleProfileImageChange("structure_image", e.target.files?.[0] || null)}
            />
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                className="px-3 py-1 bg-primary-600 text-white rounded"
                onClick={() => handleProfileImageUpload("structure_image")}
              >
                Upload
              </button>
            </div>
          </div>
          {/* <div className="card p-4">
            <label className="block text-sm mb-2 font-medium">Map Image</label>
            <div className="w-full h-40 bg-gray-100 rounded flex items-center justify-center overflow-hidden mb-3">
              {imagePreviews.map_image || form.map_image ? (
                <img
                  src={imagePreviews.map_image || getImageUrl(form.map_image)}
                  alt="Map"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400">Tidak ada gambar</span>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleProfileImageChange("map_image", e.target.files?.[0] || null)}
            />
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                className="px-3 py-1 bg-primary-600 text-white rounded"
                onClick={() => handleProfileImageUpload("map_image")}
              >
                Upload
              </button>
            </div>
          </div> */}
        </div>
        <div>
          <button
            disabled={saving}
            className="bg-primary-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Simpan
          </button>
        </div>
      </form>

      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4">Sambutan Kepala Desa</h2>
        <div className="space-y-4 p-6 border rounded-lg bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Nama Kepala Desa</label>
              <input
                name="name_head_village"
                className="w-full border rounded px-3 py-2"
                value={form.name_head_village || ""}
                onChange={handleChange}
                placeholder="Masukkan nama kepala desa"
              />
            </div>
            <div className="card p-4">
              <label className="block text-sm mb-2 font-medium">Foto Kepala Desa</label>
              <div className="w-full h-40 bg-gray-100 rounded flex items-center justify-center overflow-hidden mb-3">
                {imagePreviews.head_village_image || form.head_village_image ? (
                  <img
                    src={imagePreviews.head_village_image || getImageUrl(form.head_village_image)}
                    alt="Head Village"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400">Tidak ada gambar</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleProfileImageChange("head_village_image", e.target.files?.[0] || null)}
              />
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  className="px-3 py-1 bg-primary-600 text-white rounded"
                  onClick={() => handleProfileImageUpload("head_village_image")}
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Sambutan Kepala Desa</label>
            <ReactQuill
              theme="snow"
              value={form.description_head_village || ""}
              onChange={(value) => handleQuillChange("description_head_village", value)}
              style={{ minHeight: "150px" }}
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['link'],
                  ['clean']
                ],
              }}
            />
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4">Struktur Organisasi</h2>
        <form onSubmit={handleMemberSubmit} className="space-y-3 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              className="border rounded px-3 py-2"
              placeholder="Nama"
              value={memberForm.name}
              onChange={(e) =>
                setMemberForm({ ...memberForm, name: e.target.value })
              }
              required
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="Jabatan"
              value={memberForm.position}
              onChange={(e) =>
                setMemberForm({ ...memberForm, position: e.target.value })
              }
              required
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setMemberImageFile(e.target.files?.[0] || null)}
            />
          </div>
          <div className="flex gap-2">
            <button
              className="bg-primary-600 text-white px-4 py-2 rounded"
              type="submit"
            >
              {memberForm.id ? "Update" : "Tambah"} Anggota
            </button>
            {memberForm.id && (
              <button
                type="button"
                className="border px-4 py-2 rounded"
                onClick={() => {
                  setMemberForm({
                    id: null,
                    name: "",
                    position: "",
                    image: "",
                  });
                  setMemberImageFile(null);
                }}
              >
                Batal
              </button>
            )}
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-3">Foto</th>
                <th className="p-3">Nama</th>
                <th className="p-3">Jabatan</th>
                <th className="p-3 w-40">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-t">
                  <td className="p-3">
                    {m.image ? (
                      <img
                        src={getImageUrl(m.image)}
                        alt={m.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="p-3">{m.name}</td>
                  <td className="p-3">{m.position}</td>
                  <td className="p-3 space-x-2">
                    <button
                      className="px-2 py-1 border rounded"
                      onClick={() => handleMemberEdit(m)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-2 py-1 border rounded text-red-600"
                      onClick={() => handleMemberDelete(m.id)}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
