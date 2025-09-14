import { useState, useEffect } from "react";
import { apbAPI } from "../../utils/api";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  BarChart3,
  Download,
} from "lucide-react";

const APBPage = () => {
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [incomeData, setIncomeData] = useState([]);
  const [expenditureData, setExpenditureData] = useState([]);
  const [, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchAPBData();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      fetchYearData(selectedYear.id);
    }
  }, [selectedYear]);

  const fetchAPBData = async () => {
    try {
      setLoading(true);
      const [yearsResponse, summaryResponse] = await Promise.all([
        apbAPI.years.getAll(),
        apbAPI.summary.getAll(),
      ]);

      setYears(yearsResponse.data.data || []);
      setSummary(summaryResponse.data.data || []);

      // Set default selected year (most recent)
      if (yearsResponse.data.data && yearsResponse.data.data.length > 0) {
        const mostRecentYear = yearsResponse.data.data.sort(
          (a, b) => b.year - a.year
        )[0];
        setSelectedYear(mostRecentYear);
      }
    } catch (error) {
      console.error("Error fetching APB data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchYearData = async (yearId) => {
    try {
      const [incomeResponse, expenditureResponse] = await Promise.all([
        apbAPI.income.getByYear(yearId),
        apbAPI.expenditure.getByYear(yearId),
      ]);

      setIncomeData(incomeResponse.data.data || []);
      setExpenditureData(expenditureResponse.data.data || []);
    } catch (error) {
      console.error("Error fetching year data:", error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };


  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Aktif";
      case "approved":
        return "Disetujui";
      case "draft":
        return "Draft";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data APB Desa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 md:pt-24 pb-12">
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center" data-aos="fade-up">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              APB Desa Darit
            </h1>
            <p className="text-xl text-gray-100">
              Anggaran Pendapatan dan Belanja Desa
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Year Selector */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Pilih Tahun Anggaran
            </h2>
            <div className="max-w-md">
              <select
                value={selectedYear?.id || ""}
                onChange={(e) => {
                  const yearId = parseInt(e.target.value);
                  const year = years.find(y => y.id === yearId);
                  setSelectedYear(year);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              >
                <option value="" disabled>
                  Pilih tahun anggaran...
                </option>
                {years
                  .sort((a, b) => b.year - a.year)
                  .map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.year} - {getStatusText(year.status)} - {formatCurrency(year.total_income)} / {formatCurrency(year.total_expenditure)}
                    </option>
                  ))}
              </select>
              {selectedYear && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-900">
                        Tahun {selectedYear.year}
                      </span>
                      <span
                        className={`ml-2 inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          selectedYear.status
                        )}`}
                      >
                        {getStatusText(selectedYear.status)}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        <span className="text-green-600 font-medium">
                          {formatCurrency(selectedYear.total_income)}
                        </span>
                        {" / "}
                        <span className="text-red-600 font-medium">
                          {formatCurrency(selectedYear.total_expenditure)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedYear && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Pendapatan
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(selectedYear.total_income)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Belanja
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(selectedYear.total_expenditure)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div
                    className={`p-2 rounded-lg ${
                      selectedYear.total_income -
                        selectedYear.total_expenditure >=
                      0
                        ? "bg-green-100"
                        : "bg-red-100"
                    }`}
                  >
                    <DollarSign
                      className={`h-6 w-6 ${
                        selectedYear.total_income -
                          selectedYear.total_expenditure >=
                        0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Surplus/Defisit
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        selectedYear.total_income -
                          selectedYear.total_expenditure >=
                        0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatCurrency(
                        selectedYear.total_income -
                          selectedYear.total_expenditure
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex flex-col md:flex-row md:space-x-8 px-6">
                  {[
                    { id: "overview", name: "Ringkasan", icon: BarChart3 },
                    { id: "income", name: "Pendapatan", icon: TrendingUp },
                    { id: "expenditure", name: "Belanja", icon: TrendingDown },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                        activeTab === tab.id
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <tab.icon className="h-4 w-4 mr-2" />
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Income Overview */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                          Rincian Pendapatan
                        </h3>
                        <div className="space-y-3">
                          {incomeData.map((item, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center p-3 bg-green-50 rounded-lg"
                            >
                              <div>
                                <p className="font-medium text-gray-900">
                                  {item.source}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {item.category_name}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-green-600">
                                  {formatCurrency(item.budgeted_amount)}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Realisasi:{" "}
                                  {formatCurrency(item.realized_amount)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Expenditure Overview */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <TrendingDown className="h-5 w-5 mr-2 text-red-600" />
                          Rincian Belanja
                        </h3>
                        <div className="space-y-3">
                          {expenditureData.map((item, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center p-3 bg-red-50 rounded-lg"
                            >
                              <div>
                                <p className="font-medium text-gray-900">
                                  {item.activity}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {item.category_name}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-red-600">
                                  {formatCurrency(item.budgeted_amount)}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Realisasi:{" "}
                                  {formatCurrency(item.realized_amount)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "income" && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Detail Pendapatan Tahun {selectedYear.year}
                      </h3>
                      <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <Download className="h-4 w-4 mr-2" />
                        Unduh Laporan
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Sumber Pendapatan
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Kategori
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Anggaran
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Realisasi
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Persentase
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {incomeData.map((item, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {item.source}
                                  </div>
                                  {item.description && (
                                    <div className="text-sm text-gray-500">
                                      {item.description}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  {item.category_name}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(item.budgeted_amount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(item.realized_amount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                    <div
                                      className="bg-green-600 h-2 rounded-full"
                                      style={{
                                        width: `${Math.min(
                                          (item.realized_amount /
                                            item.budgeted_amount) *
                                            100,
                                          100
                                        )}%`,
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    {Math.round(
                                      (item.realized_amount /
                                        item.budgeted_amount) *
                                        100
                                    )}
                                    %
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === "expenditure" && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Detail Belanja Tahun {selectedYear.year}
                      </h3>
                      <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <Download className="h-4 w-4 mr-2" />
                        Unduh Laporan
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Kegiatan
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Kategori
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Anggaran
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Realisasi
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Persentase
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {expenditureData.map((item, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {item.activity}
                                  </div>
                                  {item.description && (
                                    <div className="text-sm text-gray-500">
                                      {item.description}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                  {item.category_name}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(item.budgeted_amount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(item.realized_amount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                    <div
                                      className="bg-red-600 h-2 rounded-full"
                                      style={{
                                        width: `${Math.min(
                                          (item.realized_amount /
                                            item.budgeted_amount) *
                                            100,
                                          100
                                        )}%`,
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    {Math.round(
                                      (item.realized_amount /
                                        item.budgeted_amount) *
                                        100
                                    )}
                                    %
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default APBPage;
