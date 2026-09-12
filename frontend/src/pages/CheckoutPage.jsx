import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, CheckCircle2, AlertTriangle, ArrowLeft, ShieldCheck, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../api/client';
import StatusBadge from '../components/StatusBadge';

const CheckoutPage = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [customerId, setCustomerId] = useState(user?.id ? String(user.id) : '10');

  useEffect(() => {
    if (user?.id) {
      setCustomerId(String(user.id));
    }
  }, [user]);
  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [error, setError] = useState(null);

  if (cartItems.length === 0 && !orderResult) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">No items in cart for checkout.</p>
        <Link to="/products" className="text-sky-600 font-semibold hover:underline">
          Return to Products
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrderResult(null);

    try {
      const orderPayload = {
        customerId: parseInt(customerId, 10) || 10,
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: parseFloat(item.price),
        })),
      };

      const response = await orderService.createOrder(orderPayload);
      setOrderResult(response.data);
      clearCart();
    } catch (err) {
      console.error("Order creation error:", err);
      setError(
        err.response?.data?.message || "Failed to place order. Ensure API Gateway & Order Service are online."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <Link to="/cart" className="inline-flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-900 mb-6 font-medium">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Cart</span>
      </Link>

      <h1 className="text-2xl font-extrabold text-gray-900 mb-8">Checkout & Order Placement</h1>

      {orderResult ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 mb-4">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Submitted!</h2>
          <p className="text-sm text-gray-500 mb-4">Order #{orderResult.id} has been processed via microservice workflow.</p>

          <div className="inline-block mb-6">
            <StatusBadge status={orderResult.status} />
          </div>

          {orderResult.status === 'CONFIRMED' ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 text-emerald-800 text-xs text-left">
              <p className="font-bold mb-1 flex items-center gap-1">
                <Zap className="h-4 w-4" /> Payment Success & Kafka Event Published!
              </p>
              <p>Order Service published <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">OrderConfirmedEvent</code> to Kafka topic <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">order-confirmed</code>. Notification Service consumed the event.</p>
            </div>
          ) : orderResult.status === 'PAYMENT_SERVICE_UNAVAILABLE' ? (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6 text-purple-800 text-xs text-left">
              <p className="font-bold mb-1 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" /> Resilience4j Circuit Breaker Triggered!
              </p>
              <p>Payment Service was unavailable or simulated outage was active. Order Service invoked fallback method cleanly without crashing.</p>
            </div>
          ) : null}

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate(`/orders/${orderResult.id}`)}
              className="px-6 py-3 bg-sky-600 text-white text-sm font-bold rounded-xl hover:bg-sky-700 transition"
            >
              View Order Details
            </button>
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-3 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <form onSubmit={handlePlaceOrder} className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-sky-600" /> Customer Information
              </h2>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Customer ID</label>
                <input
                  type="number"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">Default customer ID for standard checkout demo.</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-sky-600" /> Payment Processing Simulation
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                Order Service will execute a synchronous REST call to Payment Service inside a <strong>Resilience4j Circuit Breaker</strong>.
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600">
                Tip: Toggle <em>"Simulate Payment Outage"</em> in the top navigation bar to test Circuit Breaker fallback behavior!
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-sm font-semibold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-sky-600 text-white rounded-xl font-extrabold text-sm hover:bg-sky-700 transition flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <span>Place Order (${cartTotal.toFixed(2)})</span>
              )}
            </button>
          </form>

          {/* Cart Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 h-fit shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">Items Summary</h2>
            <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-xs text-gray-600">
                  <span className="truncate pr-2">{item.name} (x{item.quantity})</span>
                  <span className="font-bold text-gray-900">${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between text-sm font-extrabold text-gray-900">
              <span>Total Payable</span>
              <span className="text-sky-600">${cartTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
