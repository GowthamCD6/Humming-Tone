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
import { Header } from '../components/Header';
import { useCart } from '../context/CartContext';
import { CustomizeService } from '../api/services';
import { getImageUrl } from '../api/apiConfig';

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
  { label: 'Inter (Modern)', value: 'Inter, sans-serif' },
  { label: 'Playfair (Luxury Serif)', value: 'serif' },
  { label: 'Montserrat (Clean)', value: 'sans-serif-medium' },
  { label: 'Poppins (Soft)', value: 'sans-serif' },
  { label: 'Courier (Monospace)', value: 'monospace' },
  { label: 'Condensed (Bold)', value: 'sans-serif-condensed' },
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

const PRINT_FEE = 150; // Custom print fee per side

export const CustomizeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { addToCart, cartCount } = useCart();

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

  // Active Tool Tab: 'garment' | 'motifs' | 'text' | 'placement' | 'fabric' | 'size'
  const [activeTab, setActiveTab] = useState('motifs');

  // Modals
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);
  const [showSizeGuideModal, setShowSizeGuideModal] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Front Design State
  const [frontDesign, setFrontDesign] = useState({
    placementMode: 'chest', // 'chest', 'center', 'full'
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
      setFrontDesign((prev) => (typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }));
    } else {
      setBackDesign((prev) => (typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }));
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

  // Printable boundary label based on active side and placement mode
  const placementLabel = useMemo(() => {
    if (activeSide === 'front') {
      if (currentDesign.placementMode === 'chest') return 'LEFT CHEST (6 x 6 cm)';
      if (currentDesign.placementMode === 'center') return 'CENTER CHEST (14 x 14 cm)';
      return 'FULL FRONT BODY (28 x 38 cm)';
    } else {
      if (currentDesign.placementMode === 'upper') return 'UPPER BACK COLLAR (8 x 6 cm)';
      if (currentDesign.placementMode === 'center') return 'CENTER BACK (16 x 16 cm)';
      return 'FULL BACK ZONE (28 x 38 cm)';
    }
  }, [activeSide, currentDesign.placementMode]);

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
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAF8F5" />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>INITIALIZING ATELIER STUDIO...</Text>
      </View>
    );
  }

  // Active garment image
  const activeGarmentImg = activeSide === 'front' ? selectedGarment.front_image : selectedGarment.back_image;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF8F5" />
      <Header
        title="Custom Apparel Studio"
        rightComponent={
          <TouchableOpacity
            style={styles.cartIconBadgeBtn}
            onPress={() => navigation.navigate('CartTab')}
            activeOpacity={0.8}
          >
            <Ionicons name="bag-handle-outline" size={20} color={colors.primary} />
            {cartCount > 0 && (
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} bounces={false}>
        {/* ── 1. STUDIO CANVAS PREVIEW CARD ── */}
        <View style={styles.canvasCard}>
          {/* Side Switcher Pills */}
          <View style={styles.sideSwitcherRow}>
            <TouchableOpacity
              style={[styles.sidePill, activeSide === 'front' && styles.sidePillActive]}
              onPress={() => setActiveSide('front')}
              activeOpacity={0.85}
            >
              <Text style={[styles.sidePillText, activeSide === 'front' && styles.sidePillTextActive]}>
                FRONT VIEW
              </Text>
              {pricing.hasFront && <View style={styles.activeDot} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sidePill, activeSide === 'back' && styles.sidePillActive]}
              onPress={() => setActiveSide('back')}
              activeOpacity={0.85}
            >
              <Text style={[styles.sidePillText, activeSide === 'back' && styles.sidePillTextActive]}>
                BACK VIEW
              </Text>
              {pricing.hasBack && <View style={styles.activeDot} />}
            </TouchableOpacity>
          </View>

          {/* Garment Stage */}
          <View
            style={[
              styles.garmentStage,
              { backgroundColor: isLightColor ? '#F5EFEB' : '#2A2521' },
            ]}
          >
            {/* Garment Photo or Styled Vector Silhouette */}
            {activeGarmentImg ? (
              <Image
                source={{ uri: activeGarmentImg }}
                style={styles.garmentPhoto}
                resizeMode="contain"
              />
            ) : (
              <View
                style={[
                  styles.garmentSilhouette,
                  { backgroundColor: selectedGarment.hex, borderColor: isLightColor ? '#E2DCD5' : '#443C35' },
                ]}
              >
                {/* Silhouette collar indicator */}
                <View
                  style={[
                    styles.collarArc,
                    { borderColor: isLightColor ? '#1E1B18' : '#FAF8F5' },
                  ]}
                />
              </View>
            )}

            {/* Printable Frame Area Overlay */}
            <View
              style={[
                styles.printableFrame,
                currentDesign.placementMode === 'chest' && styles.frameChest,
                currentDesign.placementMode === 'center' && styles.frameCenter,
                currentDesign.placementMode === 'full' && styles.frameFull,
                currentDesign.placementMode === 'upper' && styles.frameUpper,
              ]}
            >
              <View style={styles.frameTag}>
                <Text style={styles.frameTagText}>{placementLabel}</Text>
              </View>

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
                    style={styles.motifImage}
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
                    style={{
                      fontFamily: currentDesign.fontFamily || 'Inter, sans-serif',
                      fontSize: currentDesign.fontSize || 16,
                      fontWeight: currentDesign.isBold ? 'bold' : 'normal',
                      fontStyle: currentDesign.isItalic ? 'italic' : 'normal',
                      letterSpacing: currentDesign.letterSpacing || 1,
                      color: resolvedTextColor,
                      textAlign: 'center',
                      textShadowColor: 'rgba(0,0,0,0.25)',
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

          {/* Garment Quick Meta */}
          <View style={styles.canvasFooter}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={[styles.swatchMini, { backgroundColor: selectedGarment.hex }]} />
              <Text style={styles.canvasGarmentName}>{selectedGarment.name} T-Shirt</Text>
            </View>
            <Text style={styles.canvasGarmentPrice}>From ₹{selectedGarment.base_price}</Text>
          </View>
        </View>

        {/* ── 2. STUDIO NAVIGATION TOOL TABS ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {[
            { id: 'motifs', label: 'ARTWORK', icon: 'sparkles-outline' },
            { id: 'text', label: 'TYPOGRAPHY', icon: 'text-outline' },
            { id: 'placement', label: 'PLACEMENT', icon: 'move-outline' },
            { id: 'garment', label: 'COLOR', icon: 'color-palette-outline' },
            { id: 'fabric', label: 'FABRIC', icon: 'shirt-outline' },
            { id: 'size', label: 'SIZING', icon: 'resize-outline' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabBtn, isActive && styles.tabBtnActive]}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={tab.icon}
                  size={15}
                  color={isActive ? '#FFFFFF' : colors.textSecondary}
                />
                <Text style={[styles.tabBtnText, isActive && styles.tabBtnTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── 3. DYNAMIC TOOL PANEL ── */}
        <View style={styles.toolPanel}>
          {/* TAB: MOTIFS & ARTWORK */}
          {activeTab === 'motifs' && (
            <View>
              <View style={styles.panelHeaderRow}>
                <Text style={styles.panelTitle}>CURATED MOTIF ATELIER</Text>
                {Boolean(currentDesign.imageUrl) && (
                  <TouchableOpacity
                    onPress={() => setCurrentDesign({ imageUrl: null, designName: null, designPrice: 0 })}
                  >
                    <Text style={styles.clearBtnText}>Remove Motif</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Search Bar */}
              <View style={styles.searchBar}>
                <Ionicons name="search-outline" size={16} color={colors.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search motifs (e.g. Anime, Vintage, Tiger)..."
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
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subPillsScroll}>
                {motifCategories.map((cat) => {
                  const isSel = selectedMotifCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.subPill, isSel && styles.subPillActive]}
                      onPress={() => setSelectedMotifCategory(cat)}
                    >
                      <Text style={[styles.subPillText, isSel && styles.subPillTextActive]}>{cat}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Motifs Grid */}
              <View style={styles.motifsGrid}>
                {filteredMotifs.map((motif) => {
                  const isSelected = currentDesign.imageUrl === motif.image_url;
                  return (
                    <TouchableOpacity
                      key={motif.id}
                      style={[styles.motifCard, isSelected && styles.motifCardActive]}
                      onPress={() =>
                        setCurrentDesign({
                          imageUrl: motif.image_url,
                          designName: motif.name,
                          designPrice: Number(motif.price || 0),
                        })
                      }
                      activeOpacity={0.8}
                    >
                      <Image source={{ uri: motif.image_url }} style={styles.motifThumb} resizeMode="contain" />
                      <Text style={styles.motifName} numberOfLines={1}>
                        {motif.name}
                      </Text>
                      <Text style={styles.motifFee}>
                        {motif.price && Number(motif.price) > 0 ? `+₹${motif.price}` : 'Free Motif'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Custom Image URL Input */}
              <View style={styles.customUploadBox}>
                <Text style={styles.customUploadTitle}>OR USE YOUR OWN ARTWORK LINK</Text>
                <View style={styles.urlInputRow}>
                  <TextInput
                    style={styles.urlInput}
                    placeholder="Paste Cloudinary or web image URL..."
                    placeholderTextColor={colors.textMuted}
                    value={customImageUrlInput}
                    onChangeText={setCustomImageUrlInput}
                  />
                  <TouchableOpacity
                    style={styles.applyUrlBtn}
                    onPress={() => {
                      if (customImageUrlInput.trim()) {
                        setCurrentDesign({
                          imageUrl: customImageUrlInput.trim(),
                          designName: 'Custom Artwork',
                          designPrice: 0,
                        });
                        setCustomImageUrlInput('');
                      }
                    }}
                  >
                    <Text style={styles.applyUrlBtnText}>Apply</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* TAB: TYPOGRAPHY & MONOGRAM */}
          {activeTab === 'text' && (
            <View>
              <View style={styles.panelHeaderRow}>
                <Text style={styles.panelTitle}>CUSTOM MONOGRAM & TEXT</Text>
                {Boolean(currentDesign.text) && (
                  <TouchableOpacity onPress={() => setCurrentDesign({ text: '' })}>
                    <Text style={styles.clearBtnText}>Clear Text</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Text Input */}
              <TextInput
                style={styles.textInput}
                placeholder="Type your name, quote, or coordinates..."
                placeholderTextColor={colors.textMuted}
                value={currentDesign.text}
                onChangeText={(text) => setCurrentDesign({ text })}
                maxLength={45}
              />

              {/* Font Selector */}
              <Text style={styles.fieldSectionLabel}>SELECT FONT FAMILY</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subPillsScroll}>
                {FONTS.map((f) => {
                  const isSel = currentDesign.fontFamily === f.value;
                  return (
                    <TouchableOpacity
                      key={f.value}
                      style={[styles.subPill, isSel && styles.subPillActive]}
                      onPress={() => setCurrentDesign({ fontFamily: f.value })}
                    >
                      <Text style={[styles.subPillText, isSel && styles.subPillTextActive]}>{f.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Text Colors */}
              <Text style={styles.fieldSectionLabel}>TEXT COLOR</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorPaletteScroll}>
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
              </ScrollView>

              {/* Font Format: Size, Bold, Italic */}
              <Text style={styles.fieldSectionLabel}>STYLING & POSITION NUDGE</Text>
              <View style={styles.formatRow}>
                <TouchableOpacity
                  style={[styles.formatBtn, currentDesign.isBold && styles.formatBtnActive]}
                  onPress={() => setCurrentDesign((p) => ({ isBold: !p.isBold }))}
                >
                  <Text style={[styles.formatBtnText, currentDesign.isBold && styles.formatBtnTextActive, { fontWeight: 'bold' }]}>
                    B
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.formatBtn, currentDesign.isItalic && styles.formatBtnActive]}
                  onPress={() => setCurrentDesign((p) => ({ isItalic: !p.isItalic }))}
                >
                  <Text style={[styles.formatBtnText, currentDesign.isItalic && styles.formatBtnTextActive, { fontStyle: 'italic' }]}>
                    I
                  </Text>
                </TouchableOpacity>

                <View style={styles.fontSizeControls}>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => setCurrentDesign((p) => ({ fontSize: Math.max(10, (p.fontSize || 16) - 2) }))}
                  >
                    <Ionicons name="remove" size={16} color={colors.textPrimary} />
                  </TouchableOpacity>
                  <Text style={styles.stepValue}>{currentDesign.fontSize || 16} pt</Text>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => setCurrentDesign((p) => ({ fontSize: Math.min(32, (p.fontSize || 16) + 2) }))}
                  >
                    <Ionicons name="add" size={16} color={colors.textPrimary} />
                  </TouchableOpacity>
                </View>

                {/* Nudge Arrows */}
                <View style={styles.nudgePad}>
                  <TouchableOpacity style={styles.nudgeBtn} onPress={() => handleNudge(0, -6)}>
                    <Ionicons name="arrow-up" size={14} color={colors.textPrimary} />
                  </TouchableOpacity>
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    <TouchableOpacity style={styles.nudgeBtn} onPress={() => handleNudge(-6, 0)}>
                      <Ionicons name="arrow-back" size={14} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.nudgeBtn} onPress={() => handleNudge(6, 0)}>
                      <Ionicons name="arrow-forward" size={14} color={colors.textPrimary} />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity style={styles.nudgeBtn} onPress={() => handleNudge(0, 6)}>
                    <Ionicons name="arrow-down" size={14} color={colors.textPrimary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* TAB: PLACEMENT & TRANSFORMS */}
          {activeTab === 'placement' && (
            <View>
              <Text style={styles.panelTitle}>PRINT ZONE & TRANSFORMS</Text>

              <Text style={styles.fieldSectionLabel}>SELECT PRINT ZONE</Text>
              <View style={styles.placementPillsRow}>
                {activeSide === 'front'
                  ? [
                      { id: 'chest', label: 'Left Chest Pocket' },
                      { id: 'center', label: 'Center Chest' },
                      { id: 'full', label: 'Full Front Zone' },
                    ].map((p) => {
                      const isSel = currentDesign.placementMode === p.id;
                      return (
                        <TouchableOpacity
                          key={p.id}
                          style={[styles.placementPill, isSel && styles.placementPillActive]}
                          onPress={() => setCurrentDesign({ placementMode: p.id })}
                        >
                          <Ionicons
                            name={isSel ? 'radio-button-on' : 'radio-button-off'}
                            size={16}
                            color={isSel ? colors.primary : colors.textMuted}
                          />
                          <Text style={[styles.placementPillText, isSel && styles.placementPillTextActive]}>
                            {p.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })
                  : [
                      { id: 'upper', label: 'Upper Back Neck' },
                      { id: 'center', label: 'Center Back' },
                      { id: 'full', label: 'Full Back Zone' },
                    ].map((p) => {
                      const isSel = currentDesign.placementMode === p.id;
                      return (
                        <TouchableOpacity
                          key={p.id}
                          style={[styles.placementPill, isSel && styles.placementPillActive]}
                          onPress={() => setCurrentDesign({ placementMode: p.id })}
                        >
                          <Ionicons
                            name={isSel ? 'radio-button-on' : 'radio-button-off'}
                            size={16}
                            color={isSel ? colors.primary : colors.textMuted}
                          />
                          <Text style={[styles.placementPillText, isSel && styles.placementPillTextActive]}>
                            {p.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
              </View>

              {/* Transform Buttons */}
              <Text style={styles.fieldSectionLabel}>ARTWORK SCALE & ORIENTATION</Text>
              <View style={styles.transformActionsRow}>
                <TouchableOpacity
                  style={styles.transformActionBtn}
                  onPress={() =>
                    setCurrentDesign((p) => ({ scale: Math.max(0.6, Math.round(((p.scale || 1) - 0.1) * 10) / 10) }))
                  }
                >
                  <Ionicons name="remove-circle-outline" size={18} color={colors.primary} />
                  <Text style={styles.transformActionText}>Zoom -</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.transformActionBtn}
                  onPress={() =>
                    setCurrentDesign((p) => ({ scale: Math.min(1.8, Math.round(((p.scale || 1) + 0.1) * 10) / 10) }))
                  }
                >
                  <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
                  <Text style={styles.transformActionText}>Zoom +</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.transformActionBtn, currentDesign.flipH && styles.transformActionBtnActive]}
                  onPress={() => setCurrentDesign((p) => ({ flipH: !p.flipH }))}
                >
                  <Ionicons name="swap-horizontal" size={18} color={currentDesign.flipH ? '#FFFFFF' : colors.primary} />
                  <Text style={[styles.transformActionText, currentDesign.flipH && { color: '#FFFFFF' }]}>Flip H</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.transformActionBtn}
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
                  <Ionicons name="refresh" size={18} color={colors.textSecondary} />
                  <Text style={[styles.transformActionText, { color: colors.textSecondary }]}>Reset</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* TAB: GARMENT COLOR */}
          {activeTab === 'garment' && (
            <View>
              <Text style={styles.panelTitle}>SELECT BASE GARMENT COLOR</Text>
              <View style={styles.garmentsGrid}>
                {garments.map((g) => {
                  const isSel = selectedGarment.id === g.id;
                  return (
                    <TouchableOpacity
                      key={g.id}
                      style={[styles.garmentCard, isSel && styles.garmentCardActive]}
                      onPress={() => setSelectedGarment(g)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.swatchLarge, { backgroundColor: g.hex }, g.hex === '#FFFFFF' && styles.whiteBorder]} />
                      <Text style={[styles.garmentCardName, isSel && styles.garmentCardNameActive]}>
                        {g.name}
                      </Text>
                      <Text style={styles.garmentCardPrice}>₹{g.base_price}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* TAB: FABRIC & MATERIALS */}
          {activeTab === 'fabric' && (
            <View>
              <Text style={styles.panelTitle}>LUXURY FABRIC SPECIFICATIONS</Text>
              <View style={styles.materialsStack}>
                {materials.map((mat) => {
                  const isSel = selectedMaterial.id === mat.id;
                  return (
                    <TouchableOpacity
                      key={mat.id}
                      style={[styles.materialItemCard, isSel && styles.materialItemCardActive]}
                      onPress={() => setSelectedMaterial(mat)}
                      activeOpacity={0.85}
                    >
                      <View style={styles.materialHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                          <Ionicons
                            name={isSel ? 'radio-button-on' : 'radio-button-off'}
                            size={18}
                            color={isSel ? colors.primary : colors.textMuted}
                          />
                          <Text style={[styles.materialTitle, isSel && styles.materialTitleActive]}>
                            {mat.name}
                          </Text>
                        </View>
                        <View style={styles.gsmBadge}>
                          <Text style={styles.gsmBadgeText}>{mat.fabric_weight || '180 GSM'}</Text>
                        </View>
                      </View>
                      <Text style={styles.materialDescription}>{mat.description}</Text>
                      <Text style={styles.materialPriceAdd}>
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

          {/* TAB: SIZING */}
          {activeTab === 'size' && (
            <View>
              <View style={styles.panelHeaderRow}>
                <Text style={styles.panelTitle}>SELECT APPAREL SIZE</Text>
                <TouchableOpacity onPress={() => setShowSizeGuideModal(true)}>
                  <Text style={styles.clearBtnText}>Size Guide Chart</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.sizesRow}>
                {sizes.map((s) => {
                  const isSel = selectedSize === s.name;
                  return (
                    <TouchableOpacity
                      key={s.id || s.name}
                      style={[styles.sizePill, isSel && styles.sizePillActive]}
                      onPress={() => setSelectedSize(s.name)}
                    >
                      <Text style={[styles.sizePillText, isSel && styles.sizePillTextActive]}>
                        {s.name}
                      </Text>
                      {Boolean(s.chest) && (
                        <Text style={[styles.sizeSubText, isSel && styles.sizeSubTextActive]}>
                          {s.chest}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Quantity Stepper */}
              <View style={styles.qtySection}>
                <Text style={styles.fieldSectionLabel}>PIECES QUANTITY</Text>
                <View style={styles.stepperRow}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    <Ionicons name="remove" size={18} color={colors.textPrimary} />
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setQuantity((q) => Math.min(20, q + 1))}
                  >
                    <Ionicons name="add" size={18} color={colors.textPrimary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── 4. STICKY BOTTOM CHECKOUT ACTION BAR ── */}
      <View style={[styles.bottomActionBar, { paddingBottom: Math.max(insets.bottom + 12, 18) }]}>
        <TouchableOpacity
          style={styles.priceMetaBox}
          onPress={() => setShowBreakdownModal(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.totalPriceLabel}>ESTIMATED TOTAL</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={styles.totalPriceValue}>₹{pricing.total.toLocaleString('en-IN')}</Text>
            <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
          </View>
          <Text style={styles.breakdownLink}>Tap for breakdown</Text>
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
              <Ionicons name="bag-add" size={18} color="#FFFFFF" />
              <Text style={styles.addToBagBtnText}>ADD TO BAG</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* ── 5. PRICE BREAKDOWN MODAL ── */}
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
                  <Text style={styles.breakdownLabel}>Fabric: {selectedMaterial.name}</Text>
                  <Text style={styles.breakdownVal}>+₹{pricing.fabricExtra}</Text>
                </View>
              )}

              {pricing.frontFee > 0 && (
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Front Customization ({frontDesign.placementMode})</Text>
                  <Text style={styles.breakdownVal}>+₹{pricing.frontFee}</Text>
                </View>
              )}

              {pricing.backFee > 0 && (
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Back Customization ({backDesign.placementMode})</Text>
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

      {/* ── 6. SIZE GUIDE MODAL ── */}
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
  cartIconBadgeBtn: {
    padding: 6,
    position: 'relative',
  },
  headerBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#E11D48',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  headerBadgeText: {
    fontSize: 9,
    fontFamily: typography.fontSansBold,
    color: '#FFFFFF',
  },

  // ── Canvas Card ──
  canvasCard: {
    margin: spacing.screenPadding,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    ...shadows.card,
  },
  sideSwitcherRow: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: '#F5EFEB',
    borderRadius: 24,
    padding: 4,
    gap: 6,
    marginBottom: spacing.sm,
  },
  sidePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },
  sidePillActive: {
    backgroundColor: colors.primary,
  },
  sidePillText: {
    fontFamily: typography.fontSansMedium,
    fontSize: 11,
    letterSpacing: 0.8,
    color: colors.textSecondary,
  },
  sidePillTextActive: {
    color: '#FFFFFF',
    fontFamily: typography.fontSansBold,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  garmentStage: {
    height: 310,
    borderRadius: 12,
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
  printableFrame: {
    position: 'absolute',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(112, 79, 56, 0.75)',
    backgroundColor: 'rgba(112, 79, 56, 0.05)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameChest: {
    top: 75,
    left: 60,
    width: 80,
    height: 80,
  },
  frameCenter: {
    top: 75,
    width: 120,
    height: 120,
  },
  frameFull: {
    top: 60,
    width: 160,
    height: 190,
  },
  frameUpper: {
    top: 45,
    width: 90,
    height: 70,
  },
  frameTag: {
    position: 'absolute',
    top: -18,
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  frameTagText: {
    fontSize: 7.5,
    fontFamily: typography.fontSansBold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  motifLayer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  motifImage: {
    width: 65,
    height: 65,
  },
  textLayer: {
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvasFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    marginTop: spacing.sm,
  },
  swatchMini: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  canvasGarmentName: {
    fontFamily: typography.fontSansBold,
    fontSize: 12,
    color: colors.textPrimary,
  },
  canvasGarmentPrice: {
    fontFamily: typography.fontSansBold,
    fontSize: 12,
    color: colors.primary,
  },

  // ── Tabs ──
  tabsScroll: {
    paddingHorizontal: spacing.screenPadding,
    gap: 8,
    paddingBottom: 4,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  tabBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabBtnText: {
    fontFamily: typography.fontSansMedium,
    fontSize: 11,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
    fontFamily: typography.fontSansBold,
  },

  // ── Tool Panel ──
  toolPanel: {
    margin: spacing.screenPadding,
    marginTop: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    ...shadows.card,
  },
  panelHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  panelTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 11.5,
    letterSpacing: 1,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  clearBtnText: {
    fontFamily: typography.fontSansBold,
    fontSize: 11,
    color: '#E11D48',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F5EFEB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    fontFamily: typography.fontSans,
    color: colors.textPrimary,
    padding: 0,
  },
  subPillsScroll: {
    gap: 8,
    paddingBottom: spacing.sm,
  },
  subPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F5EFEB',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  subPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  subPillText: {
    fontSize: 11,
    fontFamily: typography.fontSansMedium,
    color: colors.textSecondary,
  },
  subPillTextActive: {
    color: '#FFFFFF',
    fontFamily: typography.fontSansBold,
  },
  motifsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  motifCard: {
    width: (SCREEN_WIDTH - 64) / 3,
    backgroundColor: '#FAF8F5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 6,
    alignItems: 'center',
  },
  motifCardActive: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: '#F5EFEB',
  },
  motifThumb: {
    width: 60,
    height: 60,
    marginBottom: 4,
  },
  motifName: {
    fontSize: 10,
    fontFamily: typography.fontSansBold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  motifFee: {
    fontSize: 9,
    fontFamily: typography.fontSansMedium,
    color: colors.primary,
    marginTop: 2,
  },
  customUploadBox: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  customUploadTitle: {
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
  urlInput: {
    flex: 1,
    backgroundColor: '#F5EFEB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 11,
    fontFamily: typography.fontSans,
    color: colors.textPrimary,
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

  // ── Typography ──
  textInput: {
    backgroundColor: '#F5EFEB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    fontFamily: typography.fontSans,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  fieldSectionLabel: {
    fontSize: 10,
    fontFamily: typography.fontSansBold,
    letterSpacing: 0.8,
    color: colors.textSecondary,
    marginBottom: 6,
    marginTop: 4,
  },
  colorPaletteScroll: {
    gap: 10,
    paddingBottom: spacing.md,
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
  formatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  formatBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F5EFEB',
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formatBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  formatBtnText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  formatBtnTextActive: {
    color: '#FFFFFF',
  },
  fontSizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EFEB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 4,
    height: 36,
  },
  stepBtn: {
    padding: 6,
  },
  stepValue: {
    fontSize: 11,
    fontFamily: typography.fontSansBold,
    color: colors.textPrimary,
    paddingHorizontal: 6,
  },
  nudgePad: {
    alignItems: 'center',
    backgroundColor: '#F5EFEB',
    padding: 4,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  nudgeBtn: {
    padding: 4,
  },

  // ── Placement ──
  placementPillsRow: {
    gap: 8,
    marginBottom: spacing.md,
  },
  placementPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#F5EFEB',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  placementPillActive: {
    backgroundColor: '#FFFFFF',
    borderColor: colors.primary,
  },
  placementPillText: {
    fontSize: 12,
    fontFamily: typography.fontSansMedium,
    color: colors.textPrimary,
  },
  placementPillTextActive: {
    fontFamily: typography.fontSansBold,
    color: colors.primary,
  },
  transformActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  transformActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F5EFEB',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  transformActionBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  transformActionText: {
    fontSize: 11,
    fontFamily: typography.fontSansBold,
    color: colors.primary,
  },

  // ── Garments ──
  garmentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  garmentCard: {
    width: (SCREEN_WIDTH - 64) / 3,
    backgroundColor: '#F5EFEB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 10,
    alignItems: 'center',
  },
  garmentCardActive: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
  },
  swatchLarge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginBottom: 6,
  },
  garmentCardName: {
    fontSize: 11,
    fontFamily: typography.fontSansBold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  garmentCardNameActive: {
    color: colors.primary,
  },
  garmentCardPrice: {
    fontSize: 10,
    fontFamily: typography.fontSansMedium,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // ── Materials ──
  materialsStack: {
    gap: 8,
  },
  materialItemCard: {
    padding: spacing.md,
    backgroundColor: '#F5EFEB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  materialItemCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#FFFFFF',
  },
  materialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  materialTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 12.5,
    color: colors.textPrimary,
  },
  materialTitleActive: {
    color: colors.primary,
  },
  gsmBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  gsmBadgeText: {
    fontSize: 9,
    fontFamily: typography.fontSansBold,
    color: '#FFFFFF',
  },
  materialDescription: {
    fontSize: 11,
    fontFamily: typography.fontSans,
    color: colors.textSecondary,
    lineHeight: 16,
    marginVertical: 4,
  },
  materialPriceAdd: {
    fontSize: 11,
    fontFamily: typography.fontSansBold,
    color: colors.primary,
    marginTop: 2,
  },

  // ── Sizes ──
  sizesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.md,
  },
  sizePill: {
    width: (SCREEN_WIDTH - 64) / 4,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F5EFEB',
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
  },
  sizePillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sizePillText: {
    fontFamily: typography.fontSansBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  sizePillTextActive: {
    color: '#FFFFFF',
  },
  sizeSubText: {
    fontSize: 9,
    fontFamily: typography.fontSans,
    color: colors.textMuted,
    marginTop: 2,
  },
  sizeSubTextActive: {
    color: '#FFFFFF',
    opacity: 0.85,
  },
  qtySection: {
    marginTop: spacing.sm,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F5EFEB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 12,
  },
  qtyBtn: {
    padding: 6,
  },
  qtyValue: {
    fontFamily: typography.fontSansBold,
    fontSize: 14,
    color: colors.textPrimary,
    minWidth: 20,
    textAlign: 'center',
  },

  // ── Bottom Bar ──
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 12,
    ...shadows.bottomBar,
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

  // ── Modals ──
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

  // ── Size Guide Table ──
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
