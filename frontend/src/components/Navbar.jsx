import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Package, ShoppingBag, ShieldAlert, Zap, Menu, X, LogIn, LogOut, User, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { paymentService } from '../api/client';

const Navbar = () => {
  const { cartCount } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [simulationActive, setSimulationActive] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchSimulationStatus();
  }, []);

  const fetchSimulationStatus = async () => {
    try {
      const res = await paymentService.getSimulationStatus();
      setSimulationActive(res.data.failureSimulationActive);
    } catch (err) {
      console.warn("Could not check payment failure simulation status", err);
    }
  };

  const handleToggleFailure = async () => {
    setToggling(true);
    try {
      const res = await paymentService.toggleFailureSimulation();
      setSimulationActive(res.data.failureSimulationActive);
    } catch (err) {
      alert("Error toggling failure simulation. Is Payment Service running?");
    } finally {
      setToggling(false);
    }
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <header className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Desktop Nav */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2 text-xl font-bold tracking-tight text-white">
              <Zap className="h-6 w-6 text-sky-400 fill-sky-400" />
              <span>Cart<span className="text-sky-400">Flow</span></span>
            </Link>

            <nav className="hidden md:flex space-x-6">
              <Link
                to="/products"
                className={`flex items-center space-x-1.5 text-sm font-medium transition-colors ${
                  location.pathname.startsWith('/products') || location.pathname === '/'
                    ? 'text-sky-400'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Package className="h-4 w-4" />
                <span>Products</span>
              </Link>
              <Link
                to="/orders"
                className={`flex items-center space-x-1.5 text-sm font-medium transition-colors ${
                  location.pathname.startsWith('/orders')
                    ? 'text-sky-400'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Orders</span>
              </Link>
              {user && (
                <Link
                  to="/profile"
                  className={`flex items-center space-x-1.5 text-sm font-medium transition-colors ${
                    location.pathname.startsWith('/profile')
                      ? 'text-sky-400'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span>My Profile</span>
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`flex items-center space-x-1.5 text-sm font-semibold transition-colors ${
                    location.pathname.startsWith('/admin')
                      ? 'text-sky-400'
                      : 'text-amber-400 hover:text-amber-300'
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Admin Panel</span>
                </Link>
              )}
            </nav>
          </div>

          {/* Desktop Right Controls */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Demo Control Button for Circuit Breaker Simulation */}
            <button
              onClick={handleToggleFailure}
              disabled={toggling}
              title="Click to toggle Payment Service outage for Resilience4j Circuit Breaker demonstration"
              className={`flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                simulationActive
                  ? 'bg-rose-950 text-rose-300 border-rose-600 animate-pulse'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
              }`}
            >
              <ShieldAlert className={`h-3.5 w-3.5 ${simulationActive ? 'text-rose-400' : 'text-slate-400'}`} />
              <span>
                {simulationActive ? 'Payment Outage (Simulated)' : 'Simulate Outage'}
              </span>
            </button>

            <Link
              to="/cart"
              className="relative p-2 text-slate-300 hover:text-white transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-sky-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth State */}
            {user ? (
              <div className="flex items-center space-x-3 border-l border-slate-800 pl-4">
                <Link to="/profile" className="text-right hover:opacity-80 transition">
                  <p className="text-xs font-bold text-white truncate max-w-[120px]">{user.username}</p>
                  <span className="text-[10px] text-sky-400 font-semibold uppercase">{user.role}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-400 transition"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center space-x-3">
            <Link to="/cart" className="relative p-1 text-slate-300">
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-sky-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-2 py-2 text-sm font-medium text-slate-200"
          >
            <Package className="h-4 w-4 text-sky-400" />
            <span>Products</span>
          </Link>
          <Link
            to="/orders"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-2 py-2 text-sm font-medium text-slate-200"
          >
            <ShoppingBag className="h-4 w-4 text-sky-400" />
            <span>Orders</span>
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 py-2 text-sm font-bold text-amber-400"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Admin Panel</span>
            </Link>
          )}

          <div className="pt-2 border-t border-slate-800 space-y-3">
            <button
              onClick={handleToggleFailure}
              disabled={toggling}
              className={`w-full flex items-center justify-center space-x-1.5 py-2 text-xs font-bold rounded-lg border ${
                simulationActive
                  ? 'bg-rose-950 text-rose-300 border-rose-600'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              <ShieldAlert className="h-4 w-4" />
              <span>{simulationActive ? 'Payment Outage ACTIVE' : 'Simulate Payment Outage'}</span>
            </button>

            {user ? (
              <div className="flex items-center justify-between pt-2 text-xs">
                <div>
                  <p className="font-bold text-white">{user.username}</p>
                  <p className="text-slate-400">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-rose-600/20 text-rose-300 border border-rose-600/30 rounded-lg font-bold"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center space-x-1.5 py-2 bg-sky-600 text-white rounded-lg text-xs font-bold"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
