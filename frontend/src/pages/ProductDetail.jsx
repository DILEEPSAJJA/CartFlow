import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, CheckCircle, Package } from 'lucide-react';
import { productService } from '../api/client';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productService.getProductById(id);
      setProduct(res.data);
    } catch (err) {
      setError("Product not found or unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-600 mb-6">{error || "Product not found."}</p>
        <Link to="/products" className="inline-flex items-center space-x-2 text-sky-600 font-semibold hover:underline">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Products</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <Link to="/products" className="inline-flex items-center space-x-2 text-sm text-gray-500 hover:text-slate-900 mb-6 font-medium">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Products</span>
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-100 rounded-xl p-8 flex items-center justify-center min-h-[280px]">
          <Package className="h-28 w-28 text-slate-400" />
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 mb-3">
              {product.category}
            </span>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-3xl font-extrabold text-slate-900 mb-4">${parseFloat(product.price).toFixed(2)}</p>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              {product.description || "High quality item from the CartFlow catalog."}
            </p>

            <div className="mb-6">
              {product.stock <= 0 ? (
                <div className="inline-flex items-center space-x-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg">
                  <span>Out of Stock</span>
                </div>
              ) : product.stock < 5 ? (
                <div className="inline-flex items-center space-x-2 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                  <span>Only {product.stock} remaining in stock!</span>
                </div>
              ) : (
                <div className="inline-flex items-center space-x-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>In Stock</span>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            {product.stock > 0 && (
              <div className="flex items-center space-x-4 mb-4">
                <label className="text-xs font-bold text-gray-700 uppercase">Quantity</label>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 text-sm font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition ${
                product.stock <= 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                  : added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-sky-600 text-white hover:bg-sky-700'
              }`}
            >
              {product.stock <= 0 ? (
                <span>Out of Stock</span>
              ) : added ? (
                <>
                  <CheckCircle className="h-5 w-5" />
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5" />
                  <span>Add to Shopping Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
