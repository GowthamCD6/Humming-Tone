import React from "react";
import "./CustomGarmentThumb.css";

/**
 * CustomGarmentThumb Component
 * Renders a miniature visual of the custom t-shirt with exact fabric color,
 * motifs / uploaded logos, and custom typography overlay.
 */
export default function CustomGarmentThumb({
  item,
  size = 72,
  side = "front",
  className = "",
  showBadge = true,
}) {
  if (!item) return null;

  const cd = item.customDetails || {};
  const isCustom = Boolean(item.is_custom || item.customDetails || String(item.id).includes("custom"));

  // If not a customized product, render standard product image
  if (!isCustom) {
    return (
      <div
        className={`custom-garment-thumb-wrapper standard-product ${className}`}
        style={{ width: size, height: Math.round(size * 1.16) }}
      >
        <img
          src={item.image || item.image_path || "/placeholder.png"}
          alt={item.name}
          className="cgt-img-fill"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      </div>
    );
  }

  // Custom product handling
  const design = side === "back" ? (cd.back || cd.backDesign) : (cd.front || cd.frontDesign);
  const colorHex = cd.color?.hex || item.colorHex || "#F8FAFC";
  const garmentImg =
    side === "back"
      ? (cd.color?.back_image || cd.backPreviewUrl)
      : (cd.color?.front_image || cd.frontPreviewUrl || item.custom_preview_image);

  const placementMode =
    side === "back"
      ? design?.placementMode || "full"
      : design?.placementMode || "chest";

  // Relative print area styling (in percentage based on 500x580 viewBox)
  const getPrintZoneStyle = () => {
    if (side === "front") {
      if (placementMode === "chest") {
        return { top: "38%", left: "36%", width: "16%", height: "16%" };
      }
      if (placementMode === "center") {
        return { top: "39%", left: "41%", width: "18%", height: "17%" };
      }
      return { top: "38%", left: "35%", width: "30%", height: "35%" };
    } else {
      if (placementMode === "upper") {
        return { top: "33%", left: "41%", width: "18%", height: "14%" };
      }
      if (placementMode === "center") {
        return { top: "39%", left: "38%", width: "24%", height: "25%" };
      }
      return { top: "37%", left: "35%", width: "30%", height: "35%" };
    }
  };

  const zoneStyle = getPrintZoneStyle();

  // If we already have a direct composite preview data URL or image
  const directPreviewUrl =
    side === "back"
      ? cd.backPreviewUrl
      : (cd.frontPreviewUrl || item.custom_preview_image);

  const hasMotifOrText = Boolean(
    design?.imageUrl ||
    design?.motifUrl ||
    design?.userUploadUrl ||
    design?.text
  );

  return (
    <div
      className={`custom-garment-thumb-wrapper ${className}`}
      style={{
        width: typeof size === "number" ? `${size}px` : size,
        height: typeof size === "number" ? `${Math.round(size * 1.16)}px` : "auto",
        aspectRatio: "500 / 580",
        backgroundColor: colorHex || "#F4F4F5",
      }}
      title={`Custom ${cd.color?.name || item.color || "Garment"}`}
    >
      {/* 1. Base Garment Layer */}
      {garmentImg ? (
        <img
          src={garmentImg}
          alt="Garment base"
          className="cgt-base-garment"
          crossOrigin="anonymous"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      ) : (
        /* Vector T-Shirt Silhouette SVG */
        <svg
          viewBox="0 0 500 580"
          className="cgt-silhouette-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 188 78 C 150 78, 126 94, 94 136 L 16 216 C 12 222, 14 232, 22 238 L 68 274 C 74 278, 84 276, 88 268 L 124 200 L 124 514 C 124 520, 130 526, 138 526 L 362 526 C 370 526, 376 520, 376 514 L 376 200 L 412 268 C 416 276, 426 278, 432 274 L 478 238 C 486 232, 488 222, 484 216 L 406 136 C 374 94, 350 78, 312 78 Z"
            fill={colorHex || "#FFFFFF"}
            stroke="#CBD5E1"
            strokeWidth="3"
          />
          <path
            d={
              side === "front"
                ? "M 188 78 C 210 118, 290 118, 312 78"
                : "M 188 78 C 220 92, 280 92, 312 78"
            }
            stroke="#94A3B8"
            strokeWidth="4"
            fill="none"
          />
        </svg>
      )}

      {/* 2. Custom Artwork & Motif Overlay */}
      {hasMotifOrText && (
        <div className="cgt-print-zone" style={zoneStyle}>
          {(design?.imageUrl || design?.motifUrl || design?.userUploadUrl) && (
            <img
              src={design.imageUrl || design.motifUrl || design.userUploadUrl}
              alt="Motif"
              className="cgt-motif-img"
              style={{
                transform: `scale(${design.scale || 1}) rotate(${design.rotation || 0}deg) ${
                  design.flipH ? "scaleX(-1)" : ""
                }`,
              }}
            />
          )}

          {design?.text && (
            <div
              className="cgt-text-overlay"
              style={{
                color: design.textColor || (colorHex === "#000000" ? "#FFF" : "#111"),
                fontFamily: design.font || "Inter, sans-serif",
              }}
            >
              {design.text}
            </div>
          )}
        </div>
      )}

      {/* 3. Bespoke Custom Indicator Badge */}
      {showBadge && (
        <span className="cgt-bespoke-badge">
          {side === "back" ? "BACK" : "BESPOKE"}
        </span>
      )}
    </div>
  );
}
