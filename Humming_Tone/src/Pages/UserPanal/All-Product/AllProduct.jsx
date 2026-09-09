import React, { useState, useEffect, useMemo } from 'react';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';
import ProductGridSkeleton from '../../../components/ProductSkeleton/ProductSkeleton';
import ProductCard from '../../../components/ProductCard/ProductCard';
import './AllProduct.css';
import { getSiteContent, fetchSiteContent } from '../../../utils/siteContentStore';
import { API_BASE_URL, getImageUrl } from '../../../utils/apiConfig';

const normalize = (val) => String(val || '').trim().toLowerCase();

const isAllGender = (gender) => {
  const norm = normalize(gender);
  return !norm || norm === 'all' || norm === 'all gender' || norm === 'all genders';
};

const isAllCategory = (cat) => {
  const norm = normalize(cat);
  return !norm || norm === 'all' || norm === 'all categories' || norm === 'all category';
};

const AllProduct = ({ onViewDetails: _onViewDetails = () => {} }) => {
  const [siteContent, setSiteContent] = useState(getSiteContent());
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryOptions, setCategoryOptions] = useState(['All Categories']);

  // Fetch site content to obtain latest active/restricted page settings from admin
  useEffect(() => {
    let isMounted = true;
    fetchSiteContent(true).then((content) => {
      if (isMounted && content) {
        setSiteContent(content);
      }
    }).catch(console.error);

    return () => { isMounted = false; };
  }, []);

  // Helper to check if a gender is active or restricted in admin panel
  const isGenderActive = useMemo(() => {
    return (genderName) => {
      if (!genderName) return true;
      const norm = normalize(genderName);
      if (norm === 'customize') return false; // Customize is a feature tool, not product clothing collection

      const genderStatus = siteContent?.genderStatus;
      if (!genderStatus || Object.keys(genderStatus).length === 0) {
        return true;
      }

      for (const [key, active] of Object.entries(genderStatus)) {
        if (normalize(key) === norm) {
          return active === true;
        }
      }
      // If gender is not found in status list, allow it only if not explicitly deactivated
      return true;
    };
  }, [siteContent]);

  // Compute dynamic gender options: ONLY include active/unrestricted genders from admin
  const genderOptions = useMemo(() => {
    const genderStatus = siteContent?.genderStatus || {};
    const genderCategory = siteContent?.genderCategory || {};

    const candidateGenders = Array.from(
      new Set([...Object.keys(genderCategory), ...Object.keys(genderStatus)])
    );

    const baseList = candidateGenders.length > 0
      ? candidateGenders
      : ['Men', 'Women', 'Children', 'Baby', 'Sports'];

    // Strictly filter out restricted/inactive genders and Customize
    const activeGenders = baseList.filter(g => {
      if (normalize(g) === 'customize') return false;
      if (Object.keys(genderStatus).length > 0) {
        return genderStatus[g] === true;
      }
      return true;
    });

    return ['All Gender', ...activeGenders];
  }, [siteContent]);

  // If the currently selected gender becomes restricted in admin, reset to All
  useEffect(() => {
    if (!isAllGender(selectedGender)) {
      const isAllowed = genderOptions.some(opt => normalize(opt) === normalize(selectedGender));
      if (!isAllowed) {
        setSelectedGender('All');
      }
    }
  }, [genderOptions, selectedGender]);

  // Fetch all products initially
  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/user/fetch_products`);
        const data = await response.json();
        const formattedProducts = (Array.isArray(data) ? data : []).map(product => ({
          ...product,
          price: parseFloat(product.price),
          image: getImageUrl(product.image_path),
        }));
        if (isMounted) {
          setAllProducts(formattedProducts);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProducts();
    return () => { isMounted = false; };
  }, []);

  // Fetch categories dynamically when gender or products or admin settings change
  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      try {
        let url = `${API_BASE_URL}/user/fetch_categories`;
        if (!isAllGender(selectedGender)) {
          url += `?gender=${encodeURIComponent(selectedGender)}`;
        }
        const response = await fetch(url);
        const data = await response.json();
        const apiCategories = Array.isArray(data) ? data : [];

        // Categories from loaded active products (excluding restricted genders)
        const productCategories = allProducts
          .filter(p => isGenderActive(p.gender))
          .filter(p => isAllGender(selectedGender) || normalize(p.gender) === normalize(selectedGender))
          .map(p => p.category || p.category_name)
          .filter(Boolean);

        // Also categories from site content for active genders
        const adminCategories = [];
        const genderCategoryMap = siteContent?.genderCategory || {};
        Object.entries(genderCategoryMap).forEach(([gender, cats]) => {
          if (isGenderActive(gender) && Array.isArray(cats)) {
            if (isAllGender(selectedGender) || normalize(gender) === normalize(selectedGender)) {
              adminCategories.push(...cats);
            }
          }
        });

        // Deduplicate while preserving clean casing
        const categoryMap = new Map();
        [...apiCategories, ...productCategories, ...adminCategories].forEach(cat => {
          if (cat && !categoryMap.has(normalize(cat))) {
            categoryMap.set(normalize(cat), String(cat).trim());
          }
        });

        const uniqueCategories = Array.from(categoryMap.values()).sort((a, b) => a.localeCompare(b));
        if (isMounted) {
          setCategoryOptions(['All Categories', ...uniqueCategories]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
    return () => { isMounted = false; };
  }, [selectedGender, allProducts, siteContent, isGenderActive]);

  // Reactive filtering: filters products smoothly whenever filters, catalog, or admin settings change
  useEffect(() => {
    // 1. Exclude products belonging to restricted/inactive genders
    let filtered = allProducts.filter(p => isGenderActive(p.gender));

    // 2. Filter by selected gender
    if (!isAllGender(selectedGender)) {
      filtered = filtered.filter(p => normalize(p.gender) === normalize(selectedGender));
    }

    // 3. Filter by selected category
    if (!isAllCategory(selectedCategory)) {
      filtered = filtered.filter(p => {
        const cat = p.category || p.category_name;
        return normalize(cat) === normalize(selectedCategory);
      });
    }

    setProducts(filtered);
  }, [selectedGender, selectedCategory, allProducts, isGenderActive]);

  const handleApplyFilters = () => {
    let filtered = allProducts.filter(p => isGenderActive(p.gender));

    if (!isAllGender(selectedGender)) {
      filtered = filtered.filter(p => normalize(p.gender) === normalize(selectedGender));
    }

    if (!isAllCategory(selectedCategory)) {
      filtered = filtered.filter(p => {
        const cat = p.category || p.category_name;
        return normalize(cat) === normalize(selectedCategory);
      });
    }

    setProducts(filtered);
  };

  const handleClearAll = () => {
    setSelectedGender('All');
    setSelectedCategory('All Categories');
  };

  return (
    <div className="all-products-collection-page">
      {/* Header Section */}
      <div className="all-products-header">
        <h1 className="all-products-title">Our Collection</h1>
        <p className="all-products-item-count">{products.length} {products.length === 1 ? 'ITEM' : 'ITEMS'} FOUND</p>
      </div>

      <div className="all-products-divider"></div>

      {/* Filter Section */}
      <div className="all-products-filter-container">
        <h2 className="all-products-filter-title">Refine Your Selection</h2>
        
        <div className="all-products-filter-row">
          {/* Gender Dropdown */}
          <div className="all-products-filter-group">
            <label className="all-products-filter-label">GENDER</label>
            <div className="all-products-select-wrapper">
              <select 
                className="all-products-select"
                value={selectedGender}
                onChange={(e) => {
                  setSelectedGender(e.target.value);
                  setSelectedCategory('All Categories');
                }}
              >
                {genderOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <span className="all-products-select-arrow">▼</span>
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="all-products-filter-group">
            <label className="all-products-filter-label">CATEGORY</label>
            <div className="all-products-select-wrapper">
              <select 
                className="all-products-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categoryOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <span className="all-products-select-arrow">▼</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="all-products-button-group">
            <button 
              className="all-products-apply-button"
              onClick={handleApplyFilters}
            >
              APPLY FILTERS
            </button>
            <button 
              className="all-products-clear-button"
              onClick={handleClearAll}
            >
              CLEAR ALL
            </button>
          </div>
        </div>
      </div>

      {/* Products Section - Conditional Rendering */}
      {loading ? (
        <div className="all-products-products-section">
          <ProductGridSkeleton count={8} />
        </div>
      ) : products.length > 0 ? (
        <div className="all-products-products-section">
          <div className="luxury-editorial-grid all-products-product-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} fallbackCategory="ATELIER COLLECTION" />
            ))}
          </div>
        </div>
      ) : (
        <div className="all-products-no-products-container">
          <h2 className="all-products-no-products-title">No Products Found</h2>
          <p className="all-products-no-products-text">
            Try adjusting your filters or browse our complete<br />collection.
          </p>
          <button 
            type="button" 
            className="all-products-view-all-button" 
            onClick={handleClearAll}
          >
            VIEW ALL PRODUCTS
          </button>
        </div>
      )}
      
      {/* Footer */}
      <UserFooter />
    </div>
  );
};

export default AllProduct;
