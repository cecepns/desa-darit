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

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white rounded-lg shadow p-4" data-aos="fade-up">
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <div className="text-gray-500 text-sm">{label}</div>
          <div className="text-2xl font-semibold mt-1">{value}</div>
        </div>
      </div>
    </div>
  );
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node,
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
    <div className="pb-12 pt-32">
      
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
            icon={<Users className="w-5 h-5" />}
          />
          <StatCard
            label="Kepala Keluarga"
            value={data.total_families}
            icon={<Home className="w-5 h-5" />}
          />
          <StatCard
            label="Laki-laki"
            value={data.male_population}
            icon={<Mars className="w-5 h-5" />}
          />
          <StatCard
            label="Perempuan"
            value={data.female_population}
            icon={<Venus className="w-5 h-5" />}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-4" data-aos="fade-up">
            <h2 className="font-semibold mb-3">Kelompok Umur</h2>
            <div className="h-56 mb-4">
              <Bar data={makeBarData('Kelompok Umur', data.age_groups)} options={commonOptions} />
            </div>
            <ul className="space-y-1 text-sm">
              {data.age_groups && Object.entries(data.age_groups).map(([k, v]) => (
                <li key={k} className="flex justify-between border-b py-1"><span>{k}</span><span className="font-medium">{v}</span></li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow p-4" data-aos="fade-up">
            <h2 className="font-semibold mb-3">Pendidikan</h2>
            <div className="h-56 mb-4">
              <Bar data={makeBarData('Pendidikan', data.education_levels)} options={commonOptions} />
            </div>
            <ul className="space-y-1 text-sm">
              {data.education_levels && Object.entries(data.education_levels).map(([k, v]) => (
                <li key={k} className="flex justify-between border-b py-1"><span>{k}</span><span className="font-medium">{v}</span></li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow p-4" data-aos="fade-up">
            <h2 className="font-semibold mb-3">Pekerjaan</h2>
            <div className="h-56 mb-4">
              <Bar data={makeBarData('Pekerjaan', data.occupations)} options={commonOptions} />
            </div>
            <ul className="space-y-1 text-sm">
              {data.occupations && Object.entries(data.occupations).map(([k, v]) => (
                <li key={k} className="flex justify-between border-b py-1"><span>{k}</span><span className="font-medium">{v}</span></li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow p-4" data-aos="fade-up">
            <h2 className="font-semibold mb-3">Perkawinan & Agama</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-56 mb-2">
                <Bar data={makeBarData('Perkawinan', data.marital_status)} options={commonOptions} />
              </div>
              <ul className="space-y-1 text-sm">
                {data.marital_status && Object.entries(data.marital_status).map(([k, v]) => (
                  <li key={k} className="flex justify-between border-b py-1"><span>{k}</span><span className="font-medium">{v}</span></li>
                ))}
              </ul>
              <div className="h-56 mb-2">
                <Bar data={makeBarData('Agama', data.religions)} options={commonOptions} />
              </div>
              <ul className="space-y-1 text-sm">
                {data.religions && Object.entries(data.religions).map(([k, v]) => (
                  <li key={k} className="flex justify-between border-b py-1"><span>{k}</span><span className="font-medium">{v}</span></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}


