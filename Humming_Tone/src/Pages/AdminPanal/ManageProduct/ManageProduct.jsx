import { useState } from 'react'
import demoImage from '../../../assets/demo.jpeg'
import './ManageProduct.css'

// Sample product data
const productsData = [
  {
    id: 1,
    image: demoImage,
    name: 'Stitch set',
    sku: 'STICA1272',
    price: '₹400.00',
    stock: 3,
    category: 'Winter sets',
    gender: 'Baby'
  },
  {
    id: 2,
    image: demoImage,
    name: 'Blue set',
    sku: 'BLUCA8637',
    price: '₹400.00',
    stock: 4,
    category: 'Winter sets',
    gender: 'Baby'
  },
  {
    id: 3,
    image: demoImage,
    name: 'Mickey hoodie set',
    sku: 'MICCA7953',
    price: '₹450.00',
    stock: 3,
    category: 'Winter sets',
    gender: 'Baby'
  },
  {
    id: 4,
    image: demoImage,
    name: 'Bear set',
    sku: 'BEACA3638',
    price: '₹400.00',
    stock: 10,
    category: 'Winter sets',
    gender: 'Baby'
  },
  {
    id: 5,
    image: demoImage,
    name: 'Tinker bell frock',
    sku: 'TINCA7077',
    price: '₹250.00',
    stock: 6,
    category: 'T Shirts',
    gender: 'Baby'
  },
  {
    id: 6,
    image: demoImage,
    name: 'Lion king sleeping bag',
    sku: 'LIOCA7769',
    price: '₹300.00',
    stock: 12,
    category: 'Sleepingbags',
    gender: 'Baby'
  }
]

// Sample promo codes data
const promoCodesData = [
  {
    code: 'FIRST100',
    type: 'Fixed',
    discount: '₹100.00',
    minOrder: '₹0.00',
    usage: '0 / ∞',
    status: 'Active'
  }
]

export default function ManageProducts() {
  const [activeView, setActiveView] = useState('products') // 'products' or 'promoCodes'

  return (
    <section className="manage-products-container">
      <h2 className="page-heading">Manage Products</h2>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="btn-add-product">ADD NEW PRODUCT</button>
        <button className="btn-manage-promo">MANAGE PROMO CODES</button>
      </div>

      {/* Promo Codes Section */}
      <div className="promo-section">
        <div className="section-header">
          <h3 className="section-title">Active Promo Codes</h3>
          <button className="btn-view-all">VIEW ALL</button>
        </div>

        <div className="promo-table-container">
          <table className="promo-table">
            <thead>
              <tr>
                <th>CODE</th>
                <th>TYPE</th>
                <th>DISCOUNT</th>
                <th>MIN ORDER</th>
                <th>USAGE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {promoCodesData.map((promo, index) => (
                <tr key={index}>
                  <td className="promo-code">{promo.code}</td>
                  <td>{promo.type}</td>
                  <td>{promo.discount}</td>
                  <td>{promo.minOrder}</td>
                  <td>{promo.usage}</td>
                  <td>
                    <span className="status-badge status-active">{promo.status}</span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-deactivate">DEACTIVATE</button>
                      <button className="btn-delete">DELETE</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Products Table Section */}
      <div className="products-section">
        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>IMAGE</th>
                <th>NAME</th>
                <th>SKU</th>
                <th>PRICE</th>
                <th>STOCK</th>
                <th>CATEGORY</th>
                <th>GENDER</th>
              </tr>
            </thead>
            <tbody>
              {productsData.map((product) => (
                <tr key={product.id}>
                  <td>
                    <img src={product.image} alt={product.name} className="product-image" />
                  </td>
                  <td className="product-name">{product.name}</td>
                  <td className="product-sku">{product.sku}</td>
                  <td className="product-price">{product.price}</td>
                  <td className="product-stock">{product.stock}</td>
                  <td className="product-category">{product.category}</td>
                  <td className="product-gender">{product.gender}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}