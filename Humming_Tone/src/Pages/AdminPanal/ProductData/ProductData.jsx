// import React, { useState, useEffect } from 'react';
// import './ProductData.css';
// import demoImage from '../../../assets/demo.jpeg';

// // Static data for products
// const STATIC_PRODUCTS = [
//   {
//     _id: '1',
//     name: 'Cotton Kurti',
//     sku: 'HJDNJ432',
//     price: 112.00,
//     stock: 15,
//     category: 'Full',
//     gender: 'Men',
//     status: 'Active',
//     image: demoImage
//   },
//   {
//     _id: '2',
//     name: 'Silk Saree',
//     sku: 'SILK001',
//     price: 250.00,
//     stock: 8,
//     category: 'Traditional',
//     gender: 'Women',
//     status: 'Active',
//     image: demoImage
//   },
//   {
//     _id: '3',
//     name: 'Kids T-Shirt',
//     sku: 'KTS123',
//     price: 45.00,
//     stock: 25,
//     category: 'Casual',
//     gender: 'Children',
//     status: 'Inactive',
//     image: demoImage
//   },
//   {
//     _id: '4',
//     name: 'Sports Jersey',
//     sku: 'SPJ456',
//     price: 85.00,
//     stock: 12,
//     category: 'Sports',
//     gender: 'Men',
//     status: 'Active',
//     image: demoImage
//   },
//   {
//     _id: '5',
//     name: 'Baby Onesie',
//     sku: 'BON789',
//     price: 30.00,
//     stock: 20,
//     category: 'Infant',
//     gender: 'Baby',
//     status: 'Active',
//     image: demoImage
//   },
//   {
//     _id: '6',
//     name: 'Formal Shirt',
//     sku: 'FSH321',
//     price: 95.00,
//     stock: 0,
//     category: 'Formal',
//     gender: 'Men',
//     status: 'Inactive',
//     image: demoImage
//   },
//   {
//     _id: '7',
//     name: 'Summer Dress',
//     sku: 'SUM654',
//     price: 120.00,
//     stock: 18,
//     category: 'Casual',
//     gender: 'Women',
//     status: 'Active',
//     image: demoImage
//   },
//   {
//     _id: '8',
//     name: 'Sports Shorts',
//     sku: 'SPS987',
//     price: 55.00,
//     stock: 30,
//     category: 'Sports',
//     gender: 'Men',
//     status: 'Active',
//     image: demoImage
//   }
// ];

// const AllProducts = () => {
//   const [products, setProducts] = useState(STATIC_PRODUCTS);
//   const [filteredProducts, setFilteredProducts] = useState(STATIC_PRODUCTS);
//   const [loading, setLoading] = useState(false);
//   const [selectedProducts, setSelectedProducts] = useState([]);
//   const [filters, setFilters] = useState({
//     category: '',
//     gender: '',
//     status: ''
//   });

//   // Apply filters
//   useEffect(() => {
//     let filtered = [...products];

//     if (filters.category) {
//       filtered = filtered.filter(p => p.category === filters.category);
//     }
//     if (filters.gender) {
//       filtered = filtered.filter(p => p.gender === filters.gender);
//     }
//     if (filters.status) {
//       filtered = filtered.filter(p => p.status === filters.status);
//     }

//     setFilteredProducts(filtered);
//   }, [filters, products]);

//   // Handle filter change
//   const handleFilterChange = (filterType, value) => {
//     setFilters(prev => ({
//       ...prev,
//       [filterType]: value
//     }));
//   };

//   // Clear all filters
//   const clearFilters = () => {
//     setFilters({
//       category: '',
//       gender: '',
//       status: ''
//     });
//   };

//   // Toggle product selection
//   const toggleProductSelection = (productId) => {
//     setSelectedProducts(prev => {
//       if (prev.includes(productId)) {
//         return prev.filter(id => id !== productId);
//       }
//       return [...prev, productId];
//     });
//   };

//   // Select all products
//   const toggleSelectAll = () => {
//     if (selectedProducts.length === filteredProducts.length) {
//       setSelectedProducts([]);
//     } else {
//       setSelectedProducts(filteredProducts.map(p => p._id));
//     }
//   };

//   // Delete all products
//   const deleteAllProducts = () => {
//     if (products.length === 0) {
//       alert('No products to delete');
//       return;
//     }

//     if (!confirm(`Are you sure you want to delete ALL ${products.length} products? This action cannot be undone.`)) {
//       return;
//     }

//     setProducts([]);
//     setFilteredProducts([]);
//     setSelectedProducts([]);
//     alert('All products deleted successfully');
//   };

//   // Delete selected products
//   const deleteSelectedProducts = () => {
//     if (selectedProducts.length === 0) {
//       alert('Please select products to delete');
//       return;
//     }

//     if (!confirm(`Are you sure you want to delete ${selectedProducts.length} product(s)?`)) {
//       return;
//     }

//     const updatedProducts = products.filter(p => !selectedProducts.includes(p._id));
//     setProducts(updatedProducts);
//     setSelectedProducts([]);
//     alert('Selected products deleted successfully');
//   };

//   // Delete single product
//   const deleteProduct = (productId) => {
//     if (!confirm('Are you sure you want to delete this product?')) {
//       return;
//     }

//     const updatedProducts = products.filter(p => p._id !== productId);
//     setProducts(updatedProducts);
//     alert('Product deleted successfully');
//   };

//   // Restore product status to Active
//   const restoreProductStatus = (productId) => {
//     const updatedProducts = products.map(p => 
//       p._id === productId ? { ...p, status: 'Active' } : p
//     );
//     setProducts(updatedProducts);
//   };

//   // Get unique values for filters
//   const categories = [...new Set(products.map(p => p.category))];
//   const genders = [...new Set(products.map(p => p.gender))];
//   const statuses = ['Active', 'Inactive'];

//   const hasActiveFilters = filters.category || filters.gender || filters.status;

//   if (loading) {
//     return (
//       <div className="all-products-container">
//         <div className="loading-state">Loading products...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="all-products-container">
//       {/* Page Header */}
//       <div className="page-header">
//         <h1 className="page-heading">You can get the data about the deleted Products</h1>
//         <div className="header-actions">
//           {selectedProducts.length > 0 && (
//             <button className="btn-delete-selected" onClick={deleteSelectedProducts}>
//               DELETE SELECTED ({selectedProducts.length})
//             </button>
//           )}
//           {products.length > 0 && (
//             <button className="btn-delete-all" onClick={deleteAllProducts}>
//               DELETE ALL
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Filters Section */}
//       <div className="products-filters">
//         <div className="filters-left">
//           <div className="filter-item">
//             <label className="filter-label">CATEGORY</label>
//             <select
//               className="filter-select"
//               value={filters.category}
//               onChange={(e) => handleFilterChange('category', e.target.value)}
//             >
//               <option value="">All Categories</option>
//               {categories.map(cat => (
//                 <option key={cat} value={cat}>{cat}</option>
//               ))}
//             </select>
//           </div>

//           <div className="filter-item">
//             <label className="filter-label">GENDER</label>
//             <select
//               className="filter-select"
//               value={filters.gender}
//               onChange={(e) => handleFilterChange('gender', e.target.value)}
//             >
//               <option value="">All Genders</option>
//               {genders.map(gender => (
//                 <option key={gender} value={gender}>{gender}</option>
//               ))}
//             </select>
//           </div>

//           <div className="filter-item">
//             <label className="filter-label">STATUS</label>
//             <select
//               className="filter-select"
//               value={filters.status}
//               onChange={(e) => handleFilterChange('status', e.target.value)}
//             >
//               <option value="">All Status</option>
//               {statuses.map(status => (
//                 <option key={status} value={status}>{status}</option>
//               ))}
//             </select>
//           </div>
//         </div>

//         <div className="filters-right">
//           <span className="filters-count">
//             Showing {filteredProducts.length} of {products.length} products
//           </span>
//           <button
//             className="btn-clear-filters"
//             onClick={clearFilters}
//             disabled={!hasActiveFilters}
//           >
//             CLEAR FILTERS
//           </button>
//         </div>
//       </div>

//       {/* Products Table */}
//       <div className="products-table-container">
//         <table className="products-table">
//           <thead>
//             <tr>
//               <th>
//                 <input
//                   type="checkbox"
//                   checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
//                   onChange={toggleSelectAll}
//                 />
//               </th>
//               <th>IMAGE</th>
//               <th>NAME</th>
//               <th>SKU</th>
//               <th>PRICE</th>
//               <th>CATEGORY</th>
//               <th>GENDER</th>
//               <th>STATUS</th>
//               <th>ACTIONS</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredProducts.length === 0 ? (
//               <tr>
//                 <td colSpan="9" style={{ textAlign: 'center', padding: '3rem' }}>
//                   No products found
//                 </td>
//               </tr>
//             ) : (
//               filteredProducts.map(product => (
//                 <tr key={product._id}>
//                   <td>
//                     <input
//                       type="checkbox"
//                       checked={selectedProducts.includes(product._id)}
//                       onChange={() => toggleProductSelection(product._id)}
//                     />
//                   </td>
//                   <td>
//                     <img
//                       src={product.image || demoImage}
//                       alt={product.name}
//                       className="product-image"
//                     />
//                   </td>
//                   <td className="product-name">{product.name}</td>
//                   <td className="product-sku">{product.sku}</td>
//                   <td className="product-price">₹{product.price?.toFixed(2)}</td>
//                   <td className="product-category">{product.category}</td>
//                   <td className="product-gender">{product.gender}</td>
//                   <td>
//                     <span className={`status-badge ${product.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
//                       {product.status || 'Active'}
//                     </span>
//                   </td>
//                   <td>
//                     <div className="action-btns">
//                       <button
//                         className="btn-toggle-status"
//                         onClick={() => restoreProductStatus(product._id)}
//                         disabled={product.status === 'Active'}
//                       >
//                         RESTORE
//                       </button>
//                       <button
//                         className="btn-delete"
//                         onClick={() => deleteProduct(product._id)}
//                       >
//                         DELETE
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default AllProducts;



// ============================================
// FILE: ProductData.jsx (Updated with API integration)
// ============================================
import React, { useState, useEffect } from 'react';
import './ProductData.css';
import demoImage from '../../../assets/demo.jpeg';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; // Change to your API URL

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    gender: '',
    status: ''
  });

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (filters.category) params.category = filters.category;
      if (filters.gender) params.gender = filters.gender;
      if (filters.status) params.status = filters.status;

      const response = await axios.get(`${API_BASE_URL}/products`, { params });
      
      if (response.data.success) {
        setProducts(response.data.data);
        setFilteredProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to fetch products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch products on mount and when filters change
  useEffect(() => {
    fetchProducts();
  }, [filters]);

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: '',
      gender: '',
      status: ''
    });
  };

  // Toggle product selection
  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      return [...prev, productId];
    });
  };

  // Select all products
  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p._id));
    }
  };

  // Delete all products
  const deleteAllProducts = async () => {
    if (products.length === 0) {
      alert('No products to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ALL ${products.length} products? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await axios.delete(`${API_BASE_URL}/products`);
      
      if (response.data.success) {
        alert(response.data.message);
        setProducts([]);
        setFilteredProducts([]);
        setSelectedProducts([]);
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting all products:', error);
      alert('Failed to delete products. Please try again.');
    }
  };

  // Delete selected products
  const deleteSelectedProducts = async () => {
    if (selectedProducts.length === 0) {
      alert('Please select products to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedProducts.length} product(s)?`)) {
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/products/delete-multiple`, {
        productIds: selectedProducts
      });
      
      if (response.data.success) {
        alert(response.data.message);
        setSelectedProducts([]);
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting selected products:', error);
      alert('Failed to delete products. Please try again.');
    }
  };

  // Delete single product
  const deleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await axios.delete(`${API_BASE_URL}/products/${productId}`);
      
      if (response.data.success) {
        alert(response.data.message);
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    }
  };

  // Restore product status to Active
  const restoreProductStatus = async (productId) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/products/${productId}/restore`);
      
      if (response.data.success) {
        alert(response.data.message);
        fetchProducts();
      }
    } catch (error) {
      console.error('Error restoring product:', error);
      alert('Failed to restore product. Please try again.');
    }
  };

  // Get unique values for filters from all products
  const categories = [...new Set(products.map(p => p.category))].filter(Boolean);
  const genders = [...new Set(products.map(p => p.gender))].filter(Boolean);
  const statuses = ['Active', 'Inactive'];

  const hasActiveFilters = filters.category || filters.gender || filters.status;

  if (loading) {
    return (
      <div className="all-products-container">
        <div className="loading-state">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="all-products-container">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-heading">You can get the data about the deleted Products</h1>
        <div className="header-actions">
          {selectedProducts.length > 0 && (
            <button className="btn-delete-selected" onClick={deleteSelectedProducts}>
              DELETE SELECTED ({selectedProducts.length})
            </button>
          )}
          {products.length > 0 && (
            <button className="btn-delete-all" onClick={deleteAllProducts}>
              DELETE ALL
            </button>
          )}
        </div>
      </div>

      {/* Filters Section */}
      <div className="products-filters">
        <div className="filters-left">
          <div className="filter-item">
            <label className="filter-label">CATEGORY</label>
            <select
              className="filter-select"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label className="filter-label">GENDER</label>
            <select
              className="filter-select"
              value={filters.gender}
              onChange={(e) => handleFilterChange('gender', e.target.value)}
            >
              <option value="">All Genders</option>
              {genders.map(gender => (
                <option key={gender} value={gender}>{gender}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label className="filter-label">STATUS</label>
            <select
              className="filter-select"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="filters-right">
          <span className="filters-count">
            Showing {filteredProducts.length} of {products.length} products
          </span>
          <button
            className="btn-clear-filters"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
          >
            CLEAR FILTERS
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>IMAGE</th>
              <th>NAME</th>
              <th>SKU</th>
              <th>PRICE</th>
              <th>CATEGORY</th>
              <th>GENDER</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '3rem' }}>
                  No products found
                </td>
              </tr>
            ) : (
              filteredProducts.map(product => (
                <tr key={product._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product._id)}
                      onChange={() => toggleProductSelection(product._id)}
                    />
                  </td>
                  <td>
                    <img
                      src={product.image || demoImage}
                      alt={product.name}
                      className="product-image"
                      onError={(e) => { e.target.src = demoImage; }}
                    />
                  </td>
                  <td className="product-name">{product.name}</td>
                  <td className="product-sku">{product.sku}</td>
                  <td className="product-price">₹{product.price?.toFixed(2)}</td>
                  <td className="product-category">{product.category}</td>
                  <td className="product-gender">{product.gender}</td>
                  <td>
                    <span className={`status-badge ${product.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                      {product.status || 'Active'}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                     <button
                              className="btn-toggle-status"
                              onClick={() => restoreProductStatus(product._id)}
                              disabled={product.status === 'Active'} // Only disabled when Active
                         >
                          RESTORE
                         </button>
                      <button
                        className="btn-delete"
                        onClick={() => deleteProduct(product._id)}
                      >
                        DELETE
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllProducts;