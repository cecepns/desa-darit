import { useState, useEffect } from 'react';
import { apbAPI } from '../../utils/api';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Save,
  X
} from 'lucide-react';

const AdminAPBPage = () => {
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [incomeData, setIncomeData] = useState([]);
  const [expenditureData, setExpenditureData] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [expenditureCategories, setExpenditureCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('years');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

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
      const [yearsResponse, incomeCategoriesResponse, expenditureCategoriesResponse] = await Promise.all([
        apbAPI.years.getAll(),
        apbAPI.categories.income.getAll(),
        apbAPI.categories.expenditure.getAll()
      ]);
      
      setYears(yearsResponse.data.data || []);
      setIncomeCategories(incomeCategoriesResponse.data.data || []);
      setExpenditureCategories(expenditureCategoriesResponse.data.data || []);
      
      if (yearsResponse.data.data && yearsResponse.data.data.length > 0) {
        setSelectedYear(yearsResponse.data.data[0]);
      }
    } catch (error) {
      console.error('Error fetching APB data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchYearData = async (yearId) => {
    try {
      const [incomeResponse, expenditureResponse] = await Promise.all([
        apbAPI.income.getByYear(yearId),
        apbAPI.expenditure.getByYear(yearId)
      ]);
      
      setIncomeData(incomeResponse.data.data || []);
      setExpenditureData(expenditureResponse.data.data || []);
    } catch (error) {
      console.error('Error fetching year data:', error);
    }
  };

  const handleCreateYear = async () => {
    try {
      const newYear = {
        year: new Date().getFullYear(),
        status: 'draft'
      };
      
      const response = await apbAPI.years.create(newYear);
      setYears([...years, response.data.data]);
      setSelectedYear(response.data.data);
    } catch (error) {
      console.error('Error creating year:', error);
    }
  };

  const handleCreateIncome = async () => {
    try {
      const newIncome = {
        ...formData,
        year_id: selectedYear.id
      };
      
      const response = await apbAPI.income.create(newIncome);
      setIncomeData([...incomeData, response.data.data]);
      setShowForm(false);
      setFormData({});
    } catch (error) {
      console.error('Error creating income:', error);
    }
  };

  const handleCreateExpenditure = async () => {
    try {
      const newExpenditure = {
        ...formData,
        year_id: selectedYear.id
      };
      
      const response = await apbAPI.expenditure.create(newExpenditure);
      setExpenditureData([...expenditureData, response.data.data]);
      setShowForm(false);
      setFormData({});
    } catch (error) {
      console.error('Error creating expenditure:', error);
    }
  };

  const handleUpdateIncome = async () => {
    try {
      const response = await apbAPI.income.update(editingItem.id, formData);
      setIncomeData(incomeData.map(item => 
        item.id === editingItem.id ? response.data.data : item
      ));
      setShowForm(false);
      setEditingItem(null);
      setFormData({});
    } catch (error) {
      console.error('Error updating income:', error);
    }
  };

  const handleUpdateExpenditure = async () => {
    try {
      const response = await apbAPI.expenditure.update(editingItem.id, formData);
      setExpenditureData(expenditureData.map(item => 
        item.id === editingItem.id ? response.data.data : item
      ));
      setShowForm(false);
      setEditingItem(null);
      setFormData({});
    } catch (error) {
      console.error('Error updating expenditure:', error);
    }
  };

  const handleDeleteIncome = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data pendapatan ini?')) {
      try {
        await apbAPI.income.delete(id);
        setIncomeData(incomeData.filter(item => item.id !== id));
      } catch (error) {
        console.error('Error deleting income:', error);
      }
    }
  };

  const handleDeleteExpenditure = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data belanja ini?')) {
      try {
        await apbAPI.expenditure.delete(id);
        setExpenditureData(expenditureData.filter(item => item.id !== id));
      } catch (error) {
        console.error('Error deleting expenditure:', error);
      }
    }
  };

  const openForm = (type, item = null) => {
    setEditingItem(item);
    setFormData(item || {});
    setActiveTab(type);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormData({});
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'approved': return 'Disetujui';
      case 'draft': return 'Draft';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data APB Desa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola APB Desa</h1>
          <p className="text-gray-600">Anggaran Pendapatan dan Belanja Desa</p>
        </div>
        <button
          onClick={handleCreateYear}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Tahun
        </button>
      </div>

      {/* Year Selector */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Tahun Anggaran
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {years.map((year) => (
            <button
              key={year.id}
              onClick={() => setSelectedYear(year)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedYear?.id === year.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-xl font-bold text-gray-900">{year.year}</div>
              <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(year.status)}`}>
                {getStatusText(year.status)}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {formatCurrency(year.total_income)} / {formatCurrency(year.total_expenditure)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedYear && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Pendapatan</p>
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
                  <p className="text-sm font-medium text-gray-600">Total Belanja</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(selectedYear.total_expenditure)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${
                  (selectedYear.total_income - selectedYear.total_expenditure) >= 0 
                    ? 'bg-green-100' 
                    : 'bg-red-100'
                }`}>
                  <DollarSign className={`h-6 w-6 ${
                    (selectedYear.total_income - selectedYear.total_expenditure) >= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Surplus/Defisit</p>
                  <p className={`text-2xl font-bold ${
                    (selectedYear.total_income - selectedYear.total_expenditure) >= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {formatCurrency(selectedYear.total_income - selectedYear.total_expenditure)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                {[
                  { id: 'income', name: 'Pendapatan', icon: TrendingUp },
                  { id: 'expenditure', name: 'Belanja', icon: TrendingDown },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="h-4 w-4 mr-2" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Income Tab */}
              {activeTab === 'income' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Data Pendapatan Tahun {selectedYear.year}
                    </h3>
                    <button
                      onClick={() => openForm('income')}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Pendapatan
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
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {incomeData.map((item) => (
                          <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{item.source}</div>
                                {item.description && (
                                  <div className="text-sm text-gray-500">{item.description}</div>
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => openForm('income', item)}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteIncome(item.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Expenditure Tab */}
              {activeTab === 'expenditure' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Data Belanja Tahun {selectedYear.year}
                    </h3>
                    <button
                      onClick={() => openForm('expenditure')}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Belanja
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
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {expenditureData.map((item) => (
                          <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{item.activity}</div>
                                {item.description && (
                                  <div className="text-sm text-gray-500">{item.description}</div>
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => openForm('expenditure', item)}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteExpenditure(item.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
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

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingItem ? 'Edit' : 'Tambah'} {activeTab === 'income' ? 'Pendapatan' : 'Belanja'}
                </h3>
                <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                if (activeTab === 'income') {
                  editingItem ? handleUpdateIncome() : handleCreateIncome();
                } else {
                  editingItem ? handleUpdateExpenditure() : handleCreateExpenditure();
                }
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {activeTab === 'income' ? 'Sumber Pendapatan' : 'Kegiatan'}
                    </label>
                    <input
                      type="text"
                      value={formData.source || formData.activity || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        [activeTab === 'income' ? 'source' : 'activity']: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kategori
                    </label>
                    <select
                      value={formData.category_id || ''}
                      onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Pilih Kategori</option>
                      {(activeTab === 'income' ? incomeCategories : expenditureCategories).map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deskripsi
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Anggaran
                    </label>
                    <input
                      type="number"
                      value={formData.budgeted_amount || ''}
                      onChange={(e) => setFormData({ ...formData, budgeted_amount: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Realisasi
                    </label>
                    <input
                      type="number"
                      value={formData.realized_amount || ''}
                      onChange={(e) => setFormData({ ...formData, realized_amount: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAPBPage;
