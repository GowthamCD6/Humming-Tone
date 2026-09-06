import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import AddToCartModal from "../Prodect-Details/Product-Buying modal/AddToCartModal";
import { fetchSiteContent, getSiteContent } from "../../../utils/siteContentStore";
import { API_BASE_URL } from "../../../utils/apiConfig";
import UserFooter from "../../../components/User-Footer-Card/UserFooter";

// 2D Plain T-Shirt Canvas with Admin Uploaded Front & Back Static Image Background
const PlainTShirt2D = ({
  color = '#FFFFFF',
  side = 'front',
  tshirtImage = null,
  design = null,
  printableAreaVisible = true,
}) => {
  const idPrefix = `tshirt-2d-${side}`;
  // On the back side, chest pocket placement is not applicable - always use full body back zone
  const placementMode = side === 'back' ? 'full' : (design?.placementMode || 'chest');

  // Exact coordinates calculated based on the 500x580 visualizer and 1:1 model garment photo:
  // Model photo: Center of collar is at X = 250, Y ≈ 200.
  // Model garment torso is slightly shifted to screen-left: center of torso is around X ≈ 238-240.
  //
  // 1. CHEST ZONE (Standard Left Chest / Pocket Print):
  //    In apparel customization, "Left Chest" refers to the wearer's left chest (over the heart,
  //    which is on the right side from the viewer's perspective: X ≈ 262 to 324).
  //    Width: 62, Height: 68, CenterX: 293, CenterY: 256.
  //
  // 2. FULL BODY ZONE (Torso print - Front & Back):
  //    Comfortably confined within the t-shirt torso fabric:
  //    Starts at Y: 228 (below collar), ends at Y: 416 (well above hem and jeans).
  //    Width: 136 (X: 176 to 312). CenterX: 244, CenterY: 322 (front) / 312 (back).
  const printArea = placementMode === 'chest' && side === 'front'
    ? {
        x: 182,
        y: 224,
        width: 62,
        height: 68,
        rx: 6,
        centerX: 213,
        centerY: 258
      }
    : {
        x: side === 'front' ? 176 : 180,
        y: side === 'front' ? 228 : 218,
        width: 136,
        height: 188,
        rx: 10,
        centerX: side === 'front' ? 244 : 250,
        centerY: side === 'front' ? 322 : 312
      };

  const isWhiteOrLight = (hex) => {
    if (!hex || hex === '#FFFFFF' || hex.toLowerCase() === '#fff') return true;
    const c = hex.replace('#', '');
    if (c.length !== 6) return false;
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 200;
  };

  const isLight = isWhiteOrLight(color);

  // Compute text fill color with auto-contrast for dark garments if text color is dark
  const resolvedTextColor = (() => {
    if (!design?.textColor) return isLight ? '#111827' : '#FFFFFF';
    if (!isLight && (design.textColor === '#111827' || design.textColor === '#000000')) {
      return '#FFFFFF';
    }
    return design.textColor;
  })();

  // Calculate suitable dynamic font size so text fits cleanly within the designated zone
  const textLength = design?.text ? design.text.trim().length : 0;
  let dynamicFontSize = design?.fontSize || (placementMode === 'chest' ? 13 : 16);
  const maxAllowedWidth = printArea.width - (placementMode === 'chest' ? 12 : 20); // safety padding inside print zone
  if (textLength > (placementMode === 'chest' ? 7 : 10)) {
    const maxChars = placementMode === 'chest' ? 7 : 10;
    dynamicFontSize = Math.max(9, Math.floor(dynamicFontSize * (maxChars / textLength)));
  }

  return (
    <div className="plain-tshirt-svg-container" style={{ position: 'relative', width: '100%', maxWidth: '500px', margin: '0 auto', aspectRatio: '500 / 580' }}>
      {/* If admin uploaded a static plain t-shirt photo, display it cleanly in background without artificial padding */}
      {tshirtImage && (
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
          pointerEvents: 'none',
        }}>
          <img
            src={tshirtImage}
            alt="Plain T-Shirt"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 14px 28px rgba(0,0,0,0.12))'
            }}
          />
        </div>
      )}

      <svg
        viewBox="0 0 500 580"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          height: '100%',
          display: 'block',
          filter: tshirtImage ? 'none' : 'drop-shadow(0 15px 30px rgba(0,0,0,0.12))'
        }}
      >
        <defs>
          <linearGradient id={`${idPrefix}-lighting`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity={isLight ? 0.45 : 0.15} />
            <stop offset="45%" stopColor="#FFFFFF" stopOpacity={0.0} />
            <stop offset="80%" stopColor="#000000" stopOpacity={isLight ? 0.08 : 0.22} />
            <stop offset="100%" stopColor="#000000" stopOpacity={isLight ? 0.18 : 0.38} />
          </linearGradient>

          <clipPath id={`${idPrefix}-print-clip`}>
            <rect
              x={printArea.x}
              y={printArea.y}
              width={printArea.width}
              height={printArea.height}
              rx={printArea.rx}
            />
          </clipPath>
        </defs>

        {/* Render fallback vector silhouette when no static image is provided */}
        {!tshirtImage && (
          <g id="tshirt-silhouette">
            <path
              d="
                M 188 78
                C 150 78, 126 94, 94 136
                L 16 216
                C 12 222, 14 232, 22 238
                L 68 274
                C 74 278, 84 276, 88 268
                L 124 200
                L 124 514
                C 124 520, 130 526, 138 526
                L 362 526
                C 370 526, 376 520, 376 514
                L 376 200
                L 412 268
                C 416 276, 426 278, 432 274
                L 478 238
                C 486 232, 488 222, 484 216
                L 406 136
                C 374 94, 350 78, 312 78
                Z
              "
              fill={color}
              stroke="#1E293B"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="
                M 188 78
                C 150 78, 126 94, 94 136
                L 16 216
                C 12 222, 14 232, 22 238
                L 68 274
                C 74 278, 84 276, 88 268
                L 124 200
                L 124 514
                C 124 520, 130 526, 138 526
                L 362 526
                C 370 526, 376 520, 376 514
                L 376 200
                L 412 268
                C 416 276, 426 278, 432 274
                L 478 238
                C 486 232, 488 222, 484 216
                L 406 136
                C 374 94, 350 78, 312 78
                Z
              "
              fill={`url(#${idPrefix}-lighting)`}
              pointerEvents="none"
            />
          </g>
        )}

        {/* Printable boundary */}
        {printableAreaVisible && (
          <g>
            <rect
              x={printArea.x}
              y={printArea.y}
              width={printArea.width}
              height={printArea.height}
              rx={printArea.rx}
              fill="rgba(99, 102, 241, 0.03)"
              stroke="#6366F1"
              strokeWidth="1.5"
              strokeDasharray="5 4"
              opacity="0.75"
              style={{ pointerEvents: 'none' }}
            />
            {/* Zone mode label inside border */}
            <text
              x={printArea.x + 6}
              y={printArea.y + (placementMode === 'chest' ? 11 : 14)}
              fill="#6366F1"
              fontSize={placementMode === 'chest' ? "7.5" : "9"}
              fontWeight="700"
              letterSpacing="0.5"
              opacity="0.85"
              style={{ textTransform: 'uppercase', pointerEvents: 'none' }}
            >
              {placementMode === 'chest' ? 'CHEST' : 'FULL BODY PRINT ZONE'}
            </text>
          </g>
        )}

        {/* User customized design layer */}
        <g id="custom-design-layer" clipPath={`url(#${idPrefix}-print-clip)`}>
          {design && (
            <g
              transform={`translate(${printArea.centerX + (design.posX || 0)}, ${
                printArea.centerY + (design.posY || 0)
              }) scale(${design.scale || 1}) rotate(${design.rotation || 0})`}
            >
              {design.imageUrl && (
                <g
                  transform={
                    placementMode === 'chest'
                      ? (design.text ? "translate(-30, -36)" : "translate(-35, -35)")
                      : (design.text ? "translate(-50, -65)" : "translate(-55, -55)")
                  }
                >
                  <image
                    href={design.imageUrl}
                    x="0"
                    y="0"
                    width={
                      placementMode === 'chest'
                        ? (design.text ? "60" : "70")
                        : (design.text ? "100" : "110")
                    }
                    height={
                      placementMode === 'chest'
                        ? (design.text ? "60" : "70")
                        : (design.text ? "100" : "110")
                    }
                    preserveAspectRatio="xMidYMid meet"
                    style={{ pointerEvents: 'none' }}
                  />
                </g>
              )}

              {design.text && (
                <text
                  x="0"
                  y={
                    design.imageUrl
                      ? (placementMode === 'chest' ? "30" : "55")
                      : "0"
                  }
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={resolvedTextColor}
                  fontSize={placementMode === 'chest' ? Math.min(dynamicFontSize, 15) : dynamicFontSize}
                  fontFamily={design.fontFamily || 'Inter, sans-serif'}
                  fontWeight={design.isBold ? '700' : '500'}
                  fontStyle={design.isItalic ? 'italic' : 'normal'}
                  letterSpacing={(design.letterSpacing || 1) + 'px'}
                  lengthAdjust={textLength > 10 ? "spacingAndGlyphs" : undefined}
                  textLength={textLength > 10 ? maxAllowedWidth : undefined}
                  style={{
                    userSelect: 'none',
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))',
                  }}
                >
                  {design.text}
                </text>
              )}
            </g>
          )}
        </g>

        {/* Side Indicator Badge */}
        <g transform="translate(195, 545)">
          <rect x="0" y="0" width="110" height="24" rx="12" fill="#0F172A" opacity="0.85" />
          <text
            x="55"
            y="16"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="10"
            fontWeight="600"
            letterSpacing="1.5"
            style={{ textTransform: 'uppercase' }}
          >
            {side === 'front' ? 'FRONT VIEW' : 'BACK VIEW'}
          </text>
        </g>
      </svg>
    </div>
  );
};

// MUI Icons
import CheckIcon from "@mui/icons-material/Check";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import TuneIcon from "@mui/icons-material/Tune";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import "./Customize.css";

// 4 Classic Plain T-Shirt Colors with front and back images as fallback/admin defaults
const DEFAULT_PLAIN_COLORS = [
  {
    id: "white",
    name: "Pure White",
    hex: "#FFFFFF",
    front_image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
    back_image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80",
    base_price: 699,
  },
  {
    id: "black",
    name: "Jet Black",
    hex: "#18181B",
    front_image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
    back_image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
    base_price: 699,
  },
  {
    id: "navy",
    name: "Navy Blue",
    hex: "#1E293B",
    front_image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80",
    back_image: "https://images.unsplash.com/photo-1618354691438-25bc04584c23?auto=format&fit=crop&w=800&q=80",
    base_price: 749,
  },
  {
    id: "gray",
    name: "Heather Gray",
    hex: "#94A3B8",
    front_image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80",
    back_image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=800&q=80",
    base_price: 699,
  },
];

const SIZES = [
  { label: "XS", chest: "34-36\"" },
  { label: "S", chest: "36-38\"" },
  { label: "M", chest: "38-40\"" },
  { label: "L", chest: "40-42\"" },
  { label: "XL", chest: "42-44\"" },
  { label: "XXL", chest: "44-46\"" },
];

const FONTS = [
  { label: "Inter (Modern)", value: "Inter, sans-serif" },
  { label: "Playfair (Luxury)", value: "'Playfair Display', serif" },
  { label: "Montserrat (Clean)", value: "Montserrat, sans-serif" },
  { label: "Poppins (Rounded)", value: "Poppins, sans-serif" },
  { label: "Courier (Monospace)", value: "'Courier New', monospace" },
  { label: "Georgia (Editorial)", value: "Georgia, serif" },
];

const TEXT_COLORS = [
  { name: "Pure White", hex: "#FFFFFF" },
  { name: "Jet Black", hex: "#111827" },
  { name: "Golden Ochre", hex: "#F59E0B" },
  { name: "Crimson Red", hex: "#EF4444" },
  { name: "Royal Navy", hex: "#1D4ED8" },
  { name: "Emerald", hex: "#10B981" },
];

const PRESET_GRAPHICS = [
  {
    name: "Minimalist Atelier Wave",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Geometric Heritage Seal",
    url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Botanical Silhouette",
    url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=200&q=80",
  },
];

const BASE_PRICE = 699; // INR
const PRINT_FEE = 150; // Custom design print fee

const Customize = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Active side: 'front' or 'back'
  const [activeSide, setActiveSide] = useState("front");

  // Admin plain t-shirt colors
  const [availableColors, setAvailableColors] = useState(DEFAULT_PLAIN_COLORS);
  const [selectedColor, setSelectedColor] = useState(DEFAULT_PLAIN_COLORS[0]);

  // Product size & quantity
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);

  // Customizer tool tab: 'text', 'upload', 'presets'
  const [toolTab, setToolTab] = useState("text");

  // Separate designs for FRONT and BACK
  const [frontDesign, setFrontDesign] = useState({
    placementMode: "chest", // 'chest' or 'full'
    text: "HUMMING TONE",
    textColor: "#111827",
    fontFamily: "Inter, sans-serif",
    fontSize: 18,
    isBold: true,
    isItalic: false,
    imageUrl: null,
    scale: 1,
    posX: 0,
    posY: 0,
    rotation: 0,
  });

  const [backDesign, setBackDesign] = useState({
    placementMode: "full", // 'chest' or 'full'
    isBackBlank: true, // option to keep back blank
    text: "",
    textColor: "#111827",
    fontFamily: "Inter, sans-serif",
    fontSize: 18,
    isBold: true,
    isItalic: false,
    imageUrl: null,
    scale: 1,
    posX: 0,
    posY: 0,
    rotation: 0,
  });

  const [showPrintBorder, setShowPrintBorder] = useState(true);

  // Cart Modal State
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartModalData, setCartModalData] = useState(null);

  // Load Colors and Static Front & Back Images from Admin Site Content
  useEffect(() => {
    const loadSiteColors = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/site-content/customize/plain-tshirts`);
        const data = await res.json();
        if (data && data.success && Array.isArray(data.tshirts) && data.tshirts.length > 0) {
          const colors = data.tshirts.map((t) => ({
            id: t.id,
            name: t.color_name,
            hex: t.color_hex || "#FFFFFF",
            front_image: t.front_image,
            back_image: t.back_image,
            base_price: Number(t.base_price || 699),
          }));
          setAvailableColors(colors);
          setSelectedColor(colors[0]);
          return;
        }

        // Fallback to fetchSiteContent customize if plain-tshirts is empty
        const siteData = await fetchSiteContent();
        if (siteData?.customize?.colors && siteData.customize.colors.length > 0) {
          const colors = siteData.customize.colors.slice(0, 6).map((c, idx) => ({
            id: c.id || c.name.toLowerCase().replace(/\s+/g, "_"),
            name: c.name,
            hex: c.hex || "#FFFFFF",
            front_image: DEFAULT_PLAIN_COLORS[idx % DEFAULT_PLAIN_COLORS.length].front_image,
            back_image: DEFAULT_PLAIN_COLORS[idx % DEFAULT_PLAIN_COLORS.length].back_image,
            base_price: 699,
          }));
          setAvailableColors(colors);
          setSelectedColor(colors[0]);
        }
      } catch (err) {
        console.warn("Using default plain colors:", err);
      }
    };
    loadSiteColors();
  }, []);

  // Current active side design accessor
  const currentDesign = activeSide === "front" ? frontDesign : backDesign;
  const updateCurrentDesign = (updates) => {
    if (activeSide === "front") {
      setFrontDesign((prev) => ({ ...prev, ...updates }));
    } else {
      setBackDesign((prev) => ({ ...prev, ...updates }));
    }
  };

  // Pricing calculation
  const hasCustomFront = Boolean(frontDesign.text?.trim() || frontDesign.imageUrl);
  const hasCustomBack = Boolean(backDesign.text?.trim() || backDesign.imageUrl);
  const customPrintsCount = (hasCustomFront ? 1 : 0) + (hasCustomBack ? 1 : 0);
  const unitPrice = BASE_PRICE + customPrintsCount * PRINT_FEE;
  const totalPrice = unitPrice * quantity;

  // Handle Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPG, SVG)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      updateCurrentDesign({ imageUrl: uploadEvent.target.result });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeCurrentImage = () => {
    updateCurrentDesign({ imageUrl: null });
  };

  const resetActiveSide = () => {
    updateCurrentDesign({
      text: "",
      imageUrl: null,
      scale: 1,
      posX: 0,
      posY: 0,
      rotation: 0,
    });
  };

  // Construct Cart Item representation
  const buildCartItem = () => {
    return {
      cartItemId: `custom-tshirt-${Date.now()}`,
      id: "plain-custom-tshirt",
      name: `Custom Plain Cotton T-Shirt (${selectedColor.name})`,
      brand: "HUMMING TONE ATELIER",
      price: unitPrice,
      quantity,
      size: selectedSize,
      color: selectedColor.name,
      stock: 50,
      image:
        selectedColor.front_image ||
        frontDesign.imageUrl ||
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
      customDetails: {
        color: selectedColor,
        front: frontDesign,
        back: backDesign,
        totalCustomSides: customPrintsCount,
      },
    };
  };

  // Add to Cart
  const handleAddToCart = () => {
    const cartItem = buildCartItem();
    let currentCart = [];
    try {
      currentCart = JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      currentCart = [];
    }

    const updatedCart = [...currentCart, cartItem];
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cart:updated"));

    setCartModalData({
      name: cartItem.name,
      size: selectedSize,
      quantity: quantity,
      price: unitPrice,
      image: cartItem.image,
    });
    setShowCartModal(true);
  };

  // Direct Buy Now
  const handleBuyNow = () => {
    const cartItem = buildCartItem();
    const user = JSON.parse(localStorage.getItem("customerUser") || "null");
    const token = localStorage.getItem("userToken");

    if (!user || !token || user?.email === "guest@hummingtone.com") {
      alert("Please sign in to proceed with checkout.");
      return;
    }

    navigate("/usertab/checkout", { state: { buyNowItem: cartItem } });
  };

  return (
    <div className="customize-studio-wrapper">
      {/* Studio Header Banner */}
      <div className="studio-topbar">
        <div className="studio-topbar-inner">
          <div>
            <span className="studio-badge">ATELIER STUDIO</span>
            <h1 className="studio-title">Custom Plain T-Shirt Lab</h1>
            <p className="studio-subtitle">
              Configure your bespoke 2D front and back t-shirt with real-time typography, colors, and graphics.
            </p>
          </div>
          <div className="studio-header-price">
            <span className="price-label">ESTIMATED PRICE</span>
            <span className="price-amount">₹{totalPrice.toLocaleString()}</span>
            <span className="price-sub">₹{unitPrice}/pc (incl. GST)</span>
          </div>
        </div>
      </div>

      {/* Studio Main Workspace */}
      <div className="studio-container">
        {/* Left Column: 2D Interactive Stage */}
        <div className="studio-stage-column">
          <div className="stage-card">
            {/* View Switcher Controls */}
            <div className="stage-controls-header">
              <div className="side-toggle-group">
                <button
                  type="button"
                  className={`side-toggle-pill ${activeSide === "front" ? "active" : ""}`}
                  onClick={() => setActiveSide("front")}
                >
                  <span className="pill-dot"></span>
                  Front View
                  {hasCustomFront && <span className="side-indicator-dot" title="Custom design present" />}
                </button>
                <button
                  type="button"
                  className={`side-toggle-pill ${activeSide === "back" ? "active" : ""}`}
                  onClick={() => setActiveSide("back")}
                >
                  <span className="pill-dot"></span>
                  Back View
                  {hasCustomBack && <span className="side-indicator-dot" title="Custom design present" />}
                  {activeSide === "back" && !hasCustomBack && <span className="side-blank-badge">Blank</span>}
                </button>
              </div>

              <div className="stage-aux-actions">
                <button
                  type="button"
                  className="stage-mini-btn"
                  title="Toggle printable boundary guide"
                  onClick={() => setShowPrintBorder(!showPrintBorder)}
                >
                  <TuneIcon fontSize="small" />
                  {showPrintBorder ? "Hide Frame" : "Show Frame"}
                </button>
                <button
                  type="button"
                  className="stage-mini-btn danger"
                  title={`Clear ${activeSide} customizations`}
                  onClick={resetActiveSide}
                >
                  <RestartAltIcon fontSize="small" />
                  Reset Side
                </button>
              </div>
            </div>

            {/* Print Area Placement Mode Selector (Front side only: Chest vs Full Body) */}
            {activeSide === "front" ? (
              <div className="placement-mode-bar">
                <span className="placement-mode-title">Placement Area:</span>
                <div className="placement-mode-toggle-group">
                  <button
                    type="button"
                    className={`placement-mode-btn ${currentDesign.placementMode === "chest" ? "active" : ""}`}
                    onClick={() => updateCurrentDesign({ placementMode: "chest" })}
                  >
                    <span className="placement-icon-chest"></span>
                    Left Chest (Pocket)
                  </button>
                  <button
                    type="button"
                    className={`placement-mode-btn ${currentDesign.placementMode === "full" ? "active" : ""}`}
                    onClick={() => updateCurrentDesign({ placementMode: "full" })}
                  >
                    <span className="placement-icon-full"></span>
                    Full Body
                  </button>
                </div>
              </div>
            ) : (
              <div className="placement-mode-bar">
                <span className="placement-mode-title">Placement Area:</span>
                <span className="placement-mode-fixed-badge">Full Back Print Zone</span>
              </div>
            )}

            {/* If Back View is active, show quick 1-click option to keep blank or add design */}
            {activeSide === "back" && (
              <div className="back-blank-banner">
                <div className="back-blank-info">
                  <span className="back-blank-title">
                    {hasCustomBack ? "Back side has custom artwork/text" : "Back side is currently Blank"}
                  </span>
                  <span className="back-blank-sub">
                    {hasCustomBack
                      ? "Standard +₹150 print fee applies for 2-sided custom print."
                      : "No extra fee for keeping the back side plain and blank."}
                  </span>
                </div>
                {hasCustomBack && (
                  <button
                    type="button"
                    className="btn-keep-blank"
                    onClick={() => {
                      resetActiveSide();
                      updateCurrentDesign({ isBackBlank: true });
                    }}
                  >
                    Keep Back Blank
                  </button>
                )}
              </div>
            )}

            {/* 2D T-Shirt Visualizer */}
            <div className="tshirt-visualizer-box">
              <PlainTShirt2D
                color={selectedColor.hex}
                side={activeSide}
                tshirtImage={activeSide === "front" ? selectedColor.front_image : selectedColor.back_image}
                design={currentDesign}
                printableAreaVisible={showPrintBorder}
              />
            </div>

            {/* Quick Position & Scale Controls */}
            <div className="stage-quick-modifiers">
              <div className="modifier-row">
                <span className="modifier-label">Scale: {Math.round(currentDesign.scale * 100)}%</span>
                <input
                  type="range"
                  min="0.5"
                  max="1.8"
                  step="0.05"
                  value={currentDesign.scale}
                  onChange={(e) => updateCurrentDesign({ scale: parseFloat(e.target.value) })}
                  className="studio-range-slider"
                />
              </div>
              <div className="modifier-row">
                <span className="modifier-label">Vertical Position</span>
                <input
                  type="range"
                  min="-80"
                  max="80"
                  step="2"
                  value={currentDesign.posY}
                  onChange={(e) => updateCurrentDesign({ posY: parseInt(e.target.value) })}
                  className="studio-range-slider"
                />
              </div>
              <div className="modifier-row">
                <span className="modifier-label">Horizontal Align</span>
                <input
                  type="range"
                  min="-60"
                  max="60"
                  step="2"
                  value={currentDesign.posX}
                  onChange={(e) => updateCurrentDesign({ posX: parseInt(e.target.value) })}
                  className="studio-range-slider"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customization Controls & Garment Specs */}
        <div className="studio-control-column">
          {/* Section 1: Plain T-Shirt Color Selection */}
          <div className="studio-panel-card">
            <div className="panel-card-header">
              <h3 className="panel-section-title">1. Plain T-Shirt Color</h3>
              <span className="selected-color-label">{selectedColor.name}</span>
            </div>
            <div className="plain-colors-grid">
              {availableColors.map((col) => (
                <button
                  type="button"
                  key={col.id}
                  className={`plain-color-swatch-btn ${selectedColor.id === col.id ? "active" : ""}`}
                  onClick={() => {
                    setSelectedColor(col);
                    const isColLight = col.hex ? (col.hex.toLowerCase() === '#ffffff' || col.hex.toLowerCase() === '#fff' || col.name?.toLowerCase().includes('white')) : true;
                    // Auto-adjust default text color if it matches standard black/white
                    if (!isColLight) {
                      setFrontDesign(prev => (prev.textColor === '#111827' ? { ...prev, textColor: '#FFFFFF' } : prev));
                      setBackDesign(prev => (prev.textColor === '#111827' ? { ...prev, textColor: '#FFFFFF' } : prev));
                    } else {
                      setFrontDesign(prev => (prev.textColor === '#FFFFFF' ? { ...prev, textColor: '#111827' } : prev));
                      setBackDesign(prev => (prev.textColor === '#FFFFFF' ? { ...prev, textColor: '#111827' } : prev));
                    }
                  }}
                  title={col.name}
                >
                  <span
                    className="swatch-circle"
                    style={{
                      backgroundColor: col.hex,
                      border: col.hex.toLowerCase() === "#ffffff" ? "1px solid #CBD5E1" : "none",
                    }}
                  >
                    {selectedColor.id === col.id && (
                      <CheckIcon
                        style={{
                          fontSize: 18,
                          color: col.hex.toLowerCase() === "#ffffff" ? "#0F172A" : "#FFFFFF",
                        }}
                      />
                    )}
                  </span>
                  {col.front_image && (
                    <img
                      src={col.front_image}
                      alt={col.name}
                      style={{
                        width: '28px',
                        height: '28px',
                        objectFit: 'contain',
                        borderRadius: '4px',
                        background: '#f8fafc'
                      }}
                    />
                  )}
                  <span className="swatch-name">{col.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Customization Studio (Front / Back Side Tools) */}
          <div className="studio-panel-card">
            <div className="panel-card-header">
              <h3 className="panel-section-title">
                2. Customize {activeSide.toUpperCase()} Side
              </h3>
              <div className="studio-tabs">
                <button
                  type="button"
                  className={`studio-tab-btn ${toolTab === "text" ? "active" : ""}`}
                  onClick={() => setToolTab("text")}
                >
                  Typography
                </button>
                <button
                  type="button"
                  className={`studio-tab-btn ${toolTab === "upload" ? "active" : ""}`}
                  onClick={() => setToolTab("upload")}
                >
                  Upload Artwork
                </button>
                <button
                  type="button"
                  className={`studio-tab-btn ${toolTab === "presets" ? "active" : ""}`}
                  onClick={() => setToolTab("presets")}
                >
                  Motifs
                </button>
              </div>
            </div>

            <div className="tool-body">
              {/* Tab: Text / Typography */}
              {toolTab === "text" && (
                <div className="typography-editor">
                  <div className="form-group">
                    <label htmlFor="custom-text-input">Custom Text Message</label>
                    <input
                      id="custom-text-input"
                      type="text"
                      className="studio-input"
                      placeholder="e.g. YOUR BRAND OR QUOTE"
                      value={currentDesign.text}
                      maxLength={32}
                      onChange={(e) => updateCurrentDesign({ text: e.target.value })}
                    />
                  </div>

                  {/* Placement Area Toggle inside Typography (Front side only) */}
                  {activeSide === "front" && (
                    <div className="form-group">
                      <label>Print Placement Mode</label>
                      <div className="tab-placement-toggle">
                        <button
                          type="button"
                          className={`tab-placement-chip ${currentDesign.placementMode === "chest" ? "active" : ""}`}
                          onClick={() => updateCurrentDesign({ placementMode: "chest" })}
                        >
                          Left Chest (Pocket)
                        </button>
                        <button
                          type="button"
                          className={`tab-placement-chip ${currentDesign.placementMode === "full" ? "active" : ""}`}
                          onClick={() => updateCurrentDesign({ placementMode: "full" })}
                        >
                          Full Body (Torso)
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="form-group-row">
                    <div className="form-group flex-1">
                      <label>Font Style</label>
                      <select
                        className="studio-select"
                        value={currentDesign.fontFamily}
                        onChange={(e) => updateCurrentDesign({ fontFamily: e.target.value })}
                      >
                        {FONTS.map((f) => (
                          <option key={f.value} value={f.value}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Base Size</label>
                      <select
                        className="studio-select"
                        value={currentDesign.fontSize || 18}
                        onChange={(e) => updateCurrentDesign({ fontSize: parseInt(e.target.value) })}
                        style={{ minWidth: "90px" }}
                      >
                        <option value={14}>Small (14px)</option>
                        <option value={18}>Medium (18px)</option>
                        <option value={22}>Large (22px)</option>
                        <option value={26}>Extra Large (26px)</option>
                      </select>
                    </div>

                    <div className="form-group font-decor-toggles">
                      <label>Format</label>
                      <div className="btn-group-toggle">
                        <button
                          type="button"
                          className={`icon-toggle-btn ${currentDesign.isBold ? "active" : ""}`}
                          onClick={() => updateCurrentDesign({ isBold: !currentDesign.isBold })}
                          title="Toggle Bold"
                        >
                          <FormatBoldIcon fontSize="small" />
                        </button>
                        <button
                          type="button"
                          className={`icon-toggle-btn ${currentDesign.isItalic ? "active" : ""}`}
                          onClick={() => updateCurrentDesign({ isItalic: !currentDesign.isItalic })}
                          title="Toggle Italic"
                        >
                          <FormatItalicIcon fontSize="small" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Text Color</label>
                    <div className="text-colors-row">
                      {TEXT_COLORS.map((tc) => (
                        <button
                          type="button"
                          key={tc.hex}
                          className={`text-color-swatch ${currentDesign.textColor === tc.hex ? "active" : ""}`}
                          style={{ backgroundColor: tc.hex }}
                          onClick={() => updateCurrentDesign({ textColor: tc.hex })}
                          title={tc.name}
                        />
                      ))}
                      <input
                        type="color"
                        className="color-custom-input"
                        title="Pick custom hex"
                        value={currentDesign.textColor}
                        onChange={(e) => updateCurrentDesign({ textColor: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Upload Artwork / Logo */}
              {toolTab === "upload" && (
                <div className="artwork-uploader">
                  {/* Placement Area Toggle inside Upload tab (Front side only) */}
                  {activeSide === "front" && (
                    <div className="form-group" style={{ marginBottom: "14px" }}>
                      <label>Artwork Placement Zone</label>
                      <div className="tab-placement-toggle">
                        <button
                          type="button"
                          className={`tab-placement-chip ${currentDesign.placementMode === "chest" ? "active" : ""}`}
                          onClick={() => updateCurrentDesign({ placementMode: "chest" })}
                        >
                          Left Chest (Pocket)
                        </button>
                        <button
                          type="button"
                          className={`tab-placement-chip ${currentDesign.placementMode === "full" ? "active" : ""}`}
                          onClick={() => updateCurrentDesign({ placementMode: "full" })}
                        >
                          Full Body (Torso)
                        </button>
                      </div>
                    </div>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png, image/jpeg, image/webp, image/svg+xml"
                    style={{ display: "none" }}
                    onChange={handleImageUpload}
                  />

                  {currentDesign.imageUrl ? (
                    <div className="active-artwork-display">
                      <div className="artwork-preview-thumb">
                        <img src={currentDesign.imageUrl} alt="Custom Artwork" />
                      </div>
                      <div className="artwork-meta">
                        <span className="artwork-title">Custom Graphic Attached</span>
                        <p className="artwork-desc">
                          Graphic is applied directly to the {activeSide} printable zone.
                        </p>
                        <div className="artwork-actions">
                          <button
                            type="button"
                            className="btn-outline-small"
                            onClick={() => fileInputRef.current.click()}
                          >
                            Replace
                          </button>
                          <button
                            type="button"
                            className="btn-danger-small"
                            onClick={removeCurrentImage}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="upload-dropzone"
                      onClick={() => fileInputRef.current.click()}
                    >
                      <CloudUploadIcon className="upload-icon" />
                      <p className="upload-title">Click to browse your design / logo</p>
                      <span className="upload-hint">Supports PNG, JPG, or SVG with transparent background</span>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Motifs & Gallery Presets */}
              {toolTab === "presets" && (
                <div className="presets-selector">
                  <div className="presets-grid">
                    {PRESET_GRAPHICS.map((preset, idx) => (
                      <div
                        key={idx}
                        className="preset-item-card"
                        onClick={() => updateCurrentDesign({ imageUrl: preset.url })}
                      >
                        <img src={preset.url} alt={preset.name} />
                        <span>{preset.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Sizing & Quantity */}
          <div className="studio-panel-card">
            <div className="panel-card-header">
              <h3 className="panel-section-title">3. Size & Fit</h3>
              <span className="fabric-spec">100% Ring-Spun Combed Cotton (220 GSM)</span>
            </div>

            <div className="sizes-selector-grid">
              {SIZES.map((sz) => (
                <button
                  type="button"
                  key={sz.label}
                  className={`size-btn ${selectedSize === sz.label ? "active" : ""}`}
                  onClick={() => setSelectedSize(sz.label)}
                >
                  <span className="size-label">{sz.label}</span>
                  <span className="size-chest">{sz.chest}</span>
                </button>
              ))}
            </div>

            <div className="quantity-and-summary-row">
              <div className="quantity-selector">
                <span className="qty-label">Quantity:</span>
                <div className="qty-stepper">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    -
                  </button>
                  <span>{quantity}</span>
                  <button type="button" onClick={() => setQuantity((q) => q + 1)}>
                    +
                  </button>
                </div>
              </div>

              <div className="pricing-breakdown-compact">
                <span>Base ₹{BASE_PRICE}</span>
                {customPrintsCount > 0 && (
                  <span>+ {customPrintsCount} Custom Side{customPrintsCount > 1 ? "s" : ""} (₹{customPrintsCount * PRINT_FEE})</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Checkout Actions */}
          <div className="studio-action-box">
            <button
              type="button"
              className="studio-btn-primary"
              onClick={handleAddToCart}
            >
              <ShoppingBagOutlinedIcon />
              Add To Bag • ₹{totalPrice.toLocaleString()}
            </button>
            <button
              type="button"
              className="studio-btn-secondary"
              onClick={handleBuyNow}
            >
              <FlashOnIcon />
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* Add To Cart Feedback Modal */}
      <AddToCartModal
        isOpen={showCartModal}
        onClose={() => setShowCartModal(false)}
        productData={cartModalData}
      />

      <UserFooter />
    </div>
  );
};

export default Customize;