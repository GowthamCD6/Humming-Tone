// import { useState } from 'react'
// import demoImage from '../../../assets/demo.jpeg'
// import './ManageProduct.css'

// // Sample product data
// const initialProductsData = [
//   {
//     id: 1,
//     image: demoImage,
//     name: 'Stitch set',
//     sku: 'STICA1272',
//     price: 400,
//     stock: 3,
//     category: 'Winter sets',
//     gender: 'Baby'
//   },
//   {
//     id: 2,
//     image: demoImage,
//     name: 'Blue set',
//     sku: 'BLUCA8637',
//     price: 400,
//     stock: 4,
//     category: 'Winter sets',
//     gender: 'Baby'
//   },
//   {
//     id: 3,
//     image: demoImage,
//     name: 'Mickey hoodie set',
//     sku: 'MICCA7953',
//     price: 450,
//     stock: 3,
//     category: 'Winter sets',
//     gender: 'Baby'
//   },
//   {
//     id: 4,
//     image: demoImage,
//     name: 'Bear set',
//     sku: 'BEACA3638',
//     price: 400,
//     stock: 10,
//     category: 'Winter sets',
//     gender: 'Baby'
//   },
//   {
//     id: 5,
//     image: demoImage,
//     name: 'Tinker bell frock',
//     sku: 'TINCA7077',
//     price: 250,
//     stock: 6,
//     category: 'T Shirts',
//     gender: 'Baby'
//   },
//   {
//     id: 6,
//     image: demoImage,
//     name: 'Lion king sleeping bag',
//     sku: 'LIOCA7769',
//     price: 300,
//     stock: 12,
//     category: 'Sleepingbags',
//     gender: 'Baby'
//   }
// ]

// // Sample promo codes data
// const initialPromoCodesData = [
//   {
//     id: 1,
//     code: 'FIRST100',
//     type: 'Fixed',
//     discount: 100,
//     minOrder: 0,
//     usedCount: 0,
//     usageLimit: Infinity,
//     status: 'Active'
//   }
// ]

// export default function ManageProducts() {
//   const [products, setProducts] = useState(initialProductsData)
//   const [promoCodes, setPromoCodes] = useState(initialPromoCodesData)
//   const [editingProduct, setEditingProduct] = useState(null)
//   const [editingPromo, setEditingPromo] = useState(null)
//   const [showEditModal, setShowEditModal] = useState(false)
//   const [showPromoEditModal, setShowPromoEditModal] = useState(false)
//   const [showAddPromoModal, setShowAddPromoModal] = useState(false)
//   const [newPromo, setNewPromo] = useState({
//     code: '',
//     type: 'Fixed',
//     discount: 0,
//     minOrder: 0,
//     usageLimit: '',
//     status: 'Active'
//   })
//   const [newPromoErrors, setNewPromoErrors] = useState({})

//   const [filterGender, setFilterGender] = useState('All')
//   const [filterCategory, setFilterCategory] = useState('All')

//   const normalizeGender = (value) => {
//     const v = String(value || '').trim().toLowerCase()
//     if (!v) return ''
//     if (v === 'men' || v === "men's" || v === 'mens' || v === 'man') return 'Men'
//     if (v === 'child' || v === 'children' || v === 'kids' || v === 'boy' || v === 'boys' || v === 'girl' || v === 'girls') return 'Children'
//     if (v === 'baby' || v === 'babies') return 'Baby'
//     if (v === 'sports' || v === 'sport') return 'Sports'
//     return value
//   }

//   const categories = Array.from(new Set(products.map(p => p.category))).sort()
//   const genders = ['Men', 'Children', 'Baby', 'Sports']

//   const filteredProducts = products.filter((p) => {
//     const normalized = normalizeGender(p.gender)
//     const genderOk = filterGender === 'All' || normalized === filterGender
//     const categoryOk = filterCategory === 'All' || p.category === filterCategory
//     return genderOk && categoryOk
//   })

//   // Product handlers
//   const handleEditProduct = (product) => {
//     setEditingProduct({ ...product })
//     setShowEditModal(true)
//   }

//   const handleDeleteProduct = (productId) => {
//     if (window.confirm('Are you sure you want to delete this product?')) {
//       setProducts(products.filter(p => p.id !== productId))
//     }
//   }

//   const handleSaveProduct = () => {
//     setProducts(products.map(p => 
//       p.id === editingProduct.id ? editingProduct : p
//     ))
//     setShowEditModal(false)
//     setEditingProduct(null)
//   }

//   const handleProductChange = (field, value) => {
//     setEditingProduct({ ...editingProduct, [field]: value })
//   }

//   const handleProductImageUpload = (event) => {
//     const file = event.target.files?.[0]
//     if (!file) return
//     if (!file.type?.startsWith('image/')) return

//     const reader = new FileReader()
//     reader.onload = () => {
//       const dataUrl = String(reader.result || '')
//       setEditingProduct(prev => ({ ...prev, image: dataUrl }))
//     }
//     reader.readAsDataURL(file)
//   }

//   // Promo handlers
//   const handleEditPromo = (promo) => {
//     setEditingPromo({ ...promo })
//     setShowPromoEditModal(true)
//   }

//   const handleDeletePromo = (promoId) => {
//     if (window.confirm('Are you sure you want to delete this promo code?')) {
//       setPromoCodes(promoCodes.filter(p => p.id !== promoId))
//     }
//   }

//   const handleSavePromo = () => {
//     setPromoCodes(promoCodes.map(p => 
//       p.id === editingPromo.id ? editingPromo : p
//     ))
//     setShowPromoEditModal(false)
//     setEditingPromo(null)
//   }

//   const handlePromoChange = (field, value) => {
//     setEditingPromo({ ...editingPromo, [field]: value })
//   }

//   const handleOpenAddPromo = () => {
//     setNewPromo({
//       code: '',
//       type: 'Fixed',
//       discount: 0,
//       minOrder: 0,
//       usageLimit: '',
//       status: 'Active'
//     })
//     setNewPromoErrors({})
//     setShowAddPromoModal(true)
//   }

//   const handleNewPromoChange = (field, value) => {
//     setNewPromo({ ...newPromo, [field]: value })
//     if (newPromoErrors[field]) {
//       setNewPromoErrors({ ...newPromoErrors, [field]: undefined })
//     }
//   }

//   const handleSaveNewPromo = () => {
//     const trimmedCode = String(newPromo.code || '').trim()
//     if (!trimmedCode) {
//       setNewPromoErrors({ code: 'Promo code is required' })
//       return
//     }

//     const parsedLimit =
//       newPromo.usageLimit === '' || newPromo.usageLimit === null || typeof newPromo.usageLimit === 'undefined'
//         ? Infinity
//         : Math.max(0, Number(newPromo.usageLimit))

//     const newId = promoCodes.length ? Math.max(...promoCodes.map(p => p.id)) + 1 : 1
//     const createdPromo = {
//       id: newId,
//       code: trimmedCode,
//       type: newPromo.type,
//       discount: Number(newPromo.discount) || 0,
//       minOrder: Number(newPromo.minOrder) || 0,
//       usedCount: 0,
//       usageLimit: Number.isFinite(parsedLimit) ? parsedLimit : Infinity,
//       status: newPromo.status
//     }

//     setPromoCodes([createdPromo, ...promoCodes])
//     setShowAddPromoModal(false)
//   }

//   return (
//     <section className="manage-products-container">
//       {/* Action Buttons */}
//       <div className="action-buttons">
//         <button className="btn-add-product">ADD NEW PRODUCT</button>
//         <button className="btn-manage-promo" onClick={handleOpenAddPromo}>ADD PROMO CODE</button>
//       </div>

//       {/* Promo Codes Section */}
//       <div className="promo-section">
//         <div className="section-header">
//           <h3 className="section-title">Active Promo Codes</h3>
//           <button className="btn-view-all">VIEW ALL</button>
//         </div>

//         <div className="promo-table-container">
//           <table className="promo-table">
//             <thead>
//               <tr>
//                 <th>CODE</th>
//                 <th>TYPE</th>
//                 <th>DISCOUNT</th>
//                 <th>MIN ORDER</th>
//                 <th>USAGE</th>
//                 <th>STATUS</th>
//                 <th>ACTIONS</th>
//               </tr>
//             </thead>
//             <tbody>
//               {promoCodes.map((promo) => (
//                 <tr key={promo.id}>
//                   <td className="promo-code">{promo.code}</td>
//                   <td>{promo.type}</td>
//                   <td>₹{promo.discount}.00</td>
//                   <td>₹{promo.minOrder}.00</td>
//                   <td>
//                     {typeof promo.usedCount !== 'undefined' && typeof promo.usageLimit !== 'undefined'
//                       ? `${promo.usedCount} / ${Number.isFinite(promo.usageLimit) ? promo.usageLimit : '∞'}`
//                       : promo.usage}
//                   </td>
//                   <td>
//                     <span className="status-badge status-active">{promo.status}</span>
//                   </td>
//                   <td>
//                     <div className="action-btns">
//                       <button 
//                         className="btn-edit"
//                         onClick={() => handleEditPromo(promo)}
//                       >
//                         EDIT
//                       </button>
//                       <button 
//                         className="btn-delete"
//                         onClick={() => handleDeletePromo(promo.id)}
//                       >
//                         DELETE
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       <div className="section-header products-header">
//         <h3 className="section-title">Active Products</h3>
//       </div>

//       <div className="products-filters">
//         <div className="filters-left">
//           <div className="filter-item">
//             <label className="filter-label">CATEGORY</label>
//             <select
//               className="filter-select"
//               value={filterCategory}
//               onChange={(e) => setFilterCategory(e.target.value)}
//             >
//               <option value="All">All</option>
//               {categories.map((c) => (
//                 <option key={c} value={c}>{c}</option>
//               ))}
//             </select>
//           </div>

//           <div className="filter-item">
//             <label className="filter-label">GENDER</label>
//             <select
//               className="filter-select"
//               value={filterGender}
//               onChange={(e) => setFilterGender(e.target.value)}
//             >
//               <option value="All">All</option>
//               {genders.map((g) => (
//                 <option key={g} value={g}>{g}</option>
//               ))}
//             </select>
//           </div>
//         </div>

//         <div className="filters-right">
//           <span className="filters-count">Showing {filteredProducts.length} of {products.length}</span>
//           <button
//             type="button"
//             className="btn-clear-filters"
//             onClick={() => {
//               setFilterCategory('All')
//               setFilterGender('All')
//             }}
//             disabled={filterCategory === 'All' && filterGender === 'All'}
//           >
//             CLEAR FILTERS
//           </button>
//         </div>
//       </div>

//       {/* Products Table Section */}
//       <div className="products-section">
//         <div className="products-table-container">
//           <table className="products-table">
//             <thead>
//               <tr>
//                 <th>IMAGE</th>
//                 <th>NAME</th>
//                 <th>SKU</th>
//                 <th>PRICE</th>
//                 <th>STOCK</th>
//                 <th>CATEGORY</th>
//                 <th>GENDER</th>
//                 <th>ACTIONS</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredProducts.map((product) => (
//                 <tr key={product.id}>
//                   <td>
//                     <img src={product.image} alt={product.name} className="product-image" />
//                   </td>
//                   <td className="product-name">{product.name}</td>
//                   <td className="product-sku">{product.sku}</td>
//                   <td className="product-price">₹{product.price}.00</td>
//                   <td className="product-stock">{product.stock}</td>
//                   <td className="product-category">{product.category}</td>
//                   <td className="product-gender">{normalizeGender(product.gender)}</td>
//                   <td>
//                     <div className="action-btns">
//                       <button 
//                         className="btn-edit"
//                         onClick={() => handleEditProduct(product)}
//                       >
//                         EDIT
//                       </button>
//                       <button 
//                         className="btn-delete"
//                         onClick={() => handleDeleteProduct(product.id)}
//                       >
//                         DELETE
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Edit Product Modal */}
//       {showEditModal && editingProduct && (
//         <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2 className="modal-title">Edit Product</h2>
//               <button 
//                 className="modal-close"
//                 onClick={() => setShowEditModal(false)}
//               >
//                 ×
//               </button>
//             </div>
            
//             <div className="modal-body">
//               <div className="form-group">
//                 <label>PRODUCT NAME</label>
//                 <input
//                   type="text"
//                   value={editingProduct.name}
//                   onChange={(e) => handleProductChange('name', e.target.value)}
//                   className="form-input"
//                 />
//               </div>

//               <div className="form-group">
//                 <label>SKU</label>
//                 <input
//                   type="text"
//                   value={editingProduct.sku}
//                   onChange={(e) => handleProductChange('sku', e.target.value)}
//                   className="form-input"
//                 />
//               </div>

//               <div className="form-row">
//                 <div className="form-group">
//                   <label>PRICE (₹)</label>
//                   <input
//                     type="number"
//                     value={editingProduct.price}
//                     onChange={(e) => handleProductChange('price', parseFloat(e.target.value))}
//                     className="form-input"
//                   />
//                 </div>

//                 <div className="form-group">
//                   <label>STOCK</label>
//                   <input
//                     type="number"
//                     value={editingProduct.stock}
//                     onChange={(e) => handleProductChange('stock', parseInt(e.target.value))}
//                     className="form-input"
//                   />
//                 </div>
//               </div>

//               <div className="form-row">
//                 <div className="form-group">
//                   <label>CATEGORY</label>
//                   <select
//                     value={editingProduct.category}
//                     onChange={(e) => handleProductChange('category', e.target.value)}
//                     className="form-input"
//                   >
//                     <option value="Winter sets">Winter sets</option>
//                     <option value="T Shirts">T Shirts</option>
//                     <option value="Sleepingbags">Sleepingbags</option>
//                     <option value="Dresses">Dresses</option>
//                   </select>
//                 </div>

//                 <div className="form-group">
//                   <label>GENDER</label>
//                   <select
//                     value={editingProduct.gender}
//                     onChange={(e) => handleProductChange('gender', e.target.value)}
//                     className="form-input"
//                   >
//                     <option value="Men">Men</option>
//                     <option value="Children">Children</option>
//                     <option value="Baby">Baby</option>
//                     <option value="Sports">Sports</option>
//                   </select>
//                 </div>
//               </div>

//               <div className="form-group">
//                 <label>IMAGE UPLOAD</label>
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={handleProductImageUpload}
//                   className="form-input"
//                 />
//                 {editingProduct.image && (
//                   <div className="image-preview">
//                     <img
//                       src={editingProduct.image}
//                       alt="Preview"
//                       className="image-preview-img"
//                     />
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className="modal-footer">
//               <button 
//                 className="btn-cancel"
//                 onClick={() => setShowEditModal(false)}
//               >
//                 CANCEL
//               </button>
//               <button 
//                 className="btn-save"
//                 onClick={handleSaveProduct}
//               >
//                 SAVE CHANGES
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Edit Promo Modal */}
//       {showPromoEditModal && editingPromo && (
//         <div className="modal-overlay" onClick={() => setShowPromoEditModal(false)}>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2 className="modal-title">Edit Promo Code</h2>
//               <button 
//                 className="modal-close"
//                 onClick={() => setShowPromoEditModal(false)}
//               >
//                 ×
//               </button>
//             </div>
            
//             <div className="modal-body">
//               <div className="form-group">
//                 <label>PROMO CODE</label>
//                 <input
//                   type="text"
//                   value={editingPromo.code}
//                   onChange={(e) => handlePromoChange('code', e.target.value)}
//                   className="form-input"
//                 />
//               </div>

//               <div className="form-group">
//                 <label>TYPE</label>
//                 <select
//                   value={editingPromo.type}
//                   onChange={(e) => handlePromoChange('type', e.target.value)}
//                   className="form-input"
//                 >
//                   <option value="Fixed">Fixed</option>
//                   <option value="Percentage">Percentage</option>
//                 </select>
//               </div>

//               <div className="form-row">
//                 <div className="form-group">
//                   <label>DISCOUNT (₹)</label>
//                   <input
//                     type="number"
//                     value={editingPromo.discount}
//                     onChange={(e) => handlePromoChange('discount', parseFloat(e.target.value))}
//                     className="form-input"
//                   />
//                 </div>

//                 <div className="form-group">
//                   <label>MIN ORDER (₹)</label>
//                   <input
//                     type="number"
//                     value={editingPromo.minOrder}
//                     onChange={(e) => handlePromoChange('minOrder', parseFloat(e.target.value))}
//                     className="form-input"
//                   />
//                 </div>
//               </div>

//               <div className="form-group">
//                 <label>STATUS</label>
//                 <select
//                   value={editingPromo.status}
//                   onChange={(e) => handlePromoChange('status', e.target.value)}
//                   className="form-input"
//                 >
//                   <option value="Active">Active</option>
//                   <option value="Inactive">Inactive</option>
//                 </select>
//               </div>
//             </div>

//             <div className="modal-footer">
//               <button 
//                 className="btn-cancel"
//                 onClick={() => setShowPromoEditModal(false)}
//               >
//                 CANCEL
//               </button>
//               <button 
//                 className="btn-save"
//                 onClick={handleSavePromo}
//               >
//                 SAVE CHANGES
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Add Promo Modal */}
//       {showAddPromoModal && (
//         <div className="modal-overlay" onClick={() => setShowAddPromoModal(false)}>
//           <div className="modal-content modal-content--compact" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2 className="modal-title">Add Promo Code</h2>
//               <button
//                 className="modal-close"
//                 onClick={() => setShowAddPromoModal(false)}
//               >
//                 ×
//               </button>
//             </div>

//             <div className="modal-body">
//               <div className="form-group">
//                 <label>PROMO CODE</label>
//                 <input
//                   type="text"
//                   value={newPromo.code}
//                   onChange={(e) => handleNewPromoChange('code', e.target.value)}
//                   className={`form-input ${newPromoErrors.code ? 'input-error' : ''}`}
//                   placeholder="e.g. NEW50"
//                 />
//                 {newPromoErrors.code && (
//                   <p className="field-error">{newPromoErrors.code}</p>
//                 )}
//               </div>

//               <div className="form-group">
//                 <label>TYPE</label>
//                 <select
//                   value={newPromo.type}
//                   onChange={(e) => handleNewPromoChange('type', e.target.value)}
//                   className="form-input"
//                 >
//                   <option value="Fixed">Fixed</option>
//                   <option value="Percentage">Percentage</option>
//                 </select>
//               </div>

//               <div className="form-row">
//                 <div className="form-group">
//                   <label>DISCOUNT</label>
//                   <input
//                     type="number"
//                     value={newPromo.discount}
//                     onChange={(e) => handleNewPromoChange('discount', e.target.value)}
//                     className="form-input"
//                     min="0"
//                     step="1"
//                   />
//                 </div>

//                 <div className="form-group">
//                   <label>MIN ORDER (₹)</label>
//                   <input
//                     type="number"
//                     value={newPromo.minOrder}
//                     onChange={(e) => handleNewPromoChange('minOrder', e.target.value)}
//                     className="form-input"
//                     min="0"
//                     step="1"
//                   />
//                 </div>
//               </div>

//               <div className="form-group">
//                 <label>USAGE LIMIT</label>
//                 <input
//                   type="number"
//                   value={newPromo.usageLimit}
//                   onChange={(e) => handleNewPromoChange('usageLimit', e.target.value)}
//                   className="form-input"
//                   min="0"
//                   step="1"
//                   placeholder="Leave empty for unlimited"
//                 />
//               </div>

//               <div className="form-group">
//                 <label>STATUS</label>
//                 <select
//                   value={newPromo.status}
//                   onChange={(e) => handleNewPromoChange('status', e.target.value)}
//                   className="form-input"
//                 >
//                   <option value="Active">Active</option>
//                   <option value="Inactive">Inactive</option>
//                 </select>
//               </div>
//             </div>

//             <div className="modal-footer">
//               <button
//                 className="btn-cancel"
//                 onClick={() => setShowAddPromoModal(false)}
//               >
//                 CANCEL
//               </button>
//               <button
//                 className="btn-save"
//                 onClick={handleSaveNewPromo}
//               >
//                 ADD PROMO
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </section>
//   )
// }

import { useState, useEffect } from 'react'
import './ManageProduct.css'

const BASE_URL = 'http://localhost:5000';

export default function ManageProducts() {
  const [products, setProducts] = useState([])
  const [promoCodes, setPromoCodes] = useState([])
  const [editingProduct, setEditingProduct] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)
  
  // Promo State
  const [showAddPromoModal, setShowAddPromoModal] = useState(false)
  const [newPromo, setNewPromo] = useState({ code: '', type: 'fixed', discount: 0, minOrder: 0, usageLimit: 100 })

  const [filterGender, setFilterGender] = useState('All')
  const [filterCategory, setFilterCategory] = useState('All')

  const loadData = async () => {
    try {
      const prodRes = await fetch(`${BASE_URL}/admin/fetch_products`);
      const prodData = await prodRes.json();
      if (Array.isArray(prodData)) {
        setProducts(prodData.map(p => ({
          ...p,
          image: p.image_path ? `${BASE_URL}/${p.image_path.replace(/\\/g, '/')}` : '',
          category: p.subcategory || 'General',
          gender: p.gender,
          price: p.price || 0,
          stock: p.stock_quantity || 0
        })));
      }
      const promoRes = await fetch(`${BASE_URL}/admin/fetch_promos`);
      const promoData = await promoRes.json();
      if (Array.isArray(promoData)) setPromoCodes(promoData);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadData(); }, []);

  const normalizeGender = (v) => {
    const s = String(v || '').toLowerCase();
    if (s === 'men') return 'Men';
    if (s === 'children') return 'Children';
    if (s === 'babies' || s === 'baby') return 'Baby';
    if (s === 'sports') return 'Sports';
    return v;
  }

  const filteredProducts = products.filter((p) => {
    const genOk = filterGender === 'All' || normalizeGender(p.gender) === filterGender
    const catOk = filterCategory === 'All' || p.category === filterCategory
    return genOk && catOk
  })

  // --- PRODUCT HANDLERS ---
  const handleEditProduct = (p) => { setEditingProduct({ ...p }); setShowEditModal(true); }
  
  const handleSaveProduct = async () => {
    const res = await fetch(`${BASE_URL}/admin/update_product/${editingProduct.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingProduct)
    });
    const data = await res.json();
    if (data.success) { setShowEditModal(false); loadData(); }
  }

  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  }

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    const res = await fetch(`${BASE_URL}/admin/delete_product`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: productToDelete.id })
    });
    const data = await res.json();
    if (data.success) {
      setShowDeleteModal(false);
      setProductToDelete(null);
      loadData();
    }
  }

  // --- PROMO HANDLERS ---
  const handleAddPromo = async () => {
    const res = await fetch(`${BASE_URL}/admin/add_promo_code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newPromo,
        discount_type: newPromo.type,
        discount_value: newPromo.discount,
        min_order_amount: newPromo.minOrder,
        usage_limit: newPromo.usageLimit,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 31536000000).toISOString(),
        is_active: true
      })
    });
    if (res.ok) { setShowAddPromoModal(false); loadData(); }
  }

  return (
    <section className="manage-products-container">
      <div className="action-buttons">
        <button className="btn-add-product">ADD NEW PRODUCT</button>
        <button className="btn-manage-promo" onClick={() => setShowAddPromoModal(true)}>ADD PROMO CODE</button>
      </div>

      {/* PROMO TABLE */}
      <div className="promo-section">
        <div className="section-header">
          <h3 className="section-title">Active Promo Codes</h3>
          <button className="btn-view-all">VIEW ALL</button>
        </div>
        <div className="promo-table-container">
          <table className="promo-table">
            <thead>
              <tr><th>CODE</th><th>TYPE</th><th>DISCOUNT</th><th>MIN ORDER</th><th>USAGE</th><th>STATUS</th><th>ACTIONS</th></tr>
            </thead>
            <tbody>
              {promoCodes.map((p) => (
                <tr key={p.id}>
                  <td className="promo-code">{p.code}</td>
                  <td>{p.discount_type}</td>
                  <td>₹{p.discount_value}.00</td>
                  <td>₹{p.min_order_amount}.00</td>
                  <td>{p.used_count || 0} / {p.usage_limit || '∞'}</td>
                  <td><span className={`status-badge ${p.is_active ? 'status-active' : ''}`}>{p.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td><div className="action-btns"><button className="btn-edit">EDIT</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section-header products-header"><h3 className="section-title">Active Products</h3></div>

      {/* FILTER UI (RESIZED TO ORIGINAL) */}
      <div className="products-filters">
        <div className="filters-left">
          <div className="filter-item">
            <label className="filter-label">CATEGORY</label>
            <select className="filter-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="All">All</option>
              {Array.from(new Set(products.map(p => p.category))).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="filter-item">
            <label className="filter-label">GENDER</label>
            <select className="filter-select" value={filterGender} onChange={(e) => setFilterGender(e.target.value)}>
              <option value="All">All</option>
              <option value="Men">Men</option>
              <option value="Children">Children</option>
              <option value="Baby">Baby</option>
              <option value="Sports">Sports</option>
            </select>
          </div>
        </div>
        <div className="filters-right">
          <span className="filters-count">Showing {filteredProducts.length} of {products.length}</span>
          <button type="button" className="btn-clear-filters" onClick={() => { setFilterCategory('All'); setFilterGender('All'); }}>CLEAR FILTERS</button>
        </div>
      </div>

      <div className="products-section">
        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr><th>IMAGE</th><th>NAME</th><th>SKU</th><th>PRICE</th><th>STOCK</th><th>CATEGORY</th><th>GENDER</th><th>ACTIONS</th></tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <tr key={p.id}>
                    <td><img src={p.image} className="product-image" alt={p.name} onError={(e) => e.target.src='https://via.placeholder.com/50'} /></td>
                    <td className="product-name">{p.name}</td>
                    <td className="product-sku">{p.sku}</td>
                    <td className="product-price">₹{p.price}.00</td>
                    <td className="product-stock">{p.stock}</td>
                    <td className="product-category">{p.category}</td>
                    <td className="product-gender">{normalizeGender(p.gender)}</td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-edit" onClick={() => handleEditProduct(p)}>EDIT</button>
                        <button className="btn-delete" onClick={() => openDeleteModal(p)}>DELETE</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '50px', color: '#666' }}>No active products found matching your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL EDIT MODAL (All Fields Restored) */}
      {showEditModal && editingProduct && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Edit Product</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label>PRODUCT NAME</label><input type="text" value={editingProduct.name} onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} className="form-input" /></div>
              <div className="form-group"><label>SKU</label><input type="text" value={editingProduct.sku} onChange={(e) => setEditingProduct({...editingProduct, sku: e.target.value})} className="form-input" /></div>
              <div className="form-row">
                <div className="form-group"><label>PRICE (₹)</label><input type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})} className="form-input" /></div>
                <div className="form-group"><label>STOCK</label><input type="number" value={editingProduct.stock} onChange={(e) => setEditingProduct({...editingProduct, stock: e.target.value})} className="form-input" /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>CATEGORY</label><input type="text" value={editingProduct.category} onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})} className="form-input" /></div>
                <div className="form-group"><label>GENDER</label>
                  <select value={editingProduct.gender} onChange={(e) => setEditingProduct({...editingProduct, gender: e.target.value})} className="form-input">
                    <option value="men">Men</option><option value="children">Children</option><option value="babies">Baby</option><option value="sports">Sports</option>
                  </select>
                </div>
              </div>
              <div className="form-group"><label>DESCRIPTION</label><textarea value={editingProduct.about} onChange={(e) => setEditingProduct({...editingProduct, about: e.target.value})} className="form-input" rows="3" /></div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowEditModal(false)}>CANCEL</button>
              <button className="btn-save" onClick={handleSaveProduct}>SAVE CHANGES</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && productToDelete && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content modal-content--compact" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Delete Product</h2>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="delete-modal-text">
                Deleting this product will remove it from the user pages
                and store it in Product Data. Do you want to continue?
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>CANCEL</button>
              <button className="btn-save btn-delete-confirm" onClick={handleDeleteProduct}>DELETE PRODUCT</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD PROMO MODAL */}
      {showAddPromoModal && (
        <div className="modal-overlay" onClick={() => setShowAddPromoModal(false)}>
          <div className="modal-content modal-content--compact" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2 className="modal-title">Add Promo Code</h2><button className="modal-close" onClick={() => setShowAddPromoModal(false)}>×</button></div>
            <div className="modal-body">
              <div className="form-group"><label>PROMO CODE</label><input type="text" value={newPromo.code} onChange={(e) => setNewPromo({...newPromo, code: e.target.value})} className="form-input" /></div>
              <div className="form-group"><label>TYPE</label>
                <select value={newPromo.type} onChange={(e) => setNewPromo({...newPromo, type: e.target.value})} className="form-input">
                  <option value="fixed">Fixed</option><option value="percentage">Percentage</option>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group"><label>DISCOUNT</label><input type="number" value={newPromo.discount} onChange={(e) => setNewPromo({...newPromo, discount: e.target.value})} className="form-input" /></div>
                <div className="form-group"><label>MIN ORDER (₹)</label><input type="number" value={newPromo.minOrder} onChange={(e) => setNewPromo({...newPromo, minOrder: e.target.value})} className="form-input" /></div>
              </div>
            </div>
            <div className="modal-footer"><button className="btn-cancel" onClick={() => setShowAddPromoModal(false)}>CANCEL</button><button className="btn-save" onClick={handleAddPromo}>ADD PROMO</button></div>
          </div>
        </div>
      )}
    </section>
  )
}