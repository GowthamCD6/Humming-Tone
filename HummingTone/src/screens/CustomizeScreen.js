import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '../components/Icons';
import { colors } from '../theme/colors';
import { typography, spacing } from '../theme/typography';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { useCart } from '../context/CartContext';

// Product Categories from Web Store
const CATEGORIES = [
  {
    id: 'tshirts',
    name: 'T-SHIRTS',
    basePrice: 799,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    variants: [
      { id: 'round', name: 'Round Neck' },
      { id: 'vneck', name: 'V-Neck' },
      { id: 'polo', name: 'Collar / Polo' },
      { id: 'henley', name: 'Henley' },
      { id: 'sleeveless_t', name: 'Sleeveless' },
    ],
  },
  {
    id: 'hoodies',
    name: 'HOODIES',
    basePrice: 1699,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    variants: [
      { id: 'pullover', name: 'Pullover Hoodie' },
      { id: 'zipup', name: 'Zip-Up Hoodie' },
      { id: 'oversized', name: 'Oversized Streetwear' },
      { id: 'cropped_h', name: 'Cropped Hoodie' },
    ],
  },
  {
    id: 'sweatshirts',
    name: 'SWEATSHIRTS',
    basePrice: 1299,
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80',
    variants: [
      { id: 'crew', name: 'Classic Crew Neck' },
      { id: 'heavy', name: 'Heavyweight Fleece' },
    ],
  },
  {
    id: 'sportswear',
    name: 'SPORTSWEAR',
    basePrice: 999,
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    variants: [
      { id: 'dryfit', name: 'Dry-Fit Jersey' },
      { id: 'athletic', name: 'Athletic Gym Top' },
    ],
  },
];

// Color Palette
const COLORS_LIST = [
  { id: 'black', name: 'Black', hex: '#111827' },
  { id: 'white', name: 'White', hex: '#FFFFFF', border: true },
  { id: 'navy', name: 'Navy Blue', hex: '#001F3F' },
  { id: 'red', name: 'Red', hex: '#E11D48' },
  { id: 'olive', name: 'Olive Green', hex: '#3F6212' },
  { id: 'gray', name: 'Heather Gray', hex: '#9CA3AF' },
  { id: 'maroon', name: 'Maroon', hex: '#881337' },
  { id: 'beige', name: 'Sand Beige', hex: '#D7C4A5' },
];

// Fabrics & Materials
const MATERIALS_LIST = [
  { id: 'cotton', name: '100% Pure Cotton', desc: 'Soft & breathable natural fabric', extra: 0 },
  { id: 'premium', name: 'Premium Combed Cotton', desc: '240 GSM heavy luxury finish', extra: 200 },
  { id: 'blend', name: 'Cotton-Polyester Blend', desc: 'Anti-wrinkle & quick drying', extra: 100 },
  { id: 'organic', name: 'Certified Organic Cotton', desc: 'Eco-friendly sustainable knit', extra: 300 },
];

// Sizes
const SIZES_LIST = [
  { id: 'XS', label: 'XS (34")' },
  { id: 'S', label: 'S (36")' },
  { id: 'M', label: 'M (38")' },
  { id: 'L', label: 'L (40")' },
  { id: 'XL', label: 'XL (42")' },
  { id: 'XXL', label: 'XXL (44")' },
];

export const CustomizeScreen = ({ navigation }) => {
  const { addToCart } = useCart();

  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [selectedVariant, setSelectedVariant] = useState(CATEGORIES[0].variants[0]);
  const [selectedColor, setSelectedColor] = useState(COLORS_LIST[0]);
  const [selectedMaterial, setSelectedMaterial] = useState(MATERIALS_LIST[0]);
  const [selectedSize, setSelectedSize] = useState(SIZES_LIST[2].id); // 'M'
  const [customText, setCustomText] = useState('');
  const [printPosition, setPrintPosition] = useState('Front Center'); // 'Front Center' | 'Left Chest' | 'Back Large'
  const [specialInstructions, setSpecialInstructions] = useState('');

  const calculatedPrice = selectedCategory.basePrice + (selectedMaterial.extra || 0) + (customText.trim() ? 150 : 0);

  const handleAddToCart = () => {
    const customItem = {
      id: `custom-${Date.now()}`,
      name: `Custom ${selectedVariant.name} (${selectedCategory.name})`,
      brand: 'HUMMING TONE CUSTOM',
      category: selectedCategory.name,
      price: calculatedPrice,
      image: selectedCategory.image,
      description: `Custom ${selectedVariant.name} in ${selectedColor.name}, ${selectedMaterial.name}. Print: "${customText || 'None'}" (${printPosition}).`,
    };

    addToCart(
      customItem,
      {
        size: selectedSize,
        color: selectedColor.name,
      },
      1
    );

    Alert.alert(
      'Custom Design Added to Bag',
      `Your custom ${selectedVariant.name} (${selectedColor.name}, Size ${selectedSize}) has been added to your shopping bag.`,
      [
        { text: 'Create Another', style: 'cancel' },
        { text: 'View Bag', onPress: () => navigation.navigate('CartTab') },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <Header title="Customize Product" />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.heroBanner}>
          <Text style={styles.bannerTag}>CREATE YOUR UNIQUE STYLE</Text>
          <Text style={styles.bannerTitle}>Custom Apparel Studio</Text>
          <Text style={styles.bannerDesc}>
            Choose your garment, select luxury fabrics, pick your favorite color, and add personalized print or embroidery.
          </Text>
        </View>

        {/* 1. Category Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. SELECT GARMENT TYPE</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory.id === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryCard, isSelected && styles.categoryCardActive]}
                  onPress={() => {
                    setSelectedCategory(cat);
                    setSelectedVariant(cat.variants[0]);
                  }}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: cat.image }} style={styles.categoryImage} resizeMode="cover" />
                  <View style={styles.categoryMeta}>
                    <Text style={[styles.categoryName, isSelected && styles.categoryNameActive]}>
                      {cat.name}
                    </Text>
                    <Text style={styles.categoryPrice}>From ₹{cat.basePrice}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 2. Neck / Style Variant Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. CHOOSE STYLE VARIANT</Text>
          <View style={styles.pillsRow}>
            {selectedCategory.variants.map((v) => {
              const isSelected = selectedVariant.id === v.id;
              return (
                <TouchableOpacity
                  key={v.id}
                  style={[styles.pill, isSelected && styles.pillActive]}
                  onPress={() => setSelectedVariant(v)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                    {v.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 3. Color Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. SELECT COLOR: {selectedColor.name.toUpperCase()}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorsScroll}>
            {COLORS_LIST.map((col) => {
              const isSelected = selectedColor.id === col.id;
              return (
                <TouchableOpacity
                  key={col.id}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: col.hex },
                    col.border && styles.colorBorder,
                    isSelected && styles.colorCircleActive,
                  ]}
                  onPress={() => setSelectedColor(col)}
                  activeOpacity={0.8}
                >
                  {isSelected && (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={col.hex === '#FFFFFF' ? colors.primary : '#FFFFFF'}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 4. Fabric & Material */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. CHOOSE FABRIC MATERIAL</Text>
          <View style={styles.materialsList}>
            {MATERIALS_LIST.map((mat) => {
              const isSelected = selectedMaterial.id === mat.id;
              return (
                <TouchableOpacity
                  key={mat.id}
                  style={[styles.materialCard, isSelected && styles.materialCardActive]}
                  onPress={() => setSelectedMaterial(mat)}
                  activeOpacity={0.8}
                >
                  <View style={styles.materialLeft}>
                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={isSelected ? colors.primary : colors.textMuted}
                    />
                    <View>
                      <Text style={[styles.materialName, isSelected && styles.materialNameActive]}>
                        {mat.name}
                      </Text>
                      <Text style={styles.materialDesc}>{mat.desc}</Text>
                    </View>
                  </View>
                  <Text style={styles.materialExtra}>
                    {mat.extra > 0 ? `+₹${mat.extra}` : 'Included'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 5. Size Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. SELECT SIZE</Text>
          <View style={styles.sizesRow}>
            {SIZES_LIST.map((s) => {
              const isSelected = selectedSize === s.id;
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.sizeBtn, isSelected && styles.sizeBtnActive]}
                  onPress={() => setSelectedSize(s.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.sizeBtnText, isSelected && styles.sizeBtnTextActive]}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 6. Custom Text & Placement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. CUSTOM PRINT OR TEXT (OPTIONAL)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. YOUR NAME, QUOTE, OR BRAND LOGO"
            placeholderTextColor={colors.textMuted}
            value={customText}
            onChangeText={setCustomText}
          />

          <Text style={[styles.subLabel, { marginTop: 12 }]}>PRINT PLACEMENT</Text>
          <View style={styles.pillsRow}>
            {['Front Center', 'Left Chest Pocket', 'Back Large Print'].map((pos) => {
              const isSelected = printPosition === pos;
              return (
                <TouchableOpacity
                  key={pos}
                  style={[styles.pill, isSelected && styles.pillActive]}
                  onPress={() => setPrintPosition(pos)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                    {pos}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.subLabel, { marginTop: 12 }]}>SPECIAL INSTRUCTIONS FOR TAILOR</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add any specific color tone, sleeve length, or embroidery details..."
            placeholderTextColor={colors.textMuted}
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Price & Action Card */}
        <View style={styles.checkoutBar}>
          <View>
            <Text style={styles.totalLabel}>TOTAL ESTIMATE</Text>
            <Text style={styles.totalValue}>₹{calculatedPrice.toLocaleString('en-IN')}</Text>
            <Text style={styles.totalSub}>Includes custom tailoring & GST</Text>
          </View>

          <Button
            title="ADD CUSTOM PIECE TO BAG"
            onPress={handleAddToCart}
            variant="primary"
            size="md"
            style={{ flex: 1, marginLeft: 16 }}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  heroBanner: {
    backgroundColor: colors.surface,
    padding: spacing.screenPadding,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  bannerTag: {
    fontFamily: typography.fontSans,
    fontSize: 9.5,
    fontWeight: typography.weightBold,
    letterSpacing: 1.5,
    color: colors.primary,
    marginBottom: 4,
  },
  bannerTitle: {
    fontFamily: typography.fontSerif,
    fontSize: 22,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  bannerDesc: {
    fontFamily: typography.fontSans,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  section: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.xl,
  },
  sectionTitle: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    fontWeight: typography.weightBold,
    letterSpacing: 1,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: colors.cardBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  categoryCardActive: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  categoryImage: {
    width: '100%',
    height: 100,
    backgroundColor: colors.surface,
  },
  categoryMeta: {
    padding: spacing.sm,
  },
  categoryName: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  categoryNameActive: {
    color: colors.primary,
  },
  categoryPrice: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    color: colors.textSecondary,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    fontWeight: typography.weightMedium,
    color: colors.textPrimary,
  },
  pillTextActive: {
    color: colors.textInverse,
    fontWeight: typography.weightBold,
  },
  colorsScroll: {
    gap: 12,
    paddingVertical: 4,
  },
  colorCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorBorder: {
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  colorCircleActive: {
    borderWidth: 3,
    borderColor: colors.primary,
    transform: [{ scale: 1.1 }],
  },
  materialsList: {
    gap: 8,
  },
  materialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  materialCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.cardBg,
  },
  materialLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  materialName: {
    fontFamily: typography.fontSans,
    fontSize: 13,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
  },
  materialNameActive: {
    color: colors.primary,
  },
  materialDesc: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  materialExtra: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    fontWeight: typography.weightBold,
    color: colors.primary,
  },
  sizesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sizeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    minWidth: 80,
    alignItems: 'center',
  },
  sizeBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sizeBtnText: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    fontWeight: typography.weightMedium,
    color: colors.textPrimary,
  },
  sizeBtnTextActive: {
    color: colors.textInverse,
    fontWeight: typography.weightBold,
  },
  subLabel: {
    fontFamily: typography.fontSans,
    fontSize: 10,
    fontWeight: typography.weightBold,
    letterSpacing: 1,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontFamily: typography.fontSans,
    fontSize: 13,
    color: colors.textPrimary,
  },
  textArea: {
    height: 80,
  },
  checkoutBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.screenPadding,
    marginTop: spacing.xxl,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  totalLabel: {
    fontFamily: typography.fontSans,
    fontSize: 9,
    fontWeight: typography.weightBold,
    letterSpacing: 1,
    color: colors.textSecondary,
  },
  totalValue: {
    fontFamily: typography.fontSans,
    fontSize: 20,
    fontWeight: typography.weightBold,
    color: colors.primary,
    marginVertical: 2,
  },
  totalSub: {
    fontFamily: typography.fontSans,
    fontSize: 10,
    color: colors.textMuted,
  },
});

export default CustomizeScreen;
