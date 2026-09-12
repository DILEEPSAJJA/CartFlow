import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Plus, Search, Layers } from 'lucide-react';
import { productService } from '../api/client';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const { addToCart } = useCart();
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.getAllProducts();
      setProducts(response.data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Unable to load products. Please check if Product Service is running.");
    } finally {
      setLoading(false);
    }
  };

  const seedSampleProduct = async () => {
    try {
      const sample = {
        name: "Wireless Mechanical Keyboard",
        description: "Hot-swappable RGB mechanical keyboard with Bluetooth 5.1 & Type-C connection.",
        price: 129.99,
        stock: 25,
        category: "Electronics"
      };
      await productService.createProduct(sample);
      fetchProducts();
    } catch (err) {
      alert("Failed to create product: " + (err.response?.data?.message || err.message));
    }
  };

  const categories = ['ALL', ...new Set(products.map((p) => p.category))];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'ALL' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-sky-900 rounded-2xl p-8 mb-8 text-white shadow-lg">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Production Microservices E-Commerce</h1>
        <p className="text-sky-200 text-sm max-w-2xl">
          Powered by Java 21, Spring Boot 3.3, MySQL, Resilience4j Circuit Breaker & Apache Kafka.
        </p>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <Layers className="h-4 w-4 text-gray-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {isAdmin && (
            <button
              onClick={seedSampleProduct}
              className="flex items-center space-x-1.5 bg-slate-900 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-slate-800 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Sample Product</span>
            </button>
          )}
        </div>
      </div>

      {/* Content State */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-6 text-center my-8">
          <p className="font-semibold">{error}</p>
          <button
            onClick={fetchProducts}
            className="mt-4 px-4 py-2 bg-rose-600 text-white text-sm font-medium rounded-lg hover:bg-rose-700 transition"
          >
            Retry Connection
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200 my-8">
          <p className="text-gray-500 mb-4">No products found in the catalog.</p>
          <button
            onClick={seedSampleProduct}
            className="px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-700 transition"
          >
            Create First Sample Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const isOutOfStock = product.stock <= 0;
            const isLowStock = product.stock > 0 && product.stock < 5;

            return (
              <div
                key={product.id}
                className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between ${
                  isOutOfStock ? 'opacity-60 grayscale bg-slate-50' : ''
                }`}
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      {product.category}
                    </span>
                    {isOutOfStock ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-rose-100 text-rose-700">
                        Out of Stock
                      </span>
                    ) : isLowStock ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
                        Only {product.stock} left!
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                        In Stock
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-gray-500 mb-4 line-clamp-2">{product.description || 'No description available.'}</p>
                  
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-extrabold text-slate-900">
                      ${parseFloat(product.price).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
                  <Link
                    to={`/products/${product.id}`}
                    className="flex-1 flex items-center justify-center space-x-1 py-2 px-3 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 transition"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Details</span>
                  </Link>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={isOutOfStock}
                    className={`flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-lg text-xs font-semibold transition ${
                      isOutOfStock
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                        : 'bg-sky-600 text-white hover:bg-sky-700'
                    }`}
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductList;
