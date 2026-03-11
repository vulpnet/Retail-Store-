import React, { useState, useEffect } from 'react';
import { Plus, Search, ShoppingCart, CheckCircle, Clock } from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    CustomerId: '',
    Items: [{ ProductId: '', Quantity: 1, UnitPrice: 0 }],
  });

  useEffect(() => {
    fetchOrders();
    fetchCustomers();
    fetchProducts();
  }, []);

  const fetchOrders = () => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => setOrders(data));
  };

  const fetchCustomers = () => {
    fetch('/api/customers')
      .then((res) => res.json())
      .then((data) => setCustomers(data));
  };

  const fetchProducts = () => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data));
  };

  const handleProductChange = (index, productId) => {
    const product = products.find((p) => p.Id === parseInt(productId));
    const newItems = [...formData.Items];
    newItems[index] = {
      ...newItems[index],
      ProductId: productId,
      UnitPrice: product ? product.Price : 0,
    };
    setFormData({ ...formData, Items: newItems });
  };

  const handleQuantityChange = (index, quantity) => {
    const newItems = [...formData.Items];
    newItems[index].Quantity = parseInt(quantity) || 1;
    setFormData({ ...formData, Items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      Items: [...formData.Items, { ProductId: '', Quantity: 1, UnitPrice: 0 }],
    });
  };

  const removeItem = (index) => {
    const newItems = formData.Items.filter((_, i) => i !== index);
    setFormData({ ...formData, Items: newItems });
  };

  const calculateTotal = () => {
    return formData.Items.reduce((sum, item) => sum + item.Quantity * item.UnitPrice, 0);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const payload = {
      CustomerId: formData.CustomerId,
      TotalAmount: calculateTotal(),
      Status: 'Completed',
      Items: formData.Items.filter((item) => item.ProductId !== ''),
    };

    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(() => {
      setShowModal(false);
      fetchOrders();
      setFormData({ CustomerId: '', Items: [{ ProductId: '', Quantity: 1, UnitPrice: 0 }] });
    });
  };

  const filteredOrders = orders.filter((o) =>
    o.CustomerName?.toLowerCase().includes(search.toLowerCase()) ||
    o.Id.toString().includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Create Order</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm flex items-center space-x-3">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search orders by customer or ID..."
          className="flex-1 outline-none text-gray-700"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-medium">Order ID</th>
              <th className="px-6 py-4 font-medium">Customer</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOrders.map((order) => (
              <tr key={order.Id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">#{order.Id}</td>
                <td className="px-6 py-4 text-gray-600">{order.CustomerName}</td>
                <td className="px-6 py-4 text-gray-500">
                  {new Date(order.CreatedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <span className="flex items-center space-x-1 text-green-600 bg-green-50 px-2 py-1 rounded-full w-max text-sm font-medium">
                    <CheckCircle className="w-4 h-4" />
                    <span>{order.Status}</span>
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-bold text-gray-900">
                  ${order.TotalAmount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Order</h2>
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                <select
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  value={formData.CustomerId}
                  onChange={(e) => setFormData({ ...formData, CustomerId: e.target.value })}
                >
                  <option value="">Select a customer</option>
                  {customers.map((c) => (
                    <option key={c.Id} value={c.Id}>
                      {c.Name} ({c.Email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Order Items</label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Item</span>
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.Items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <select
                        required
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={item.ProductId}
                        onChange={(e) => handleProductChange(index, e.target.value)}
                      >
                        <option value="">Select product</option>
                        {products.map((p) => (
                          <option key={p.Id} value={p.Id} disabled={p.StockQuantity < 1}>
                            {p.Name} - ${p.Price.toFixed(2)} ({p.StockQuantity} in stock)
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        required
                        className="w-24 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={item.Quantity}
                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                      />
                      <div className="w-24 text-right font-medium text-gray-700">
                        ${(item.Quantity * item.UnitPrice).toFixed(2)}
                      </div>
                      {formData.Items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-500 hover:text-red-700 p-2"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 flex justify-between items-center">
                <span className="text-lg font-medium text-gray-700">Total Amount:</span>
                <span className="text-2xl font-bold text-indigo-600">${calculateTotal().toFixed(2)}</span>
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
                  disabled={formData.Items.some(i => !i.ProductId)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  Complete Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
