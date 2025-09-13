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
} from "lucide-react";
import {
  newsAPI,
  profileAPI,
  infographicsAPI,
  organizationAPI,
  shopAPI,
} from "../../utils/api";
import { getImageUrl } from "../../utils/helpers";
import { bannersAPI } from "../../utils/api";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import DesaDaritMap from "../../components/common/DesaDaritMap";

const HomePage = () => {
  const [profile, setProfile] = useState(null);
  const [news, setNews] = useState([]);
  const [stats, setStats] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, newsRes, statsRes, orgRes, bannersRes, productsRes] = await Promise.all([
          profileAPI.get(),
          newsAPI.getAll({ limit: 3 }),
          infographicsAPI.get(),
          organizationAPI.getAll({ limit: 4 }),
          bannersAPI.getAll({ status: 'active', limit: 10 }),
          shopAPI.getAll({ limit: 3 }),
        ]);

        setProfile(profileRes.data);
        setNews(newsRes.data.data || []);
        setStats(statsRes.data);
        setMembers(orgRes.data.data || []);
        setBanners(bannersRes.data.data || []);
        setProducts(productsRes.data.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="pt-28 lg:pt-20">
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
                    alt={b.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-black/20" />
                  <div className="absolute inset-0 flex items-center">
                    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8">
                      <div className="max-w-3xl text-white" data-aos="fade-up">
                        <h2 className="text-3xl lg:text-6xl font-bold mb-4">{b.title}</h2>
                        {b.description && (
                          <p className="text-base lg:text-lg text-white/90 mb-6" dangerouslySetInnerHTML={{ __html: b.description }} />
                        )}
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
                      </div>
                    </div>
                  </div>
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
      <section className="py-20 bg-white section-pattern">
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
                {profile?.area || "25.5"} km²
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
              <div className="text-3xl font-bold text-gray-900 mb-2">8</div>
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
            <DesaDaritMap height="480px" />
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
                {stats?.total_male || "612"}
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
                {stats?.total_female || "622"}
              </div>
              <div className="text-gray-600 font-medium">Total Perempuan</div>
            </div>
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
