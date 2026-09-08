import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import AddToCartModal from "../Prodect-Details/Product-Buying modal/AddToCartModal";
import AuthModal from "../../../components/AuthModal/AuthModal";
import { API_BASE_URL } from "../../../utils/apiConfig";
import { generateCompositeGarmentPreview } from "./garmentPreviewGenerator";
import UserFooter from "../../../components/User-Footer-Card/UserFooter";

// Lucide & MUI Icons
import {
  RotateCcw,
  Sparkles,
  Search,
  Maximize2,
  Minimize2,
  Ruler,
  Sliders,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Layers,
  ArrowRight,
  FlipHorizontal,
  Move,
  X,
  Check,
  Tag
} from "lucide-react";
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

// 2D Plain T-Shirt Canvas with Admin Uploaded Front & Back Static Image Background
const PlainTShirt2D = ({
  color = "#FFFFFF",
  side = "front",
  tshirtImage = null,
  design = null,
  printableAreaVisible = true,
  onUpdateDesign = null,
  isDraggable = true,
}) => {
  const idPrefix = `tshirt-2d-${side}`;
  const [imgError, setImgError] = useState(false);
  const svgRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef(null);

  // Reset imgError when tshirtImage or side changes
  useEffect(() => {
    setImgError(false);
  }, [tshirtImage, side]);

  const placementMode = side === "back"
    ? (design?.placementMode || "full")
    : (design?.placementMode || "chest");

  // Coordinate zones
  const printArea = useMemo(() => {
    if (side === "front") {
      if (placementMode === "chest") {
        return { x: 182, y: 224, width: 62, height: 68, rx: 6, centerX: 213, centerY: 258, label: "LEFT CHEST" };
      }
      if (placementMode === "center") {
        return { x: 210, y: 232, width: 80, height: 75, rx: 8, centerX: 250, centerY: 269, label: "CENTER CHEST" };
      }
      return { x: 176, y: 228, width: 136, height: 188, rx: 10, centerX: 244, centerY: 322, label: "FULL BODY ZONE" };
    } else {
      if (placementMode === "upper") {
        return { x: 210, y: 194, width: 80, height: 62, rx: 6, centerX: 250, centerY: 225, label: "UPPER BACK" };
      }
      if (placementMode === "center") {
        return { x: 190, y: 235, width: 120, height: 130, rx: 8, centerX: 250, centerY: 300, label: "CENTER BACK" };
      }
      return { x: 180, y: 218, width: 136, height: 188, rx: 10, centerX: 250, centerY: 312, label: "FULL BACK ZONE" };
    }
  }, [side, placementMode]);

  const isWhiteOrLight = (hex) => {
    if (!hex || hex === "#FFFFFF" || hex.toLowerCase() === "#fff") return true;
    const c = hex.replace("#", "");
    if (c.length !== 6) return false;
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 200;
  };

  const isLight = isWhiteOrLight(color);

  // Compute text fill color with auto-contrast for dark garments
  const resolvedTextColor = (() => {
    if (!design?.textColor) return isLight ? "#111827" : "#FFFFFF";
    if (!isLight && (design.textColor === "#111827" || design.textColor === "#000000")) {
      return "#FFFFFF";
    }
    return design.textColor;
  })();

  const textLength = design?.text ? design.text.trim().length : 0;
  let dynamicFontSize = design?.fontSize || (placementMode === "chest" ? 13 : 16);
  const maxAllowedWidth = printArea.width - (placementMode === "chest" ? 12 : 20);
  if (textLength > (placementMode === "chest" ? 7 : 10)) {
    const maxChars = placementMode === "chest" ? 7 : 10;
    dynamicFontSize = Math.max(9, Math.floor(dynamicFontSize * (maxChars / textLength)));
  }

  const effectiveImage = !imgError && tshirtImage ? tshirtImage : null;

  // Drag & drop handlers for the custom text element
  const handleTextPointerDown = (e) => {
    if (!onUpdateDesign || !isDraggable || !design?.text) return;
    e.preventDefault();
    e.stopPropagation();

    const svg = svgRef.current;
    if (!svg) return;

    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

    dragStartRef.current = {
      startMouseX: svgP.x,
      startMouseY: svgP.y,
      initialTextX: design.textPosX || 0,
      initialTextY: design.textPosY || 0,
      scale: design.scale || 1,
      rotation: design.rotation || 0,
      flipH: design.flipH || false,
      pointerId: e.pointerId,
    };

    setIsDragging(true);

    if (e.target && e.target.setPointerCapture) {
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handleTextPointerMove = (e) => {
    if (!dragStartRef.current || !onUpdateDesign) return;
    e.preventDefault();

    const svg = svgRef.current;
    if (!svg) return;

    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

    const { startMouseX, startMouseY, initialTextX, initialTextY, scale, rotation, flipH } = dragStartRef.current;

    const deltaX = svgP.x - startMouseX;
    const deltaY = svgP.y - startMouseY;

    // Apply inverse rotation
    const rad = ((rotation || 0) * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const rotDeltaX = deltaX * cos + deltaY * sin;
    const rotDeltaY = -deltaX * sin + deltaY * cos;

    // Apply inverse scale & flip
    const scaleX = (scale || 1) * (flipH ? -1 : 1);
    const scaleY = scale || 1;

    const localDeltaX = rotDeltaX / (scaleX || 1);
    const localDeltaY = rotDeltaY / (scaleY || 1);

    const newTextX = Math.round(initialTextX + localDeltaX);
    const newTextY = Math.round(initialTextY + localDeltaY);

    onUpdateDesign({
      textPosX: newTextX,
      textPosY: newTextY,
    });
  };

  const handleTextPointerUp = (e) => {
    if (dragStartRef.current) {
      if (e.target && e.target.releasePointerCapture) {
        try {
          e.target.releasePointerCapture(dragStartRef.current.pointerId);
        } catch {}
      }
      dragStartRef.current = null;
      setIsDragging(false);
    }
  };

  useEffect(() => {
    const onWindowMove = (e) => {
      if (dragStartRef.current) {
        handleTextPointerMove(e);
      }
    };
    const onWindowUp = (e) => {
      if (dragStartRef.current) {
        handleTextPointerUp(e);
      }
    };

    window.addEventListener("pointermove", onWindowMove);
    window.addEventListener("pointerup", onWindowUp);
    window.addEventListener("pointercancel", onWindowUp);

    return () => {
      window.removeEventListener("pointermove", onWindowMove);
      window.removeEventListener("pointerup", onWindowUp);
      window.removeEventListener("pointercancel", onWindowUp);
    };
  }, [design]);

  return (
    <div
      className="plain-tshirt-svg-container"
      style={{
        position: "relative",
        width: "auto",
        height: "100%",
        maxHeight: "100%",
        maxWidth: "100%",
        margin: "0 auto",
        aspectRatio: "500 / 580",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        borderRadius: "8px",
      }}
    >
      {/* Real static garment image background if supplied by admin */}
      {effectiveImage && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
            pointerEvents: "none",
            overflow: "hidden",
            borderRadius: "8px",
          }}
        >
          <img
            src={effectiveImage}
            alt="Plain T-Shirt Garment"
            onError={() => setImgError(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.08))",
              borderRadius: "8px",
            }}
          />
        </div>
      )}

      <svg
        ref={svgRef}
        viewBox="0 0 500 580"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          height: "100%",
          display: "block",
          filter: effectiveImage ? "none" : "drop-shadow(0 15px 30px rgba(0,0,0,0.12))",
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

        {/* Render high precision vector silhouette when no static photo is loaded */}
        {!effectiveImage && (
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
            {/* Neckline & Collar */}
            <path
              d={
                side === "front"
                  ? "M 188 78 C 210 118, 290 118, 312 78"
                  : "M 188 78 C 220 92, 280 92, 312 78"
              }
              stroke="#0F172A"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Sleeve stitching */}
            <line x1="124" y1="200" x2="68" y2="274" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" />
            <line x1="376" y1="200" x2="432" y2="274" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" />
            {/* Subtle Lighting overlay */}
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

        {/* Printable boundary frame */}
        {printableAreaVisible && (
          <g>
            <rect
              x={printArea.x}
              y={printArea.y}
              width={printArea.width}
              height={printArea.height}
              rx={printArea.rx}
              fill="rgba(79, 70, 229, 0.04)"
              stroke="#4F46E5"
              strokeWidth="1.5"
              strokeDasharray="5 4"
              opacity="0.85"
              style={{ pointerEvents: "none" }}
            />
            <g transform={`translate(${printArea.x + 6}, ${printArea.y + 6})`}>
              <rect
                x="0"
                y="0"
                width={printArea.label.length * 6 + 10}
                height="14"
                rx="3"
                fill="#4F46E5"
                opacity="0.9"
              />
              <text
                x={(printArea.label.length * 6 + 10) / 2}
                y="10"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="7.5"
                fontWeight="700"
                letterSpacing="0.8"
                style={{ textTransform: "uppercase", pointerEvents: "none" }}
              >
                {printArea.label}
              </text>
            </g>
          </g>
        )}

        {/* User customized design layer */}
        <g id="custom-design-layer" clipPath={`url(#${idPrefix}-print-clip)`}>
          {design && (
            <g
              transform={`translate(${printArea.centerX + (design.posX || 0)}, ${printArea.centerY + (design.posY || 0)
                }) scale(${design.scale || 1}) rotate(${design.rotation || 0}) ${design.flipH ? "scale(-1, 1)" : ""
                }`}
            >
              {design.imageUrl && (
                <g
                  transform={
                    placementMode === "chest"
                      ? (design.text ? "translate(-28, -34)" : "translate(-32, -32)")
                      : (design.text ? "translate(-50, -65)" : "translate(-55, -55)")
                  }
                >
                  <image
                    href={design.imageUrl}
                    x="0"
                    y="0"
                    width={
                      placementMode === "chest"
                        ? (design.text ? "56" : "64")
                        : (design.text ? "100" : "110")
                    }
                    height={
                      placementMode === "chest"
                        ? (design.text ? "56" : "64")
                        : (design.text ? "100" : "110")
                    }
                    preserveAspectRatio="xMidYMid meet"
                    style={{ pointerEvents: "none" }}
                  />
                </g>
              )}

              {design.text && (
                <g
                  className="interactive-text-drag-group"
                  transform={`translate(${design.textPosX || 0}, ${design.textPosY || 0})`}
                  onPointerDown={handleTextPointerDown}
                  style={{
                    cursor: isDraggable ? (isDragging ? "grabbing" : "grab") : "default",
                    touchAction: "none",
                  }}
                >
                  {/* Invisible padding hitbox for easy grabbing even with thin fonts */}
                  <rect
                    x={-(maxAllowedWidth / 2) - 10}
                    y={
                      (design.imageUrl ? (placementMode === "chest" ? 28 : 55) : 0) - (dynamicFontSize || 16) - 6
                    }
                    width={maxAllowedWidth + 20}
                    height={(dynamicFontSize || 16) * 2 + 12}
                    fill="transparent"
                    style={{ cursor: isDraggable ? (isDragging ? "grabbing" : "grab") : "default" }}
                  />

                  {/* Subtle drag outline indicator on hover/drag */}
                  {isDraggable && (
                    <rect
                      x={-(maxAllowedWidth / 2) - 6}
                      y={
                        (design.imageUrl ? (placementMode === "chest" ? 28 : 55) : 0) - (dynamicFontSize || 16) - 3
                      }
                      width={maxAllowedWidth + 12}
                      height={(dynamicFontSize || 16) * 2 + 6}
                      rx="6"
                      fill="none"
                      stroke="#4F46E5"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                      className={`text-drag-outline ${isDragging ? "is-dragging" : ""}`}
                      style={{ pointerEvents: "none" }}
                    />
                  )}

                  <text
                    x="0"
                    y={
                      design.imageUrl
                        ? (placementMode === "chest" ? "28" : "55")
                        : "0"
                    }
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={resolvedTextColor}
                    fontSize={placementMode === "chest" ? Math.min(dynamicFontSize, 15) : dynamicFontSize}
                    fontFamily={design.fontFamily || "Inter, sans-serif"}
                    fontWeight={design.isBold ? "700" : "500"}
                    fontStyle={design.isItalic ? "italic" : "normal"}
                    letterSpacing={(design.letterSpacing || 1) + "px"}
                    lengthAdjust={textLength > 10 ? "spacingAndGlyphs" : undefined}
                    textLength={textLength > 10 ? maxAllowedWidth : undefined}
                    style={{
                      userSelect: "none",
                      filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.25))",
                      pointerEvents: "none",
                    }}
                  >
                    {design.text}
                  </text>
                </g>
              )}
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};

// Size Specifications fallback
const FALLBACK_SIZES = [
  { id: 1, name: "XS", label: "XS", chest: '34-36"', length: '26.5"', shoulder: '16.5"', price_adjustment: 0 },
  { id: 2, name: "S", label: "S", chest: '36-38"', length: '27.5"', shoulder: '17.5"', price_adjustment: 0 },
  { id: 3, name: "M", label: "M", chest: '38-40"', length: '28.5"', shoulder: '18.5"', price_adjustment: 0 },
  { id: 4, name: "L", label: "L", chest: '40-42"', length: '29.5"', shoulder: '19.5"', price_adjustment: 0 },
  { id: 5, name: "XL", label: "XL", chest: '42-44"', length: '30.5"', shoulder: '20.5"', price_adjustment: 0 },
  { id: 6, name: "XXL", label: "XXL", chest: '44-46"', length: '31.5"', shoulder: '21.5"', price_adjustment: 0 },
  { id: 7, name: "3XL", label: "3XL", chest: '46-48"', length: '32.5"', shoulder: '22.5"', price_adjustment: 50 },
];

// Fabric Materials fallback
const FALLBACK_MATERIALS = [
  {
    id: 1,
    name: "100% Bio-Washed Combed Cotton",
    fabric_weight: "180 GSM",
    description: "Ultra-soft ring-spun combed cotton. Breathable, pre-shrunk, ideal for everyday luxury comfort.",
    price_adjustment: 0,
  },
  {
    id: 2,
    name: "Premium Supima Cotton",
    fabric_weight: "220 GSM",
    description: "Finest long-staple luxury cotton with silky hand feel and vibrant dye retention.",
    price_adjustment: 150,
  },
  {
    id: 3,
    name: "Heavyweight French Terry",
    fabric_weight: "260 GSM",
    description: "Substantial 260 GSM streetwear drape with structured silhouette and rich texture.",
    price_adjustment: 250,
  },
  {
    id: 4,
    name: "Poly-Cotton Performance Blend",
    fabric_weight: "170 GSM",
    description: "Moisture-wicking active stretch fabric, wrinkle-resistant and shape-retaining.",
    price_adjustment: 50,
  },
];

const FONTS = [
  { label: "Inter (Modern)", value: "Inter, sans-serif" },
  { label: "Playfair (Luxury Serif)", value: "'Playfair Display', serif" },
  { label: "Montserrat (Clean)", value: "Montserrat, sans-serif" },
  { label: "Poppins (Rounded)", value: "Poppins, sans-serif" },
  { label: "Courier (Monospace)", value: "'Courier New', monospace" },
  { label: "Georgia (Editorial)", value: "Georgia, serif" },
  { label: "Oswald (Condensed)", value: "'Oswald', sans-serif" },
  { label: "Bebas Neue (Bold Display)", value: "'Bebas Neue', sans-serif" },
];

const TEXT_COLORS = [
  { name: "Pure White", hex: "#FFFFFF" },
  { name: "Jet Black", hex: "#111827" },
  { name: "Golden Ochre", hex: "#F59E0B" },
  { name: "Crimson Red", hex: "#EF4444" },
  { name: "Royal Navy", hex: "#1D4ED8" },
  { name: "Emerald Green", hex: "#10B981" },
  { name: "Electric Purple", hex: "#8B5CF6" },
  { name: "Silver Slate", hex: "#94A3B8" },
];

// Clean fallback garments without static photos of humans
const FALLBACK_GARMENTS = [
  { id: "white", name: "Pure White", hex: "#FFFFFF", base_price: 699, front_image: null, back_image: null },
  { id: "black", name: "Jet Black", hex: "#18181B", base_price: 699, front_image: null, back_image: null },
  { id: "navy", name: "Navy Blue", hex: "#1E293B", base_price: 749, front_image: null, back_image: null },
  { id: "gray", name: "Heather Gray", hex: "#94A3B8", base_price: 699, front_image: null, back_image: null },
];

const PRINT_FEE = 150; // Custom design print fee per side

const Customize = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Initial loading state - prevents static image flicker
  const [isLoading, setIsLoading] = useState(true);

  // Available plain t-shirt garments
  const [availableColors, setAvailableColors] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);

  // Preset Artwork / Designs from backend
  const [presetDesigns, setPresetDesigns] = useState([]);
  const [isLoadingDesigns, setIsLoadingDesigns] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [motifSearch, setMotifSearch] = useState("");

  // Fabric Materials from backend
  const [availableMaterials, setAvailableMaterials] = useState(FALLBACK_MATERIALS);
  const [selectedMaterial, setSelectedMaterial] = useState(FALLBACK_MATERIALS[0]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);

  // Apparel Sizes from backend
  const [availableSizes, setAvailableSizes] = useState(FALLBACK_SIZES);

  // Active side: 'front' or 'back'
  const [activeSide, setActiveSide] = useState("front");

  // Product size & quantity
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);

  // Tool tabs: 'text', 'presets', 'upload'
  const [toolTab, setToolTab] = useState("text");

  // Front & Back design state
  const [frontDesign, setFrontDesign] = useState({
    placementMode: "chest", // 'chest', 'center', 'full'
    text: "",
    textColor: "#111827",
    fontFamily: "Inter, sans-serif",
    fontSize: 18,
    isBold: false,
    isItalic: false,
    letterSpacing: 1,
    imageUrl: null,
    designName: null,
    designPrice: 0,
    scale: 1,
    posX: 0,
    posY: 0,
    textPosX: 0,
    textPosY: 0,
    rotation: 0,
    flipH: false,
  });

  const [backDesign, setBackDesign] = useState({
    placementMode: "full", // 'upper', 'center', 'full'
    isBackBlank: true,
    text: "",
    textColor: "#111827",
    fontFamily: "Inter, sans-serif",
    fontSize: 18,
    isBold: false,
    isItalic: false,
    letterSpacing: 1,
    imageUrl: null,
    designName: null,
    designPrice: 0,
    scale: 1,
    posX: 0,
    posY: 0,
    textPosX: 0,
    textPosY: 0,
    rotation: 0,
    flipH: false,
  });

  const [showPrintBorder, setShowPrintBorder] = useState(true);

  // Modals
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartModalData, setCartModalData] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // 1. Fetch Plain T-Shirts from Admin API
  useEffect(() => {
    let isMounted = true;

    const loadGarments = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/site-content/customize/plain-tshirts`);
        const data = await res.json();

        if (isMounted) {
          if (data && data.success && Array.isArray(data.tshirts) && data.tshirts.length > 0) {
            const garments = data.tshirts.map((t) => ({
              id: t.id,
              name: t.color_name,
              hex: t.color_hex || "#FFFFFF",
              front_image: t.front_image,
              back_image: t.back_image,
              base_price: Number(t.base_price || 699),
            }));
            setAvailableColors(garments);
            setSelectedColor(garments[0]);
          } else {
            // Fallback to pure vector mockups if no garments added by admin
            setAvailableColors(FALLBACK_GARMENTS);
            setSelectedColor(FALLBACK_GARMENTS[0]);
          }
        }
      } catch (err) {
        console.warn("Could not load plain t-shirts from API, using clean vector garments:", err);
        if (isMounted) {
          setAvailableColors(FALLBACK_GARMENTS);
          setSelectedColor(FALLBACK_GARMENTS[0]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadGarments();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch Preset Artwork / Designs from Admin API
  useEffect(() => {
    let isMounted = true;

    const loadDesigns = async () => {
      try {
        setIsLoadingDesigns(true);
        const res = await fetch(`${API_BASE_URL}/api/site-content/customize/designs`);
        const data = await res.json();
        if (isMounted && data && data.success && Array.isArray(data.designs)) {
          setPresetDesigns(data.designs);
        }
      } catch (err) {
        console.warn("Could not load preset designs:", err);
      } finally {
        if (isMounted) {
          setIsLoadingDesigns(false);
        }
      }
    };

    loadDesigns();
    return () => {
      isMounted = false;
    };
  }, []);

  // 3. Fetch Fabric Materials from Admin API
  useEffect(() => {
    let isMounted = true;
    const loadMaterials = async () => {
      try {
        setIsLoadingMaterials(true);
        const res = await fetch(`${API_BASE_URL}/api/site-content/customize/materials`);
        const data = await res.json();
        if (isMounted && data && data.success && Array.isArray(data.materials) && data.materials.length > 0) {
          const activeMaterials = data.materials.map((m) => ({
            id: m.id,
            name: m.name,
            fabric_weight: m.fabric_weight,
            description: m.description,
            price_adjustment: Number(m.price_adjustment || 0),
          }));
          setAvailableMaterials(activeMaterials);
          setSelectedMaterial(activeMaterials[0]);
        }
      } catch (err) {
        console.warn("Could not load materials from API, using fallback:", err);
      } finally {
        if (isMounted) setIsLoadingMaterials(false);
      }
    };
    loadMaterials();
    return () => {
      isMounted = false;
    };
  }, []);

  // 4. Fetch Sizes from Admin API
  useEffect(() => {
    let isMounted = true;
    const loadSizes = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/site-content/customize/sizes`);
        const data = await res.json();
        if (isMounted && data && data.success && Array.isArray(data.sizes) && data.sizes.length > 0) {
          const activeSizes = data.sizes.map((s) => ({
            id: s.id,
            name: s.name,
            label: s.name,
            chest: s.chest,
            length: s.length,
            shoulder: s.shoulder,
            price_adjustment: Number(s.price_adjustment || 0),
          }));
          setAvailableSizes(activeSizes);
          if (!activeSizes.some((s) => (s.label || s.name) === selectedSize)) {
            setSelectedSize(activeSizes[0].label || activeSizes[0].name);
          }
        }
      } catch (err) {
        console.warn("Could not load sizes from API, using fallback:", err);
      }
    };
    loadSizes();
    return () => {
      isMounted = false;
    };
  }, []);

  // Current active side design accessor & updater
  const currentDesign = activeSide === "front" ? frontDesign : backDesign;
  const updateCurrentDesign = (updates) => {
    if (activeSide === "front") {
      setFrontDesign((prev) => ({ ...prev, ...updates }));
    } else {
      setBackDesign((prev) => ({ ...prev, ...updates, isBackBlank: false }));
    }
  };

  // Pricing calculation
  const hasCustomFront = Boolean(frontDesign.text?.trim() || frontDesign.imageUrl);
  const hasCustomBack = Boolean(backDesign.text?.trim() || backDesign.imageUrl);
  const customSidesCount = (hasCustomFront ? 1 : 0) + (hasCustomBack ? 1 : 0);

  const baseGarmentPrice = selectedColor?.base_price || 699;
  const materialSurcharge = Number(selectedMaterial?.price_adjustment || 0);
  const selectedSizeObj = availableSizes.find(
    (s) => (s.label || s.name) === selectedSize
  );
  const sizeSurcharge = Number(selectedSizeObj?.price_adjustment || 0);

  const frontFee = hasCustomFront ? PRINT_FEE : 0;
  const backFee = hasCustomBack ? PRINT_FEE : 0;
  const frontDesignSurcharge = frontDesign.imageUrl ? Number(frontDesign.designPrice || 0) : 0;
  const backDesignSurcharge = backDesign.imageUrl ? Number(backDesign.designPrice || 0) : 0;

  const frontTotal = frontFee + frontDesignSurcharge;
  const backTotal = backFee + backDesignSurcharge;
  const totalPrintFees = frontFee + backFee;
  const totalArtworkSurcharges = frontDesignSurcharge + backDesignSurcharge;
  const totalCustomizationPrice = frontTotal + backTotal;

  const unitPrice =
    baseGarmentPrice +
    materialSurcharge +
    sizeSurcharge +
    totalCustomizationPrice;
  const totalPrice = unitPrice * quantity;

  // Handle Customer Artwork / Logo Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPG, SVG, WebP)");
      return;
    }

    const localUrl = URL.createObjectURL(file);
    updateCurrentDesign({
      imageUrl: localUrl,
      designName: file.name.replace(/\.[^/.]+$/, ""),
      designPrice: 0,
      motifId: null,
      isUserUpload: true,
      userUploadUrl: null,
    });

    const formData = new FormData();
    formData.append("image", file);

    try {
      const token = localStorage.getItem("userToken");
      const res = await fetch(`${API_BASE_URL}/customize/upload-user-design`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.imageUrl) {
          updateCurrentDesign({
            imageUrl: data.imageUrl,
            userUploadUrl: data.imageUrl,
            isUserUpload: true,
          });
        }
      }
    } catch (err) {
      console.warn("Cloudinary upload fallback:", err);
    }

    e.target.value = "";
  };

  const removeCurrentImage = () => {
    updateCurrentDesign({
      imageUrl: null,
      designName: null,
      designPrice: 0,
      motifId: null,
      userUploadUrl: null,
      isUserUpload: false,
    });
  };

  const resetActiveSide = () => {
    updateCurrentDesign({
      text: "",
      imageUrl: null,
      designName: null,
      designPrice: 0,
      scale: 1,
      posX: 0,
      posY: 0,
      textPosX: 0,
      textPosY: 0,
      rotation: 0,
      flipH: false,
      motifId: null,
      userUploadUrl: null,
      isUserUpload: false,
    });
  };

  // Alignment Helper actions
  const handleCenterHorizontal = () => updateCurrentDesign({ posX: 0, textPosX: 0 });
  const handleCenterVertical = () => updateCurrentDesign({ posY: 0, textPosY: 0 });
  const handleToggleFlipH = () => updateCurrentDesign({ flipH: !currentDesign.flipH });
  const handleNudge = (dx, dy) => {
    updateCurrentDesign({
      posX: Math.max(-80, Math.min(80, (currentDesign.posX || 0) + dx)),
      posY: Math.max(-90, Math.min(90, (currentDesign.posY || 0) + dy)),
      textPosX: (currentDesign.textPosX || 0) + dx,
      textPosY: (currentDesign.textPosY || 0) + dy,
    });
  };

  // Build Cart Item representation with composite preview data
  const buildCartItem = (frontPreview = null, backPreview = null) => {
    const previewImg =
      frontPreview ||
      selectedColor?.front_image ||
      frontDesign.imageUrl ||
      "https://res.cloudinary.com/agoiw3rz/image/upload/v1788676780/hummingtone/plain-tshirts/odzdmoueowkbb99phqmj.jpg";

    return {
      cartItemId: `custom-tshirt-${Date.now()}`,
      id: "plain-custom-tshirt",
      product_id: "custom-tshirt",
      is_custom: true,
      name: `Custom Plain T-Shirt (${selectedColor?.name || "Bespoke"} • ${selectedMaterial?.name || "Pure Cotton"})`,
      brand: "HUMMING TONE ATELIER",
      price: unitPrice,
      quantity,
      size: selectedSize,
      color: selectedColor?.name || "Custom",
      colorHex: selectedColor?.hex || "#FFFFFF",
      material: selectedMaterial?.name || "100% Bio-Washed Combed Cotton",
      fabricWeight: selectedMaterial?.fabric_weight || "180 GSM",
      stock: 50,
      image: previewImg,
      custom_preview_image: previewImg,
      customDetails: {
        garmentType: "tshirt",
        color: selectedColor,
        material: selectedMaterial,
        size: selectedSize,
        frontPreviewUrl: frontPreview || previewImg,
        backPreviewUrl: backPreview || null,
        baseGarmentPrice,
        materialSurcharge,
        sizeSurcharge,
        front: frontDesign,
        frontDesign: {
          motifId: frontDesign.motifId || null,
          motifUrl: frontDesign.imageUrl || null,
          userUploadUrl: frontDesign.userUploadUrl || (frontDesign.isUserUpload ? frontDesign.imageUrl : null),
          text: frontDesign.text || null,
          font: frontDesign.font || null,
          textColor: frontDesign.textColor || null,
          placement: frontDesign.placementMode || "chest",
          transforms: {
            scale: frontDesign.scale || 1,
            rotation: frontDesign.rotation || 0,
            flipH: frontDesign.flipH || false,
            posX: frontDesign.posX || 0,
            posY: frontDesign.posY || 0,
            textPosX: frontDesign.textPosX || 0,
            textPosY: frontDesign.textPosY || 0,
          },
        },
        frontFee,
        frontDesignSurcharge,
        frontTotal,
        hasCustomFront,
        back: backDesign,
        backDesign: {
          motifId: backDesign.motifId || null,
          motifUrl: backDesign.imageUrl || null,
          userUploadUrl: backDesign.userUploadUrl || (backDesign.isUserUpload ? backDesign.imageUrl : null),
          text: backDesign.text || null,
          font: backDesign.font || null,
          textColor: backDesign.textColor || null,
          placement: backDesign.placementMode || "full",
          transforms: {
            scale: backDesign.scale || 1,
            rotation: backDesign.rotation || 0,
            flipH: backDesign.flipH || false,
            posX: backDesign.posX || 0,
            posY: backDesign.posY || 0,
            textPosX: backDesign.textPosX || 0,
            textPosY: backDesign.textPosY || 0,
          },
        },
        backFee,
        backDesignSurcharge,
        backTotal,
        hasCustomBack,
        totalCustomSides: customSidesCount,
        unitPrice,
        totalPrice,
      },
    };
  };

  // Add to Cart
  const handleAddToCart = async () => {
    let frontPreview = null;
    let backPreview = null;

    try {
      frontPreview = await generateCompositeGarmentPreview({
        color: selectedColor?.hex || "#FFFFFF",
        side: "front",
        garmentImageUrl: selectedColor?.front_image,
        design: frontDesign,
      });

      if (hasCustomBack) {
        backPreview = await generateCompositeGarmentPreview({
          color: selectedColor?.hex || "#FFFFFF",
          side: "back",
          garmentImageUrl: selectedColor?.back_image,
          design: backDesign,
        });
      }
    } catch (err) {
      console.warn("Composite preview generation warning:", err);
    }

    const cartItem = buildCartItem(frontPreview, backPreview);
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
      material: selectedMaterial?.name,
      quantity: quantity,
      price: unitPrice,
      image: cartItem.image,
      customDetails: cartItem.customDetails,
      is_custom: true,
    });
    setShowCartModal(true);
  };

  // Buy Now clicked on main panel: opens preview visualizer modal first per design requirements
  const handleBuyNow = () => {
    setShowPreviewModal(true);
  };

  // Confirm and proceed with direct checkout from Preview modal (with Auth gate)
  const handleConfirmCheckout = async () => {
    let frontPreview = null;
    let backPreview = null;

    try {
      frontPreview = await generateCompositeGarmentPreview({
        color: selectedColor?.hex || "#FFFFFF",
        side: "front",
        garmentImageUrl: selectedColor?.front_image,
        design: frontDesign,
      });

      if (hasCustomBack) {
        backPreview = await generateCompositeGarmentPreview({
          color: selectedColor?.hex || "#FFFFFF",
          side: "back",
          garmentImageUrl: selectedColor?.back_image,
          design: backDesign,
        });
      }
    } catch (err) {
      console.warn("Preview error:", err);
    }

    const cartItem = buildCartItem(frontPreview, backPreview);
    const user = JSON.parse(localStorage.getItem("customerUser") || "null");
    const token = localStorage.getItem("userToken");

    if (!user || !token || user?.email === "guest@hummingtone.com") {
      setAuthModalOpen(true);
      return;
    }

    setShowPreviewModal(false);
    navigate("/usertab/checkout", { state: { buyNowItem: cartItem } });
  };

  // Filtered preset motifs
  const designCategories = useMemo(() => {
    const set = new Set(["ALL"]);
    presetDesigns.forEach((d) => {
      if (d.category) set.add(d.category);
    });
    return Array.from(set);
  }, [presetDesigns]);

  const filteredPresetDesigns = useMemo(() => {
    return presetDesigns.filter((d) => {
      const matchSearch =
        !motifSearch.trim() ||
        d.name?.toLowerCase().includes(motifSearch.toLowerCase()) ||
        d.category?.toLowerCase().includes(motifSearch.toLowerCase());
      const matchCat = selectedCategory === "ALL" || d.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [presetDesigns, motifSearch, selectedCategory]);

  return (
    <div className="customize-studio-wrapper">
      {/* Studio Header Banner */}
      <div className="studio-topbar">
        <div className="studio-topbar-inner">
          <div className="studio-header-left">
            <h1 className="studio-title">Custom Plain T-Shirt Studio</h1>
          </div>
          <div className="studio-header-price">
            <span className="price-label">ESTIMATED PRICE</span>
            <div className="price-main-row">
              <span className="price-amount">₹{totalPrice.toLocaleString()}</span>
              <span className="price-sub">₹{unitPrice}/pc (incl. GST)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="studio-container">
        {/* Left Column: 2D Interactive Visualizer Stage */}
        <div className="studio-stage-column">
          <div className="stage-card">
            {/* View Switcher Controls with Dual Mini Thumbnails */}
            <div className="stage-controls-header">
              <div className="side-toggle-group">
                <button
                  type="button"
                  className={`side-toggle-pill ${activeSide === "front" ? "active" : ""}`}
                  onClick={() => setActiveSide("front")}
                >
                  <span className="pill-dot"></span>
                  <span className="pill-name">Front View</span>
                  {hasCustomFront && <span className="side-indicator-dot" title="Custom front design present" />}
                </button>
                <button
                  type="button"
                  className={`side-toggle-pill ${activeSide === "back" ? "active" : ""}`}
                  onClick={() => setActiveSide("back")}
                >
                  <span className="pill-dot"></span>
                  <span className="pill-name">Back View</span>
                  {hasCustomBack && <span className="side-indicator-dot" title="Custom back design present" />}
                </button>
              </div>

              <div className="stage-aux-actions">
                <button
                  type="button"
                  className="stage-mini-btn"
                  title="Preview in high resolution"
                  onClick={() => setShowPreviewModal(true)}
                >
                  <Maximize2 size={14} />
                  Preview
                </button>
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
                  Reset
                </button>
              </div>
            </div>

            {/* Print Placement Zone Selector */}
            <div className="placement-mode-bar">
              <span className="placement-mode-title">Placement Zone:</span>
              {activeSide === "front" ? (
                <div className="placement-mode-toggle-group">
                  <button
                    type="button"
                    className={`placement-mode-btn ${currentDesign.placementMode === "chest" ? "active" : ""}`}
                    onClick={() => updateCurrentDesign({ placementMode: "chest" })}
                  >
                    Left Chest (Pocket)
                  </button>
                  <button
                    type="button"
                    className={`placement-mode-btn ${currentDesign.placementMode === "center" ? "active" : ""}`}
                    onClick={() => updateCurrentDesign({ placementMode: "center" })}
                  >
                    Center Chest
                  </button>
                  <button
                    type="button"
                    className={`placement-mode-btn ${currentDesign.placementMode === "full" ? "active" : ""}`}
                    onClick={() => updateCurrentDesign({ placementMode: "full" })}
                  >
                    Full Torso
                  </button>
                </div>
              ) : (
                <div className="placement-mode-toggle-group">
                  <button
                    type="button"
                    className={`placement-mode-btn ${currentDesign.placementMode === "upper" ? "active" : ""}`}
                    onClick={() => updateCurrentDesign({ placementMode: "upper" })}
                  >
                    Upper Back / Collar
                  </button>
                  <button
                    type="button"
                    className={`placement-mode-btn ${currentDesign.placementMode === "center" ? "active" : ""}`}
                    onClick={() => updateCurrentDesign({ placementMode: "center" })}
                  >
                    Center Back
                  </button>
                  <button
                    type="button"
                    className={`placement-mode-btn ${currentDesign.placementMode === "full" ? "active" : ""}`}
                    onClick={() => updateCurrentDesign({ placementMode: "full" })}
                  >
                    Full Back Body
                  </button>
                </div>
              )}
            </div>


            {/* Main Stage Canvas Row: Image on Left + Control Dock on Right */}
            <div className="stage-canvas-workspace-row">
              {/* Left: 2D T-Shirt Visualizer */}
              <div className="tshirt-visualizer-box">
                {isLoading ? (
                  <div className="tshirt-skeleton-box">
                    <div className="skeleton-shimmer"></div>
                    <div className="skeleton-loader-circle"></div>
                    <p className="skeleton-text">Loading garment studio...</p>
                  </div>
                ) : (
                  <PlainTShirt2D
                    color={selectedColor?.hex || "#FFFFFF"}
                    side={activeSide}
                    tshirtImage={
                      activeSide === "front"
                        ? selectedColor?.front_image
                        : selectedColor?.back_image
                    }
                    design={currentDesign}
                    printableAreaVisible={showPrintBorder}
                    onUpdateDesign={updateCurrentDesign}
                    isDraggable={true}
                  />
                )}
              </div>

              {/* Right: Quick Tools Dock (Center X, Y, Flip & Motion Nudge Pad) */}
              <div className="stage-side-tools-dock">
                <div className="stage-side-dock-section">
                  <span className="stage-side-dock-label">Align & Flip</span>
                  <div className="dock-actions-stack">
                    <button
                      type="button"
                      className="dock-tool-btn"
                      title="Center Horizontally"
                      onClick={handleCenterHorizontal}
                    >
                      Center X
                    </button>
                    <button
                      type="button"
                      className="dock-tool-btn"
                      title="Center Vertically"
                      onClick={handleCenterVertical}
                    >
                      Center Y
                    </button>
                    <button
                      type="button"
                      className={`dock-tool-btn ${currentDesign.flipH ? "active" : ""}`}
                      title="Flip Horizontally"
                      onClick={handleToggleFlipH}
                    >
                      <FlipHorizontal size={13} />
                      Flip
                    </button>
                  </div>
                </div>

                <div className="stage-side-dock-section">
                  <span className="stage-side-dock-label">Nudge</span>
                  <div className="dock-dpad">
                    <button
                      type="button"
                      className="dock-dpad-btn up"
                      title="Nudge Up"
                      onClick={() => handleNudge(0, -4)}
                    >
                      <ChevronUp size={14} />
                    </button>
                    <div className="dock-dpad-mid">
                      <button
                        type="button"
                        className="dock-dpad-btn left"
                        title="Nudge Left"
                        onClick={() => handleNudge(-4, 0)}
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <button
                        type="button"
                        className="dock-dpad-btn center"
                        title="Reset Position to Center"
                        onClick={() => updateCurrentDesign({ posX: 0, posY: 0, textPosX: 0, textPosY: 0 })}
                      >
                        •
                      </button>
                      <button
                        type="button"
                        className="dock-dpad-btn right"
                        title="Nudge Right"
                        onClick={() => handleNudge(4, 0)}
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                    <button
                      type="button"
                      className="dock-dpad-btn down"
                      title="Nudge Down"
                      onClick={() => handleNudge(0, 4)}
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Precision Position, Scale & Rotation Sliders */}
            <div className="stage-quick-modifiers">
              {/* Dual Sliders in One Compact Row */}
              <div className="modifiers-grid-row">
                <div className="modifier-col">
                  <div className="modifier-col-header">
                    <span className="modifier-label">Scale</span>
                    <span className="modifier-val-badge">{Math.round((currentDesign.scale || 1) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.8"
                    step="0.05"
                    value={currentDesign.scale || 1}
                    onChange={(e) => updateCurrentDesign({ scale: parseFloat(e.target.value) })}
                    className="studio-range-slider"
                  />
                </div>
                <div className="modifier-col">
                  <div className="modifier-col-header">
                    <span className="modifier-label">Rotation</span>
                    <span className="modifier-val-badge">{currentDesign.rotation || 0}°</span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="5"
                    value={currentDesign.rotation || 0}
                    onChange={(e) => updateCurrentDesign({ rotation: parseInt(e.target.value) })}
                    className="studio-range-slider"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customization Controls & Garment Specs */}
        <div className="studio-control-column">
          {/* Section 1: Plain T-Shirt Color Selection */}
          <div className="studio-panel-card">
            <div className="panel-card-header">
              <h3 className="panel-section-title">1. Plain T-Shirt Garment & Color</h3>
              <span className="selected-color-label">{selectedColor?.name || "Loading..."}</span>
            </div>

            {isLoading ? (
              <div className="swatches-loading-skeleton">
                <div className="skeleton-swatch"></div>
                <div className="skeleton-swatch"></div>
                <div className="skeleton-swatch"></div>
                <div className="skeleton-swatch"></div>
              </div>
            ) : (
              <div className="plain-colors-grid">
                {availableColors.map((col) => (
                  <button
                    type="button"
                    key={col.id}
                    className={`plain-color-swatch-btn ${selectedColor?.id === col.id ? "active" : ""}`}
                    onClick={() => {
                      setSelectedColor(col);
                      const isColLight = col.hex
                        ? col.hex.toLowerCase() === "#ffffff" ||
                        col.hex.toLowerCase() === "#fff" ||
                        col.name?.toLowerCase().includes("white")
                        : true;
                      // Auto-adjust default text color if it matches standard black/white
                      if (!isColLight) {
                        setFrontDesign((prev) => (prev.textColor === "#111827" ? { ...prev, textColor: "#FFFFFF" } : prev));
                        setBackDesign((prev) => (prev.textColor === "#111827" ? { ...prev, textColor: "#FFFFFF" } : prev));
                      } else {
                        setFrontDesign((prev) => (prev.textColor === "#FFFFFF" ? { ...prev, textColor: "#111827" } : prev));
                        setBackDesign((prev) => (prev.textColor === "#FFFFFF" ? { ...prev, textColor: "#111827" } : prev));
                      }
                    }}
                    title={col.name}
                  >
                    <span
                      className="swatch-circle"
                      style={{
                        backgroundColor: col.hex,
                        border: col.hex?.toLowerCase() === "#ffffff" ? "1px solid #CBD5E1" : "none",
                      }}
                    >
                      {selectedColor?.id === col.id && (
                        <CheckIcon
                          style={{
                            fontSize: 18,
                            color: col.hex?.toLowerCase() === "#ffffff" ? "#0F172A" : "#FFFFFF",
                          }}
                        />
                      )}
                    </span>
                    <span className="swatch-name">{col.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Fabric Material Selection */}
          <div className="studio-panel-card">
            <div className="panel-card-header">
              <h3 className="panel-section-title">2. Select Fabric Material</h3>
              <span className="selected-color-label">
                {selectedMaterial ? `${selectedMaterial.fabric_weight || "Standard"}` : "Select Fabric"}
              </span>
            </div>

            <div className="materials-selector-grid">
              {availableMaterials.map((mat) => {
                const isSelected = selectedMaterial?.id === mat.id;
                const surcharge = Number(mat.price_adjustment || 0);

                return (
                  <div
                    key={mat.id}
                    className={`material-select-card ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelectedMaterial(mat)}
                  >
                    <div className="mat-card-badge-row">
                      <span className="mat-weight-tag">{mat.fabric_weight || "180 GSM"}</span>
                      {surcharge > 0 ? (
                        <span className="mat-price-tag">+₹{surcharge}</span>
                      ) : (
                        <span className="mat-price-tag free">Included</span>
                      )}
                    </div>
                    <h4 className="mat-card-title">{mat.name}</h4>
                    <p className="mat-card-desc">{mat.description}</p>
                    {isSelected && (
                      <div className="mat-selected-indicator">
                        <Check size={13} /> Selected
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Customization Studio (Front / Back Tools) */}
          <div className="studio-panel-card">
            <div className="panel-card-header">
              <div className="section-title-with-pill">
                <h3 className="panel-section-title">
                  3. Customize {activeSide.toUpperCase()} Side
                </h3>
                <div className="side-current-cost-pill">
                  {activeSide === "front" ? (
                    hasCustomFront ? (
                      <span>
                        Front Total: <strong>+₹{frontTotal}</strong>
                        <small> (Print: ₹{frontFee}{frontDesignSurcharge > 0 ? ` + Motif: ₹${frontDesignSurcharge}` : ""})</small>
                      </span>
                    ) : (
                      <span className="plain-status">Front: Plain Garment (₹0)</span>
                    )
                  ) : (
                    hasCustomBack ? (
                      <span>
                        Back Total: <strong>+₹{backTotal}</strong>
                        <small> (Print: ₹{backFee}{backDesignSurcharge > 0 ? ` + Motif: ₹${backDesignSurcharge}` : ""})</small>
                      </span>
                    ) : (
                      <span className="plain-status">Back: Blank Canvas (₹0)</span>
                    )
                  )}
                </div>
              </div>
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
                  className={`studio-tab-btn ${toolTab === "presets" ? "active" : ""}`}
                  onClick={() => setToolTab("presets")}
                >
                  <Sparkles size={13} style={{ marginRight: 4, display: "inline" }} />
                  Artwork Motifs
                </button>
                <button
                  type="button"
                  className={`studio-tab-btn ${toolTab === "upload" ? "active" : ""}`}
                  onClick={() => setToolTab("upload")}
                >
                  Upload Artwork
                </button>
              </div>
            </div>

            <div className="tool-body">
              {/* Tab 1: Typography */}
              {toolTab === "text" && (
                <div className="typography-editor">
                  <div className="form-group">
                    <label htmlFor="custom-text-input">Custom Text Message</label>
                    <input
                      id="custom-text-input"
                      type="text"
                      className="studio-input"
                      placeholder="Type your bespoke slogan, name, or quote..."
                      value={currentDesign.text}
                      maxLength={36}
                      onChange={(e) => updateCurrentDesign({ text: e.target.value })}
                    />
                    <div className="text-drag-hint">
                      <Move size={12} /> Drag & reposition text directly on the t-shirt
                    </div>
                  </div>

                  <div className="form-group-row">
                    <div className="form-group flex-1">
                      <label>Font Family</label>
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
                      <label>Size</label>
                      <select
                        className="studio-select"
                        value={currentDesign.fontSize || 18}
                        onChange={(e) => updateCurrentDesign({ fontSize: parseInt(e.target.value) })}
                        style={{ minWidth: "90px" }}
                      >
                        <option value={12}>Small (12px)</option>
                        <option value={16}>Regular (16px)</option>
                        <option value={20}>Medium (20px)</option>
                        <option value={24}>Large (24px)</option>
                        <option value={28}>X-Large (28px)</option>
                      </select>
                    </div>

                    <div className="form-group font-decor-toggles">
                      <label>Style</label>
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
                    <label>Letter Spacing: {currentDesign.letterSpacing || 1}px</label>
                    <input
                      type="range"
                      min="0"
                      max="6"
                      step="0.5"
                      value={currentDesign.letterSpacing || 1}
                      onChange={(e) => updateCurrentDesign({ letterSpacing: parseFloat(e.target.value) })}
                      className="studio-range-slider"
                    />
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
                        value={currentDesign.textColor || "#FFFFFF"}
                        onChange={(e) => updateCurrentDesign({ textColor: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Preset Motifs & Artwork from Admin */}
              {toolTab === "presets" && (
                <div className="presets-selector">
                  {/* Category Pills */}
                  <div className="motifs-category-pills">
                    {designCategories.map((cat) => (
                      <button
                        type="button"
                        key={cat}
                        className={`category-pill ${selectedCategory === cat ? "active" : ""}`}
                        onClick={() => setSelectedCategory(cat)}
                      >
                        {cat === "ALL" ? "All Motifs" : cat}
                      </button>
                    ))}
                  </div>

                  {/* Search bar */}
                  <div className="motif-search-bar">
                    <Search size={14} className="motif-search-icon" />
                    <input
                      type="text"
                      placeholder="Search artwork or theme..."
                      value={motifSearch}
                      onChange={(e) => setMotifSearch(e.target.value)}
                      className="motif-search-input"
                    />
                    {motifSearch && (
                      <button
                        type="button"
                        className="motif-search-clear"
                        onClick={() => setMotifSearch("")}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  {/* Active Motif Highlight */}
                  {currentDesign.imageUrl && (
                    <div className="active-motif-bar">
                      <div className="active-motif-preview">
                        <img src={currentDesign.imageUrl} alt="Active Motif" />
                        <div>
                          <strong>{currentDesign.designName || "Selected Motif"}</strong>
                          <div className="motif-calc-breakdown-row">
                            <span className="motif-surcharge-text">
                              {currentDesign.designPrice > 0
                                ? `+₹${currentDesign.designPrice} Artwork Surcharge`
                                : "Free Artwork"}
                            </span>
                            <span className="motif-calc-total-pill">
                              Side Print Addition: +₹{PRINT_FEE + (Number(currentDesign.designPrice) || 0)} (Print: ₹{PRINT_FEE}{currentDesign.designPrice > 0 ? ` + Artwork: ₹${currentDesign.designPrice}` : ""})
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn-remove-motif"
                        onClick={removeCurrentImage}
                        title="Remove motif from active side"
                      >
                        <X size={14} />
                        Remove
                      </button>
                    </div>
                  )}

                  {/* Grid of Designs */}
                  {isLoadingDesigns ? (
                    <div className="motifs-loading">
                      <div className="mc-spinner"></div>
                      <p>Loading artwork catalog...</p>
                    </div>
                  ) : filteredPresetDesigns.length > 0 ? (
                    <div className="presets-grid">
                      {filteredPresetDesigns.map((preset) => {
                        const isApplied = currentDesign.imageUrl === preset.image_url;
                        const price = Number(preset.price || 0);

                        return (
                          <div
                            key={preset.id}
                            className={`preset-item-card ${isApplied ? "applied" : ""}`}
                            onClick={() =>
                              updateCurrentDesign({
                                imageUrl: preset.image_url,
                                designName: preset.name,
                                designPrice: price,
                                motifId: preset.id,
                                isUserUpload: false,
                                userUploadUrl: null,
                              })
                            }
                          >
                            <div className="preset-card-thumb">
                              <img src={preset.image_url} alt={preset.name} />
                              {price > 0 ? (
                                <span className="preset-price-tag">+₹{price}</span>
                              ) : (
                                <span className="preset-price-tag free">Free</span>
                              )}
                              {isApplied && (
                                <span className="preset-applied-badge">
                                  <Check size={12} />
                                </span>
                              )}
                            </div>
                            <span className="preset-name" title={preset.name}>
                              {preset.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="motifs-empty">
                      <Sparkles size={24} />
                      <p>No artwork found matching this filter.</p>
                      <button
                        type="button"
                        className="btn-link"
                        onClick={() => {
                          setSelectedCategory("ALL");
                          setMotifSearch("");
                        }}
                      >
                        Clear filters
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Upload Custom Artwork / Logo */}
              {toolTab === "upload" && (
                <div className="artwork-uploader">
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
                        <span className="artwork-title">
                          {currentDesign.designName || "Custom Graphic Attached"}
                        </span>
                        <p className="artwork-desc">
                          Graphic is applied directly to the {activeSide.toUpperCase()} print zone.
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
                      <p className="upload-title">Click to browse your design or logo</p>
                      <span className="upload-hint">
                        Supports PNG, SVG, or JPG (transparent background recommended)
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Size & Fit */}
          <div className="studio-panel-card">
            <div className="panel-card-header">
              <h3 className="panel-section-title">4. Size & Garment Fit</h3>
              <button
                type="button"
                className="btn-size-guide"
                onClick={() => setShowSizeModal(true)}
              >
                <Ruler size={14} />
                Size Chart
              </button>
            </div>

            <div className="sizes-selector-grid">
              {availableSizes.map((sz) => {
                const szLabel = sz.label || sz.name;
                const isSelected = selectedSize === szLabel;
                const szSurcharge = Number(sz.price_adjustment || 0);

                return (
                  <button
                    type="button"
                    key={szLabel}
                    className={`size-btn ${isSelected ? "active" : ""}`}
                    onClick={() => setSelectedSize(szLabel)}
                  >
                    <span className="size-label">{szLabel}</span>
                    {sz.chest && <span className="size-chest">{sz.chest}</span>}
                    {szSurcharge > 0 && (
                      <span className="size-surcharge-pill">+₹{szSurcharge}</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="quantity-row-simple">
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
              <div className="qty-unit-price-preview">
                <span>Unit Price: <strong>₹{unitPrice}</strong></span>
              </div>
            </div>
          </div>

          {/* Section 5: Real-Time Price Calculation & Order Breakdown */}
          <div className="studio-panel-card calculation-summary-card">
            <div className="panel-card-header">
              <div className="calc-header-title-wrap">
                <Tag size={16} className="calc-header-icon" />
                <h3 className="panel-section-title">5. Price Calculation & Breakdown</h3>
              </div>
              <span className="calc-badge-live">Live Calculation</span>
            </div>

            <div className="calculation-breakdown-table">
              {/* 1. Base Garment */}
              <div className="calc-row">
                <div className="calc-row-left">
                  <span className="calc-item-title">1. Base Garment</span>
                  <span className="calc-item-desc">{selectedColor?.name || "Plain T-Shirt"}</span>
                </div>
                <div className="calc-row-price">₹{baseGarmentPrice}</div>
              </div>

              {/* 2. Fabric Surcharge */}
              <div className="calc-row">
                <div className="calc-row-left">
                  <span className="calc-item-title">2. Fabric Material</span>
                  <span className="calc-item-desc">{selectedMaterial?.name || "Standard Cotton"}</span>
                </div>
                <div className="calc-row-price">
                  {materialSurcharge > 0 ? (
                    <span className="calc-added">+₹{materialSurcharge}</span>
                  ) : (
                    <span className="calc-free">Included (₹0)</span>
                  )}
                </div>
              </div>

              {/* 3. Size Surcharge */}
              <div className="calc-row">
                <div className="calc-row-left">
                  <span className="calc-item-title">3. Garment Size</span>
                  <span className="calc-item-desc">Size {selectedSize}</span>
                </div>
                <div className="calc-row-price">
                  {sizeSurcharge > 0 ? (
                    <span className="calc-added">+₹{sizeSurcharge}</span>
                  ) : (
                    <span className="calc-free">Standard (₹0)</span>
                  )}
                </div>
              </div>

              {/* 4. Front Print Customization */}
              <div className={`calc-row ${hasCustomFront ? "calc-customized-row" : ""}`}>
                <div className="calc-row-left">
                  <div className="calc-side-title-row">
                    <span className="calc-item-title">4. Front Print Customization</span>
                    {hasCustomFront ? (
                      <span className="calc-side-status-tag active">Customized</span>
                    ) : (
                      <span className="calc-side-status-tag plain">Plain Garment</span>
                    )}
                  </div>
                  {hasCustomFront ? (
                    <span className="calc-item-desc">
                      {frontDesign.text ? `Text: "${frontDesign.text}"` : ""}
                      {frontDesign.text && frontDesign.imageUrl ? " • " : ""}
                      {frontDesign.imageUrl ? `Artwork: ${frontDesign.designName || "Graphic"}` : ""}
                      {" "}(Print Fee: ₹{frontFee}{frontDesignSurcharge > 0 ? ` + Motif Surcharge: ₹${frontDesignSurcharge}` : ""})
                    </span>
                  ) : (
                    <span className="calc-item-desc">No print on front side</span>
                  )}
                </div>
                <div className="calc-row-price">
                  {hasCustomFront ? (
                    <span className="calc-added-bold">+₹{frontTotal}</span>
                  ) : (
                    <span className="calc-free">₹0</span>
                  )}
                </div>
              </div>

              {/* 5. Back Print Customization */}
              <div className={`calc-row ${hasCustomBack ? "calc-customized-row" : ""}`}>
                <div className="calc-row-left">
                  <div className="calc-side-title-row">
                    <span className="calc-item-title">5. Back Print Customization</span>
                    {hasCustomBack ? (
                      <span className="calc-side-status-tag active">Customized</span>
                    ) : (
                      <span className="calc-side-status-tag plain">Blank Canvas</span>
                    )}
                  </div>
                  {hasCustomBack ? (
                    <span className="calc-item-desc">
                      {backDesign.text ? `Text: "${backDesign.text}"` : ""}
                      {backDesign.text && backDesign.imageUrl ? " • " : ""}
                      {backDesign.imageUrl ? `Artwork: ${backDesign.designName || "Graphic"}` : ""}
                      {" "}(Print Fee: ₹{backFee}{backDesignSurcharge > 0 ? ` + Motif Surcharge: ₹${backDesignSurcharge}` : ""})
                    </span>
                  ) : (
                    <span className="calc-item-desc">No print on back side</span>
                  )}
                </div>
                <div className="calc-row-price">
                  {hasCustomBack ? (
                    <span className="calc-added-bold">+₹{backTotal}</span>
                  ) : (
                    <span className="calc-free">₹0</span>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="calc-divider" />

              {/* Unit Price Subtotal */}
              <div className="calc-row calc-subtotal-row">
                <div className="calc-row-left">
                  <span className="calc-subtotal-label">Unit Price per Piece</span>
                </div>
                <div className="calc-subtotal-price">₹{unitPrice}</div>
              </div>

              {/* Quantity Stepper */}
              <div className="calc-row calc-quantity-row">
                <div className="calc-row-left">
                  <span className="calc-item-title">Quantity</span>
                  <span className="calc-item-desc">{quantity} piece{quantity > 1 ? "s" : ""} selected</span>
                </div>
                <div className="calc-quantity-summary">× {quantity}</div>
              </div>

              {/* Final Total */}
              <div className="calc-total-box">
                <div className="calc-total-left">
                  <span className="calc-total-label">FINAL ESTIMATED AMOUNT</span>
                  <span className="calc-total-sub">Includes all custom print fees, surcharges & taxes</span>
                </div>
                <div className="calc-total-amount">₹{totalPrice.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Section 6: Checkout Actions */}
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

      {/* Interactive Size Chart Modal */}
      {showSizeModal && (
        <div className="studio-modal-overlay" onClick={() => setShowSizeModal(false)}>
          <div className="studio-modal size-chart-modal" onClick={(e) => e.stopPropagation()}>
            <div className="studio-modal-header">
              <div>
                <h3 className="studio-modal-title">Garment Size & Measurement Guide</h3>
                <p className="studio-modal-sub">
                  {selectedMaterial?.name || "100% Super-Combed Cotton"} • {selectedMaterial?.fabric_weight || "180 GSM"} • Unisex Classic Fit
                </p>
              </div>
              <button
                type="button"
                className="studio-modal-close"
                onClick={() => setShowSizeModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="size-table-wrap">
              <table className="size-table">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Chest (Inches)</th>
                    <th>Length (Inches)</th>
                    <th>Shoulder (Inches)</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {availableSizes.map((s) => {
                    const sLabel = s.label || s.name;
                    const surcharge = Number(s.price_adjustment || 0);

                    return (
                      <tr
                        key={sLabel}
                        className={selectedSize === sLabel ? "active-row" : ""}
                      >
                        <td>
                          <strong>{sLabel}</strong>
                        </td>
                        <td>{s.chest || "—"}</td>
                        <td>{s.length || "—"}</td>
                        <td>{s.shoulder || "—"}</td>
                        <td>{surcharge > 0 ? `+₹${surcharge}` : "Standard"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="size-guide-tip">
              <InfoOutlinedIcon fontSize="small" />
              <span>For a relaxed streetwear fit, we recommend ordering one size up from your standard fit.</span>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen High-Res Preview Modal */}
      {showPreviewModal && (
        <div className="studio-modal-overlay" onClick={() => setShowPreviewModal(false)}>
          <div className="studio-modal preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="studio-modal-header">
              <div>
                <h3 className="studio-modal-title">Garment Atelier Visualizer</h3>
                <p className="studio-modal-sub">
                  Inspect your bespoke garment ({selectedColor?.name || "Pure White"}, Size: {selectedSize}, Fabric: {selectedMaterial?.name || "Standard Cotton"})
                </p>
              </div>
              <button
                type="button"
                className="studio-modal-close"
                onClick={() => setShowPreviewModal(false)}
                title="Close Visualizer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="preview-modal-body">
              <div className="preview-duo-grid">
                <div className="preview-stage-box">
                  <span className="preview-tag">FRONT VIEW</span>
                  <PlainTShirt2D
                    color={selectedColor?.hex || "#FFFFFF"}
                    side="front"
                    tshirtImage={selectedColor?.front_image}
                    design={frontDesign}
                    printableAreaVisible={false}
                  />
                </div>
                <div className="preview-stage-box">
                  <span className="preview-tag">BACK VIEW</span>
                  <PlainTShirt2D
                    color={selectedColor?.hex || "#FFFFFF"}
                    side="back"
                    tshirtImage={selectedColor?.back_image}
                    design={backDesign}
                    printableAreaVisible={false}
                  />
                </div>
              </div>

              {/* Atelier Cost Breakdown in Visualizer */}
              <div className="preview-cost-breakdown">
                <div className="preview-cost-item">
                  <span className="pci-label">Base Garment</span>
                  <span className="pci-val">₹{baseGarmentPrice}</span>
                </div>
                {materialSurcharge > 0 && (
                  <div className="preview-cost-item">
                    <span className="pci-label">Fabric ({selectedMaterial?.name})</span>
                    <span className="pci-val">+₹{materialSurcharge}</span>
                  </div>
                )}
                {sizeSurcharge > 0 && (
                  <div className="preview-cost-item">
                    <span className="pci-label">Size ({selectedSize})</span>
                    <span className="pci-val">+₹{sizeSurcharge}</span>
                  </div>
                )}
                <div className="preview-cost-item">
                  <span className="pci-label">Front Print Customization</span>
                  <span className={`pci-val ${hasCustomFront ? "pci-custom" : ""}`}>
                    {hasCustomFront ? `+₹${frontTotal}` : "Plain (₹0)"}
                  </span>
                </div>
                <div className="preview-cost-item">
                  <span className="pci-label">Back Print Customization</span>
                  <span className={`pci-val ${hasCustomBack ? "pci-custom" : ""}`}>
                    {hasCustomBack ? `+₹${backTotal}` : "Blank (₹0)"}
                  </span>
                </div>
                <div className="preview-cost-item pci-total">
                  <span className="pci-label">Unit Price ({quantity} pc{quantity > 1 ? "s" : ""})</span>
                  <span className="pci-val">₹{unitPrice} × {quantity} = ₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="preview-modal-footer">
              <div className="preview-summary-text">
                <span className="preview-summary-price">₹{totalPrice.toLocaleString()}</span>
                <span className="preview-summary-sub">
                  for {quantity} pc(s) • Size: {selectedSize} • ₹{unitPrice}/pc
                </span>
              </div>
              <div className="preview-footer-actions">
                <button
                  type="button"
                  className="preview-btn-back"
                  onClick={() => setShowPreviewModal(false)}
                >
                  <ArrowRight size={14} style={{ transform: "rotate(180deg)" }} />
                  Go Back
                </button>
                <button
                  type="button"
                  className="preview-btn-cart"
                  onClick={() => {
                    setShowPreviewModal(false);
                    handleAddToCart();
                  }}
                >
                  <ShoppingBagOutlinedIcon fontSize="small" />
                  Add To Bag
                </button>
                <button
                  type="button"
                  className="preview-btn-buy"
                  onClick={handleConfirmCheckout}
                >
                  <FlashOnIcon fontSize="small" />
                  Confirm & Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal for Buy Now Login Gate */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={() => {
          setAuthModalOpen(false);
          setShowPreviewModal(false);
          const cartItem = buildCartItem();
          navigate("/usertab/checkout", { state: { buyNowItem: cartItem } });
        }}
      />

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