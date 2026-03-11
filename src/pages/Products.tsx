import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Package } from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    Name: '',
    CategoryId: '',
    Price: '',
    StockQuantity: '',
    ImageUrl: '',
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = () => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data));
  };

  const fetchCategories = () => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const method = editingProduct ? 'PUT' : 'POST';
    const url = editingProduct ? `/api/products/${editingProduct.Id}` : '/api/products';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    }).then(() => {
      setShowModal(false);
      fetchProducts();
      setEditingProduct(null);
      setFormData({ Name: '', CategoryId: '', Price: '', StockQuantity: '', ImageUrl: '' });
    });
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      fetch(`/api/products/${id}`, { method: 'DELETE' }).then(() => fetchProducts());
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      Name: product.Name,
      CategoryId: product.CategoryId,
      Price: product.Price,
      StockQuantity: product.StockQuantity,
      ImageUrl: product.ImageUrl || '',
    });
    setShowModal(true);
  };

  const filteredProducts = products.filter((p) =>
    p.Name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            setFormData({ Name: '', CategoryId: '', Price: '', StockQuantity: '', ImageUrl: '' });
            setShowModal(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm flex items-center space-x-3">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search products..."
          className="flex-1 outline-none text-gray-700"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-medium">Product</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Price</th>
              <th className="px-6 py-4 font-medium">Stock</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.map((product) => (
              <tr key={product.Id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 flex items-center space-x-4">
                  {product.ImageUrl ? (
                    <img src={product.ImageUrl} alt={product.Name} className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500">
                      <Package className="w-5 h-5" />
                    </div>
                  )}
                  <span className="font-medium text-gray-900">{product.Name}</span>
                </td>
                <td className="px-6 py-4 text-gray-600">{product.CategoryName}</td>
                <td className="px-6 py-4 font-medium text-gray-900">${product.Price.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.StockQuantity > 10
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {product.StockQuantity} in stock
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button onClick={() => openEditModal(product)} className="text-blue-600 hover:text-blue-800">
                    <Edit className="w-5 h-5 inline" />
                  </button>
                  <button onClick={() => handleDelete(product.Id)} className="text-red-600 hover:text-red-800">
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
              {editingProduct ? 'Edit Product' : 'Add Product'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  value={formData.CategoryId}
                  onChange={(e) => setFormData({ ...formData, CategoryId: e.target.value })}
                >
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c.Id} value={c.Id}>
                      {c.Name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    value={formData.Price}
                    onChange={(e) => setFormData({ ...formData, Price: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    required
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    value={formData.StockQuantity}
                    onChange={(e) => setFormData({ ...formData, StockQuantity: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  value={formData.ImageUrl}
                  onChange={(e) => setFormData({ ...formData, ImageUrl: e.target.value })}
                />
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
