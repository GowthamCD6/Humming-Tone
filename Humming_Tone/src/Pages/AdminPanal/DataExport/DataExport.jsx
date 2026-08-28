import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import TableViewIcon from '@mui/icons-material/TableView';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CodeIcon from '@mui/icons-material/Code';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import RefreshIcon from '@mui/icons-material/Refresh';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import RateReviewIcon from '@mui/icons-material/RateReview';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentsIcon from '@mui/icons-material/Payments';
import PrintIcon from '@mui/icons-material/Print';
import StarIcon from '@mui/icons-material/Star';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import { API_BASE_URL as BASE_URL, getImageUrl } from '../../../utils/apiConfig';
import './DataExport.css';

const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

// Toast Component
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`de-toast de-toast-${type}`}>
      <span>{message}</span>
      <button className="de-toast-close" onClick={onClose} aria-label="Close">
        <CloseIcon fontSize="small" />
      </button>
    </div>
  );
}

export default function DataExport() {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'products' | 'reviews'
  const [loading, setLoading] = useState(false);

  // --- Orders Filter State ---
  const [orderPeriod, setOrderPeriod] = useState('all'); // 'all', 'this_month', 'last_month', 'custom_month', 'custom_dates'
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [orderStatus, setOrderStatus] = useState('all');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  // --- Products Filter State ---
  const [prodCategory, setProdCategory] = useState('All');
  const [prodGender, setProdGender] = useState('All');
  const [prodFeatured, setProdFeatured] = useState('all');
  const [prodSearch, setProdSearch] = useState('');

  // --- Options ---
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [genderOptions, setGenderOptions] = useState(['Men', 'Women', 'Children', 'Baby', 'Sports']);

  // --- Loaded Data ---
  const [ordersData, setOrdersData] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [reviewsData, setReviewsData] = useState([]);

  // --- Selection & Modal ---
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [viewDetailModal, setViewDetailModal] = useState(null); // { type: 'order' | 'product', data: ... }

  // --- Pagination ---
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // --- Toasts ---
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };
  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const formatCurrency = (val) => {
    const num = Number(val || 0);
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  // Fetch Category options
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch(`${BASE_URL}/user/fetch_categories`);
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list)) setCategoryOptions(list);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch Orders for Export
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/export_orders_data`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setOrdersData(data.orders || []);
        setSelectedIds(new Set());
      } else {
        addToast('Failed to fetch orders data', 'error');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      addToast('Error loading orders data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Products for Export
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/export_products_data`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setProductsData(data.products || []);
        setSelectedIds(new Set());
      } else {
        addToast('Failed to fetch products data', 'error');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      addToast('Error loading products catalog', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Reviews for Export
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/reviews?limit=1000`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setReviewsData(data.reviews || []);
        setSelectedIds(new Set());
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    if (activeTab === 'orders') fetchOrders();
    else if (activeTab === 'products') fetchProducts();
    else if (activeTab === 'reviews') fetchReviews();
  }, [activeTab]);

  // Dynamic real-time order filtering
  const filteredOrders = useMemo(() => {
    return ordersData.filter(o => {
      // 1. Order Status Filter
      if (orderStatus !== 'all') {
        const oStat = (o.order_status || '').toLowerCase();
        if (oStat !== orderStatus.toLowerCase()) return false;
      }

      // 2. Payment Status Filter
      if (paymentStatus !== 'all') {
        const pStat = (o.payment_status || '').toLowerCase();
        if (paymentStatus === 'paid') {
          if (!['paid', 'captured', 'success', 'completed'].includes(pStat)) return false;
        } else if (paymentStatus === 'pending') {
          if (!['pending', 'unpaid', 'created', 'processing'].includes(pStat)) return false;
        } else if (paymentStatus === 'failed') {
          if (!['failed', 'cancelled', 'declined'].includes(pStat)) return false;
        } else {
          if (pStat !== paymentStatus.toLowerCase()) return false;
        }
      }

      // 3. Date / Period Filter
      if (o.created_at) {
        const orderDate = new Date(o.created_at);
        const now = new Date();

        if (orderPeriod === 'this_month') {
          if (orderDate.getMonth() !== now.getMonth() || orderDate.getFullYear() !== now.getFullYear()) {
            return false;
          }
        } else if (orderPeriod === 'last_month') {
          const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          if (orderDate.getMonth() !== lastMonthDate.getMonth() || orderDate.getFullYear() !== lastMonthDate.getFullYear()) {
            return false;
          }
        } else if (orderPeriod === 'custom_month') {
          if (selectedYear !== 'all' && orderDate.getFullYear() !== parseInt(selectedYear, 10)) {
            return false;
          }
          if (selectedMonth !== 'all' && (orderDate.getMonth() + 1) !== parseInt(selectedMonth, 10)) {
            return false;
          }
        } else if (orderPeriod === 'custom_dates') {
          const orderDateStr = orderDate.toISOString().slice(0, 10);
          if (customStartDate && orderDateStr < customStartDate) return false;
          if (customEndDate && orderDateStr > customEndDate) return false;
        }
      }

      // 4. Search Filter
      if (orderSearch.trim()) {
        const q = orderSearch.toLowerCase();
        const matches =
          String(o.order_number || '').toLowerCase().includes(q) ||
          String(o.customer_name || '').toLowerCase().includes(q) ||
          String(o.customer_email || '').toLowerCase().includes(q) ||
          String(o.customer_phone || '').toLowerCase().includes(q) ||
          String(o.tracking_number || '').toLowerCase().includes(q) ||
          String(o.courier_partner || '').toLowerCase().includes(q) ||
          String(o.products_summary || '').toLowerCase().includes(q) ||
          String(o.city || '').toLowerCase().includes(q) ||
          String(o.state || '').toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [ordersData, orderStatus, paymentStatus, orderPeriod, selectedMonth, selectedYear, customStartDate, customEndDate, orderSearch]);

  // Dynamic real-time product filtering
  const filteredProducts = useMemo(() => {
    return productsData.filter(p => {
      // 1. Category Filter
      if (prodCategory !== 'All') {
        const pCat = String(p.category || p.category_name || '').toLowerCase();
        if (pCat !== prodCategory.toLowerCase()) return false;
      }

      // 2. Gender Filter
      if (prodGender !== 'All') {
        const pGen = String(p.gender || '').toLowerCase();
        if (pGen !== prodGender.toLowerCase()) return false;
      }

      // 3. Featured Filter
      if (prodFeatured !== 'all') {
        const isFeat = Number(p.is_featured) === 1;
        if (prodFeatured === 'featured' && !isFeat) return false;
        if (prodFeatured === 'normal' && isFeat) return false;
      }

      // 4. Search Filter
      if (prodSearch.trim()) {
        const q = prodSearch.toLowerCase();
        const matches =
          String(p.name || '').toLowerCase().includes(q) ||
          String(p.sku || '').toLowerCase().includes(q) ||
          String(p.category || p.category_name || '').toLowerCase().includes(q) ||
          String(p.gender || '').toLowerCase().includes(q) ||
          String(p.about || '').toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [productsData, prodCategory, prodGender, prodFeatured, prodSearch]);

  // Reset Filters
  const handleResetFilters = () => {
    if (activeTab === 'orders') {
      setOrderPeriod('all');
      setSelectedMonth(String(new Date().getMonth() + 1));
      setSelectedYear(String(new Date().getFullYear()));
      setOrderStatus('all');
      setPaymentStatus('all');
      setCustomStartDate('');
      setCustomEndDate('');
      setOrderSearch('');
    } else if (activeTab === 'products') {
      setProdCategory('All');
      setProdGender('All');
      setProdFeatured('all');
      setProdSearch('');
    }
    setPage(1);
    addToast('Filters reset to default', 'success');
  };

  // KPI Metrics (Gross Revenue calculates only gained amount, excluding cancelled/failed orders)
  const orderMetrics = useMemo(() => {
    const total = filteredOrders.length;
    const gainedOrders = filteredOrders.filter(o => {
      const oStat = (o.order_status || '').toLowerCase();
      const pStat = (o.payment_status || '').toLowerCase();
      return oStat !== 'cancelled' && pStat !== 'failed';
    });
    const revenue = gainedOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const delivered = filteredOrders.filter(o => (o.order_status || '').toLowerCase() === 'delivered').length;
    const pending = filteredOrders.filter(o => ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery'].includes((o.order_status || '').toLowerCase())).length;
    const cancelled = filteredOrders.filter(o => (o.order_status || '').toLowerCase() === 'cancelled').length;
    return { total, revenue, delivered, pending, cancelled };
  }, [filteredOrders]);

  const productMetrics = useMemo(() => {
    const total = filteredProducts.length;
    const featured = filteredProducts.filter(p => Number(p.is_featured) === 1).length;
    const totalStock = filteredProducts.reduce((sum, p) => sum + Number(p.total_stock || 0), 0);
    const outOfStock = filteredProducts.filter(p => Number(p.total_stock || 0) <= 0).length;
    return { total, featured, totalStock, outOfStock };
  }, [filteredProducts]);

  // Handle Multi-Selection
  const currentList = activeTab === 'orders' ? filteredOrders : activeTab === 'products' ? filteredProducts : reviewsData;
  const isAllSelected = currentList.length > 0 && selectedIds.size === currentList.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(currentList.map(item => item.id)));
    }
  };

  const toggleSelectItem = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Get active dataset for export (all or selected)
  const getExportDataset = () => {
    if (selectedIds.size > 0) {
      return currentList.filter(item => selectedIds.has(item.id));
    }
    return currentList;
  };

  // --- EXPORT TO EXCEL (.XLSX) ---
  const handleExportExcel = (customDataset = null, customFilename = null) => {
    try {
      const wb = XLSX.utils.book_new();
      const dataset = customDataset || getExportDataset();

      if (activeTab === 'orders') {
        // 1. Orders Summary Sheet
        const summaryData = dataset.map((o, idx) => ({
          'S.No': idx + 1,
          'Order Number': o.order_number || `HT-${o.id}`,
          'Date': new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          'Customer Name': o.customer_name || 'N/A',
          'Phone': o.customer_phone || 'N/A',
          'Email': o.customer_email || 'N/A',
          'Address': o.customer_address || '',
          'City': o.city || '',
          'State': o.state || '',
          'Pincode': o.pincode || '',
          'Total Items': o.item_count || (o.items || []).length,
          'Products Summary': o.products_summary || '',
          'Total Amount (₹)': Number(o.total_amount || 0),
          'Payment Status': (o.payment_status || 'pending').toUpperCase(),
          'Order Status': (o.order_status || 'pending').toUpperCase(),
          'Courier Partner': o.courier_partner || 'N/A',
          'Tracking Number': o.tracking_number || 'N/A'
        }));

        const wsOrders = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, wsOrders, 'Orders Summary');

        // 2. Line Items Breakdown Sheet
        const itemRows = [];
        dataset.forEach(o => {
          (o.items || []).forEach(it => {
            itemRows.push({
              'Order Number': o.order_number || `HT-${o.id}`,
              'Order Date': new Date(o.created_at).toLocaleDateString('en-IN'),
              'Customer': o.customer_name,
              'Product Name': it.product_name,
              'Product SKU': it.product_sku || 'N/A',
              'Variant / Size': it.size || 'Free Size',
              'Quantity': it.quantity,
              'Unit Price (₹)': Number(it.unit_price || 0),
              'Line Total (₹)': Number(it.total_price || (it.unit_price * it.quantity)),
              'Order Status': (o.order_status || '').toUpperCase(),
              'Image URL': it.image_path ? getImageUrl(it.image_path) : ''
            });
          });
        });

        if (itemRows.length > 0) {
          const wsItems = XLSX.utils.json_to_sheet(itemRows);
          XLSX.utils.book_append_sheet(wb, wsItems, 'Itemized Details');
        }

        const fileName = customFilename || `Humming_Tone_Orders_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
        XLSX.writeFile(wb, fileName);
        addToast(`Orders report downloaded (${dataset.length} orders)!`, 'success');

      } else if (activeTab === 'products') {
        const prodRows = dataset.map((p, idx) => ({
          'S.No': idx + 1,
          'Product Name': p.name,
          'SKU': p.sku,
          'Category': p.category || p.category_name || 'General',
          'Gender': p.gender ? p.gender.toUpperCase() : 'ALL',
          'Featured': Number(p.is_featured) === 1 ? 'YES' : 'NO',
          'Min Price (₹)': Number(p.min_price || 0),
          'Max Price (₹)': Number(p.max_price || 0),
          'Total Stock': Number(p.total_stock || 0),
          'Available Sizes': p.sizes_list || '',
          'Variants Breakdown': p.variant_summary || '',
          'Description': p.about || '',
          'Primary Image URL': p.primary_image ? getImageUrl(p.primary_image) : '',
          'Created Date': new Date(p.created_at).toLocaleDateString('en-IN')
        }));

        const wsProd = XLSX.utils.json_to_sheet(prodRows);
        XLSX.utils.book_append_sheet(wb, wsProd, 'Product Catalog');

        const fileName = customFilename || `Humming_Tone_Product_Catalog_${new Date().toISOString().slice(0, 10)}.xlsx`;
        XLSX.writeFile(wb, fileName);
        addToast(`Products catalog downloaded (${dataset.length} products)!`, 'success');

      } else {
        const revRows = dataset.map((r, idx) => ({
          'S.No': idx + 1,
          'Product Name': r.product_name || `Product #${r.product_id}`,
          'Customer': r.reviewer_name,
          'Email': r.reviewer_email,
          'Rating (1-5)': r.rating,
          'Title': r.title || '',
          'Comment': r.comment || '',
          'Status': (r.status || 'pending').toUpperCase(),
          'Date': new Date(r.created_at).toLocaleDateString('en-IN')
        }));

        const wsRev = XLSX.utils.json_to_sheet(revRows);
        XLSX.utils.book_append_sheet(wb, wsRev, 'Reviews Data');
        XLSX.writeFile(wb, `Humming_Tone_Reviews_${new Date().toISOString().slice(0, 10)}.xlsx`);
        addToast('Customer Reviews report downloaded!', 'success');
      }
    } catch (err) {
      console.error('Excel export error:', err);
      addToast('Error generating Excel file', 'error');
    }
  };

  // --- EXPORT TO CSV (.CSV) ---
  const handleExportCSV = () => {
    try {
      const dataset = getExportDataset();
      if (!dataset || dataset.length === 0) {
        addToast('No records to export for the selected filters', 'error');
        return;
      }

      let csvContent = '\uFEFF'; // UTF-8 BOM for Excel / Google Sheets compatibility

      if (activeTab === 'orders') {
        const headers = [
          'S.No',
          'Order Number',
          'Date',
          'Customer Name',
          'Phone',
          'Email',
          'Address',
          'City',
          'State',
          'Pincode',
          'Items Count',
          'Products Breakdown',
          'Subtotal (₹)',
          'Discount (₹)',
          'Shipping (₹)',
          'Total Amount (₹)',
          'Payment Status',
          'Order Status',
          'Courier Partner',
          'Tracking Number'
        ];

        const rows = dataset.map((o, idx) => [
          idx + 1,
          `"${o.order_number || `HT-${o.id}`}"`,
          `"${new Date(o.created_at).toLocaleDateString('en-IN')}"`,
          `"${(o.customer_name || '').replace(/"/g, '""')}"`,
          `"${o.customer_phone || ''}"`,
          `"${o.customer_email || ''}"`,
          `"${(o.customer_address || '').replace(/"/g, '""')}"`,
          `"${o.city || ''}"`,
          `"${o.state || ''}"`,
          `"${o.pincode || ''}"`,
          o.item_count || (o.items || []).length || 1,
          `"${(o.products_summary || '').replace(/"/g, '""')}"`,
          o.subtotal || 0,
          o.discount_amount || 0,
          o.shipping || 0,
          o.total_amount || 0,
          `"${(o.payment_status || 'pending').toUpperCase()}"`,
          `"${(o.order_status || 'pending').toUpperCase()}"`,
          `"${o.courier_partner || 'N/A'}"`,
          `"${o.tracking_number || 'N/A'}"`
        ]);

        csvContent += [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');

      } else if (activeTab === 'products') {
        const headers = [
          'S.No',
          'Product Name',
          'SKU',
          'Category',
          'Gender',
          'Featured',
          'Min Price (₹)',
          'Max Price (₹)',
          'Total Stock',
          'Available Sizes',
          'Variants Breakdown',
          'Primary Image URL',
          'Description',
          'Created Date'
        ];

        const rows = dataset.map((p, idx) => [
          idx + 1,
          `"${(p.name || '').replace(/"/g, '""')}"`,
          `"${p.sku || ''}"`,
          `"${p.category || p.category_name || 'General'}"`,
          `"${(p.gender || 'ALL').toUpperCase()}"`,
          Number(p.is_featured) === 1 ? 'YES' : 'NO',
          p.min_price || 0,
          p.max_price || 0,
          p.total_stock || 0,
          `"${(p.sizes_list || '').replace(/"/g, '""')}"`,
          `"${(p.variant_summary || '').replace(/"/g, '""')}"`,
          `"${p.primary_image ? getImageUrl(p.primary_image) : ''}"`,
          `"${(p.about || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
          `"${new Date(p.created_at).toLocaleDateString('en-IN')}"`
        ]);

        csvContent += [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');

      } else {
        const headers = [
          'S.No',
          'Product Name',
          'Customer Name',
          'Email',
          'Rating (1-5)',
          'Review Title',
          'Review Comment',
          'Status',
          'Date'
        ];

        const rows = dataset.map((r, idx) => [
          idx + 1,
          `"${(r.product_name || `Product #${r.product_id}`).replace(/"/g, '""')}"`,
          `"${(r.reviewer_name || 'Anonymous').replace(/"/g, '""')}"`,
          `"${r.reviewer_email || ''}"`,
          r.rating || 5,
          `"${(r.title || '').replace(/"/g, '""')}"`,
          `"${(r.comment || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
          `"${(r.status || 'pending').toUpperCase()}"`,
          `"${new Date(r.created_at).toLocaleDateString('en-IN')}"`
        ]);

        csvContent += [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Humming_Tone_${activeTab}_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast(`CSV export downloaded (${dataset.length} records)!`, 'success');
    } catch (err) {
      console.error('CSV export error:', err);
      addToast('Error exporting CSV', 'error');
    }
  };

  // --- COMPREHENSIVE PRINT / PDF REPORT GENERATOR WITH REAL IMAGES ---
  const handlePrintPDF = () => {
    try {
      const dataset = getExportDataset();
      if (!dataset || dataset.length === 0) {
        addToast('No records to print for the selected filters', 'error');
        return;
      }

      const now = new Date();
      const formattedDate = now.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      let reportTitle = '';
      let filterSummary = '';
      let kpiHtml = '';
      let tableHeaderHtml = '';
      let tableBodyHtml = '';
      let tableFooterHtml = '';

      if (activeTab === 'orders') {
        reportTitle = 'ORDERS & FULFILLMENT AUDIT REPORT';
        const periodLabel = orderPeriod === 'all' ? 'All Time' : orderPeriod === 'this_month' ? 'This Month' : orderPeriod === 'last_month' ? 'Last Month' : orderPeriod === 'custom_dates' ? `${customStartDate || 'Start'} to ${customEndDate || 'End'}` : `${selectedMonth}/${selectedYear}`;
        filterSummary = `Period: <strong>${periodLabel}</strong> | Status: <strong>${orderStatus.toUpperCase()}</strong> | Payment: <strong>${paymentStatus.toUpperCase()}</strong> | Total Orders: <strong>${dataset.length}</strong>`;

        const gainedOrders = dataset.filter(o => {
          const oStat = (o.order_status || '').toLowerCase();
          const pStat = (o.payment_status || '').toLowerCase();
          return oStat !== 'cancelled' && pStat !== 'failed';
        });
        const totalRevenue = gainedOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
        const totalDelivered = dataset.filter(o => (o.order_status || '').toLowerCase() === 'delivered').length;
        const totalPending = dataset.filter(o => ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery'].includes((o.order_status || '').toLowerCase())).length;
        const totalCancelled = dataset.filter(o => (o.order_status || '').toLowerCase() === 'cancelled').length;

        kpiHtml = `
          <div class="pdf-kpi-grid">
            <div class="pdf-kpi-box"><span>TOTAL ORDERS</span><strong>${dataset.length}</strong></div>
            <div class="pdf-kpi-box"><span>GROSS REVENUE</span><strong style="color: #047857;">${formatCurrency(totalRevenue)}</strong></div>
            <div class="pdf-kpi-box"><span>DELIVERED</span><strong style="color: #15803d;">${totalDelivered}</strong></div>
            <div class="pdf-kpi-box"><span>PENDING / TRANSIT</span><strong style="color: #c2410c;">${totalPending}</strong></div>
            <div class="pdf-kpi-box"><span>CANCELLED</span><strong style="color: #b91c1c;">${totalCancelled}</strong></div>
          </div>
        `;

        tableHeaderHtml = `
          <tr>
            <th style="width: 30px; text-align: center;">#</th>
            <th>ORDER NUMBER</th>
            <th>DATE</th>
            <th>CUSTOMER INFO</th>
            <th>PRODUCTS & IMAGES</th>
            <th style="text-align: right;">AMOUNT</th>
            <th style="text-align: center;">PAYMENT</th>
            <th style="text-align: center;">ORDER STATUS</th>
            <th>LOGISTICS / TRACKING</th>
          </tr>
        `;

        tableBodyHtml = dataset.map((o, idx) => {
          const firstImg = o.items && o.items[0] && o.items[0].image_path ? getImageUrl(o.items[0].image_path) : null;
          return `
            <tr>
              <td style="text-align: center; font-weight: 700;">${idx + 1}</td>
              <td><strong>${o.order_number || `HT-${o.id}`}</strong></td>
              <td>${new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
              <td>
                <strong>${o.customer_name || 'N/A'}</strong><br/>
                <span style="font-size: 10.5px; color: #64748b;">${o.customer_phone || ''} ${o.city ? `• ${o.city}, ${o.state || ''}` : ''}</span>
              </td>
              <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                  ${firstImg ? `
                    <img src="${firstImg}" alt="Product" class="pdf-prod-img" crossorigin="anonymous" />
                  ` : ''}
                  <div style="font-size: 11px; line-height: 1.35;">
                    ${o.products_summary || `${o.item_count || 1} item(s)`}
                  </div>
                </div>
              </td>
              <td style="text-align: right; font-weight: 800; color: #0f172a;">${formatCurrency(o.total_amount)}</td>
              <td style="text-align: center;">
                <span class="pdf-badge pdf-badge-${(o.payment_status || '').toLowerCase() === 'paid' || (o.payment_status || '').toLowerCase() === 'captured' ? 'green' : 'gold'}">
                  ${(o.payment_status || 'PENDING').toUpperCase()}
                </span>
              </td>
              <td style="text-align: center;">
                <span class="pdf-badge pdf-status-${(o.order_status || 'pending').toLowerCase()}">
                  ${(o.order_status || 'PENDING').toUpperCase()}
                </span>
              </td>
              <td>
                <span style="font-size: 11px; font-weight: 600;">${o.courier_partner || 'Unassigned'}</span><br/>
                <span style="font-size: 10px; color: #64748b; font-family: monospace;">${o.tracking_number || '—'}</span>
              </td>
            </tr>
          `;
        }).join('');

        tableFooterHtml = `
          <tr class="pdf-total-row">
            <td colspan="5" style="text-align: right; font-weight: 800;">GRAND TOTAL:</td>
            <td style="text-align: right; font-weight: 800; color: #0f172a; font-size: 13px;">${formatCurrency(totalRevenue)}</td>
            <td colspan="3"></td>
          </tr>
        `;

      } else if (activeTab === 'products') {
        reportTitle = 'PRODUCT CATALOG & INVENTORY SPECIFICATION REPORT';
        filterSummary = `Category: <strong>${prodCategory}</strong> | Gender: <strong>${prodGender.toUpperCase()}</strong> | Type: <strong>${prodFeatured.toUpperCase()}</strong> | Total Products: <strong>${dataset.length}</strong>`;

        const totalStock = dataset.reduce((sum, p) => sum + Number(p.total_stock || 0), 0);
        const featuredCount = dataset.filter(p => Number(p.is_featured) === 1).length;
        const outOfStockCount = dataset.filter(p => Number(p.total_stock || 0) <= 0).length;

        kpiHtml = `
          <div class="pdf-kpi-grid">
            <div class="pdf-kpi-box"><span>TOTAL PRODUCTS</span><strong>${dataset.length}</strong></div>
            <div class="pdf-kpi-box"><span>FEATURED ITEMS</span><strong style="color: #b45309;">${featuredCount}</strong></div>
            <div class="pdf-kpi-box"><span>TOTAL STOCK UNITS</span><strong style="color: #047857;">${totalStock}</strong></div>
            <div class="pdf-kpi-box"><span>OUT OF STOCK</span><strong style="color: #b91c1c;">${outOfStockCount}</strong></div>
          </div>
        `;

        tableHeaderHtml = `
          <tr>
            <th style="width: 30px; text-align: center;">#</th>
            <th style="width: 52px; text-align: center;">IMAGE</th>
            <th>PRODUCT NAME</th>
            <th>SKU</th>
            <th>CATEGORY</th>
            <th>GENDER</th>
            <th style="text-align: center;">FEATURED</th>
            <th style="text-align: right;">PRICE RANGE</th>
            <th style="text-align: center;">TOTAL STOCK</th>
            <th>AVAILABLE SIZES & VARIANTS</th>
          </tr>
        `;

        tableBodyHtml = dataset.map((p, idx) => `
          <tr>
            <td style="text-align: center; font-weight: 700;">${idx + 1}</td>
            <td style="text-align: center; padding: 5px;">
              ${p.primary_image ? `
                <img src="${getImageUrl(p.primary_image)}" alt="${(p.name || '').replace(/"/g, '')}" class="pdf-prod-img" crossorigin="anonymous" />
              ` : `
                <div class="pdf-no-img">No Img</div>
              `}
            </td>
            <td><strong>${p.name}</strong></td>
            <td><code>${p.sku || 'N/A'}</code></td>
            <td>${p.category || p.category_name || 'General'}</td>
            <td>${(p.gender || 'ALL').toUpperCase()}</td>
            <td style="text-align: center;">
              <span class="pdf-badge ${Number(p.is_featured) === 1 ? 'pdf-badge-gold' : 'pdf-badge-gray'}">
                ${Number(p.is_featured) === 1 ? '★ FEATURED' : 'STANDARD'}
              </span>
            </td>
            <td style="text-align: right; font-weight: 700;">${formatCurrency(p.min_price)} ${p.min_price !== p.max_price ? `– ${formatCurrency(p.max_price)}` : ''}</td>
            <td style="text-align: center;">
              <span class="pdf-badge ${Number(p.total_stock) > 0 ? 'pdf-badge-green' : 'pdf-badge-red'}">
                ${Number(p.total_stock) > 0 ? `${p.total_stock} units` : 'OUT OF STOCK'}
              </span>
            </td>
            <td><span style="font-size: 11px;">${p.sizes_list || p.variant_summary || '—'}</span></td>
          </tr>
        `).join('');

      } else {
        reportTitle = 'CUSTOMER REVIEWS & FEEDBACK REPORT';
        filterSummary = `Total Reviews: <strong>${dataset.length}</strong>`;

        tableHeaderHtml = `
          <tr>
            <th style="width: 30px; text-align: center;">#</th>
            <th>PRODUCT</th>
            <th>CUSTOMER NAME</th>
            <th>EMAIL</th>
            <th style="text-align: center;">RATING</th>
            <th>FEEDBACK & TITLE</th>
            <th style="text-align: center;">STATUS</th>
            <th>DATE</th>
          </tr>
        `;

        tableBodyHtml = dataset.map((r, idx) => `
          <tr>
            <td style="text-align: center; font-weight: 700;">${idx + 1}</td>
            <td><strong>${r.product_name || `Product #${r.product_id}`}</strong></td>
            <td>${r.reviewer_name || 'Anonymous'}</td>
            <td>${r.reviewer_email || '—'}</td>
            <td style="text-align: center; font-weight: 800; color: #b45309;">★ ${r.rating} / 5</td>
            <td>${r.title ? `<strong>${r.title}: </strong>` : ''}${r.comment || ''}</td>
            <td style="text-align: center;"><span class="pdf-badge pdf-badge-${r.status === 'approved' ? 'green' : 'gold'}">${(r.status || 'pending').toUpperCase()}</span></td>
            <td>${new Date(r.created_at).toLocaleDateString('en-IN')}</td>
          </tr>
        `).join('');
      }

      const printableHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Humming Tone - ${reportTitle}</title>
          <meta charset="utf-8" />
          <style>
            @page {
              size: A4 landscape;
              margin: 10mm 12mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              color: #0f172a;
              margin: 0;
              padding: 10px;
              background: #ffffff;
              font-size: 11.5px;
              line-height: 1.4;
            }
            .pdf-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              border-bottom: 2px solid #0f172a;
              padding-bottom: 10px;
              margin-bottom: 12px;
            }
            .pdf-brand {
              font-size: 22px;
              font-weight: 900;
              letter-spacing: 0.08em;
              color: #0f172a;
              margin: 0;
            }
            .pdf-title {
              font-size: 13.5px;
              font-weight: 700;
              color: #475569;
              margin: 3px 0 0 0;
              letter-spacing: 0.04em;
            }
            .pdf-meta {
              text-align: right;
              font-size: 10.5px;
              color: #64748b;
            }
            .pdf-filters-bar {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              padding: 8px 12px;
              margin-bottom: 12px;
              font-size: 11px;
              color: #334155;
            }
            .pdf-kpi-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
              gap: 8px;
              margin-bottom: 12px;
            }
            .pdf-kpi-box {
              background: #ffffff;
              border: 1px solid #cbd5e1;
              border-radius: 6px;
              padding: 7px 10px;
            }
            .pdf-kpi-box span {
              display: block;
              font-size: 9px;
              font-weight: 800;
              color: #64748b;
              letter-spacing: 0.05em;
              margin-bottom: 2px;
            }
            .pdf-kpi-box strong {
              font-size: 15px;
              font-weight: 800;
              color: #0f172a;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 14px;
              font-size: 11px;
            }
            th {
              background: #f1f5f9;
              border: 1px solid #cbd5e1;
              padding: 7px 9px;
              font-size: 9.5px;
              font-weight: 800;
              color: #334155;
              letter-spacing: 0.05em;
              text-transform: uppercase;
              text-align: left;
            }
            td {
              border: 1px solid #e2e8f0;
              padding: 6px 9px;
              color: #334155;
              vertical-align: middle;
            }
            tr:nth-child(even) td {
              background: #fcfdfe;
            }
            .pdf-prod-img {
              width: 40px;
              height: 40px;
              object-fit: cover;
              border-radius: 5px;
              border: 1px solid #cbd5e1;
              display: block;
              margin: 0 auto;
              background: #f8fafc;
            }
            .pdf-no-img {
              width: 40px;
              height: 40px;
              border-radius: 5px;
              background: #f1f5f9;
              border: 1px solid #e2e8f0;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              font-size: 8.5px;
              color: #94a3b8;
              font-weight: 700;
            }
            .pdf-total-row td {
              background: #f8fafc !important;
              border-top: 2px solid #0f172a;
              font-size: 11.5px;
              padding: 8px 9px;
            }
            .pdf-badge {
              display: inline-block;
              padding: 2px 6px;
              border-radius: 999px;
              font-size: 9px;
              font-weight: 800;
              letter-spacing: 0.03em;
            }
            .pdf-badge-green { background: #dcfce7; color: #15803d; }
            .pdf-badge-gold { background: #fef3c7; color: #92400e; }
            .pdf-badge-red { background: #fee2e2; color: #991b1b; }
            .pdf-badge-gray { background: #f1f5f9; color: #475569; }
            .pdf-status-delivered { background: #dcfce7; color: #15803d; }
            .pdf-status-pending { background: #fef3c7; color: #92400e; }
            .pdf-status-confirmed { background: #e0f2fe; color: #0369a1; }
            .pdf-status-packed { background: #f3e8ff; color: #7e22ce; }
            .pdf-status-shipped { background: #e0e7ff; color: #3730a3; }
            .pdf-status-out_for_delivery { background: #ffedd5; color: #c2410c; }
            .pdf-status-cancelled { background: #fee2e2; color: #991b1b; }
            .pdf-footer {
              margin-top: 14px;
              padding-top: 8px;
              border-top: 1px solid #e2e8f0;
              display: flex;
              justify-content: space-between;
              font-size: 9.5px;
              color: #94a3b8;
            }
            @media print {
              body { padding: 0; }
              thead { display: table-header-group; }
              tr { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="pdf-header">
            <div>
              <h1 class="pdf-brand">HUMMING TONE</h1>
              <div class="pdf-title">${reportTitle}</div>
            </div>
            <div class="pdf-meta">
              <strong>Generated:</strong> ${formattedDate}<br/>
              <strong>Scope:</strong> Admin Analytics & Export Center
            </div>
          </div>

          <div class="pdf-filters-bar">
            ${filterSummary}
          </div>

          ${kpiHtml}

          <table>
            <thead>
              ${tableHeaderHtml}
            </thead>
            <tbody>
              ${tableBodyHtml}
              ${tableFooterHtml}
            </tbody>
          </table>

          <div class="pdf-footer">
            <span>Humming Tone Management Portal • Confidential Business Report</span>
            <span>Generated Automatically • Page 1</span>
          </div>
        </body>
        </html>
      `;

      // Print seamlessly via hidden background iframe with zero popup tabs
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.visibility = 'hidden';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(printableHtml);
      iframeDoc.close();

      const triggerPrint = () => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        } catch (e) {
          console.error(e);
        } finally {
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 3000);
        }
      };

      const imgs = iframeDoc.images;
      if (!imgs || imgs.length === 0) {
        setTimeout(triggerPrint, 250);
      } else {
        let loaded = 0;
        const total = imgs.length;
        let triggered = false;
        const checkDone = () => {
          loaded++;
          if (loaded >= total && !triggered) {
            triggered = true;
            setTimeout(triggerPrint, 350);
          }
        };

        for (let i = 0; i < total; i++) {
          if (imgs[i].complete) {
            loaded++;
            if (loaded >= total && !triggered) {
              triggered = true;
              setTimeout(triggerPrint, 350);
            }
          } else {
            imgs[i].onload = imgs[i].onerror = checkDone;
          }
        }
        setTimeout(() => {
          if (!triggered) {
            triggered = true;
            triggerPrint();
          }
        }, 2000);
      }

    } catch (err) {
      console.error('Print PDF error:', err);
      addToast('Error generating print view', 'error');
    }
  };

  const totalPages = Math.max(1, Math.ceil(currentList.length / rowsPerPage));
  const pagedList = currentList.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <section className="de-container">

      {/* Toast notifications */}
      <div className="de-toast-container">
        {toasts.map(t => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
        ))}
      </div>

      {/* ===== 1. TOP ACTION BAR ===== */}
      <div className="de-top-bar no-print">
        <div className="de-mode-nav">
          <button
            type="button"
            className={`de-mode-tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingCartIcon fontSize="small" />
            <span>Orders & Fulfillment</span>
            <span className="de-tab-count">{ordersData.length}</span>
          </button>
          <button
            type="button"
            className={`de-mode-tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Inventory2Icon fontSize="small" />
            <span>Product Catalog</span>
            <span className="de-tab-count">{productsData.length}</span>
          </button>
          <button
            type="button"
            className={`de-mode-tab ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <RateReviewIcon fontSize="small" />
            <span>Customer Reviews</span>
            <span className="de-tab-count">{reviewsData.length}</span>
          </button>
        </div>

        {/* 1-Click Action Buttons */}
        <div className="de-header-actions">
          <button type="button" className="de-btn de-btn-excel" onClick={() => handleExportExcel()}>
            <FileDownloadIcon fontSize="small" />
            Download Excel (.xlsx)
          </button>
          <button type="button" className="de-btn de-btn-csv" onClick={handleExportCSV}>
            <TableViewIcon fontSize="small" />
            Download CSV
          </button>
          <button type="button" className="de-btn de-btn-print" onClick={handlePrintPDF}>
            <PrintIcon fontSize="small" />
            Print / PDF
          </button>
        </div>
      </div>

      {/* ===== 2. DYNAMIC TOP KPI STAT CARDS ===== */}
      {activeTab === 'orders' ? (
        <div className="de-stats-grid">
          <div className="de-stat-card de-stat-blue">
            <div className="de-stat-top">
              <span className="de-stat-icon de-icon-blue"><ShoppingCartIcon fontSize="inherit" /></span>
              <span className="de-stat-label">TOTAL ORDERS</span>
            </div>
            <div className="de-stat-value de-val-blue">{orderMetrics.total}</div>
            <div className="de-stat-sub">Matched criteria in range</div>
          </div>

          <div className="de-stat-card de-stat-green">
            <div className="de-stat-top">
              <span className="de-stat-icon de-icon-green"><PaymentsIcon fontSize="inherit" /></span>
              <span className="de-stat-label">GROSS REVENUE</span>
            </div>
            <div className="de-stat-value de-val-green">{formatCurrency(orderMetrics.revenue)}</div>
            <div className="de-stat-sub">Excluding cancelled orders</div>
          </div>

          <div className="de-stat-card de-stat-emerald">
            <div className="de-stat-top">
              <span className="de-stat-icon de-icon-emerald"><CheckCircleIcon fontSize="inherit" /></span>
              <span className="de-stat-label">DELIVERED</span>
            </div>
            <div className="de-stat-value de-val-emerald">{orderMetrics.delivered}</div>
            <div className="de-stat-sub">Successfully fulfilled orders</div>
          </div>

          <div className="de-stat-card de-stat-orange">
            <div className="de-stat-top">
              <span className="de-stat-icon de-icon-orange"><HourglassEmptyIcon fontSize="inherit" /></span>
              <span className="de-stat-label">PENDING / IN TRANSIT</span>
            </div>
            <div className="de-stat-value de-val-orange">{orderMetrics.pending}</div>
            <div className="de-stat-sub">Packaging or with courier</div>
          </div>

          <div className="de-stat-card de-stat-red">
            <div className="de-stat-top">
              <span className="de-stat-icon de-icon-red"><CancelIcon fontSize="inherit" /></span>
              <span className="de-stat-label">CANCELLED</span>
            </div>
            <div className="de-stat-value de-val-red">{orderMetrics.cancelled}</div>
            <div className="de-stat-sub">Cancelled by customer/store</div>
          </div>
        </div>
      ) : activeTab === 'products' ? (
        <div className="de-stats-grid">
          <div className="de-stat-card de-stat-blue">
            <div className="de-stat-top">
              <span className="de-stat-icon de-icon-blue"><Inventory2Icon fontSize="inherit" /></span>
              <span className="de-stat-label">TOTAL PRODUCTS</span>
            </div>
            <div className="de-stat-value de-val-blue">{productMetrics.total}</div>
            <div className="de-stat-sub">In active store catalog</div>
          </div>

          <div className="de-stat-card de-stat-gold">
            <div className="de-stat-top">
              <span className="de-stat-icon de-icon-gold"><StarIcon fontSize="inherit" /></span>
              <span className="de-stat-label">FEATURED PRODUCTS</span>
            </div>
            <div className="de-stat-value de-val-gold">{productMetrics.featured}</div>
            <div className="de-stat-sub">Showcased on homepage</div>
          </div>

          <div className="de-stat-card de-stat-green">
            <div className="de-stat-top">
              <span className="de-stat-icon de-icon-green"><CheckCircleIcon fontSize="inherit" /></span>
              <span className="de-stat-label">TOTAL INVENTORY UNITS</span>
            </div>
            <div className="de-stat-value de-val-green">{productMetrics.totalStock}</div>
            <div className="de-stat-sub">Across all sizes & variants</div>
          </div>

          <div className="de-stat-card de-stat-red">
            <div className="de-stat-top">
              <span className="de-stat-icon de-icon-red"><CancelIcon fontSize="inherit" /></span>
              <span className="de-stat-label">OUT OF STOCK</span>
            </div>
            <div className="de-stat-value de-val-red">{productMetrics.outOfStock}</div>
            <div className="de-stat-sub">Items requiring restocking</div>
          </div>
        </div>
      ) : null}

      {/* ===== 5. CUSTOM FILTER BUILDER ===== */}
      <div className="de-filter-card no-print">
        <div className="de-filter-header">
          <div className="de-filter-title-wrap">
            <FilterAltIcon className="de-filter-title-icon" />
            <div>
              <h3 className="de-filter-title">Export Filters & Parameters</h3>
              <p className="de-filter-sub">Refine parameters, select custom date ranges, or filter by specific order statuses.</p>
            </div>
          </div>
          <div className="de-filter-actions">
            <button type="button" className="de-btn de-btn-outline" onClick={handleResetFilters}>
              <RotateLeftIcon fontSize="small" />
              Reset Filters
            </button>
            <button type="button" className="de-btn de-btn-refresh" onClick={() => activeTab === 'orders' ? fetchOrders() : fetchProducts()}>
              <RefreshIcon fontSize="small" className={loading ? 'spin' : ''} />
              Refresh Data
            </button>
          </div>
        </div>

        {activeTab === 'orders' ? (
          <div className="de-filter-grid">
            {/* Period Range */}
            <div className="de-form-group">
              <label>EXPORT PERIOD</label>
              <select
                className="de-select"
                value={orderPeriod}
                onChange={(e) => setOrderPeriod(e.target.value)}
              >
                <option value="all">All Time Records</option>
                <option value="this_month">This Month (Current)</option>
                <option value="last_month">Last Month</option>
                <option value="custom_month">Specific Month & Year</option>
                <option value="custom_dates">Custom Date Range</option>
              </select>
            </div>

            {/* Specific Month & Year */}
            {orderPeriod === 'custom_month' && (
              <>
                <div className="de-form-group">
                  <label>MONTH</label>
                  <select
                    className="de-select"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    <option value="all">All Months</option>
                    <option value="1">January</option>
                    <option value="2">February</option>
                    <option value="3">March</option>
                    <option value="4">April</option>
                    <option value="5">May</option>
                    <option value="6">June</option>
                    <option value="7">July</option>
                    <option value="8">August</option>
                    <option value="9">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </select>
                </div>

                <div className="de-form-group">
                  <label>YEAR</label>
                  <select
                    className="de-select"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>
                </div>
              </>
            )}

            {/* Custom Dates */}
            {orderPeriod === 'custom_dates' && (
              <>
                <div className="de-form-group">
                  <label>FROM DATE</label>
                  <input
                    type="date"
                    className="de-input"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>
                <div className="de-form-group">
                  <label>TO DATE</label>
                  <input
                    type="date"
                    className="de-input"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Order Status */}
            <div className="de-form-group">
              <label>ORDER STATUS</label>
              <select
                className="de-select"
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending Orders</option>
                <option value="confirmed">Confirmed / Paid</option>
                <option value="packed">Packaging / Packed</option>
                <option value="shipped">Shipped</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered (Completed)</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Payment Status */}
            <div className="de-form-group">
              <label>PAYMENT STATUS</label>
              <select
                className="de-select"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
              >
                <option value="all">All Payments</option>
                <option value="paid">Paid / Success</option>
                <option value="pending">Pending Payment</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Search */}
            <div className="de-form-group de-search-group">
              <label>SEARCH PREVIEW</label>
              <div className="de-search-box">
                <SearchIcon fontSize="small" />
                <input
                  type="text"
                  placeholder="Search customer, order #, phone, email, city..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        ) : activeTab === 'products' ? (
          <div className="de-filter-grid">
            {/* Category */}
            <div className="de-form-group">
              <label>CATEGORY</label>
              <select
                className="de-select"
                value={prodCategory}
                onChange={(e) => setProdCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Gender */}
            <div className="de-form-group">
              <label>GENDER / SECTION</label>
              <select
                className="de-select"
                value={prodGender}
                onChange={(e) => setProdGender(e.target.value)}
              >
                <option value="All">All Genders</option>
                {genderOptions.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            {/* Featured Status */}
            <div className="de-form-group">
              <label>PRODUCT TYPE</label>
              <select
                className="de-select"
                value={prodFeatured}
                onChange={(e) => setProdFeatured(e.target.value)}
              >
                <option value="all">All Products</option>
                <option value="featured">Featured Only</option>
                <option value="normal">Normal (Non-Featured)</option>
              </select>
            </div>

            {/* Search */}
            <div className="de-form-group de-search-group">
              <label>SEARCH CATALOG</label>
              <div className="de-search-box">
                <SearchIcon fontSize="small" />
                <input
                  type="text"
                  placeholder="Search by product name, SKU, or category..."
                  value={prodSearch}
                  onChange={(e) => setProdSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* ===== 6. DATA PREVIEW TABLE ===== */}
      <div className="de-table-card">
        <div className="de-table-header">
          <div className="de-table-title">
            <span>LIVE DATA PREVIEW ({currentList.length} total records)</span>
            {selectedIds.size > 0 && (
              <span className="de-selected-pill">{selectedIds.size} selected for export</span>
            )}
          </div>
          <span className="de-table-note no-print">
            Click any row or the eye icon to inspect full details, or click Export buttons above
          </span>
        </div>

        <div className="de-table-wrapper">
          {activeTab === 'orders' ? (
            <table className="de-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      aria-label="Select All"
                    />
                  </th>
                  <th>ORDER #</th>
                  <th>DATE</th>
                  <th>CUSTOMER</th>
                  <th>ITEMS & PRODUCTS</th>
                  <th>AMOUNT</th>
                  <th>PAYMENT</th>
                  <th>STATUS</th>
                  <th>LOGISTICS</th>
                  <th className="de-text-center">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
                    <tr key={`skel-ord-${idx}`}>
                      <td data-label="Select"><div className="de-skeleton de-skeleton-box" style={{ width: '18px', height: '18px', borderRadius: '4px' }} /></td>
                      <td data-label="Order"><div className="de-skeleton de-skeleton-text" style={{ width: '100px', height: '16px' }} /></td>
                      <td data-label="Date"><div className="de-skeleton de-skeleton-text" style={{ width: '80px', height: '14px' }} /></td>
                      <td data-label="Customer">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div className="de-skeleton de-skeleton-text" style={{ width: '120px', height: '14px' }} />
                          <div className="de-skeleton de-skeleton-text" style={{ width: '90px', height: '12px' }} />
                        </div>
                      </td>
                      <td data-label="Items & Products"><div className="de-skeleton de-skeleton-text" style={{ width: '150px', height: '14px' }} /></td>
                      <td data-label="Amount"><div className="de-skeleton de-skeleton-text" style={{ width: '70px', height: '16px' }} /></td>
                      <td data-label="Payment"><div className="de-skeleton de-skeleton-pill" style={{ width: '60px', height: '22px' }} /></td>
                      <td data-label="Status"><div className="de-skeleton de-skeleton-pill" style={{ width: '75px', height: '22px' }} /></td>
                      <td data-label="Logistics"><div className="de-skeleton de-skeleton-text" style={{ width: '85px', height: '14px' }} /></td>
                      <td className="de-text-center" data-label="Action">
                        <div className="de-skeleton de-skeleton-box" style={{ width: '28px', height: '28px', borderRadius: '6px', margin: '0 auto' }} />
                      </td>
                    </tr>
                  ))
                ) : filteredOrders.length === 0 ? (
                  <tr><td colSpan="10" className="de-empty">No orders match the selected export filters.</td></tr>
                ) : (
                  pagedList.map((o) => {
                    const isChecked = selectedIds.has(o.id);
                    return (
                      <tr
                        key={o.id}
                        className={isChecked ? 'row-selected' : ''}
                        onClick={() => toggleSelectItem(o.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td data-label="Select" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelectItem(o.id)}
                            aria-label={`Select Order ${o.order_number || o.id}`}
                          />
                        </td>
                        <td data-label="Order">
                          <strong className="de-order-code">{o.order_number || `HT-${o.id}`}</strong>
                        </td>
                        <td className="de-nowrap" data-label="Date">
                          {new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td data-label="Customer">
                          <div className="de-cust-name">{o.customer_name}</div>
                          <div className="de-cust-meta">{o.customer_phone} • {o.city}, {o.state}</div>
                        </td>
                        <td data-label="Items & Products">
                          <div className="de-items-summary" title={o.products_summary}>
                            <strong>{o.item_count || (o.items || []).length} item(s):</strong> {o.products_summary || '—'}
                          </div>
                        </td>
                        <td data-label="Amount">
                          <strong className="de-amount">{formatCurrency(o.total_amount)}</strong>
                        </td>
                        <td data-label="Payment">
                          <span className={`de-badge de-badge-${o.payment_status?.toLowerCase() === 'paid' ? 'paid' : 'pending'}`}>
                            {o.payment_status || 'pending'}
                          </span>
                        </td>
                        <td data-label="Status">
                          <span className={`de-badge de-status-${o.order_status?.toLowerCase()}`}>
                            {o.order_status || 'pending'}
                          </span>
                        </td>
                        <td className="de-nowrap" data-label="Logistics">
                          {o.courier_partner ? (
                            <div>
                              <small style={{ fontWeight: 700 }}>{o.courier_partner}</small>
                              <div className="de-tracking-tag">{o.tracking_number || 'No AWB'}</div>
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>Unassigned</span>
                          )}
                        </td>
                        <td className="de-text-center" data-label="Action" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="de-icon-btn"
                            title="View Full Order Details"
                            onClick={() => setViewDetailModal({ type: 'order', data: o })}
                          >
                            <VisibilityIcon fontSize="small" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : activeTab === 'products' ? (
            <table className="de-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      aria-label="Select All"
                    />
                  </th>
                  <th>IMAGE</th>
                  <th>PRODUCT NAME</th>
                  <th>SKU</th>
                  <th>CATEGORY</th>
                  <th>GENDER</th>
                  <th>FEATURED</th>
                  <th>PRICE RANGE</th>
                  <th>TOTAL STOCK</th>
                  <th>VARIANTS</th>
                  <th className="de-text-center">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
                    <tr key={`skel-prod-${idx}`}>
                      <td><div className="de-skeleton de-skeleton-box" style={{ width: '18px', height: '18px', borderRadius: '4px' }} /></td>
                      <td><div className="de-skeleton de-skeleton-img" style={{ width: '38px', height: '38px', borderRadius: '6px' }} /></td>
                      <td><div className="de-skeleton de-skeleton-text" style={{ width: '140px', height: '16px' }} /></td>
                      <td><div className="de-skeleton de-skeleton-text" style={{ width: '90px', height: '14px' }} /></td>
                      <td><div className="de-skeleton de-skeleton-pill" style={{ width: '70px', height: '22px' }} /></td>
                      <td><div className="de-skeleton de-skeleton-pill" style={{ width: '50px', height: '22px' }} /></td>
                      <td><div className="de-skeleton de-skeleton-pill" style={{ width: '70px', height: '22px' }} /></td>
                      <td><div className="de-skeleton de-skeleton-text" style={{ width: '80px', height: '16px' }} /></td>
                      <td><div className="de-skeleton de-skeleton-pill" style={{ width: '65px', height: '22px' }} /></td>
                      <td><div className="de-skeleton de-skeleton-pill" style={{ width: '60px', height: '22px' }} /></td>
                      <td className="de-text-center">
                        <div className="de-skeleton de-skeleton-box" style={{ width: '28px', height: '28px', borderRadius: '6px', margin: '0 auto' }} />
                      </td>
                    </tr>
                  ))
                ) : filteredProducts.length === 0 ? (
                  <tr><td colSpan="11" className="de-empty">No products match the selected catalog filters.</td></tr>
                ) : (
                  pagedList.map((p) => {
                    const isChecked = selectedIds.has(p.id);
                    return (
                      <tr
                        key={p.id}
                        className={isChecked ? 'row-selected' : ''}
                        onClick={() => toggleSelectItem(p.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelectItem(p.id)}
                            aria-label={`Select Product ${p.name}`}
                          />
                        </td>
                        <td>
                          {p.primary_image ? (
                            <img
                              src={getImageUrl(p.primary_image)}
                              alt={p.name}
                              className="de-prod-thumb"
                              onError={(e) => { e.target.onerror = null; e.target.style.opacity = '0.3'; }}
                            />
                          ) : (
                            <div className="de-prod-thumb-empty">No Img</div>
                          )}
                        </td>
                        <td>
                          <strong>{p.name}</strong>
                        </td>
                        <td data-label="SKU"><code>{p.sku}</code></td>
                        <td data-label="Category">{p.category || p.category_name || 'General'}</td>
                        <td data-label="Gender">{p.gender ? p.gender.toUpperCase() : 'ALL'}</td>
                        <td data-label="Featured">
                          {Number(p.is_featured) === 1 ? (
                            <span className="de-badge de-badge-gold"><StarIcon fontSize="inherit" /> Featured</span>
                          ) : (
                            <span className="de-badge de-badge-gray">Normal</span>
                          )}
                        </td>
                        <td data-label="Price Range">
                          <strong className="de-amount">
                            {formatCurrency(p.min_price)} {p.min_price !== p.max_price ? `– ${formatCurrency(p.max_price)}` : ''}
                          </strong>
                        </td>
                        <td data-label="Total Stock">
                          <span className={`de-badge ${Number(p.total_stock) > 0 ? 'de-badge-green' : 'de-badge-red'}`}>
                            {Number(p.total_stock) > 0 ? `${p.total_stock} units` : 'Out of Stock'}
                          </span>
                        </td>
                        <td data-label="Variants">
                          <small>{p.sizes_list || '—'}</small>
                        </td>
                        <td className="de-text-center" data-label="Action" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="de-icon-btn"
                            title="View Product Specs"
                            onClick={() => setViewDetailModal({ type: 'product', data: p })}
                          >
                            <VisibilityIcon fontSize="small" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            <table className="de-table">
              <thead>
                <tr>
                  <th>PRODUCT</th>
                  <th>CUSTOMER</th>
                  <th>RATING</th>
                  <th>FEEDBACK</th>
                  <th>STATUS</th>
                  <th>DATE</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
                    <tr key={`skel-rev-${idx}`}>
                      <td data-label="Product"><div className="de-skeleton de-skeleton-text" style={{ width: '140px', height: '16px' }} /></td>
                      <td data-label="Customer"><div className="de-skeleton de-skeleton-text" style={{ width: '110px', height: '14px' }} /></td>
                      <td data-label="Rating"><div className="de-skeleton de-skeleton-pill" style={{ width: '60px', height: '22px' }} /></td>
                      <td data-label="Feedback"><div className="de-skeleton de-skeleton-text" style={{ width: '200px', height: '14px' }} /></td>
                      <td data-label="Status"><div className="de-skeleton de-skeleton-pill" style={{ width: '65px', height: '22px' }} /></td>
                      <td data-label="Date"><div className="de-skeleton de-skeleton-text" style={{ width: '75px', height: '14px' }} /></td>
                    </tr>
                  ))
                ) : reviewsData.length === 0 ? (
                  <tr><td colSpan="6" className="de-empty">No reviews match the selected filters.</td></tr>
                ) : (
                  reviewsData.map((r) => (
                    <tr key={r.id}>
                      <td data-label="Product"><strong>{r.product_name || `Product #${r.product_id}`}</strong></td>
                      <td data-label="Customer">{r.reviewer_name} ({r.reviewer_email})</td>
                      <td data-label="Rating"><span className="de-rating-value"><StarIcon fontSize="inherit" /> {r.rating} / 5</span></td>
                      <td data-label="Feedback">{r.title && <strong>{r.title}: </strong>}{r.comment}</td>
                      <td data-label="Status"><span className={`de-badge de-status-${r.status}`}>{r.status}</span></td>
                      <td data-label="Date">{new Date(r.created_at).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer & Pagination */}
        <div className="de-table-footer no-print">
          <div className="de-footer-text">
            Showing {currentList.length === 0 ? 0 : (page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, currentList.length)} of {currentList.length} records
          </div>

          <div className="de-pagination-group">
            <label>Rows:</label>
            <select
              className="de-select de-limit-select"
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={1000}>All</option>
            </select>

            <button
              className="de-btn de-btn-outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Previous
            </button>
            <span className="de-page-indicator">Page {page} of {totalPages}</span>
            <button
              className="de-btn de-btn-outline"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ===== FLOATING BULK EXPORT BAR ===== */}
      {selectedIds.size > 0 && (
        <div className="de-bulk-bar no-print">
          <div className="de-bulk-info">
            <strong>{selectedIds.size}</strong> {activeTab} selected for export
          </div>
          <div className="de-bulk-actions">
            <button type="button" className="de-btn de-btn-excel" onClick={() => handleExportExcel()}>
              <FileDownloadIcon fontSize="small" />
              Export Selected to Excel ({selectedIds.size})
            </button>
            <button type="button" className="de-btn de-btn-csv" onClick={handleExportCSV}>
              <TableViewIcon fontSize="small" />
              Export Selected to CSV
            </button>
            <button type="button" className="de-btn de-btn-outline" onClick={() => setSelectedIds(new Set())}>
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* ===== DETAIL INSPECTION MODAL ===== */}
      {viewDetailModal && (
        <div className="de-modal-overlay" onClick={() => setViewDetailModal(null)}>
          <div className="de-modal" onClick={(e) => e.stopPropagation()}>
            <div className="de-modal-header">
              <div className="de-modal-title-wrap">
                <h3 className="de-modal-title">
                  {viewDetailModal.type === 'order'
                    ? `Order Details: ${viewDetailModal.data.order_number || `HT-${viewDetailModal.data.id}`}`
                    : `Product Details: ${viewDetailModal.data.name}`
                  }
                </h3>
                <span className="de-modal-sub">
                  {viewDetailModal.type === 'order'
                    ? `Placed on ${new Date(viewDetailModal.data.created_at).toLocaleDateString('en-IN', { dateStyle: 'full' })}`
                    : `SKU: ${viewDetailModal.data.sku}`
                  }
                </span>
              </div>
              <button className="de-modal-close" onClick={() => setViewDetailModal(null)}>
                <CloseIcon />
              </button>
            </div>

            <div className="de-modal-body">
              {viewDetailModal.type === 'order' ? (
                <>
                  {/* Order Status & Financial Summary */}
                  <div className="de-modal-section-grid">
                    <div className="de-modal-box">
                      <h4><PersonIcon fontSize="small" /> Customer & Shipping Info</h4>
                      <p><strong>Name:</strong> {viewDetailModal.data.customer_name}</p>
                      <p><strong>Phone:</strong> {viewDetailModal.data.customer_phone}</p>
                      <p><strong>Email:</strong> {viewDetailModal.data.customer_email || 'N/A'}</p>
                      <p><strong>Address:</strong> {viewDetailModal.data.customer_address}, {viewDetailModal.data.city}, {viewDetailModal.data.state} - {viewDetailModal.data.pincode}</p>
                    </div>

                    <div className="de-modal-box">
                      <h4><LocalShippingIcon fontSize="small" /> Fulfillment & Logistics</h4>
                      <p>
                        <strong>Order Status: </strong>
                        <span className={`de-badge de-status-${viewDetailModal.data.order_status?.toLowerCase()}`}>
                          {viewDetailModal.data.order_status}
                        </span>
                      </p>
                      <p>
                        <strong>Payment Status: </strong>
                        <span className={`de-badge de-badge-${viewDetailModal.data.payment_status?.toLowerCase() === 'paid' ? 'paid' : 'pending'}`}>
                          {viewDetailModal.data.payment_status}
                        </span>
                      </p>
                      <p><strong>Courier:</strong> {viewDetailModal.data.courier_partner || 'Not assigned'}</p>
                      <p><strong>Tracking Number:</strong> <code>{viewDetailModal.data.tracking_number || 'N/A'}</code></p>
                    </div>
                  </div>

                  {/* Line items table */}
                  <h4 style={{ marginTop: '16px', marginBottom: '8px' }}>Order Line Items ({viewDetailModal.data.items?.length || 0})</h4>
                  <table className="de-table de-modal-table">
                    <thead>
                      <tr>
                        <th>ITEM</th>
                        <th>SIZE / VARIANT</th>
                        <th>QTY</th>
                        <th>UNIT PRICE</th>
                        <th>TOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(viewDetailModal.data.items || []).map((it, idx) => (
                        <tr key={idx}>
                          <td>
                            <div className="de-prod-cell">
                              {it.image_path && (
                                <img src={getImageUrl(it.image_path)} alt={it.product_name} className="de-prod-thumb" />
                              )}
                              <div>
                                <strong>{it.product_name}</strong>
                                {it.product_sku && <div style={{ fontSize: '11px', color: '#94a3b8' }}>SKU: {it.product_sku}</div>}
                              </div>
                            </div>
                          </td>
                          <td><span className="de-badge de-badge-gray">{it.size || 'Free'}</span></td>
                          <td><strong>x{it.quantity}</strong></td>
                          <td>{formatCurrency(it.unit_price)}</td>
                          <td><strong>{formatCurrency(it.total_price || (it.unit_price * it.quantity))}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pricing footer */}
                  <div className="de-order-bill-summary">
                    <div><span>Subtotal:</span> <strong>{formatCurrency(viewDetailModal.data.subtotal)}</strong></div>
                    <div><span>Discount:</span> <strong style={{ color: '#059669' }}>- {formatCurrency(viewDetailModal.data.discount_amount)}</strong></div>
                    <div><span>Shipping:</span> <strong>{Number(viewDetailModal.data.shipping) > 0 ? formatCurrency(viewDetailModal.data.shipping) : 'FREE'}</strong></div>
                    <div className="de-total-row"><span>Total Amount:</span> <strong>{formatCurrency(viewDetailModal.data.total_amount)}</strong></div>
                  </div>
                </>
              ) : (
                <>
                  {/* Product Details View */}
                  <div className="de-modal-section-grid">
                    <div className="de-modal-box">
                      <h4>Product Information</h4>
                      <p><strong>Name:</strong> {viewDetailModal.data.name}</p>
                      <p><strong>SKU:</strong> <code>{viewDetailModal.data.sku}</code></p>
                      <p><strong>Category:</strong> {viewDetailModal.data.category || viewDetailModal.data.category_name}</p>
                      <p><strong>Gender:</strong> {viewDetailModal.data.gender?.toUpperCase()}</p>
                      <p><strong>Featured Status:</strong> {Number(viewDetailModal.data.is_featured) === 1 ? <span className="de-featured-value"><StarIcon fontSize="inherit" /> Featured</span> : 'Standard'}</p>
                    </div>

                    <div className="de-modal-box">
                      <h4>Inventory & Pricing</h4>
                      <p><strong>Price Range:</strong> {formatCurrency(viewDetailModal.data.min_price)} – {formatCurrency(viewDetailModal.data.max_price)}</p>
                      <p><strong>Total Units in Stock:</strong> <strong>{viewDetailModal.data.total_stock}</strong></p>
                      <p><strong>Available Sizes:</strong> {viewDetailModal.data.sizes_list}</p>
                    </div>
                  </div>

                  {viewDetailModal.data.about && (
                    <div style={{ marginTop: '14px' }}>
                      <h4>Description</h4>
                      <p style={{ color: '#475569', fontSize: '13px' }}>{viewDetailModal.data.about}</p>
                    </div>
                  )}

                  {/* Variants table */}
                  <h4 style={{ marginTop: '16px', marginBottom: '8px' }}>Variants & Sizes Inventory</h4>
                  <table className="de-table de-modal-table">
                    <thead>
                      <tr>
                        <th>SIZE</th>
                        <th>SELLING PRICE</th>
                        <th>ORIGINAL PRICE</th>
                        <th>STOCK QUANTITY</th>
                        <th>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(viewDetailModal.data.variants || []).map((v, idx) => (
                        <tr key={idx}>
                          <td><strong>{v.size}</strong></td>
                          <td><strong>{formatCurrency(v.price)}</strong></td>
                          <td>{v.original_price ? formatCurrency(v.original_price) : '—'}</td>
                          <td><strong>{v.stock_quantity} units</strong></td>
                          <td>
                            <span className={`de-badge ${Number(v.stock_quantity) > 0 ? 'de-badge-green' : 'de-badge-red'}`}>
                              {Number(v.stock_quantity) > 0 ? 'Available' : 'Out of Stock'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>

            <div className="de-modal-footer">
              <button type="button" className="de-btn de-btn-outline" onClick={() => setViewDetailModal(null)}>
                Close
              </button>
              <button
                type="button"
                className="de-btn de-btn-excel"
                onClick={() => {
                  handleExportExcel([viewDetailModal.data], `Export_${viewDetailModal.type}_${viewDetailModal.data.id}.xlsx`);
                  setViewDetailModal(null);
                }}
              >
                <FileDownloadIcon fontSize="small" />
                Export Single Record to Excel
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
