import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { infographicsAPI } from '../../utils/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Users, Home, Venus, Mars } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function StatCard({ label, value, icon, gradientClass = "orange-accent-gradient" }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl hover:scale-105 transition-all duration-300" data-aos="fade-up">
      <div className="flex items-center gap-4">
        <div className={`shrink-0 w-12 h-12 rounded-lg ${gradientClass} flex items-center justify-center shadow-lg`}>
          {icon}
        </div>
        <div>
          <div className="text-gray-600 text-sm font-medium">{label}</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
        </div>
      </div>
    </div>
  );
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node,
  gradientClass: PropTypes.string,
};

export default function InfographicsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const makeBarData = (title, obj) => {
    const labels = obj ? Object.keys(obj) : [];
    const values = obj ? Object.values(obj) : [];
    return {
      labels,
      datasets: [
        {
          label: title,
          data: values,
          backgroundColor: 'rgba(37, 99, 235, 0.7)',
          borderColor: 'rgb(37, 99, 235)',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  };

  const commonOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: false },
        tooltip: { intersect: false, mode: 'index' },
      },
      scales: {
        x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true } },
        y: { beginAtZero: true }
      },
    }),
    []
  );

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await infographicsAPI.get();
        if (active) setData(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <div className="container mx-auto px-4 py-12">Memuat data…</div>;
  }

  if (!data) {
    return <div className="container mx-auto px-4 py-12">Data tidak tersedia.</div>;
  }

  return (
    <div className="pt-20 md:pt-24 pb-12">
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center" data-aos="fade-up">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">Infografis Desa Darit</h1>
            <p className="text-xl text-gray-100">
              Mengenal lebih dekat Desa Darit, Kecamatan Menyuke, Kabupaten Landak
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-8">
          <StatCard
            label="Jumlah Penduduk"
            value={data.total_population}
            icon={<Users className="w-6 h-6 text-white" />}
            gradientClass="orange-accent-gradient"
          />
          <StatCard
            label="Kepala Keluarga"
            value={data.total_families}
            icon={<Home className="w-6 h-6 text-white" />}
            gradientClass="bg-gradient-to-br from-amber-500 to-orange-500"
          />
          <StatCard
            label="Laki-laki"
            value={data.male_population}
            icon={<Mars className="w-6 h-6 text-white" />}
            gradientClass="bg-gradient-to-br from-blue-600 to-blue-500"
          />
          <StatCard
            label="Perempuan"
            value={data.female_population}
            icon={<Venus className="w-6 h-6 text-white" />}
            gradientClass="bg-gradient-to-br from-pink-600 to-pink-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl hover:scale-105 transition-all duration-300" data-aos="fade-up">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Kelompok Umur</h2>
            <div className="h-56 mb-4">
              <Bar data={makeBarData('Kelompok Umur', data.age_groups)} options={commonOptions} />
            </div>
            <ul className="space-y-2 text-sm">
              {data.age_groups && Object.entries(data.age_groups).map(([k, v]) => (
                <li key={k} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">{k}</span>
                  <span className="font-bold text-primary-600">{v}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl hover:scale-105 transition-all duration-300" data-aos="fade-up">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Pendidikan</h2>
            <div className="h-56 mb-4">
              <Bar data={makeBarData('Pendidikan', data.education_levels)} options={commonOptions} />
            </div>
            <ul className="space-y-2 text-sm">
              {data.education_levels && Object.entries(data.education_levels).map(([k, v]) => (
                <li key={k} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">{k}</span>
                  <span className="font-bold text-primary-600">{v}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl hover:scale-105 transition-all duration-300" data-aos="fade-up">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Pekerjaan</h2>
            <div className="h-56 mb-4">
              <Bar data={makeBarData('Pekerjaan', data.occupations)} options={commonOptions} />
            </div>
            <ul className="space-y-2 text-sm">
              {data.occupations && Object.entries(data.occupations).map(([k, v]) => (
                <li key={k} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">{k}</span>
                  <span className="font-bold text-primary-600">{v}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl hover:scale-105 transition-all duration-300" data-aos="fade-up">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Perkawinan & Agama</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Status Perkawinan</h3>
                <div className="h-48 mb-4">
                  <Bar data={makeBarData('Perkawinan', data.marital_status)} options={commonOptions} />
                </div>
                <ul className="space-y-2 text-sm">
                  {data.marital_status && Object.entries(data.marital_status).map(([k, v]) => (
                    <li key={k} className="flex justify-between items-center py-1 px-2 bg-gray-50 rounded">
                      <span className="font-medium text-gray-700">{k}</span>
                      <span className="font-bold text-primary-600">{v}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Agama</h3>
                <div className="h-48 mb-4">
                  <Bar data={makeBarData('Agama', data.religions)} options={commonOptions} />
                </div>
                <ul className="space-y-2 text-sm">
                  {data.religions && Object.entries(data.religions).map(([k, v]) => (
                    <li key={k} className="flex justify-between items-center py-1 px-2 bg-gray-50 rounded">
                      <span className="font-medium text-gray-700">{k}</span>
                      <span className="font-bold text-primary-600">{v}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}


