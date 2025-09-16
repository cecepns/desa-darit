import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Users,
  MapPin,
  Award,
  TrendingUp,
  User,
  BarChart3,
  ShoppingBag,
  DollarSign,
  TrendingDown,
} from "lucide-react";
import {
  newsAPI,
  profileAPI,
  infographicsAPI,
  organizationAPI,
  shopAPI,
  apbAPI,
} from "../../utils/api";
import { getImageUrl } from "../../utils/helpers";
import { bannersAPI } from "../../utils/api";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const HomePage = () => {
  const [profile, setProfile] = useState(null);
  const [news, setNews] = useState([]);
  const [stats, setStats] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState([]);
  const [products, setProducts] = useState([]);
  const [apbData, setApbData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, newsRes, statsRes, orgRes, bannersRes, productsRes, apbYearsRes] = await Promise.all([
          profileAPI.get(),
          newsAPI.getAll({ limit: 3 }),
          infographicsAPI.get(),
          organizationAPI.getAll({ limit: 4 }),
          bannersAPI.getAll({ status: 'active', limit: 10 }),
          shopAPI.getAll({ limit: 3 }),
          apbAPI.years.getAll(),
        ]);

        setProfile(profileRes.data);
        setNews(newsRes.data.data || []);
        setStats(statsRes.data);
        setMembers(orgRes.data.data || []);
        setBanners(bannersRes.data.data || []);
        setProducts(productsRes.data.data || []);
        
        // Get current year APB data
        const currentYear = new Date().getFullYear();
        const apbYears = apbYearsRes.data.data || [];
        
        // Try to find current year data first, then fallback to latest available year
        let currentYearData = apbYears.find(year => year.year === currentYear);
        
        // If no data for current year, use the latest available year
        if (!currentYearData && apbYears.length > 0) {
          currentYearData = apbYears.sort((a, b) => b.year - a.year)[0];
        }
        
        if (currentYearData) {
          try {
            // Use summary API to get calculated totals
            const summaryRes = await apbAPI.summary.getAll();
            
            // Find the current year data from summary
            const currentYearSummary = summaryRes.data.data?.find(
              item => item.year === currentYearData.year
            );
            
            if (currentYearSummary) {
              // Convert string amounts to numbers
              const incomeTotal = parseFloat(currentYearSummary.total_income || 0);
              const expenditureTotal = parseFloat(currentYearSummary.total_expenditure || 0);
              
              setApbData({
                year: currentYearData.year,
                incomeTotal,
                expenditureTotal,
              });
            } else {
              // Fallback if no summary data found
              setApbData({
                year: currentYearData.year,
                incomeTotal: 0,
                expenditureTotal: 0,
              });
            }
          } catch (error) {
            console.error("Error fetching APB data:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="pt-20 lg:pt-20">
      {/* Banner Section using Swiper */}
      <section className="relative overflow-hidden">
        {banners.length > 0 ? (
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            navigation
            loop
            className="w-full h-64 lg:h-screen"
          >
            {banners.map((b) => (
              <SwiperSlide key={b.id}>
                <div className="relative w-full h-full">
                  <img
                    src={b.image ? getImageUrl(b.image) : 'https://images.pexels.com/photos/1851149/pexels-photo-1851149.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop'}
                    alt={b.title || 'Banner Desa Darit'}
                    className="w-full h-full object-cover"
                  />
                  {/* Only show overlay and content if there's title, description, or link */}
                  {(b.title || b.description || b.link) && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-black/20" />
                      <div className="absolute inset-0 flex items-center">
                        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8">
                          <div className="max-w-3xl text-white" data-aos="fade-up">
                            {b.title && (
                              <h2 className="text-3xl lg:text-6xl font-bold mb-4">{b.title}</h2>
                            )}
                            {b.description && (
                              <p className="text-base lg:text-lg text-white/90 mb-6" dangerouslySetInnerHTML={{ __html: b.description }} />
                            )}
                            {(b.link || b.title || b.description) && (
                              <div className="flex gap-3">
                                {b.link && (
                                  <a href={b.link} className="btn-primary inline-flex items-center" target="_blank" rel="noreferrer">
                                    Kunjungi <ArrowRight size={18} className="ml-2" />
                                  </a>
                                )}
                                <Link to="/profil" className="btn-secondary inline-flex items-center">
                                  Tentang Desa
                                  <ArrowRight size={18} className="ml-2" />
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="relative bg-gradient-to-r from-primary-700 to-primary-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
              <h1 className="text-4xl lg:text-6xl font-bold mb-6">Selamat Datang di <span className="text-yellow-300">Desa Darit</span></h1>
              <p className="text-lg lg:text-2xl text-white/90 mb-8">Kecamatan Menyuke, Kabupaten Landak, Kalimantan Barat</p>
              <div className="flex gap-3">
                <Link to="/profil" className="btn-primary inline-flex items-center">Pelajari Lebih Lanjut <ArrowRight size={18} className="ml-2" /></Link>
                <Link to="/berita" className="btn-secondary inline-flex items-center">Baca Berita Terbaru</Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Stats Section */}
      <section className="pt-10 md:pt-20 pb-20 bg-white section-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              className="text-center p-6 card hover:scale-105 transition-all duration-300"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <div className="w-12 h-12 orange-accent-gradient rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Users className="text-white" size={24} />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stats?.total_population || "1,234"}
              </div>
              <div className="text-gray-600 font-medium">Total Penduduk</div>
            </div>

            <div
              className="text-center p-6 card hover:scale-105 transition-all duration-300"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
                <MapPin className="text-white" size={24} />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {profile?.area || "25.5"} Ha
              </div>
              <div className="text-gray-600 font-medium">Luas Wilayah</div>
            </div>

            <div
              className="text-center p-6 card hover:scale-105 transition-all duration-300"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-500 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Award className="text-white" size={24} />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stats?.total_families || "456"}
              </div>
              <div className="text-gray-600 font-medium">Kepala Keluarga</div>
            </div>

            <div
              className="text-center p-6 card hover:scale-105 transition-all duration-300"
              data-aos="fade-up"
              data-aos-delay="400"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary-700 to-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
                <TrendingUp className="text-white" size={24} />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{profile?.dusun || "8"}</div>
              <div className="text-gray-600 font-medium">Dusun</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 green-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Layanan Desa Darit
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Berbagai layanan dan informasi yang tersedia untuk masyarakat Desa
              Darit
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Link
              to="/profil"
              className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 hover:scale-105 group"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <div className="w-12 h-12 orange-accent-gradient rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg">
                <User
                  className="text-white"
                  size={24}
                />
              </div>
              <h3 className="text-xl font-semibold text-primary-900 mb-4">
                Profil Desa
              </h3>
              <p className="text-primary-700 mb-4">
                Pelajari sejarah, visi misi, dan struktur organisasi Desa Darit
              </p>
              <span className="text-orange-600 font-medium group-hover:text-orange-700 inline-flex items-center">
                Lihat Detail <ArrowRight size={16} className="ml-1" />
              </span>
            </Link>

            <Link
              to="/infografis"
              className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 hover:scale-105 group"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg">
                <BarChart3
                  className="text-white"
                  size={24}
                />
              </div>
              <h3 className="text-xl font-semibold text-primary-900 mb-4">
                Data Infografis
              </h3>
              <p className="text-primary-700 mb-4">
                Statistik dan data demografis masyarakat Desa Darit
              </p>
              <span className="text-orange-600 font-medium group-hover:text-orange-700 inline-flex items-center">
                Lihat Data <ArrowRight size={16} className="ml-1" />
              </span>
            </Link>

            <Link
              to="/belanja"
              className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 hover:scale-105 group"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-500 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg">
                <ShoppingBag
                  className="text-white"
                  size={24}
                />
              </div>
              <h3 className="text-xl font-semibold text-primary-900 mb-4">
                Belanja Desa
              </h3>
              <p className="text-primary-700 mb-4">
                Produk UMKM dan hasil pertanian dari masyarakat Desa Darit
              </p>
              <span className="text-orange-600 font-medium group-hover:text-orange-700 inline-flex items-center">
                Lihat Produk <ArrowRight size={16} className="ml-1" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Village Head Welcome Section */}
      {(profile?.name_head_village || profile?.description_head_village) && (
        <section className="py-20 bg-white section-pattern">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16" data-aos="fade-up">
              <h2 className="text-3xl lg:text-4xl font-bold text-primary-900 mb-4">
                Sambutan Kepala Desa
              </h2>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-primary-50 to-white rounded-2xl shadow-xl overflow-hidden" data-aos="fade-up" data-aos-delay="100">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8 lg:p-12">
                  {/* Photo Section */}
                  <div className="lg:col-span-1 flex justify-center" data-aos="fade-right" data-aos-delay="200">
                    <div className="relative">
                      {profile?.head_village_image ? (
                        <div className="w-48 h-48 lg:w-56 lg:h-56 rounded-full overflow-hidden shadow-2xl border-4 border-white">
                          <img
                            src={getImageUrl(profile.head_village_image)}
                            alt={profile.name_head_village || "Kepala Desa"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-48 h-48 lg:w-56 lg:h-56 rounded-full bg-primary-100 flex items-center justify-center shadow-2xl border-4 border-white">
                          <User className="text-primary-400" size={80} />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Content Section */}
                  <div className="lg:col-span-2 flex flex-col justify-center" data-aos="fade-left" data-aos-delay="300">
                    {profile?.name_head_village && (
                      <div className="text-center lg:text-left mb-6">
                        <h3 className="text-2xl lg:text-3xl font-bold text-primary-900 mb-2">
                          {profile.name_head_village}
                        </h3>
                        <p className="text-primary-600 font-medium text-lg">
                          Kepala Desa Darit
                        </p>
                      </div>
                    )}
                    
                    {profile?.description_head_village && (
                      <div className="text-primary-700 leading-relaxed">
                        <div 
                          className="prose prose-lg max-w-none text-justify"
                          dangerouslySetInnerHTML={{ __html: profile.description_head_village }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Map Section */}
      <section className="pt-24 pb-20 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8" data-aos="fade-up">
            <h2 className="text-3xl lg:text-4xl font-bold text-primary-900 mb-3">
              Peta Desa Darit
            </h2>
            <p className="text-primary-700 max-w-2xl mx-auto">
              Lokasi dan batas wilayah perkiraan. Akan diperbarui dengan data resmi.
            </p>
          </div>
          <div data-aos="fade-up" data-aos-delay="100" className="rounded-lg overflow-hidden shadow-2xl border-4 border-white">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.8174774775844!2d109.32442731475447!3d-0.1507499996393!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e1d5b1b1b1b1b1b%3A0x1b1b1b1b1b1b1b1b!2sDesa%20Darit%2C%20Menyuke%2C%20Landak%20Regency%2C%20West%20Kalimantan!5e0!3m2!1sen!2sid!4v1642000000000!5m2!1sen!2sid"
              width="100%" 
              height="480" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Peta Desa Darit"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Organization Section (limit 4) */}
      {members.length > 0 && (
        <section className="py-20 bg-gray-50 section-pattern">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16" data-aos="fade-up">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Struktur Organisasi
              </h2>
              <p className="text-xl text-gray-600">
                Sebagian pengurus dan perangkat Desa Darit
              </p>
            </div>
            <div
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              data-aos="fade-up"
            >
              {members.map((m, idx) => (
                <div key={m.id || idx} className="rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="w-full h-28 md:h-64 bg-gradient-to-br from-slate-100 to-gray-200">
                    {m.image ? (
                      <img
                        src={getImageUrl(m.image)}
                        alt={m.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary-500">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="orange-accent-gradient p-4 h-24 md:h-auto flex flex-col items-center justify-center">
                    <h4 className="text-sm md:text-xl font-semibold text-white font-bold text-center line-clamp-1 mb-2">
                      {m.name}
                    </h4>
                    <p className="text-xs md:text-sm text-white/90 text-center">{m.position}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-12" data-aos="fade-up">
              <Link
                to="/profil"
                className="btn-primary inline-flex items-center"
              >
                Lihat Struktur Lengkap
                <ArrowRight size={20} className="ml-2" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Administrasi Penduduk Section */}
      <section className="py-20 bg-white section-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Administrasi Penduduk
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Sistem digital yang berfungsi mempermudah pengelolaan data dan informasi terkait dengan kependudukan dan pendayagunaannya untuk pelayanan publik yang efektif dan efisien
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              className="text-center p-6 card hover:scale-105 transition-all duration-300"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <div className="w-12 h-12 orange-accent-gradient rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Users className="text-white" size={24} />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stats?.total_population || "1,234"}
              </div>
              <div className="text-gray-600 font-medium">Jumlah Penduduk</div>
            </div>

            <div
              className="text-center p-6 card hover:scale-105 transition-all duration-300"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
                <User className="text-white" size={24} />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stats?.total_families || "456"}
              </div>
              <div className="text-gray-600 font-medium">Kepala Keluarga</div>
            </div>

            <div
              className="text-center p-6 card hover:scale-105 transition-all duration-300"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Users className="text-white" size={24} />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stats?.male_population || "612"}
              </div>
              <div className="text-gray-600 font-medium">Total Laki-laki</div>
            </div>

            <div
              className="text-center p-6 card hover:scale-105 transition-all duration-300"
              data-aos="fade-up"
              data-aos-delay="400"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Users className="text-white" size={24} />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stats?.female_population || "622"}
              </div>
              <div className="text-gray-600 font-medium">Total Perempuan</div>
            </div>
          </div>
        </div>
      </section>

      {/* APB Desa 2025 Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 section-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              APB Desa {apbData?.year || new Date().getFullYear()}
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Akses cepat dan transparan terhadap APB Desa serta proyek pembangunan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Pendapatan Desa Card */}
            <div
              className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 hover:scale-105 border-l-4 border-green-500"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="text-white" size={28} />
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 font-medium">Total Pendapatan</div>
                  <div className="text-xs text-gray-400">Tahun {apbData?.year || new Date().getFullYear()}</div>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Pendapatan Desa</h3>
                <div className="text-3xl lg:text-4xl font-bold text-green-600 mb-2">
                  {apbData ? formatCurrency(apbData.incomeTotal) : "Rp 0"}
                </div>
                <div className="text-sm text-gray-500">
                  {apbData?.incomeTotal > 0 ? "Anggaran yang telah dialokasikan" : "Data belum tersedia"}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-green-600">
                  <DollarSign size={16} className="mr-1" />
                  <span className="text-sm font-medium">Anggaran Masuk</span>
                </div>
                <Link 
                  to="/apb" 
                  className="text-green-600 hover:text-green-700 font-medium text-sm inline-flex items-center transition-colors"
                >
                  Lihat Detail <ArrowRight size={14} className="ml-1" />
                </Link>
              </div>
            </div>

            {/* Belanja Desa Card */}
            <div
              className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 hover:scale-105 border-l-4 border-orange-500"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingDown className="text-white" size={28} />
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 font-medium">Total Belanja</div>
                  <div className="text-xs text-gray-400">Tahun {apbData?.year || new Date().getFullYear()}</div>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Belanja Desa</h3>
                <div className="text-3xl lg:text-4xl font-bold text-orange-600 mb-2">
                  {apbData ? formatCurrency(apbData.expenditureTotal) : "Rp 0"}
                </div>
                <div className="text-sm text-gray-500">
                  {apbData?.expenditureTotal > 0 ? "Anggaran yang telah digunakan" : "Data belum tersedia"}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-orange-600">
                  <BarChart3 size={16} className="mr-1" />
                  <span className="text-sm font-medium">Pengeluaran</span>
                </div>
                <Link 
                  to="/apb" 
                  className="text-orange-600 hover:text-orange-700 font-medium text-sm inline-flex items-center transition-colors"
                >
                  Lihat Detail <ArrowRight size={14} className="ml-1" />
                </Link>
              </div>
            </div>
          </div>

          {/* Summary Card */}
          {apbData && (apbData.incomeTotal > 0 || apbData.expenditureTotal > 0) && (
            <div className="mt-8 max-w-2xl mx-auto" data-aos="fade-up" data-aos-delay="300">
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-xl p-6 text-white">
                <div className="text-center">
                  <h4 className="text-lg font-semibold mb-2">Ringkasan APB Desa {apbData.year}</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-300">
                        {formatCurrency(apbData.incomeTotal)}
                      </div>
                      <div className="text-sm text-white/80">Total Pendapatan</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-300">
                        {formatCurrency(apbData.expenditureTotal)}
                      </div>
                      <div className="text-sm text-white/80">Total Belanja</div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="text-lg font-semibold">
                      Saldo: <span className={apbData.incomeTotal - apbData.expenditureTotal >= 0 ? "text-green-300" : "text-red-300"}>
                        {formatCurrency(apbData.incomeTotal - apbData.expenditureTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="text-center mt-12" data-aos="fade-up" data-aos-delay="400">
            <Link to="/apb" className="btn-primary inline-flex items-center">
              Lihat Detail APB Lengkap
              <ArrowRight size={20} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="py-20 bg-white section-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Berita Terbaru
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Informasi terkini seputar kegiatan dan perkembangan di Desa Darit
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((item, index) => (
              <Link
                key={item.id}
                to={`/berita/${item.id}`}
                className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl overflow-hidden hover:scale-105 transition-all duration-300"
                data-aos="fade-up"
                data-aos-delay={100 + index * 100}
              >
                <img
                  src={
                    item.image
                      ? getImageUrl(item.image)
                      : "https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=600"
                  }
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="text-sm text-orange-600 font-medium mb-2">
                    {new Date(item.created_at).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 line-clamp-3 mb-4">
                    {item.excerpt ||
                      item.content.replace(/<[^>]*>/g, "").slice(0, 100) +
                        "..."}
                  </p>
                  <span className="text-orange-600 font-medium inline-flex items-center">
                    Baca Selengkapnya <ArrowRight size={16} className="ml-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12" data-aos="fade-up">
            <Link to="/berita" className="btn-primary inline-flex items-center">
              Lihat Semua Berita
              <ArrowRight size={20} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Shop Section */}
      {products.length > 0 && (
        <section className="py-20 green-gradient">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16" data-aos="fade-up">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Belanja dari Desa
              </h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Produk UMKM dan hasil pertanian dari masyarakat Desa Darit
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product, index) => (
                <Link
                  key={product.id}
                  to={`/belanja/${product.id}`}
                  className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl overflow-hidden hover:scale-105 transition-all duration-300"
                  data-aos="fade-up"
                  data-aos-delay={100 + index * 100}
                >
                  <div className="w-full h-48 bg-slate-50">
                    {product.image ? (
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ShoppingBag size={48} />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 line-clamp-3 mb-4">
                      {product.description ? 
                        product.description.replace(/<[^>]*>/g, "").slice(0, 100) + "..." : 
                        "Produk berkualitas dari Desa Darit"
                      }
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-orange-600">
                        Rp {Number(product.price).toLocaleString("id-ID")}
                      </div>
                      <span className="text-orange-600 font-medium inline-flex items-center">
                        Lihat Produk <ArrowRight size={16} className="ml-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12" data-aos="fade-up">
              <Link to="/belanja" className="btn-primary inline-flex items-center">
                Lihat Semua Produk
                <ArrowRight size={20} className="ml-2" />
              </Link>
            </div>
          </div>
        </section>
      )}

    </div>
  );
};

export default HomePage;
