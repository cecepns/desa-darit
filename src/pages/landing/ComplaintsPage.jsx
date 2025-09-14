import { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  Phone,
  User,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { complaintsAPI } from '../../utils/api';

const ComplaintsPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    category: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const categories = [
    { value: 'umum', label: 'Umum' },
    { value: 'sosial', label: 'Sosial' },
    { value: 'keamanan', label: 'Keamanan' },
    { value: 'kesehatan', label: 'Kesehatan' },
    { value: 'kebersihan', label: 'Kebersihan' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await complaintsAPI.create(formData);
      setSubmitStatus('success');
      setFormData({
        name: '',
        phone: '',
        category: '',
        description: ''
      });
    } catch (error) {
      console.error('Error submitting complaint:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-20 md:pt-24 pb-12">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center" data-aos="fade-up">
            <div className="flex items-center justify-center mb-4">
              <h1 className="text-4xl lg:text-5xl font-bold">
                Pengaduan Masyarakat
              </h1>
            </div>
            <p className="text-xl text-gray-100 max-w-3xl mx-auto">
              Sampaikan keluhan, saran, atau masukan Anda untuk kemajuan Desa Darit. 
              Setiap pengaduan akan ditindaklanjuti dengan serius oleh pemerintah desa.
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Form Pengaduan</h2>
                <p className="text-gray-600">Isi form di bawah ini untuk menyampaikan pengaduan Anda</p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <User className="w-5 h-5 inline mr-2" />
                Nama Lengkap
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-lg"
                placeholder="Masukkan nama lengkap Anda"
              />
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <Phone className="w-5 h-5 inline mr-2" />
                Nomor HP
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-lg"
                placeholder="Contoh: 081234567890"
              />
            </div>

            {/* Category Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <FileText className="w-5 h-5 inline mr-2" />
                Kategori Pengaduan
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-lg"
              >
                <option value="">Pilih kategori pengaduan</option>
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <AlertCircle className="w-5 h-5 inline mr-2" />
                Pengaduan / Deskripsi
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none text-lg"
                placeholder="Jelaskan keluhan atau pengaduan Anda secara detail..."
              />
            </div>

            {/* Submit Status */}
            {submitStatus === 'success' && (
              <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3 text-green-800">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-lg">Pengaduan berhasil dikirim!</p>
                    <p className="text-sm">Terima kasih atas pengaduan Anda. Tim kami akan segera menindaklanjuti.</p>
                  </div>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-3 text-red-800">
                  <XCircle className="w-6 h-6 text-red-600" />
                  <div>
                    <p className="font-semibold text-lg">Gagal mengirim pengaduan</p>
                    <p className="text-sm">Silakan coba lagi atau hubungi admin jika masalah berlanjut.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-3 text-lg"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Mengirim Pengaduan...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Kirim Pengaduan
                </>
              )}
            </button>
          </form>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Informasi Penting</h3>
            <p className="text-blue-800">
              Pengaduan yang Anda kirim akan diproses dalam waktu 1-3 hari kerja. 
              Kami akan menghubungi Anda melalui nomor HP yang telah diisi untuk memberikan update terkait pengaduan Anda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintsPage;
