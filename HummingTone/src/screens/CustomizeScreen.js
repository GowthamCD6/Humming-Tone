import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  StatusBar,
  Modal,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '../components/Icons';
import { colors, shadows } from '../theme/colors';
import { typography, spacing } from '../theme/typography';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useNotifications } from '../context/NotificationContext';
import { CustomizeService } from '../api/services';
import { getImageUrl } from '../api/apiConfig';
import { SkeletonCustomizer } from '../components/SkeletonLoader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── Fallback Garments with Front and Back ──
const FALLBACK_GARMENTS = [
  { id: 1, name: 'Pure White', hex: '#FFFFFF', base_price: 699, front_image: null, back_image: null },
  { id: 2, name: 'Jet Black', hex: '#18181B', base_price: 699, front_image: null, back_image: null },
  { id: 3, name: 'Navy Blue', hex: '#1E293B', base_price: 749, front_image: null, back_image: null },
  { id: 4, name: 'Heather Gray', hex: '#94A3B8', base_price: 699, front_image: null, back_image: null },
  { id: 5, name: 'Sand Beige', hex: '#D7C4A5', base_price: 749, front_image: null, back_image: null },
  { id: 6, name: 'Olive Green', hex: '#3F6212', base_price: 749, front_image: null, back_image: null },
  { id: 7, name: 'Crimson Red', hex: '#E11D48', base_price: 749, front_image: null, back_image: null },
];

// ── Fallback Materials ──
const FALLBACK_MATERIALS = [
  {
    id: 1,
    name: '100% Bio-Washed Combed Cotton',
    fabric_weight: '180 GSM',
    description: 'Ultra-soft ring-spun combed cotton. Breathable, pre-shrunk, ideal for everyday luxury comfort.',
    price_adjustment: 0,
  },
  {
    id: 2,
    name: 'Premium Supima Cotton',
    fabric_weight: '220 GSM',
    description: 'Finest long-staple luxury cotton with silky hand feel and deep dye retention.',
    price_adjustment: 150,
  },
  {
    id: 3,
    name: 'Heavyweight French Terry',
    fabric_weight: '260 GSM',
    description: 'Substantial 260 GSM streetwear drape with structured silhouette and rich texture.',
    price_adjustment: 250,
  },
  {
    id: 4,
    name: 'Poly-Cotton Performance Blend',
    fabric_weight: '170 GSM',
    description: 'Active stretch fabric, moisture-wicking, wrinkle-resistant and shape-retaining.',
    price_adjustment: 50,
  },
];

// ── Fallback Sizes ──
const FALLBACK_SIZES = [
  { id: 1, name: 'XS', label: 'XS', chest: '34-36"', length: '26.5"', shoulder: '16.5"', price_adjustment: 0 },
  { id: 2, name: 'S', label: 'S', chest: '36-38"', length: '27.5"', shoulder: '17.5"', price_adjustment: 0 },
  { id: 3, name: 'M', label: 'M', chest: '38-40"', length: '28.5"', shoulder: '18.5"', price_adjustment: 0 },
  { id: 4, name: 'L', label: 'L', chest: '40-42"', length: '29.5"', shoulder: '19.5"', price_adjustment: 0 },
  { id: 5, name: 'XL', label: 'XL', chest: '42-44"', length: '30.5"', shoulder: '20.5"', price_adjustment: 0 },
  { id: 6, name: 'XXL', label: 'XXL', chest: '44-46"', length: '31.5"', shoulder: '21.5"', price_adjustment: 0 },
  { id: 7, name: '3XL', label: '3XL', chest: '46-48"', length: '32.5"', shoulder: '22.5"', price_adjustment: 50 },
];

// ── Luxury Font Selection ──
const FONTS = [
  { label: 'Inter Modern', sub: 'Clean & Minimal', value: 'Inter, sans-serif' },
  { label: 'Playfair Luxury', sub: 'High Fashion Serif', value: 'serif' },
  { label: 'Montserrat Medium', sub: 'Contemporary Geometric', value: 'sans-serif-medium' },
  { label: 'Poppins Rounded', sub: 'Warm & Friendly', value: 'sans-serif' },
  { label: 'Courier Monospace', sub: 'Industrial Atelier', value: 'monospace' },
  { label: 'Condensed Bold', sub: 'Streetwear Display', value: 'sans-serif-condensed' },
];

// ── Curated Text Colors ──
const TEXT_COLORS = [
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Jet Black', hex: '#111827' },
  { name: 'Golden Ochre', hex: '#F59E0B' },
  { name: 'Crimson Red', hex: '#EF4444' },
  { name: 'Royal Navy', hex: '#1D4ED8' },
  { name: 'Emerald Green', hex: '#10B981' },
  { name: 'Electric Purple', hex: '#8B5CF6' },
  { name: 'Silver Slate', hex: '#94A3B8' },
];

const STUDIO_STEPS = [
  { id: 'garment', num: 1, title: 'Color', subtitle: 'Base Garment Shade', icon: 'color-palette-outline' },
  { id: 'fabric', num: 2, title: 'Fabric', subtitle: 'Luxury Weight & Weave', icon: 'shirt-outline' },
  { id: 'placement', num: 3, title: 'Placement', subtitle: 'Print Zone & Geometry', icon: 'move-outline' },
  { id: 'motifs', num: 4, title: 'Artwork', subtitle: 'Curated Atelier Motifs', icon: 'sparkles-outline' },
  { id: 'text', num: 5, title: 'Typography', subtitle: 'Monograms & Lettering', icon: 'text-outline' },
  { id: 'size', num: 6, title: 'Sizing', subtitle: 'Tailored Fit & Quantity', icon: 'resize-outline' },
];

const PRINT_FEE = 150; // Custom print fee per side

export const CustomizeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { addToCart } = useCart();
  const { wishlistCount } = useWishlist();
  const { unreadCount } = useNotifications();

  // Loading state
  const [loading, setLoading] = useState(true);

  // Garments / Colors
  const [garments, setGarments] = useState(FALLBACK_GARMENTS);
  const [selectedGarment, setSelectedGarment] = useState(FALLBACK_GARMENTS[0]);

  // Preset Motifs
  const [presetDesigns, setPresetDesigns] = useState([]);
  const [selectedMotifCategory, setSelectedMotifCategory] = useState('ALL');
  const [motifSearch, setMotifSearch] = useState('');
  const [customImageUrlInput, setCustomImageUrlInput] = useState('');

  // Materials & Sizes
  const [materials, setMaterials] = useState(FALLBACK_MATERIALS);
  const [selectedMaterial, setSelectedMaterial] = useState(FALLBACK_MATERIALS[0]);
  const [sizes, setSizes] = useState(FALLBACK_SIZES);
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);

  // Active View Side: 'front' | 'back'
  const [activeSide, setActiveSide] = useState('front');

  // Active Step Tab: 'garment' | 'fabric' | 'placement' | 'motifs' | 'text' | 'size'
  const [activeTab, setActiveTab] = useState('garment');

  // Modals
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);
  const [showSizeGuideModal, setShowSizeGuideModal] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Front Design State
  const [frontDesign, setFrontDesign] = useState({
    placementMode: 'chest', // 'chest' (Pocket), 'center', 'full'
    text: '',
    textColor: '#111827',
    fontFamily: FONTS[0].value,
    fontSize: 16,
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

  // Back Design State
  const [backDesign, setBackDesign] = useState({
    placementMode: 'full', // 'upper', 'center', 'full'
    text: '',
    textColor: '#111827',
    fontFamily: FONTS[0].value,
    fontSize: 16,
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

  // Load Garments, Motifs, Fabrics, and Sizes from API
  useEffect(() => {
    let isMounted = true;

    const loadStudioData = async () => {
      try {
        setLoading(true);
        const [garmentsRes, designsRes, materialsRes, sizesRes] = await Promise.allSettled([
          CustomizeService.fetchPlainTshirts(),
          CustomizeService.fetchDesigns(),
          CustomizeService.fetchMaterials(),
          CustomizeService.fetchSizes(),
        ]);

        if (!isMounted) return;

        // 1. Garments
        if (garmentsRes.status === 'fulfilled' && garmentsRes.value?.success && Array.isArray(garmentsRes.value.tshirts) && garmentsRes.value.tshirts.length > 0) {
          const parsed = garmentsRes.value.tshirts.map((t) => ({
            id: t.id,
            name: t.color_name,
            hex: t.color_hex || '#FFFFFF',
            front_image: t.front_image ? getImageUrl(t.front_image) : null,
            back_image: t.back_image ? getImageUrl(t.back_image) : null,
            base_price: Number(t.base_price || 699),
          }));
          setGarments(parsed);
          setSelectedGarment(parsed[0]);
        }

        // 2. Preset Designs
        if (designsRes.status === 'fulfilled' && designsRes.value?.success && Array.isArray(designsRes.value.designs)) {
          setPresetDesigns(designsRes.value.designs);
        }

        // 3. Materials
        if (materialsRes.status === 'fulfilled' && materialsRes.value?.success && Array.isArray(materialsRes.value.materials) && materialsRes.value.materials.length > 0) {
          setMaterials(materialsRes.value.materials);
          setSelectedMaterial(materialsRes.value.materials[0]);
        }

        // 4. Sizes
        if (sizesRes.status === 'fulfilled' && sizesRes.value?.success && Array.isArray(sizesRes.value.sizes) && sizesRes.value.sizes.length > 0) {
          setSizes(sizesRes.value.sizes);
        }
      } catch (err) {
        console.warn('Error loading customizer data, using defaults:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadStudioData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Helper: Active design state accessor
  const currentDesign = activeSide === 'front' ? frontDesign : backDesign;
  const setCurrentDesign = (updater) => {
    if (activeSide === 'front') {
      setFrontDesign((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        return { ...prev, ...next };
      });
    } else {
      setBackDesign((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        return { ...prev, ...next };
      });
    }
  };

  // Determine if garment color is light or dark
  const isLightColor = useMemo(() => {
    const hex = selectedGarment.hex || '#FFFFFF';
    if (hex === '#FFFFFF' || hex.toLowerCase() === '#fff') return true;
    const c = hex.replace('#', '');
    if (c.length !== 6) return true;
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 180;
  }, [selectedGarment.hex]);

  // Resolved text color for auto-contrast on dark t-shirts
  const resolvedTextColor = useMemo(() => {
    const userColor = currentDesign.textColor;
    if (!isLightColor && (userColor === '#111827' || userColor === '#000000')) {
      return '#FFFFFF';
    }
    return userColor || (isLightColor ? '#111827' : '#FFFFFF');
  }, [currentDesign.textColor, isLightColor]);

  // Categories list for motifs
  const motifCategories = useMemo(() => {
    const set = new Set(['ALL']);
    presetDesigns.forEach((d) => {
      if (d.category) set.add(d.category);
    });
    return Array.from(set);
  }, [presetDesigns]);

  // Filtered motifs
  const filteredMotifs = useMemo(() => {
    return presetDesigns.filter((d) => {
      const matchCat = selectedMotifCategory === 'ALL' || d.category === selectedMotifCategory;
      const matchSearch = !motifSearch.trim() || (d.name && d.name.toLowerCase().includes(motifSearch.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [presetDesigns, selectedMotifCategory, motifSearch]);

  // Pricing Calculation
  const pricing = useMemo(() => {
    const base = Number(selectedGarment.base_price || 699);
    const fabricExtra = Number(selectedMaterial.price_adjustment || 0);

    const hasFront = Boolean(frontDesign.imageUrl || (frontDesign.text && frontDesign.text.trim()));
    const frontMotifPrice = Number(frontDesign.designPrice || 0);
    const frontFee = hasFront ? PRINT_FEE + frontMotifPrice : 0;

    const hasBack = Boolean(backDesign.imageUrl || (backDesign.text && backDesign.text.trim()));
    const backMotifPrice = Number(backDesign.designPrice || 0);
    const backFee = hasBack ? PRINT_FEE + backMotifPrice : 0;

    const unitPrice = base + fabricExtra + frontFee + backFee;
    const total = unitPrice * quantity;

    return {
      base,
      fabricExtra,
      frontFee,
      backFee,
      unitPrice,
      total,
      hasFront,
      hasBack,
    };
  }, [selectedGarment, selectedMaterial, frontDesign, backDesign, quantity]);

  // Placement boundary label based on active side and placement mode
  const placementLabel = useMemo(() => {
    if (activeSide === 'front') {
      if (currentDesign.placementMode === 'chest') return 'LEFT CHEST (6 x 6 cm)';
      if (currentDesign.placementMode === 'center') return 'CENTER CHEST (14 x 14 cm)';
      return 'FULL TORSO (28 x 38 cm)';
    } else {
      if (currentDesign.placementMode === 'upper') return 'UPPER BACK (8 x 6 cm)';
      if (currentDesign.placementMode === 'center') return 'CENTER BACK (16 x 16 cm)';
      return 'FULL BACK ZONE (28 x 38 cm)';
    }
  }, [activeSide, currentDesign.placementMode]);

  // Placement options list
  const currentPlacementOptions = activeSide === 'front'
    ? [
        { id: 'chest', label: 'Left Chest (Pocket)', desc: 'Subtle monogram or minimal insignia on chest.' },
        { id: 'center', label: 'Center Chest', desc: 'Balanced emblem centered across upper chest.' },
        { id: 'full', label: 'Full Torso', desc: 'Prominent, high-impact statement across entire front.' },
      ]
    : [
        { id: 'upper', label: 'Upper Back / Collar', desc: 'Refined brand signature below neckline.' },
        { id: 'center', label: 'Center Back', desc: 'Mid-back focal emblem or typographic quote.' },
        { id: 'full', label: 'Full Back Zone', desc: 'Expansive bespoke artwork across entire back.' },
      ];

  // Current Step Index Helper
  const currentStepIndex = STUDIO_STEPS.findIndex((s) => s.id === activeTab);
  const currentStep = STUDIO_STEPS[currentStepIndex >= 0 ? currentStepIndex : 0];

  const handleNextStep = () => {
    if (currentStepIndex < STUDIO_STEPS.length - 1) {
      setActiveTab(STUDIO_STEPS[currentStepIndex + 1].id);
    } else {
      handleAddToCart();
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setActiveTab(STUDIO_STEPS[currentStepIndex - 1].id);
    }
  };

  // Handle adding custom garment to bag
  const handleAddToCart = () => {
    setAddingToCart(true);

    const customDetails = {
      color: {
        name: selectedGarment.name,
        hex: selectedGarment.hex,
        front_image: selectedGarment.front_image,
        back_image: selectedGarment.back_image,
      },
      material: {
        id: selectedMaterial.id,
        name: selectedMaterial.name,
        fabric_weight: selectedMaterial.fabric_weight,
      },
      fabric: selectedMaterial.name,
      fabricWeight: selectedMaterial.fabric_weight,
      size: selectedSize,
      hasCustomFront: pricing.hasFront,
      front: {
        placement: frontDesign.placementMode,
        imageUrl: frontDesign.imageUrl,
        designName: frontDesign.designName,
        text: frontDesign.text,
        font: frontDesign.fontFamily,
        textColor: frontDesign.textColor,
        scale: frontDesign.scale,
        rotation: frontDesign.rotation,
        flipH: frontDesign.flipH,
        posX: frontDesign.posX,
        posY: frontDesign.posY,
        textPosX: frontDesign.textPosX,
        textPosY: frontDesign.textPosY,
      },
      frontFee: pricing.frontFee,
      hasCustomBack: pricing.hasBack,
      back: {
        placement: backDesign.placementMode,
        imageUrl: backDesign.imageUrl,
        designName: backDesign.designName,
        text: backDesign.text,
        font: backDesign.fontFamily,
        textColor: backDesign.textColor,
        scale: backDesign.scale,
        rotation: backDesign.rotation,
        flipH: backDesign.flipH,
        posX: backDesign.posX,
        posY: backDesign.posY,
        textPosX: backDesign.textPosX,
        textPosY: backDesign.textPosY,
      },
      backFee: pricing.backFee,
      frontPreviewUrl: selectedGarment.front_image || null,
      backPreviewUrl: selectedGarment.back_image || null,
    };

    const customProduct = {
      id: `custom-${Date.now()}`,
      name: `Customized ${selectedGarment.name} T-Shirt`,
      brand: 'HUMMING TONE ATELIER',
      category: 'Custom Apparel',
      price: pricing.unitPrice,
      unit_price: pricing.unitPrice,
      image: selectedGarment.front_image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      is_custom: true,
      customDetails,
      custom_preview_image: selectedGarment.front_image || null,
      custom_fabric: selectedMaterial.name,
      color: selectedGarment.name,
      size: selectedSize,
    };

    addToCart(customProduct, selectedSize, quantity);
    setAddingToCart(false);

    Alert.alert(
      'Custom Garment Added',
      `Your bespoke ${selectedGarment.name} T-Shirt (Size ${selectedSize}, ${selectedMaterial.fabric_weight}) has been added to your shopping bag.`,
      [
        { text: 'Create Another', style: 'cancel' },
        { text: 'View Bag', onPress: () => navigation.navigate('CartTab') },
      ]
    );
  };

  // Nudge text offset handler
  const handleNudge = (dx, dy) => {
    setCurrentDesign((prev) => ({
      ...prev,
      textPosX: (prev.textPosX || 0) + dx,
      textPosY: (prev.textPosY || 0) + dy,
    }));
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: Math.max((insets.top || 0) + 12, (StatusBar.currentHeight || 0) + 12, Platform.OS === 'android' ? 34 : 44) }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAF8F5" translucent={true} />
        <SkeletonCustomizer />
      </View>
    );
  }

  // Proper safe area top & bottom tab bar clearance
  const topSafePadding = Math.max(
    (insets.top || 0) + 12,
    (StatusBar.currentHeight || 0) + 12,
    Platform.OS === 'android' ? 34 : 44
  );
  const bottomBarOffset = (Platform.OS === 'ios' ? Math.max(insets.bottom, 16) : 16) + 64 + 10;

  // Active garment image
  const activeGarmentImg = activeSide === 'front' ? selectedGarment.front_image : selectedGarment.back_image;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF8F5" translucent={true} />

      {/* ── 1. LUXURY TOP APP BAR ── */}
      <View style={[styles.topBar, { paddingTop: topSafePadding }]}>
        <View>
          <Text style={styles.headerTitle}>Custom Studio</Text>
          <Text style={styles.headerSubtitle}>Bespoke Apparel & Virtual Atelier</Text>
        </View>

        <View style={styles.topActionsRow}>
          <TouchableOpacity
            style={styles.notifCircleBtn}
            onPress={() => navigation.navigate('Wishlist')}
            activeOpacity={0.8}
          >
            <Ionicons name="heart-outline" size={19} color="#1E1B18" />
            {wishlistCount > 0 && (
              <View style={[styles.topNotifBadge, { backgroundColor: '#6B4E37' }]}>
                <Text style={styles.topNotifBadgeText}>{wishlistCount > 9 ? '9+' : wishlistCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.notifCircleBtn}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications-outline" size={19} color="#1E1B18" />
            {unreadCount > 0 && (
              <View style={styles.topNotifBadge}>
                <Text style={styles.topNotifBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomBarOffset + 95 }]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── 2. VIRTUAL ENVIRONMENT STAGE CARD ── */}
        <View style={styles.virtualStageCard}>
          {/* Virtual Mode Header */}
          <View style={styles.stageHeaderRow}>
            <View style={styles.liveBadgePill}>
              <View style={styles.livePulseDot} />
              <Text style={styles.liveBadgeText}>VIRTUAL 2D STUDIO</Text>
            </View>

            {/* Side Switcher Pills */}
            <View style={styles.sideSwitcherPills}>
              <TouchableOpacity
                style={[styles.sidePill, activeSide === 'front' && styles.sidePillActive]}
                onPress={() => setActiveSide('front')}
                activeOpacity={0.85}
              >
                <Text style={[styles.sidePillText, activeSide === 'front' && styles.sidePillTextActive]}>
                  FRONT
                </Text>
                {pricing.hasFront && <View style={styles.activeDot} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.sidePill, activeSide === 'back' && styles.sidePillActive]}
                onPress={() => setActiveSide('back')}
                activeOpacity={0.85}
              >
                <Text style={[styles.sidePillText, activeSide === 'back' && styles.sidePillTextActive]}>
                  BACK
                </Text>
                {pricing.hasBack && <View style={styles.activeDot} />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Placement Zone Selector Bar */}
          <View style={styles.quickPlacementRow}>
            {currentPlacementOptions.map((p) => {
              const isSel = currentDesign.placementMode === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.quickPlacementBtn, isSel && styles.quickPlacementBtnActive]}
                  onPress={() => setCurrentDesign({ placementMode: p.id })}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.quickPlacementBtnText, isSel && styles.quickPlacementBtnTextActive]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Garment Stage with Normalized 500:580 Aspect Ratio */}
          <View
            style={[
              styles.garmentStage,
              { backgroundColor: isLightColor ? '#F4EDE6' : '#221D1A' },
            ]}
          >
            {/* Garment Photo or Styled Vector Silhouette */}
            {activeGarmentImg ? (
              <Image
                source={{ uri: activeGarmentImg }}
                style={styles.garmentPhoto}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[
                  styles.garmentSilhouette,
                  { backgroundColor: selectedGarment.hex, borderColor: isLightColor ? '#E2DCD5' : '#443C35' },
                ]}
              >
                <View
                  style={[
                    styles.collarArc,
                    { borderColor: isLightColor ? '#1E1B18' : '#FAF8F5' },
                  ]}
                />
              </View>
            )}

            {/* Quick Canvas Floating Action Controls */}
            <View style={styles.floatingCanvasControls}>
              <TouchableOpacity
                style={styles.floatingControlBtn}
                onPress={() =>
                  setCurrentDesign((p) => ({
                    ...p,
                    scale: Math.max(0.5, Math.round(((p?.scale || 1) - 0.1) * 10) / 10),
                  }))
                }
                activeOpacity={0.8}
              >
                <Ionicons name="remove" size={16} color="#1E1B18" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.floatingControlBtn}
                onPress={() =>
                  setCurrentDesign((p) => ({
                    ...p,
                    scale: Math.min(2.0, Math.round(((p?.scale || 1) + 0.1) * 10) / 10),
                  }))
                }
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={16} color="#1E1B18" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.floatingControlBtn, currentDesign.flipH && styles.floatingControlBtnActive]}
                onPress={() => setCurrentDesign((p) => ({ ...p, flipH: !p?.flipH }))}
                activeOpacity={0.8}
              >
                <Ionicons name="swap-horizontal" size={16} color={currentDesign.flipH ? '#FFFFFF' : '#1E1B18'} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.floatingControlBtn}
                onPress={() =>
                  setCurrentDesign({
                    scale: 1,
                    flipH: false,
                    rotation: 0,
                    posX: 0,
                    posY: 0,
                    textPosX: 0,
                    textPosY: 0,
                  })
                }
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={15} color="#1E1B18" />
              </TouchableOpacity>
            </View>

            {/* Printable Frame Area Overlay with Precise Torso Boundaries */}
            <View
              style={[
                styles.printableFrame,
                activeSide === 'front' && currentDesign.placementMode === 'chest' && styles.frameFrontChest,
                activeSide === 'front' && currentDesign.placementMode === 'center' && styles.frameFrontCenter,
                activeSide === 'front' && currentDesign.placementMode === 'full' && styles.frameFrontFull,
                activeSide === 'back' && currentDesign.placementMode === 'upper' && styles.frameBackUpper,
                activeSide === 'back' && currentDesign.placementMode === 'center' && styles.frameBackCenter,
                activeSide === 'back' && currentDesign.placementMode === 'full' && styles.frameBackFull,
              ]}
            >
              {/* Design Content Container */}
              <View style={styles.frameInnerContent}>
                {/* Layer 1: Motif / Artwork Image */}
                {Boolean(currentDesign.imageUrl) && (
                  <View
                    style={[
                      styles.motifLayer,
                      {
                        transform: [
                          { scale: currentDesign.scale || 1 },
                          { scaleX: currentDesign.flipH ? -1 : 1 },
                          { rotate: `${currentDesign.rotation || 0}deg` },
                          { translateX: currentDesign.posX || 0 },
                          { translateY: currentDesign.posY || 0 },
                        ],
                      },
                    ]}
                  >
                    <Image
                      source={{ uri: currentDesign.imageUrl }}
                      style={[
                        styles.motifImage,
                        (currentDesign.placementMode === 'chest' || currentDesign.placementMode === 'upper') && styles.motifImageSmall,
                        currentDesign.placementMode === 'center' && styles.motifImageMedium,
                        currentDesign.placementMode === 'full' && styles.motifImageLarge,
                      ]}
                      resizeMode="contain"
                    />
                  </View>
                )}

                {/* Layer 2: Custom Text */}
                {Boolean(currentDesign.text && currentDesign.text.trim()) && (
                  <View
                    style={[
                      styles.textLayer,
                      {
                        transform: [
                          { translateX: currentDesign.textPosX || 0 },
                          { translateY: currentDesign.textPosY || 0 },
                        ],
                      },
                    ]}
                  >
                    <Text
                      numberOfLines={2}
                      style={{
                        fontFamily: currentDesign.fontFamily || 'Inter, sans-serif',
                        fontSize: (currentDesign.placementMode === 'chest' || currentDesign.placementMode === 'upper')
                          ? Math.min(currentDesign.fontSize || 16, 11)
                          : Math.min(currentDesign.fontSize || 16, 14),
                        fontWeight: currentDesign.isBold ? 'bold' : 'normal',
                        fontStyle: currentDesign.isItalic ? 'italic' : 'normal',
                        letterSpacing: currentDesign.letterSpacing || 1,
                        color: resolvedTextColor,
                        textAlign: 'center',
                        textShadowColor: 'rgba(0,0,0,0.35)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 2,
                      }}
                    >
                      {currentDesign.text}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Bottom Floating Live Garment Specs Tag */}
            <View style={styles.floatingGarmentSpecsTag}>
              <View style={[styles.swatchMini, { backgroundColor: selectedGarment.hex }]} />
              <Text style={styles.floatingSpecsText} numberOfLines={1}>
                {selectedGarment.name} • {selectedMaterial.fabric_weight || '180 GSM'} • Size {selectedSize}
              </Text>
            </View>
          </View>
        </View>

        {/* ── 3. ATELIER STEP WORKFLOW BAR (Steps 1 to 6) ── */}
        <View style={styles.stepWorkflowContainer}>
          <View style={styles.stepProgressMetaRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={styles.stepNumberCircle}>
                <Text style={styles.stepNumberCircleText}>{currentStep.num}</Text>
              </View>
              <View>
                <Text style={styles.stepTitleMain}>STEP {currentStep.num}: {currentStep.title.toUpperCase()}</Text>
                <Text style={styles.stepSubtitleMain}>{currentStep.subtitle}</Text>
              </View>
            </View>
            <Text style={styles.stepCountText}>{currentStep.num} / 6</Text>
          </View>

          {/* Stepper Navigation Pills Bar */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.stepWorkflowScroll}
          >
            {STUDIO_STEPS.map((step) => {
              const isActive = activeTab === step.id;
              const isPassed = step.num < currentStep.num;
              return (
                <TouchableOpacity
                  key={step.id}
                  style={[
                    styles.workflowStepPill,
                    isActive && styles.workflowStepPillActive,
                    isPassed && styles.workflowStepPillPassed,
                  ]}
                  onPress={() => setActiveTab(step.id)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={isPassed ? 'checkmark-circle' : step.icon}
                    size={14}
                    color={isActive ? '#FFFFFF' : isPassed ? colors.primary : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.workflowStepPillText,
                      isActive && styles.workflowStepPillTextActive,
                      isPassed && styles.workflowStepPillTextPassed,
                    ]}
                  >
                    {step.num}. {step.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── 4. DYNAMIC TOOL PANEL ── */}
        <View style={styles.toolPanel}>
          {/* ──────── STEP 1: GARMENT COLOR ──────── */}
          {activeTab === 'garment' && (
            <View>
              <Text style={styles.panelSectionHeading}>Select Base Garment Color</Text>
              <Text style={styles.panelSectionSub}>All plain t-shirts are tailored from ethically sourced organic cotton.</Text>

              <View style={styles.garmentsGrid3Col}>
                {garments.map((g) => {
                  const isSel = selectedGarment.id === g.id;
                  return (
                    <TouchableOpacity
                      key={g.id}
                      style={[styles.garmentTile3Col, isSel && styles.garmentTile3ColActive]}
                      onPress={() => setSelectedGarment(g)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.tileSwatch3Col, { backgroundColor: g.hex }, g.hex === '#FFFFFF' && styles.whiteBorder]}>
                        {isSel && (
                          <Ionicons
                            name="checkmark"
                            size={14}
                            color={g.hex === '#FFFFFF' ? '#111827' : '#FFFFFF'}
                          />
                        )}
                      </View>
                      <Text style={[styles.tileName3Col, isSel && styles.tileName3ColActive]} numberOfLines={1}>
                        {g.name}
                      </Text>
                      <Text style={styles.tilePrice3Col}>₹{g.base_price}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* ──────── STEP 2: FABRIC & MATERIALS ──────── */}
          {activeTab === 'fabric' && (
            <View>
              <Text style={styles.panelSectionHeading}>Select Luxury Fabric & Weave</Text>
              <Text style={styles.panelSectionSub}>Bespoke textile specifications tailored to your hand feel & structure preference.</Text>

              <View style={styles.materialsStack}>
                {materials.map((mat) => {
                  const isSel = selectedMaterial.id === mat.id;
                  return (
                    <TouchableOpacity
                      key={mat.id}
                      style={[styles.materialCardLuxury, isSel && styles.materialCardLuxuryActive]}
                      onPress={() => setSelectedMaterial(mat)}
                      activeOpacity={0.85}
                    >
                      <View style={styles.materialHeaderRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                          <Ionicons
                            name={isSel ? 'radio-button-on' : 'radio-button-off'}
                            size={19}
                            color={isSel ? colors.primary : colors.textMuted}
                          />
                          <Text style={[styles.materialCardTitle, isSel && styles.materialCardTitleActive]}>
                            {mat.name}
                          </Text>
                        </View>
                        <View style={[styles.gsmPill, isSel && styles.gsmPillActive]}>
                          <Text style={[styles.gsmPillText, isSel && styles.gsmPillTextActive]}>
                            {mat.fabric_weight || '180 GSM'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.materialCardDesc}>{mat.description}</Text>
                      <Text style={styles.materialCardPrice}>
                        {mat.price_adjustment && Number(mat.price_adjustment) > 0
                          ? `+₹${mat.price_adjustment} Upgrade`
                          : 'Included in Base Price'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* ──────── STEP 3: PLACEMENT & TRANSFORMS ──────── */}
          {activeTab === 'placement' && (
            <View>
              <Text style={styles.panelSectionHeading}>Print Zone Selection ({activeSide.toUpperCase()} VIEW)</Text>
              <Text style={styles.panelSectionSub}>Choose exact placement area for artwork or monogram positioning.</Text>

              <View style={styles.placementCardsStack}>
                {currentPlacementOptions.map((p) => {
                  const isSel = currentDesign.placementMode === p.id;
                  return (
                    <TouchableOpacity
                      key={p.id}
                      style={[styles.placementOptionCard, isSel && styles.placementOptionCardActive]}
                      onPress={() => setCurrentDesign({ placementMode: p.id })}
                      activeOpacity={0.8}
                    >
                      <View style={styles.placementOptionHeader}>
                        <Ionicons
                          name={isSel ? 'radio-button-on' : 'radio-button-off'}
                          size={18}
                          color={isSel ? colors.primary : colors.textMuted}
                        />
                        <Text style={[styles.placementOptionTitle, isSel && styles.placementOptionTitleActive]}>
                          {p.label}
                        </Text>
                      </View>
                      <Text style={styles.placementOptionDesc}>{p.desc}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.subSectionTitle}>ARTWORK GEOMETRY & ORIENTATION</Text>
              <View style={styles.transformActionGrid}>
                <TouchableOpacity
                  style={styles.transformGridBtn}
                  onPress={() =>
                    setCurrentDesign((p) => ({
                      ...p,
                      scale: Math.max(0.5, Math.round(((p?.scale || 1) - 0.1) * 10) / 10),
                    }))
                  }
                >
                  <Ionicons name="remove-circle-outline" size={17} color={colors.primary} />
                  <Text style={styles.transformGridBtnText}>Zoom Out</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.transformGridBtn}
                  onPress={() =>
                    setCurrentDesign((p) => ({
                      ...p,
                      scale: Math.min(2.0, Math.round(((p?.scale || 1) + 0.1) * 10) / 10),
                    }))
                  }
                >
                  <Ionicons name="add-circle-outline" size={17} color={colors.primary} />
                  <Text style={styles.transformGridBtnText}>Zoom In</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.transformGridBtn, currentDesign.flipH && styles.transformGridBtnActive]}
                  onPress={() => setCurrentDesign((p) => ({ ...p, flipH: !p?.flipH }))}
                >
                  <Ionicons name="swap-horizontal" size={17} color={currentDesign.flipH ? '#FFFFFF' : colors.primary} />
                  <Text style={[styles.transformGridBtnText, currentDesign.flipH && { color: '#FFFFFF' }]}>Flip H</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.transformGridBtn}
                  onPress={() =>
                    setCurrentDesign({
                      scale: 1,
                      flipH: false,
                      rotation: 0,
                      posX: 0,
                      posY: 0,
                      textPosX: 0,
                      textPosY: 0,
                    })
                  }
                >
                  <Ionicons name="refresh" size={17} color={colors.textSecondary} />
                  <Text style={[styles.transformGridBtnText, { color: colors.textSecondary }]}>Reset</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ──────── STEP 4: MOTIFS & ARTWORK ──────── */}
          {activeTab === 'motifs' && (
            <View>
              <View style={styles.panelHeaderRow}>
                <Text style={styles.panelSectionHeading}>Curated Motif Atelier</Text>
                {Boolean(currentDesign.imageUrl) && (
                  <TouchableOpacity
                    onPress={() => setCurrentDesign({ imageUrl: null, designName: null, designPrice: 0 })}
                  >
                    <Text style={styles.clearActionText}>Remove Motif</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.panelSectionSub}>Choose handcrafted graphic emblems or apply your custom artwork link.</Text>

              {/* Search Bar */}
              <View style={styles.searchBar}>
                <Ionicons name="search-outline" size={16} color={colors.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search motifs (e.g. Streetwear, Anime, Vintage)..."
                  placeholderTextColor={colors.textMuted}
                  value={motifSearch}
                  onChangeText={setMotifSearch}
                />
                {Boolean(motifSearch) && (
                  <TouchableOpacity onPress={() => setMotifSearch('')}>
                    <Ionicons name="close-circle" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Category Pills */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryPillsScroll}>
                {motifCategories.map((cat) => {
                  const isSel = selectedMotifCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.categoryPill, isSel && styles.categoryPillActive]}
                      onPress={() => setSelectedMotifCategory(cat)}
                    >
                      <Text style={[styles.categoryPillText, isSel && styles.categoryPillTextActive]}>{cat}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Motifs Grid */}
              <View style={styles.motifsGrid3Col}>
                {filteredMotifs.map((motif) => {
                  const isSelected = currentDesign.imageUrl === motif.image_url;
                  return (
                    <TouchableOpacity
                      key={motif.id}
                      style={[styles.motifTile, isSelected && styles.motifTileActive]}
                      onPress={() =>
                        setCurrentDesign({
                          imageUrl: motif.image_url,
                          designName: motif.name,
                          designPrice: Number(motif.price || 0),
                        })
                      }
                      activeOpacity={0.8}
                    >
                      <Image source={{ uri: motif.image_url }} style={styles.motifTileImg} resizeMode="contain" />
                      <Text style={styles.motifTileName} numberOfLines={1}>
                        {motif.name}
                      </Text>
                      <Text style={styles.motifTilePrice}>
                        {motif.price && Number(motif.price) > 0 ? `+₹${motif.price}` : 'Free Motif'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* ──────── STEP 5: TYPOGRAPHY & MONOGRAM ──────── */}
          {activeTab === 'text' && (
            <View>
              <View style={styles.panelHeaderRow}>
                <Text style={styles.panelSectionHeading}>Custom Monogram & Typography</Text>
                {Boolean(currentDesign.text) && (
                  <TouchableOpacity onPress={() => setCurrentDesign({ text: '' })}>
                    <Text style={styles.clearActionText}>Clear Text</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.panelSectionSub}>Add your personal quote, monogram, or bespoke phrase.</Text>

              {/* Text Input */}
              <TextInput
                style={styles.monogramInput}
                placeholder="Type your bespoke monogram or quote..."
                placeholderTextColor={colors.textMuted}
                value={currentDesign.text}
                onChangeText={(text) => setCurrentDesign({ text })}
                maxLength={45}
              />

              {/* Visual Font Style Cards */}
              <Text style={styles.subSectionTitle}>SELECT FONT STYLE</Text>
              <View style={styles.fontsGrid2Col}>
                {FONTS.map((f) => {
                  const isSel = currentDesign.fontFamily === f.value;
                  return (
                    <TouchableOpacity
                      key={f.label}
                      style={[styles.fontTile, isSel && styles.fontTileActive]}
                      onPress={() => setCurrentDesign({ fontFamily: f.value })}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.fontSampleText, { fontFamily: f.value }]}>Aa Bb Cc</Text>
                      <Text style={[styles.fontTileName, isSel && styles.fontTileNameActive]}>{f.label}</Text>
                      <Text style={styles.fontTileSub}>{f.sub}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Text Color Swatches Palette */}
              <Text style={styles.subSectionTitle}>TEXT COLOR PALETTE</Text>
              <View style={styles.textColorGrid}>
                {TEXT_COLORS.map((tc) => {
                  const isSel = currentDesign.textColor === tc.hex;
                  return (
                    <TouchableOpacity
                      key={tc.hex}
                      style={[
                        styles.textColorCircle,
                        { backgroundColor: tc.hex },
                        tc.hex === '#FFFFFF' && styles.whiteBorder,
                        isSel && styles.textColorCircleActive,
                      ]}
                      onPress={() => setCurrentDesign({ textColor: tc.hex })}
                      activeOpacity={0.8}
                    >
                      {isSel && (
                        <Ionicons
                          name="checkmark"
                          size={14}
                          color={tc.hex === '#FFFFFF' ? '#111827' : '#FFFFFF'}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Font Format: Size, Bold, Italic & Nudge Pad */}
              <Text style={styles.subSectionTitle}>STYLING & POSITION NUDGE</Text>
              <View style={styles.typographyToolbarRow}>
                <TouchableOpacity
                  style={[styles.styleBtn, currentDesign.isBold && styles.styleBtnActive]}
                  onPress={() => setCurrentDesign((p) => ({ isBold: !p.isBold }))}
                >
                  <Text style={[styles.styleBtnText, currentDesign.isBold && styles.styleBtnTextActive, { fontWeight: 'bold' }]}>
                    B
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.styleBtn, currentDesign.isItalic && styles.styleBtnActive]}
                  onPress={() => setCurrentDesign((p) => ({ isItalic: !p.isItalic }))}
                >
                  <Text style={[styles.styleBtnText, currentDesign.isItalic && styles.styleBtnTextActive, { fontStyle: 'italic' }]}>
                    I
                  </Text>
                </TouchableOpacity>

                <View style={styles.fontSizeStepper}>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => setCurrentDesign((p) => ({ fontSize: Math.max(10, (p.fontSize || 16) - 2) }))}
                  >
                    <Ionicons name="remove" size={15} color={colors.textPrimary} />
                  </TouchableOpacity>
                  <Text style={styles.fontSizeValue}>{currentDesign.fontSize || 16} pt</Text>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => setCurrentDesign((p) => ({ fontSize: Math.min(32, (p.fontSize || 16) + 2) }))}
                  >
                    <Ionicons name="add" size={15} color={colors.textPrimary} />
                  </TouchableOpacity>
                </View>

                {/* 4-Way Directional Nudge Pad */}
                <View style={styles.nudgePad}>
                  <TouchableOpacity style={styles.nudgeBtn} onPress={() => handleNudge(0, -6)}>
                    <Ionicons name="arrow-up" size={13} color={colors.textPrimary} />
                  </TouchableOpacity>
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    <TouchableOpacity style={styles.nudgeBtn} onPress={() => handleNudge(-6, 0)}>
                      <Ionicons name="arrow-back" size={13} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.nudgeBtn} onPress={() => handleNudge(6, 0)}>
                      <Ionicons name="arrow-forward" size={13} color={colors.textPrimary} />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity style={styles.nudgeBtn} onPress={() => handleNudge(0, 6)}>
                    <Ionicons name="arrow-down" size={13} color={colors.textPrimary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* ──────── STEP 6: SIZING & FINAL OVERVIEW ──────── */}
          {activeTab === 'size' && (
            <View>
              <View style={styles.panelHeaderRow}>
                <Text style={styles.panelSectionHeading}>Select Apparel Size & Quantity</Text>
                <TouchableOpacity onPress={() => setShowSizeGuideModal(true)}>
                  <Text style={styles.clearActionText}>Size Guide Chart</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.panelSectionSub}>Crafted to authentic Indian & Global luxury tailored fit standards.</Text>

              {/* Sizes Row */}
              <View style={styles.sizesGrid}>
                {sizes.map((s) => {
                  const isSel = selectedSize === s.name;
                  return (
                    <TouchableOpacity
                      key={s.id || s.name}
                      style={[styles.sizeTile, isSel && styles.sizeTileActive]}
                      onPress={() => setSelectedSize(s.name)}
                    >
                      <Text style={[styles.sizeTileName, isSel && styles.sizeTileNameActive]}>
                        {s.name}
                      </Text>
                      {Boolean(s.chest) && (
                        <Text style={[styles.sizeTileChest, isSel && styles.sizeTileChestActive]}>
                          {s.chest}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Quantity Stepper */}
              <View style={styles.quantitySection}>
                <Text style={styles.subSectionTitle}>QUANTITY OF BESPOKE PIECES</Text>
                <View style={styles.qtyStepperRow}>
                  <TouchableOpacity
                    style={styles.qtyActionBtn}
                    onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    <Ionicons name="remove" size={18} color={colors.textPrimary} />
                  </TouchableOpacity>
                  <Text style={styles.qtyCountValue}>{quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyActionBtn}
                    onPress={() => setQuantity((q) => Math.min(20, q + 1))}
                  >
                    <Ionicons name="add" size={18} color={colors.textPrimary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Final Custom Garment Overview Card */}
              <View style={styles.orderSummaryCard}>
                <Text style={styles.orderSummaryTitle}>GARMENT SPECIFICATIONS SUMMARY</Text>
                <View style={styles.summaryLine}>
                  <Text style={styles.summaryLabel}>Base Garment</Text>
                  <Text style={styles.summaryVal}>{selectedGarment.name} (₹{selectedGarment.base_price})</Text>
                </View>
                <View style={styles.summaryLine}>
                  <Text style={styles.summaryLabel}>Fabric & GSM</Text>
                  <Text style={styles.summaryVal}>{selectedMaterial.name} ({selectedMaterial.fabric_weight || '180 GSM'})</Text>
                </View>
                <View style={styles.summaryLine}>
                  <Text style={styles.summaryLabel}>Front Customization</Text>
                  <Text style={styles.summaryVal}>{pricing.hasFront ? `Active (${frontDesign.placementMode})` : 'Plain Front'}</Text>
                </View>
                <View style={styles.summaryLine}>
                  <Text style={styles.summaryLabel}>Back Customization</Text>
                  <Text style={styles.summaryVal}>{pricing.hasBack ? `Active (${backDesign.placementMode})` : 'Plain Back'}</Text>
                </View>
                <View style={[styles.summaryLine, { borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: 6, marginTop: 4 }]}>
                  <Text style={[styles.summaryLabel, { fontWeight: 'bold' }]}>Unit Price</Text>
                  <Text style={[styles.summaryVal, { fontWeight: 'bold', color: colors.primary }]}>₹{pricing.unitPrice}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Step Navigation Bottom Row */}
          <View style={styles.stepNavigationRow}>
            {currentStepIndex > 0 && (
              <TouchableOpacity
                style={styles.stepPrevButton}
                onPress={handlePrevStep}
                activeOpacity={0.85}
              >
                <Ionicons name="arrow-back" size={16} color={colors.textPrimary} />
                <Text style={styles.stepPrevButtonText}>Back</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.stepNextButton}
              onPress={handleNextStep}
              activeOpacity={0.85}
            >
              <Text style={styles.stepNextButtonText}>
                {currentStepIndex === STUDIO_STEPS.length - 1
                  ? `Add To Bag (₹${pricing.total.toLocaleString('en-IN')})`
                  : `Next: ${STUDIO_STEPS[currentStepIndex + 1].title}`}
              </Text>
              <Ionicons
                name={currentStepIndex === STUDIO_STEPS.length - 1 ? 'bag-check' : 'arrow-forward'}
                size={16}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ── 5. FLOATING CHECKOUT ACTION BAR ── */}
      <View style={[styles.bottomActionBar, { bottom: bottomBarOffset }]}>
        <TouchableOpacity
          style={styles.priceMetaBox}
          onPress={() => setShowBreakdownModal(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.totalPriceLabel}>ESTIMATED TOTAL</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={styles.totalPriceValue}>₹{pricing.total.toLocaleString('en-IN')}</Text>
            <Ionicons name="information-circle-outline" size={15} color={colors.primary} />
          </View>
          <Text style={styles.breakdownLink}>Price breakdown</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addToBagBtn}
          onPress={handleAddToCart}
          disabled={addingToCart}
          activeOpacity={0.9}
        >
          {addingToCart ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="bag-add" size={17} color="#FFFFFF" />
              <Text style={styles.addToBagBtnText}>ADD TO BAG</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* ── 6. PRICE BREAKDOWN MODAL ── */}
      <Modal
        visible={showBreakdownModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBreakdownModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.breakdownCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Price Breakdown</Text>
              <TouchableOpacity onPress={() => setShowBreakdownModal(false)}>
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.breakdownRows}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Plain {selectedGarment.name} T-Shirt</Text>
                <Text style={styles.breakdownVal}>₹{pricing.base}</Text>
              </View>

              {pricing.fabricExtra > 0 && (
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Fabric Upgrade: {selectedMaterial.name}</Text>
                  <Text style={styles.breakdownVal}>+₹{pricing.fabricExtra}</Text>
                </View>
              )}

              {pricing.frontFee > 0 && (
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Front Print ({frontDesign.placementMode})</Text>
                  <Text style={styles.breakdownVal}>+₹{pricing.frontFee}</Text>
                </View>
              )}

              {pricing.backFee > 0 && (
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Back Print ({backDesign.placementMode})</Text>
                  <Text style={styles.breakdownVal}>+₹{pricing.backFee}</Text>
                </View>
              )}

              <View style={[styles.breakdownRow, { marginTop: 8, borderTopWidth: 1, borderColor: colors.borderLight, paddingTop: 8 }]}>
                <Text style={styles.breakdownLabel}>Unit Garment Price</Text>
                <Text style={[styles.breakdownVal, { fontWeight: 'bold' }]}>₹{pricing.unitPrice}</Text>
              </View>

              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Quantity</Text>
                <Text style={styles.breakdownVal}>x {quantity}</Text>
              </View>

              <View style={[styles.breakdownRow, styles.grandTotalRow]}>
                <Text style={styles.grandTotalLabel}>TOTAL (INCL. GST)</Text>
                <Text style={styles.grandTotalVal}>₹{pricing.total.toLocaleString('en-IN')}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalDoneBtn}
              onPress={() => setShowBreakdownModal(false)}
            >
              <Text style={styles.modalDoneBtnText}>GOT IT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── 7. SIZE GUIDE MODAL ── */}
      <Modal
        visible={showSizeGuideModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSizeGuideModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.breakdownCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Apparel Measurement Guide</Text>
              <TouchableOpacity onPress={() => setShowSizeGuideModal(false)}>
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.sizeGuideDesc}>
              All dimensions are measured in inches. Tailored to standard Indian & Global bespoke fit.
            </Text>

            <View style={styles.sizeTable}>
              <View style={styles.sizeTableHeader}>
                <Text style={[styles.tableCell, { fontWeight: 'bold', width: 60 }]}>Size</Text>
                <Text style={[styles.tableCell, { fontWeight: 'bold', flex: 1 }]}>Chest</Text>
                <Text style={[styles.tableCell, { fontWeight: 'bold', flex: 1 }]}>Length</Text>
                <Text style={[styles.tableCell, { fontWeight: 'bold', flex: 1 }]}>Shoulder</Text>
              </View>
              {sizes.map((s) => (
                <View key={s.id || s.name} style={[styles.sizeTableRow, selectedSize === s.name && styles.activeTableRow]}>
                  <Text style={[styles.tableCell, { fontWeight: 'bold', width: 60, color: selectedSize === s.name ? colors.primary : colors.textPrimary }]}>
                    {s.name}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{s.chest || 'Standard'}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{s.length || 'Standard'}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{s.shoulder || 'Standard'}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.modalDoneBtn}
              onPress={() => setShowSizeGuideModal(false)}
            >
              <Text style={styles.modalDoneBtnText}>CLOSE GUIDE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
    gap: 12,
  },
  loadingText: {
    fontFamily: typography.fontSansBold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#FAF8F5',
  },
  headerTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 20,
    color: '#1E1B18',
  },
  headerSubtitle: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    color: '#8A7F75',
    marginTop: 2,
  },
  topActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notifCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECE4DC',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...shadows.subtle,
  },
  topNotifBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#C53030',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    borderWidth: 1.2,
    borderColor: '#FFFFFF',
  },
  topNotifBadgeText: {
    fontFamily: typography.fontSansBold,
    fontSize: 8.5,
    color: '#FFFFFF',
    lineHeight: 10,
  },

  // ── 2. VIRTUAL STAGE CARD ──
  virtualStageCard: {
    margin: spacing.screenPadding,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ECE4DC',
    padding: spacing.md,
    ...shadows.card,
  },
  stageHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  liveBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F5EFEB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  liveBadgeText: {
    fontSize: 9.5,
    fontFamily: typography.fontSansBold,
    color: colors.textPrimary,
    letterSpacing: 0.8,
  },
  sideSwitcherPills: {
    flexDirection: 'row',
    backgroundColor: '#F5EFEB',
    borderRadius: 20,
    padding: 3,
    gap: 4,
  },
  sidePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  sidePillActive: {
    backgroundColor: colors.primary,
  },
  sidePillText: {
    fontFamily: typography.fontSansMedium,
    fontSize: 10.5,
    letterSpacing: 0.8,
    color: colors.textSecondary,
  },
  sidePillTextActive: {
    color: '#FFFFFF',
    fontFamily: typography.fontSansBold,
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
  quickPlacementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  quickPlacementBtn: {
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#ECE4DC',
  },
  quickPlacementBtnActive: {
    backgroundColor: '#F5EFEB',
    borderColor: colors.primary,
  },
  quickPlacementBtnText: {
    fontSize: 10,
    fontFamily: typography.fontSansMedium,
    color: colors.textSecondary,
  },
  quickPlacementBtnTextActive: {
    fontFamily: typography.fontSansBold,
    color: colors.primary,
  },
  garmentStage: {
    width: '100%',
    aspectRatio: 500 / 580,
    maxHeight: 380,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  garmentPhoto: {
    width: '100%',
    height: '100%',
  },
  garmentSilhouette: {
    width: 220,
    height: 270,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
  },
  collarArc: {
    width: 60,
    height: 24,
    borderBottomWidth: 3,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginTop: -2,
  },
  floatingCanvasControls: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'column',
    gap: 6,
    zIndex: 30,
  },
  floatingControlBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  floatingControlBtnActive: {
    backgroundColor: colors.primary,
  },
  printableFrame: {
    position: 'absolute',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(112, 79, 56, 0.85)',
    backgroundColor: 'rgba(112, 79, 56, 0.08)',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    overflow: 'hidden',
  },
  frameFrontChest: {
    top: '37%',
    left: '32%',
    width: '13%',
    height: '12%',
  },
  frameFrontCenter: {
    top: '38%',
    left: '41%',
    width: '18%',
    height: '14%',
  },
  frameFrontFull: {
    top: '36.5%',
    left: '34%',
    width: '32%',
    height: '35%',
  },
  frameBackUpper: {
    top: '33.5%',
    left: '41%',
    width: '18%',
    height: '11%',
  },
  frameBackCenter: {
    top: '38.5%',
    left: '37%',
    width: '26%',
    height: '23%',
  },
  frameBackFull: {
    top: '36.5%',
    left: '34%',
    width: '32%',
    height: '35%',
  },
  frameTag: {
    position: 'absolute',
    top: -18,
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    zIndex: 20,
  },
  frameTagText: {
    fontSize: 7.5,
    fontFamily: typography.fontSansBold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  frameInnerContent: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  motifLayer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  motifImage: {
    width: '85%',
    height: '85%',
  },
  motifImageSmall: {
    width: '85%',
    height: '85%',
  },
  motifImageMedium: {
    width: '88%',
    height: '88%',
  },
  motifImageLarge: {
    width: '92%',
    height: '92%',
  },
  textLayer: {
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '96%',
  },
  floatingGarmentSpecsTag: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  swatchMini: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
  },
  floatingSpecsText: {
    fontFamily: typography.fontSansMedium,
    fontSize: 10.5,
    color: colors.textPrimary,
    flex: 1,
  },

  // ── 3. ATELIER STEP WORKFLOW BAR ──
  stepWorkflowContainer: {
    marginHorizontal: spacing.screenPadding,
    marginBottom: spacing.xs,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECE4DC',
    padding: 12,
    ...shadows.subtle,
  },
  stepProgressMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  stepNumberCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberCircleText: {
    color: '#FFFFFF',
    fontFamily: typography.fontSansBold,
    fontSize: 11,
  },
  stepTitleMain: {
    fontFamily: typography.fontSansBold,
    fontSize: 12,
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  stepSubtitleMain: {
    fontFamily: typography.fontSans,
    fontSize: 10.5,
    color: colors.textSecondary,
  },
  stepCountText: {
    fontFamily: typography.fontSansBold,
    fontSize: 11,
    color: colors.primary,
    backgroundColor: '#F5EFEB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  stepWorkflowScroll: {
    gap: 8,
  },
  workflowStepPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#ECE4DC',
  },
  workflowStepPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  workflowStepPillPassed: {
    backgroundColor: '#F5EFEB',
    borderColor: '#E2DCD5',
  },
  workflowStepPillText: {
    fontSize: 11,
    fontFamily: typography.fontSansMedium,
    color: colors.textSecondary,
  },
  workflowStepPillTextActive: {
    color: '#FFFFFF',
    fontFamily: typography.fontSansBold,
  },
  workflowStepPillTextPassed: {
    color: colors.textPrimary,
    fontFamily: typography.fontSansMedium,
  },

  // ── 4. DYNAMIC TOOL PANEL ──
  toolPanel: {
    margin: spacing.screenPadding,
    marginTop: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ECE4DC',
    padding: spacing.md,
    ...shadows.card,
  },
  panelSectionHeading: {
    fontFamily: typography.fontSansBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  panelSectionSub: {
    fontFamily: typography.fontSans,
    fontSize: 11.5,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  subSectionTitle: {
    fontSize: 10,
    fontFamily: typography.fontSansBold,
    letterSpacing: 0.8,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: 8,
  },
  panelHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clearActionText: {
    fontFamily: typography.fontSansBold,
    fontSize: 11,
    color: '#E11D48',
  },

  // Step 1: Color grid (3 columns)
  garmentsGrid3Col: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  garmentsGrid2Col: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  garmentTile3Col: {
    width: Math.floor((SCREEN_WIDTH - 84) / 3),
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF8F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ECE4DC',
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 4,
  },
  garmentTile3ColActive: {
    backgroundColor: '#FFFFFF',
    borderColor: colors.primary,
    borderWidth: 2,
    ...shadows.subtle,
  },
  garmentTile: {
    width: Math.floor((SCREEN_WIDTH - 84) / 3),
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF8F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ECE4DC',
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 4,
  },
  garmentTileActive: {
    backgroundColor: '#FFFFFF',
    borderColor: colors.primary,
    borderWidth: 2,
    ...shadows.subtle,
  },
  tileSwatch3Col: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  tileSwatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  tileName3Col: {
    fontFamily: typography.fontSansBold,
    fontSize: 11,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  tileName: {
    fontFamily: typography.fontSansBold,
    fontSize: 11,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  tileNameActive: {
    color: colors.primary,
  },
  tilePrice3Col: {
    fontFamily: typography.fontSansMedium,
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tilePrice: {
    fontFamily: typography.fontSansMedium,
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Step 2: Fabric cards
  materialsStack: {
    gap: 10,
  },
  materialCardLuxury: {
    padding: spacing.md,
    backgroundColor: '#FAF8F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ECE4DC',
  },
  materialCardLuxuryActive: {
    backgroundColor: '#FFFFFF',
    borderColor: colors.primary,
    borderWidth: 1.5,
    ...shadows.subtle,
  },
  materialHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  materialCardTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 12.5,
    color: colors.textPrimary,
  },
  materialCardTitleActive: {
    color: colors.primary,
  },
  gsmPill: {
    backgroundColor: '#ECE4DC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  gsmPillActive: {
    backgroundColor: colors.primary,
  },
  gsmPillText: {
    fontSize: 9.5,
    fontFamily: typography.fontSansBold,
    color: colors.textPrimary,
  },
  gsmPillTextActive: {
    color: '#FFFFFF',
  },
  materialCardDesc: {
    fontSize: 11,
    fontFamily: typography.fontSans,
    color: colors.textSecondary,
    lineHeight: 16,
    marginVertical: 4,
  },
  materialCardPrice: {
    fontSize: 11,
    fontFamily: typography.fontSansBold,
    color: colors.primary,
    marginTop: 2,
  },

  // Step 3: Placement cards
  placementCardsStack: {
    gap: 8,
  },
  placementOptionCard: {
    padding: 12,
    backgroundColor: '#FAF8F5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ECE4DC',
  },
  placementOptionCardActive: {
    backgroundColor: '#FFFFFF',
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  placementOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  placementOptionTitle: {
    fontSize: 12,
    fontFamily: typography.fontSansBold,
    color: colors.textPrimary,
  },
  placementOptionTitleActive: {
    color: colors.primary,
  },
  placementOptionDesc: {
    fontSize: 10.5,
    fontFamily: typography.fontSans,
    color: colors.textSecondary,
    marginLeft: 26,
  },
  transformActionGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  transformGridBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#ECE4DC',
  },
  transformGridBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  transformGridBtnText: {
    fontSize: 10.5,
    fontFamily: typography.fontSansBold,
    color: colors.primary,
  },

  // Step 4: Motifs
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FAF8F5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#ECE4DC',
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    fontFamily: typography.fontSans,
    color: colors.textPrimary,
    padding: 0,
  },
  categoryPillsScroll: {
    gap: 6,
    paddingBottom: spacing.sm,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#ECE4DC',
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryPillText: {
    fontSize: 10.5,
    fontFamily: typography.fontSansMedium,
    color: colors.textSecondary,
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
    fontFamily: typography.fontSansBold,
  },
  motifsGrid3Col: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  motifTile: {
    width: Math.floor((SCREEN_WIDTH - 84) / 3),
    backgroundColor: '#FAF8F5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ECE4DC',
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  motifTileActive: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
  },
  motifTileImg: {
    width: 44,
    height: 44,
    marginBottom: 4,
  },
  motifTileName: {
    fontSize: 9.5,
    fontFamily: typography.fontSansBold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  motifTilePrice: {
    fontSize: 8.5,
    fontFamily: typography.fontSansMedium,
    color: colors.primary,
    marginTop: 1,
  },
  customUrlCard: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#ECE4DC',
  },
  customUrlCardTitle: {
    fontSize: 10,
    fontFamily: typography.fontSansBold,
    letterSpacing: 0.8,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  urlInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  urlTextInput: {
    flex: 1,
    backgroundColor: '#FAF8F5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 11,
    fontFamily: typography.fontSans,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: '#ECE4DC',
  },
  applyUrlBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    borderRadius: 8,
    justifyContent: 'center',
  },
  applyUrlBtnText: {
    color: '#FFFFFF',
    fontFamily: typography.fontSansBold,
    fontSize: 11,
  },

  // Step 5: Typography
  monogramInput: {
    backgroundColor: '#FAF8F5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ECE4DC',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    fontFamily: typography.fontSans,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  fontsGrid2Col: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  fontTile: {
    width: (SCREEN_WIDTH - 64 - 8) / 2,
    backgroundColor: '#FAF8F5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ECE4DC',
    padding: 10,
  },
  fontTileActive: {
    backgroundColor: '#FFFFFF',
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  fontSampleText: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  fontTileName: {
    fontSize: 11,
    fontFamily: typography.fontSansBold,
    color: colors.textPrimary,
  },
  fontTileNameActive: {
    color: colors.primary,
  },
  fontTileSub: {
    fontSize: 9.5,
    fontFamily: typography.fontSans,
    color: colors.textSecondary,
    marginTop: 1,
  },
  textColorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  textColorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whiteBorder: {
    borderWidth: 1,
    borderColor: '#D4C5B9',
  },
  textColorCircleActive: {
    borderWidth: 2.5,
    borderColor: colors.primary,
    transform: [{ scale: 1.15 }],
  },
  typographyToolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  styleBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#ECE4DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  styleBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  styleBtnText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  styleBtnTextActive: {
    color: '#FFFFFF',
  },
  fontSizeStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ECE4DC',
    paddingHorizontal: 4,
    height: 36,
  },
  stepBtn: {
    padding: 6,
  },
  fontSizeValue: {
    fontSize: 11,
    fontFamily: typography.fontSansBold,
    color: colors.textPrimary,
    paddingHorizontal: 6,
  },
  nudgePad: {
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
    padding: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ECE4DC',
    marginLeft: 'auto',
  },
  nudgeBtn: {
    padding: 3,
  },

  // Step 6: Sizing
  sizesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.md,
  },
  sizeTile: {
    width: Math.floor((SCREEN_WIDTH - 86) / 4),
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#ECE4DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeTileActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sizeTileName: {
    fontFamily: typography.fontSansBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  sizeTileNameActive: {
    color: '#FFFFFF',
  },
  sizeTileChest: {
    fontSize: 9,
    fontFamily: typography.fontSans,
    color: colors.textMuted,
    marginTop: 2,
  },
  sizeTileChestActive: {
    color: '#FFFFFF',
    opacity: 0.85,
  },
  quantitySection: {
    marginBottom: spacing.md,
  },
  qtyStepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FAF8F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ECE4DC',
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 12,
  },
  qtyActionBtn: {
    padding: 6,
  },
  qtyCountValue: {
    fontFamily: typography.fontSansBold,
    fontSize: 14,
    color: colors.textPrimary,
    minWidth: 20,
    textAlign: 'center',
  },
  orderSummaryCard: {
    backgroundColor: '#FAF8F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ECE4DC',
    padding: 12,
    gap: 6,
  },
  orderSummaryTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 9.5,
    letterSpacing: 0.8,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  summaryLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    fontFamily: typography.fontSans,
    color: colors.textSecondary,
  },
  summaryVal: {
    fontSize: 11,
    fontFamily: typography.fontSansMedium,
    color: colors.textPrimary,
  },

  // Step Navigation Bottom Row
  stepNavigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#ECE4DC',
  },
  stepPrevButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF8F5',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ECE4DC',
  },
  stepPrevButtonText: {
    fontFamily: typography.fontSansBold,
    fontSize: 12,
    color: colors.textPrimary,
  },
  stepNextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
  },
  stepNextButtonText: {
    fontFamily: typography.fontSansBold,
    fontSize: 12,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  // ── 5. FLOATING CHECKOUT ACTION BAR ──
  bottomActionBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ECE4DC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 90,
  },
  priceMetaBox: {
    flex: 1,
  },
  totalPriceLabel: {
    fontSize: 8.5,
    fontFamily: typography.fontSansBold,
    letterSpacing: 1,
    color: colors.textSecondary,
  },
  totalPriceValue: {
    fontSize: 18,
    fontFamily: typography.fontSansBold,
    color: colors.primary,
    marginVertical: 1,
  },
  breakdownLink: {
    fontSize: 10,
    fontFamily: typography.fontSansMedium,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  addToBagBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 30,
    ...shadows.card,
  },
  addToBagBtnText: {
    fontFamily: typography.fontSansBold,
    fontSize: 12,
    letterSpacing: 0.8,
    color: '#FFFFFF',
  },

  // ── 6. MODALS ──
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(31, 26, 23, 0.65)',
    justifyContent: 'flex-end',
  },
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontFamily: typography.fontSerifBold || typography.fontSansBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  breakdownRows: {
    gap: 8,
    marginBottom: spacing.lg,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  breakdownLabel: {
    fontSize: 12,
    fontFamily: typography.fontSans,
    color: colors.textSecondary,
  },
  breakdownVal: {
    fontSize: 12,
    fontFamily: typography.fontSansMedium,
    color: colors.textPrimary,
  },
  grandTotalRow: {
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: colors.primary,
    paddingTop: 8,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontFamily: typography.fontSansBold,
    color: colors.primary,
  },
  grandTotalVal: {
    fontSize: 16,
    fontFamily: typography.fontSansBold,
    color: colors.primary,
  },
  modalDoneBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  modalDoneBtnText: {
    fontFamily: typography.fontSansBold,
    fontSize: 12,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  sizeGuideDesc: {
    fontSize: 12,
    fontFamily: typography.fontSans,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  sizeTable: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  sizeTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F5EFEB',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  sizeTableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  activeTableRow: {
    backgroundColor: '#F5EFEB',
  },
  tableCell: {
    fontSize: 11,
    fontFamily: typography.fontSans,
    color: colors.textPrimary,
    textAlign: 'center',
  },
});

export default CustomizeScreen;
