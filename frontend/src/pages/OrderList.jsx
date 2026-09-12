import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, RefreshCw, User, LogIn } from 'lucide-react';
import { orderService } from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

const OrderList = () => {
  const { user, isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isAdmin) {
        const res = await orderService.getAllOrders();
        setOrders(res.data);
      } else if (user?.id) {
        const res = await orderService.getOrdersByCustomer(user.id);
        setOrders(res.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Unable to load orders. Make sure API Gateway and Order Service are operational.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Order History</h1>
          <p className="text-xs text-gray-500 mt-1">
            {isAdmin
              ? "Admin View: Showing all customer orders"
              : user
              ? `Showing orders for Customer #${user.id} (${user.email || user.username})`
              : "Real-time status updates across Order, Payment, and Notification services."}
          </p>
        </div>
        {user && (
          <button
            onClick={fetchOrders}
            className="flex items-center space-x-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
        )}
      </div>

      {!user ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm my-8">
          <div className="bg-slate-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <User className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Sign In to View Your Orders</h2>
          <p className="text-gray-500 text-xs mb-6 max-w-sm mx-auto">
            Please log in to your customer account to view your order history and track live order status.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-sky-600 text-white text-sm font-semibold rounded-xl hover:bg-sky-700 transition"
          >
            <LogIn className="h-4 w-4" />
            <span>Sign In Now</span>
          </Link>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-6 text-center my-8">
          <p className="font-semibold">{error}</p>
          <button
            onClick={fetchOrders}
            className="mt-4 px-4 py-2 bg-rose-600 text-white text-sm font-medium rounded-lg hover:bg-rose-700 transition"
          >
            Retry Loading
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200 my-8">
          <div className="bg-slate-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <p className="text-gray-500 mb-4 font-medium">No orders recorded yet.</p>
          <Link
            to="/products"
            className="px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-700 transition"
          >
            Create an Order
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-slate-50 text-slate-700 uppercase text-xs font-bold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-bold text-gray-900">#{order.id}</td>
                    <td className="px-6 py-4 font-medium">Customer #{order.customerId}</td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-extrabold text-slate-900">
                      ${parseFloat(order.totalAmount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/orders/${order.id}`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Details</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;
