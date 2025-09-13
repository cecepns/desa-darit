import { useEffect, useState } from "react";
import { MapPin, Users, Home, TrendingUp, User } from "lucide-react";
import { profileAPI, organizationAPI } from "../../utils/api";
import { getImageUrl } from "../../utils/helpers";
import DesaDaritMap from "../../components/common/DesaDaritMap";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await profileAPI.get();
        setProfile(response.data);
        const org = await organizationAPI.getAll({ limit: 100 });
        setMembers(org.data.data || []);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="pt-20 md:pt-28">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center" data-aos="fade-up">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Profil Desa Darit
            </h1>
            <p className="text-xl text-gray-100">
              Mengenal lebih dekat Desa Darit, Kecamatan Menyuke, Kabupaten
              Landak
            </p>
          </div>
        </div>
      </section>

      {/* Village Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div data-aos="fade-right">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Tentang Desa Darit
              </h2>
              <div className="text-lg text-gray-600 leading-relaxed mb-6">
                {profile?.description ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: profile.description }}
                  />
                ) : (
                  <p>
                    Desa Darit adalah sebuah desa yang terletak di Kecamatan
                    Menyuke, Kabupaten Landak, Kalimantan Barat. Desa ini
                    memiliki luas wilayah sekitar 25,5 km² dengan jumlah
                    penduduk kurang lebih 1.234 jiwa yang terdiri dari 456
                    kepala keluarga.
                  </p>
                )}
              </div>
            </div>
            <div data-aos="fade-left">
              <img
                src={
                  profile?.main_image
                    ? getImageUrl(profile.main_image)
                    : "https://images.pexels.com/photos/1851149/pexels-photo-1851149.jpeg?auto=compress&cs=tinysrgb&w=800"
                }
                alt="Desa Darit"
                className="w-full h-96 object-cover rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* History */}
      {profile?.history && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16" data-aos="fade-up">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Sejarah Desa
              </h2>
              <p className="text-xl text-gray-600">
                Perjalanan sejarah pembentukan Desa Darit
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
              <div
                className="prose prose-lg max-w-none text-gray-600"
                data-aos="fade-up"
                dangerouslySetInnerHTML={{ __html: profile.history }}
              />
            </div>
          </div>
        </section>
      )}

      {/* Vision & Mission */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Visi & Misi
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="card p-8" data-aos="fade-up" data-aos-delay="100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Visi
              </h3>
              <div
                dangerouslySetInnerHTML={{
                  __html:
                    profile?.vision ||
                    `"Terwujudnya Desa Darit yang Maju, Mandiri, dan Sejahtera 
                Berlandaskan Gotong Royong dan Nilai-nilai Budaya Lokal"`,
                }}
                className="text-lg text-gray-600 leading-relaxed text-center"
              ></div>
            </div>

            <div className="card p-8" data-aos="fade-up" data-aos-delay="200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Misi
              </h3>
              <div className="text-gray-600 leading-relaxed">
                {profile?.mission ? (
                  <div dangerouslySetInnerHTML={{ __html: profile.mission }} />
                ) : (
                  <ol className="list-decimal list-inside space-y-2">
                    <li>
                      Meningkatkan kualitas sumber daya manusia melalui
                      pendidikan dan pelatihan
                    </li>
                    <li>
                      Mengembangkan potensi ekonomi desa berbasis kearifan lokal
                    </li>
                    <li>Memperkuat infrastruktur dan fasilitas publik</li>
                    <li>Melestarikan budaya dan lingkungan hidup</li>
                    <li>
                      Meningkatkan pelayanan publik yang transparan dan
                      akuntabel
                    </li>
                  </ol>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Village Statistics */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Data Desa
            </h2>
            <p className="text-xl text-gray-600">
              Informasi umum mengenai Desa Darit
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div
              className="text-center p-6 card hover:scale-105 transition-all duration-300"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <div className="w-12 h-12 orange-accent-gradient rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Users className="text-white" size={24} />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {profile?.population || "1,234"}
              </div>
              <div className="text-gray-600 font-medium">Total Penduduk</div>
            </div>

            <div
              className="text-center p-6 card hover:scale-105 transition-all duration-300"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Home className="text-white" size={24} />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {profile?.families || "456"}
              </div>
              <div className="text-gray-600 font-medium">Kepala Keluarga</div>
            </div>

            <div
              className="text-center p-6 card hover:scale-105 transition-all duration-300"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-500 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
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

      {/* Boundaries */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Batas Wilayah
            </h2>
            <p className="text-xl text-gray-600">
              Batas administratif Desa Darit
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card p-8" data-aos="fade-up" data-aos-delay="100">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Batas Wilayah
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Utara:</span>
                  <span className="text-gray-600">
                    {profile?.north_border || "Desa Sekayam"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Timur:</span>
                  <span className="text-gray-600">
                    {profile?.east_border || "Desa Menyuke"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Selatan:</span>
                  <span className="text-gray-600">
                    {profile?.south_border || "Desa Sungai Raya"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Barat:</span>
                  <span className="text-gray-600">
                    {profile?.west_border || "Desa Pahauman"}
                  </span>
                </div>
              </div>
            </div>

            <div className="card p-8" data-aos="fade-up" data-aos-delay="200">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Lokasi
              </h3>
              <div className="space-y-4">
                <div>
                  <span className="font-medium text-gray-700">Kecamatan:</span>
                  <span className="ml-2 text-gray-600">Menyuke</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Kabupaten:</span>
                  <span className="ml-2 text-gray-600">Landak</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Provinsi:</span>
                  <span className="ml-2 text-gray-600">Kalimantan Barat</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Kode Pos:</span>
                  <span className="ml-2 text-gray-600">79357</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8" data-aos="fade-up">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              Peta Desa Darit
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Lokasi dan batas wilayah perkiraan. Akan diperbarui dengan data
              resmi.
            </p>
          </div>
          <div
            data-aos="fade-up"
            data-aos-delay="100"
            className="rounded-lg overflow-hidden shadow"
          >
            <DesaDaritMap height="480px" />
          </div>
        </div>
      </section>

      {/* Village Structure */}
      {(members.length > 0 || profile?.structure_image) && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16" data-aos="fade-up">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Struktur Organisasi
              </h2>
              <p className="text-xl text-gray-600">
                Susunan pengurus dan perangkat Desa Darit
              </p>
            </div>
            {members.length > 0 && (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12"
                data-aos="fade-up"
              >
                {members.map((m, idx) => (
                  <div key={m.id || idx} className="rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="w-full h-64 bg-gradient-to-br from-slate-100 to-gray-200">
                      {m.image ? (
                        <img
                          src={getImageUrl(m.image)}
                          alt={m.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary-500">
                          <User size={48} />
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
            )}
            {profile?.structure_image && (
              <div className="flex justify-center" data-aos="zoom-in">
                <img
                  src={getImageUrl(profile.structure_image)}
                  alt="Struktur Organisasi Desa Darit"
                  className="max-w-full h-auto rounded-xl shadow-lg"
                />
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProfilePage;
