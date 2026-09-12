import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Ban, CheckCircle, Package, Zap, Truck, RotateCcw, ChevronRight, ShieldCheck } from 'lucide-react';
import { orderService } from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

const OrderDetail = () => {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cancellation modal state
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState('Changed my mind');
  const [customReason, setCustomReason] = useState('');

  // Return & Refund modal state
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('Item damaged or defective');
  const [customReturnReason, setCustomReturnReason] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  const REASON_OPTIONS = [
    "Changed my mind",
    "Found a better price elsewhere",
    "Ordered by mistake / wrong item",
    "Delivery time is too long",
    "Other reason"
  ];

  const RETURN_REASONS = [
    "Item damaged or defective",
    "Item not as described",
    "Wrong item delivered",
    "No longer needed",
    "Other reason"
  ];

  const TRACKING_STEPS = [
    { label: "Order Placed", key: "CONFIRMED", icon: "📦" },
    { label: "Package Started", key: "PROCESSING", icon: "⚙️" },
    { label: "In Transit", key: "IN_TRANSIT", icon: "🚚" },
    { label: "Out for Delivery", key: "OUT_FOR_DELIVERY", icon: "📬" },
    { label: "Delivered", key: "DELIVERED", icon: "✅" }
  ];

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderService.getOrderById(id);
      setOrder(res.data);
    } catch (err) {
      console.error("Error fetching order detail:", err);
      setError("Order not found or service unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status) => {
    switch (status) {
      case 'CONFIRMED': return 0;
      case 'PROCESSING': return 1;
      case 'IN_TRANSIT': return 2;
      case 'OUT_FOR_DELIVERY': return 3;
      case 'DELIVERED': return 4;
      default: return 0;
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      const res = await orderService.updateOrderStatus(id, newStatus);
      setOrder(res.data);
    } catch (err) {
      alert("Failed to update status: " + (err.response?.data?.message || err.message));
    }
  };

  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    setCancelling(true);
    try {
      const finalReason = selectedReason === 'Other reason' && customReason.trim()
        ? `Other: ${customReason.trim()}`
        : selectedReason;
      const res = await orderService.cancelOrder(id, finalReason);
      setOrder(res.data);
      setShowCancelModal(false);
    } catch (err) {
      alert("Failed to cancel order: " + (err.response?.data?.message || err.message));
    } finally {
      setCancelling(false);
    }
  };

  const handleConfirmReturn = async (e) => {
    e.preventDefault();
    setSubmittingReturn(true);
    try {
      const finalReason = returnReason === 'Other reason' && customReturnReason.trim()
        ? `Other: ${customReturnReason.trim()}`
        : returnReason;
      const res = await orderService.requestReturn(id, finalReason);
      setOrder(res.data);
      setShowReturnModal(false);
    } catch (err) {
      alert("Failed to submit return request: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingReturn(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-600 mb-6">{error || "Order not found."}</p>
        <Link to="/orders" className="inline-flex items-center space-x-2 text-sky-600 font-semibold hover:underline">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Orders</span>
        </Link>
      </div>
    );
  }

  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === 'CANCELLED';
  const isDelivered = order.status === 'DELIVERED';
  const isReturnOrRefund = order.status === 'RETURN_REQUESTED' || order.status === 'REFUNDED';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <Link to="/orders" className="inline-flex items-center space-x-2 text-sm text-gray-500 hover:text-slate-900 mb-6 font-medium">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Order History</span>
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-6 mb-6 gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <h1 className="text-2xl font-extrabold text-gray-900">Order #{order.id}</h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-xs text-gray-500">
              Placed on {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'} • Customer #{order.customerId}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {!isCancelled && !isReturnOrRefund && (
              <>
                {!isDelivered && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    disabled={cancelling}
                    className="flex items-center space-x-1.5 px-3.5 py-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl hover:bg-rose-100 transition"
                  >
                    <Ban className="h-3.5 w-3.5" />
                    <span>Cancel Order</span>
                  </button>
                )}

                <button
                  onClick={() => isDelivered && setShowReturnModal(true)}
                  disabled={!isDelivered}
                  title={!isDelivered ? "Return & Refund option is enabled only after the product is delivered" : "Request Return & Refund"}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition ${
                    isDelivered
                      ? 'bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 cursor-pointer'
                      : 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed opacity-75'
                  }`}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Return & Refund</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Live Shipment Tracking Stepper */}
        {!isCancelled && !isReturnOrRefund && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Truck className="h-4 w-4 text-sky-600" /> Package Tracking & Live Delivery Status
              </h3>
              
              {/* Quick Status Advance Control - ADMIN ONLY */}
              {isAdmin ? (
                <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase px-1 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-sky-600" /> Admin Update:
                  </span>
                  {TRACKING_STEPS.map((st) => (
                    <button
                      key={st.key}
                      onClick={() => handleUpdateStatus(st.key)}
                      className={`px-2 py-1 text-[10px] font-bold rounded transition ${
                        order.status === st.key ? 'bg-sky-600 text-white' : 'bg-slate-50 border text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              ) : (
                <span className="text-xs font-medium text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  Live Customer Tracking View
                </span>
              )}
            </div>

            <div className="relative flex items-center justify-between max-w-2xl mx-auto py-4">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 z-0" />
              <div
                className="absolute top-1/2 left-0 h-1 bg-sky-600 -translate-y-1/2 z-0 transition-all duration-500"
                style={{ width: `${(currentStep / (TRACKING_STEPS.length - 1)) * 100}%` }}
              />

              {TRACKING_STEPS.map((step, idx) => {
                const isCompleted = idx <= currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <div key={step.key} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition ${
                        isCurrent
                          ? 'bg-sky-600 text-white border-sky-600 ring-4 ring-sky-100 animate-pulse'
                          : isCompleted
                          ? 'bg-sky-600 text-white border-sky-600'
                          : 'bg-white text-slate-400 border-slate-300'
                      }`}
                    >
                      {step.icon}
                    </div>
                    <span className={`text-[11px] mt-2 font-bold ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Cancelled Banner */}
        {isCancelled && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6 text-xs text-rose-800 flex items-start space-x-3">
            <Ban className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-1">Order Cancelled</p>
              {order.cancellationReason && (
                <p className="mb-1 font-medium"><strong>Cancellation Reason:</strong> {order.cancellationReason}</p>
              )}
              <p className="text-[11px] text-rose-600 font-semibold">Product stock has been automatically restored to inventory.</p>
            </div>
          </div>
        )}

        {/* Return & Refund Banner */}
        {isReturnOrRefund && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-xs text-amber-900 flex items-start space-x-3">
            <RotateCcw className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold mb-1">
                {order.status === 'REFUNDED' ? 'Refund Processed & Completed' : 'Return Request Pending Review'}
              </p>
              {order.cancellationReason && (
                <p className="mb-1"><strong>Details:</strong> {order.cancellationReason}</p>
              )}
              {order.status === 'RETURN_REQUESTED' ? (
                <div className="flex items-center space-x-2 mt-2">
                  {isAdmin ? (
                    <>
                      <span className="text-[11px] text-amber-700 font-bold">Admin Action:</span>
                      <button
                        onClick={() => handleUpdateStatus('REFUNDED')}
                        className="px-3 py-1 bg-amber-600 text-white rounded text-[11px] font-bold hover:bg-amber-700 transition"
                      >
                        Approve & Issue Full Refund
                      </button>
                    </>
                  ) : (
                    <p className="text-[11px] text-amber-800 font-semibold">Your return request has been submitted and is under review by support.</p>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-emerald-700 font-semibold">Product stock restored and funds refunded to customer.</p>
              )}
            </div>
          </div>
        )}

        {/* Items Table */}
        <h2 className="text-base font-bold text-gray-900 mb-4">Ordered Items</h2>
        <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden mb-6">
          {order.items && order.items.length > 0 ? (
            order.items.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between bg-white text-sm">
                <div className="flex items-center space-x-3">
                  <div className="bg-slate-100 p-2 rounded-lg text-slate-500">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Product #{item.productId}</p>
                    <p className="text-xs text-gray-500">${parseFloat(item.price).toFixed(2)} x {item.quantity}</p>
                  </div>
                </div>
                <span className="font-extrabold text-slate-900">
                  ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))
          ) : (
            <div className="p-4 text-xs text-gray-500 text-center">No item details recorded.</div>
          )}
        </div>

        {/* Total Summary */}
        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl text-sm border border-slate-200">
          <span className="font-bold text-slate-700">Total Order Amount</span>
          <span className="text-xl font-extrabold text-sky-600">
            ${parseFloat(order.totalAmount).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Cancellation Reason Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 border-b border-gray-100 pb-3">
              <div className="bg-rose-100 text-rose-600 p-2 rounded-full">
                <Ban className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Cancel Order #{order.id}</h3>
                <p className="text-xs text-gray-500">Select a reason for cancelling this order</p>
              </div>
            </div>

            <form onSubmit={handleConfirmCancel} className="space-y-4">
              <div className="space-y-2">
                {REASON_OPTIONS.map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center space-x-3 p-3 rounded-xl border text-xs font-medium cursor-pointer transition ${
                      selectedReason === reason
                        ? 'border-sky-500 bg-sky-50/50 text-sky-900 font-bold'
                        : 'border-gray-200 hover:bg-slate-50 text-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancelReason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="text-sky-600 focus:ring-sky-500 h-4 w-4"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              {selectedReason === 'Other reason' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Specify Details</label>
                  <textarea
                    rows={2}
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Enter custom cancellation reason..."
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-200"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 transition flex items-center space-x-1.5"
                >
                  {cancelling ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <span>Submit Cancellation</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return & Refund Request Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 border-b border-gray-100 pb-3">
              <div className="bg-amber-100 text-amber-700 p-2 rounded-full">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Request Return & Refund</h3>
                <p className="text-xs text-gray-500">Order #{order.id} • Select return reason</p>
              </div>
            </div>

            <form onSubmit={handleConfirmReturn} className="space-y-4">
              <div className="space-y-2">
                {RETURN_REASONS.map((r) => (
                  <label
                    key={r}
                    className={`flex items-center space-x-3 p-3 rounded-xl border text-xs font-medium cursor-pointer transition ${
                      returnReason === r
                        ? 'border-amber-500 bg-amber-50/50 text-amber-900 font-bold'
                        : 'border-gray-200 hover:bg-slate-50 text-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="returnReason"
                      value={r}
                      checked={returnReason === r}
                      onChange={(e) => setReturnReason(e.target.value)}
                      className="text-amber-600 focus:ring-amber-500 h-4 w-4"
                    />
                    <span>{r}</span>
                  </label>
                ))}
              </div>

              {returnReason === 'Other reason' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Explain Reason</label>
                  <textarea
                    rows={2}
                    value={customReturnReason}
                    onChange={(e) => setCustomReturnReason(e.target.value)}
                    placeholder="Provide additional return details..."
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReturn}
                  className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl hover:bg-amber-700 transition"
                >
                  {submittingReturn ? 'Submitting...' : 'Submit Return Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
