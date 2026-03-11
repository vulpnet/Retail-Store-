import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Tag } from 'lucide-react';

export default function Promotions() {
  const [promotions, setPromotions] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);

  const [formData, setFormData] = useState({
    Name: '',
    DiscountPercentage: '',
    StartDate: '',
    EndDate: '',
    Active: true,
  });

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = () => {
    fetch('/api/promotions')
      .then((res) => res.json())
      .then((data) => setPromotions(data));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const method = editingPromo ? 'PUT' : 'POST';
    const url = editingPromo ? `/api/promotions/${editingPromo.Id}` : '/api/promotions';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    }).then(() => {
      setShowModal(false);
      fetchPromotions();
      setEditingPromo(null);
      setFormData({ Name: '', DiscountPercentage: '', StartDate: '', EndDate: '', Active: true });
    });
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this promotion?')) {
      fetch(`/api/promotions/${id}`, { method: 'DELETE' }).then(() => fetchPromotions());
    }
  };

  const openEditModal = (promo) => {
    setEditingPromo(promo);
    setFormData({
      Name: promo.Name,
      DiscountPercentage: promo.DiscountPercentage,
      StartDate: promo.StartDate.split('T')[0],
      EndDate: promo.EndDate.split('T')[0],
      Active: promo.Active === 1,
    });
    setShowModal(true);
  };

  const filteredPromotions = promotions.filter((p) =>
    p.Name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Promotions</h1>
        <button
          onClick={() => {
            setEditingPromo(null);
            setFormData({ Name: '', DiscountPercentage: '', StartDate: '', EndDate: '', Active: true });
            setShowModal(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Promotion</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm flex items-center space-x-3">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search promotions..."
          className="flex-1 outline-none text-gray-700"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Promotions Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-medium">Promotion</th>
              <th className="px-6 py-4 font-medium">Discount</th>
              <th className="px-6 py-4 font-medium">Start Date</th>
              <th className="px-6 py-4 font-medium">End Date</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredPromotions.map((promo) => (
              <tr key={promo.Id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <Tag className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-gray-900">{promo.Name}</span>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">{promo.DiscountPercentage}%</td>
                <td className="px-6 py-4 text-gray-600">{new Date(promo.StartDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-gray-600">{new Date(promo.EndDate).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      promo.Active === 1
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {promo.Active === 1 ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button onClick={() => openEditModal(promo)} className="text-blue-600 hover:text-blue-800">
                    <Edit className="w-5 h-5 inline" />
                  </button>
                  <button onClick={() => handleDelete(promo.Id)} className="text-red-600 hover:text-red-800">
                    <Trash2 className="w-5 h-5 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingPromo ? 'Edit Promotion' : 'Add Promotion'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  required
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  value={formData.Name}
                  onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Percentage (%)</label>
                <input
                  required
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  value={formData.DiscountPercentage}
                  onChange={(e) => setFormData({ ...formData, DiscountPercentage: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    required
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    value={formData.StartDate}
                    onChange={(e) => setFormData({ ...formData, StartDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    required
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    value={formData.EndDate}
                    onChange={(e) => setFormData({ ...formData, EndDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <input
                  type="checkbox"
                  id="active"
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={formData.Active}
                  onChange={(e) => setFormData({ ...formData, Active: e.target.checked })}
                />
                <label htmlFor="active" className="text-sm font-medium text-gray-700">
                  Active
                </label>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
