/**
 * High-fidelity composite preview generator for customized garments.
 * Combines the base garment photo or vector silhouette with user motifs,
 * uploaded artwork, and custom typography onto an offscreen canvas.
 */

export const generateCompositeGarmentPreview = async ({
  color = "#FFFFFF",
  side = "front",
  garmentImageUrl = null,
  design = null,
  width = 500,
  height = 580,
}) => {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return resolve(garmentImageUrl || "");
      }

      const placementMode =
        side === "back"
          ? design?.placementMode || "full"
          : design?.placementMode || "chest";

      // Coordinate zones matching PlainTShirt2D viewBox (500 x 580)
      let printArea = { x: 176, y: 228, width: 136, height: 188, centerX: 244, centerY: 322 };
      if (side === "front") {
        if (placementMode === "chest") {
          printArea = { x: 182, y: 224, width: 62, height: 68, centerX: 213, centerY: 258 };
        } else if (placementMode === "center") {
          printArea = { x: 210, y: 232, width: 80, height: 75, centerX: 250, centerY: 269 };
        }
      } else {
        if (placementMode === "upper") {
          printArea = { x: 210, y: 194, width: 80, height: 62, centerX: 250, centerY: 225 };
        } else if (placementMode === "center") {
          printArea = { x: 190, y: 235, width: 120, height: 130, centerX: 250, centerY: 300 };
        } else {
          printArea = { x: 180, y: 218, width: 136, height: 188, centerX: 250, centerY: 312 };
        }
      }

      // Helper to draw vector fallback silhouette
      const drawSilhouette = () => {
        ctx.save();
        ctx.fillStyle = color || "#F4F4F5";
        ctx.strokeStyle = "#1E293B";
        ctx.lineWidth = 2;

        ctx.beginPath();
        // Path matches PlainTShirt2D silhouette
        ctx.moveTo(188, 78);
        ctx.bezierCurveTo(150, 78, 126, 94, 94, 136);
        ctx.lineTo(16, 216);
        ctx.bezierCurveTo(12, 222, 14, 232, 22, 238);
        ctx.lineTo(68, 274);
        ctx.bezierCurveTo(74, 278, 84, 276, 88, 268);
        ctx.lineTo(124, 200);
        ctx.lineTo(124, 514);
        ctx.bezierCurveTo(124, 520, 130, 526, 138, 526);
        ctx.lineTo(362, 526);
        ctx.bezierCurveTo(370, 526, 376, 520, 376, 514);
        ctx.lineTo(376, 200);
        ctx.lineTo(412, 268);
        ctx.bezierCurveTo(416, 276, 426, 278, 432, 274);
        ctx.lineTo(478, 238);
        ctx.bezierCurveTo(486, 232, 488, 222, 484, 216);
        ctx.lineTo(406, 136);
        ctx.bezierCurveTo(374, 94, 350, 78, 312, 78);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Collar
        ctx.beginPath();
        if (side === "front") {
          ctx.moveTo(188, 78);
          ctx.bezierCurveTo(210, 118, 290, 118, 312, 78);
        } else {
          ctx.moveTo(188, 78);
          ctx.bezierCurveTo(220, 92, 280, 92, 312, 78);
        }
        ctx.strokeStyle = "#0F172A";
        ctx.lineWidth = 3.5;
        ctx.stroke();

        ctx.restore();
      };

      // Helper to draw design artwork and text
      const drawDesign = () => {
        if (!design) return;

        ctx.save();
        // Clip to print boundary
        ctx.beginPath();
        ctx.rect(printArea.x, printArea.y, printArea.width, printArea.height);
        ctx.clip();

        // Translate to design center
        const cx = printArea.centerX + (design.posX || 0);
        const cy = printArea.centerY + (design.posY || 0);
        ctx.translate(cx, cy);

        // Transforms: scale, rotation, flip
        const scale = design.scale || 1;
        const flipH = design.flipH ? -1 : 1;
        ctx.scale(scale * flipH, scale);
        if (design.rotation) {
          ctx.rotate((design.rotation * Math.PI) / 180);
        }

        // Draw image artwork if preloaded
        if (design._loadedImg) {
          const img = design._loadedImg;
          const isChest = placementMode === "chest";
          const hasText = Boolean(design.text && design.text.trim());
          const size = isChest ? (hasText ? 56 : 64) : hasText ? 100 : 110;
          const offset = isChest
            ? hasText ? { x: -28, y: -34 } : { x: -32, y: -32 }
            : hasText ? { x: -50, y: -65 } : { x: -55, y: -55 };

          try {
            ctx.drawImage(img, offset.x, offset.y, size, size);
          } catch (e) {
            console.warn("Canvas drawImage error:", e);
          }
        }

        // Draw custom typography if present
        if (design.text && design.text.trim()) {
          ctx.save();
          const tx = design.textPosX || 0;
          const ty = design.textPosY || 0;
          ctx.translate(tx, ty);

          const isLightGarment =
            !color ||
            color.toLowerCase() === "#ffffff" ||
            color.toLowerCase() === "#fff";
          const resolvedColor =
            design.textColor || (isLightGarment ? "#111827" : "#FFFFFF");
          const fontSize = design.fontSize || (placementMode === "chest" ? 13 : 16);
          const fontFamily = design.font || "Inter, sans-serif";

          ctx.fillStyle = resolvedColor;
          ctx.font = `bold ${fontSize}px ${fontFamily}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          const isChest = placementMode === "chest";
          const textY = design.imageUrl ? (isChest ? 28 : 55) : 0;
          ctx.fillText(design.text.trim(), 0, textY);
          ctx.restore();
        }

        ctx.restore();
      };

      // Execution flow: load garment image first, then design image, then export
      const finishExport = () => {
        drawDesign();
        try {
          const dataUrl = canvas.toDataURL("image/png");
          resolve(dataUrl);
        } catch (err) {
          // If canvas was tainted by crossOrigin image, fallback to garmentImageUrl or SVG
          console.warn("Canvas export fallback:", err);
          resolve(garmentImageUrl || "");
        }
      };

      const loadDesignImageAndFinish = () => {
        if (design?.imageUrl) {
          const dImg = new Image();
          dImg.crossOrigin = "anonymous";
          dImg.onload = () => {
            design._loadedImg = dImg;
            finishExport();
          };
          dImg.onerror = () => {
            finishExport();
          };
          dImg.src = design.imageUrl;
        } else {
          finishExport();
        }
      };

      if (garmentImageUrl) {
        const bgImg = new Image();
        bgImg.crossOrigin = "anonymous";
        bgImg.onload = () => {
          ctx.drawImage(bgImg, 0, 0, width, height);
          loadDesignImageAndFinish();
        };
        bgImg.onerror = () => {
          drawSilhouette();
          loadDesignImageAndFinish();
        };
        bgImg.src = garmentImageUrl;
      } else {
        drawSilhouette();
        loadDesignImageAndFinish();
      }
    } catch (e) {
      console.warn("Preview generation error:", e);
      resolve(garmentImageUrl || "");
    }
  });
};
