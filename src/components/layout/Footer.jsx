import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Desa Info */}
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-2xl">D</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">Desa Darit</h3>
                <p className="text-gray-300">Kec. Menyuke, Kab. Landak</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Desa Darit adalah sebuah desa yang terletak di Kecamatan Menyuke, 
              Kabupaten Landak, Kalimantan Barat, Indonesia. Desa ini berkomitmen 
              untuk memberikan pelayanan terbaik kepada masyarakat.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-primary-400 transition-colors duration-200">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary-400 transition-colors duration-200">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary-400 transition-colors duration-200">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Menu</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-primary-400 transition-colors duration-200">
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/profil" className="text-gray-300 hover:text-primary-400 transition-colors duration-200">
                  Profil Desa
                </Link>
              </li>
              <li>
                <Link to="/infografis" className="text-gray-300 hover:text-primary-400 transition-colors duration-200">
                  Infografis
                </Link>
              </li>
              <li>
                <Link to="/berita" className="text-gray-300 hover:text-primary-400 transition-colors duration-200">
                  Berita
                </Link>
              </li>
              <li>
                <Link to="/belanja" className="text-gray-300 hover:text-primary-400 transition-colors duration-200">
                  Belanja
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Kontak</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin size={18} className="text-primary-400 mt-1 flex-shrink-0" />
                <p className="text-gray-300 text-sm">
                  Desa Darit, Kec. Menyuke<br />
                  Kab. Landak, Kalimantan Barat<br />
                  Indonesia
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={18} className="text-primary-400 flex-shrink-0" />
                <p className="text-gray-300 text-sm">+62 123 4567 8900</p>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={18} className="text-primary-400 flex-shrink-0" />
                <p className="text-gray-300 text-sm">info@desadarit.id</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-300 text-sm">
            © {currentYear} Desa Darit. Hak cipta dilindungi undang-undang.
          </p>
          <p className="text-gray-300 text-sm mt-2 sm:mt-0">
            Dibuat dengan ❤️ untuk masyarakat Desa Darit
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;