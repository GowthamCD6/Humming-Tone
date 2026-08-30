import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '../components/Icons';
import { colors, shadows } from '../theme/colors';
import { typography, spacing } from '../theme/typography';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { ProductService } from '../api/services';
import { GoogleAuthModal } from '../components/GoogleAuthModal';

const { width } = Dimensions.get('window');

export const ProductDetailsScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuth();
  const { productId, initialProduct } = route.params || {};
  
  const [product, setProduct] = useState(initialProduct || null);
  const [loading, setLoading] = useState(!initialProduct);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isExpandedDesc, setIsExpandedDesc] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({
    totalReviews: 0,
    averageRating: 5.0,
    ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Review Form Inputs
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewerName, setReviewerName] = useState(user?.name || '');
  const [reviewerEmail, setReviewerEmail] = useState(user?.email || '');

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const targetId = productId || initialProduct?.id;

  const fetchDetails = async () => {
    if (targetId) {
      try {
        setLoading(true);
        const data = await ProductService.fetchProductById(targetId);
        if (data) {
          setProduct(data);
          if (Array.isArray(data.variants) && data.variants.length > 0) {
            setSelectedVariant(data.variants[0]);
          }
        }
      } catch (e) {
        console.warn('Error fetching product details:', e);
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchReviews = async () => {
    if (targetId) {
      try {
        setLoadingReviews(true);
        const data = await ProductService.fetchProductReviews(targetId);
        if (data) {
          setReviews(data.reviews || []);
          if (data.stats) {
            setReviewStats(data.stats);
          }
        }
      } catch (e) {
        console.warn('Error fetching reviews:', e);
      } finally {
        setLoadingReviews(false);
      }
    }
  };

  useEffect(() => {
    fetchDetails();
    fetchReviews();
  }, [targetId]);

  useEffect(() => {
    if (product && Array.isArray(product.variants) && product.variants.length > 0 && !selectedVariant) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  if (loading && !product) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B4E37" />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.notFoundContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
        <Text style={styles.notFoundText}>Product not found or unavailable.</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>Return to Catalog</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Gallery Images from DB
  const galleryImages = (Array.isArray(product.images) && product.images.length > 0)
    ? product.images
    : [product.image].filter(Boolean);

  const isWishlisted = isInWishlist(product.id);
  
  // Dynamic Pricing from selected variant or base product
  const currentPrice = selectedVariant?.price != null ? selectedVariant.price : (product.price || 0);
  const originalPrice = selectedVariant?.original_price != null ? selectedVariant.original_price : (product.original_price || currentPrice);
  const hasDiscount = originalPrice > currentPrice;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;
  
  const currentStock = selectedVariant?.stock_quantity != null ? selectedVariant.stock_quantity : (product.stock_quantity || 10);
  const isOutOfStock = currentStock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      Alert.alert('Out of Stock', 'This size is currently sold out. Please choose another size.');
      return;
    }

    const sizeToUse = selectedVariant?.size || 'Standard';
    addToCart(product, sizeToUse, quantity, selectedVariant);

    Alert.alert(
      'Added to Bag',
      `${product.name} (Size: ${sizeToUse}) has been added to your shopping bag.`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Bag', onPress: () => navigation.navigate('MainTabs', { screen: 'CartTab' }) },
      ]
    );
  };

  const handleBuyNow = () => {
    if (isOutOfStock) {
      Alert.alert('Out of Stock', 'This size is currently sold out. Please choose another size.');
      return;
    }

    const sizeToUse = selectedVariant?.size || 'Standard';
    addToCart(product, sizeToUse, quantity, selectedVariant);

    if (!isAuthenticated) {
      setShowGoogleModal(true);
    } else {
      navigation.navigate('Checkout');
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewerName.trim()) {
      Alert.alert('Name Required', 'Please enter your name to submit a review.');
      return;
    }
    if (!reviewerEmail.trim() || !reviewerEmail.includes('@')) {
      Alert.alert('Email Required', 'Please enter a valid email address.');
      return;
    }
    if (!reviewComment.trim()) {
      Alert.alert('Review Required', 'Please write a brief comment describing your experience.');
      return;
    }

    try {
      setSubmittingReview(true);
      await ProductService.submitReview(product.id, {
        reviewer_name: reviewerName.trim(),
        reviewer_email: reviewerEmail.trim(),
        rating: reviewRating,
        title: reviewTitle.trim() || null,
        comment: reviewComment.trim(),
      });

      Alert.alert(
        'Review Submitted',
        'Thank you! Your verified review has been submitted for approval.',
        [{ text: 'OK' }]
      );
      setShowReviewModal(false);
      setReviewTitle('');
      setReviewComment('');
      fetchReviews();
    } catch (e) {
      Alert.alert('Submission Error', e.response?.data?.message || 'Unable to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (ratingCount, starSize = 14) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= ratingCount ? 'star' : i - ratingCount < 1 && i - ratingCount > 0 ? 'star-half' : 'star-outline'}
          size={starSize}
          color="#D4AF37"
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Recently';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return 'Recently';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF8F5" />

      {/* ── 1. TOP FLOATING HEADER BAR ── */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity
          style={styles.circleIconBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {product.brand || 'Humming Tone'}
        </Text>

        <TouchableOpacity
          style={styles.circleIconBtn}
          onPress={() => toggleWishlist(product)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isWishlisted ? 'heart' : 'heart-outline'}
            size={20}
            color={isWishlisted ? '#E53E3E' : colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 2. MAIN GALLERY VIEWER ── */}
        <View style={styles.mainImageWrap}>
          <Image
            source={{ uri: galleryImages[selectedImageIndex] || product.image }}
            style={styles.mainImage}
            resizeMode="cover"
          />

          {/* Discount Badge on Image */}
          {hasDiscount && (
            <View style={styles.imageDiscountBadge}>
              <Text style={styles.imageDiscountText}>{discountPercent}% OFF</Text>
            </View>
          )}

          {/* Image Counter Badge */}
          {galleryImages.length > 1 && (
            <View style={styles.imageCounterBadge}>
              <Text style={styles.imageCounterText}>
                {selectedImageIndex + 1} / {galleryImages.length}
              </Text>
            </View>
          )}
        </View>

        {/* Thumbnail Selector */}
        {galleryImages.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailsRow}
          >
            {galleryImages.map((img, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.thumbnailWrap,
                  selectedImageIndex === idx && styles.thumbnailWrapActive,
                ]}
                onPress={() => setSelectedImageIndex(idx)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: img }} style={styles.thumbnailImg} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* ── 3. PRODUCT INFO & BRAND SECTION ── */}
        <View style={styles.infoSection}>
          {/* Brand & Subcategory tags */}
          <View style={styles.tagsRow}>
            <Text style={styles.brandTag}>
              {(product.brand || 'HUMMING & TONE').toUpperCase()}
            </Text>
            {product.subcategory ? (
              <View style={styles.subcatPill}>
                <Text style={styles.subcatText}>{product.subcategory}</Text>
              </View>
            ) : null}
          </View>

          {/* Product Name */}
          <Text style={styles.productTitle}>{product.name}</Text>

          {/* SKU & Star Rating Quick Summary */}
          <View style={styles.metaRow}>
            {product.sku ? (
              <Text style={styles.skuText}>SKU: {product.sku}</Text>
            ) : null}

            <View style={styles.starQuickBadge}>
              <Ionicons name="star" size={13} color="#D4AF37" />
              <Text style={styles.starQuickRating}>
                {reviewStats.averageRating > 0 ? Number(reviewStats.averageRating).toFixed(1) : '5.0'}
              </Text>
              <Text style={styles.starQuickCount}>
                ({reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? 'review' : 'reviews'})
              </Text>
            </View>
          </View>

          {/* Pricing Row */}
          <View style={styles.priceRow}>
            <Text style={styles.currentPriceText}>₹{currentPrice.toLocaleString('en-IN')}</Text>
            {hasDiscount && (
              <Text style={styles.originalPriceText}>₹{originalPrice.toLocaleString('en-IN')}</Text>
            )}
            {hasDiscount && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountBadgeText}>{discountPercent}% SAVINGS</Text>
              </View>
            )}
          </View>
          <Text style={styles.taxInclusiveText}>Inclusive of all taxes & quality craftsmanship guarantee</Text>

          <View style={styles.divider} />

          {/* ── 4. SIZES & VARIANTS (From Database) ── */}
          {Array.isArray(product.variants) && product.variants.length > 0 ? (
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeading}>SELECT SIZE</Text>
                {/* Stock Status Badge */}
                <View
                  style={[
                    styles.stockBadge,
                    isOutOfStock ? styles.stockBadgeOut : currentStock <= 5 ? styles.stockBadgeLow : styles.stockBadgeIn,
                  ]}
                >
                  <View
                    style={[
                      styles.stockDot,
                      isOutOfStock ? styles.stockDotOut : currentStock <= 5 ? styles.stockDotLow : styles.stockDotIn,
                    ]}
                  />
                  <Text
                    style={[
                      styles.stockText,
                      isOutOfStock ? styles.stockTextOut : currentStock <= 5 ? styles.stockTextLow : styles.stockTextIn,
                    ]}
                  >
                    {isOutOfStock ? 'Sold Out' : currentStock <= 5 ? `Only ${currentStock} left!` : `In Stock (${currentStock})`}
                  </Text>
                </View>
              </View>

              <View style={styles.sizePillsRow}>
                {product.variants.map((v, index) => {
                  const isSelected = selectedVariant?.size === v.size;
                  const isSizeOut = (v.stock_quantity || 0) <= 0;

                  return (
                    <TouchableOpacity
                      key={v.size || index}
                      style={[
                        styles.sizePill,
                        isSelected && styles.sizePillActive,
                        isSizeOut && styles.sizePillDisabled,
                      ]}
                      onPress={() => setSelectedVariant(v)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.sizePillText,
                          isSelected && styles.sizePillTextActive,
                          isSizeOut && styles.sizePillTextDisabled,
                        ]}
                      >
                        {v.size}
                      </Text>
                      {v.price && (
                        <Text
                          style={[
                            styles.sizePriceSub,
                            isSelected && styles.sizePriceSubActive,
                          ]}
                        >
                          ₹{v.price}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : null}

          {/* ── 5. COLOR & MATERIAL HIGHLIGHT ── */}
          {(product.color || product.material || product.gender) && (
            <View style={styles.highlightPillRow}>
              {product.color ? (
                <View style={styles.highlightCard}>
                  <Ionicons name="color-palette-outline" size={16} color="#6B4E37" />
                  <Text style={styles.highlightLabel}>Color</Text>
                  <Text style={styles.highlightValue}>{product.color}</Text>
                </View>
              ) : null}

              {product.material ? (
                <View style={styles.highlightCard}>
                  <Ionicons name="layers-outline" size={16} color="#6B4E37" />
                  <Text style={styles.highlightLabel}>Material</Text>
                  <Text style={styles.highlightValue}>{product.material}</Text>
                </View>
              ) : null}

              {product.gender ? (
                <View style={styles.highlightCard}>
                  <Ionicons name="person-outline" size={16} color="#6B4E37" />
                  <Text style={styles.highlightLabel}>Gender</Text>
                  <Text style={styles.highlightValue}>{product.gender}</Text>
                </View>
              ) : null}
            </View>
          )}

          <View style={styles.divider} />

          {/* ── 6. DESCRIPTION / ABOUT (From Database) ── */}
          {product.about || product.description ? (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>PRODUCT STORY & DETAILS</Text>
              <Text
                style={styles.descriptionText}
                numberOfLines={isExpandedDesc ? undefined : 4}
              >
                {product.about || product.description}
              </Text>
              <TouchableOpacity
                onPress={() => setIsExpandedDesc(!isExpandedDesc)}
                style={styles.readMoreTouch}
              >
                <Text style={styles.readMoreText}>
                  {isExpandedDesc ? 'Read Less' : 'Read Full Description'}
                </Text>
                <Ionicons
                  name={isExpandedDesc ? 'chevron-up' : 'chevron-down'}
                  size={14}
                  color="#6B4E37"
                />
              </TouchableOpacity>
            </View>
          ) : null}

          {/* ── 7. CARE INSTRUCTIONS (From Database) ── */}
          {product.care_instructions ? (
            <View style={styles.careBox}>
              <View style={styles.careHeader}>
                <Ionicons name="sparkles-outline" size={16} color="#6B4E37" />
                <Text style={styles.careTitle}>GARMENT CARE INSTRUCTIONS</Text>
              </View>
              <Text style={styles.careText}>{product.care_instructions}</Text>
            </View>
          ) : null}

          {/* ── 8. COMPLETE SPECIFICATIONS TABLE (From Database) ── */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeading}>SPECIFICATIONS</Text>
            <View style={styles.specsTable}>
              {product.brand ? (
                <View style={styles.specRow}>
                  <Text style={styles.specKey}>Brand</Text>
                  <Text style={styles.specVal}>{product.brand}</Text>
                </View>
              ) : null}

              {product.sku ? (
                <View style={styles.specRow}>
                  <Text style={styles.specKey}>SKU Code</Text>
                  <Text style={styles.specVal}>{product.sku}</Text>
                </View>
              ) : null}

              {product.category_name || product.category ? (
                <View style={styles.specRow}>
                  <Text style={styles.specKey}>Category</Text>
                  <Text style={styles.specVal}>{product.category_name || product.category}</Text>
                </View>
              ) : null}

              {product.material ? (
                <View style={styles.specRow}>
                  <Text style={styles.specKey}>Fabric & Material</Text>
                  <Text style={styles.specVal}>{product.material}</Text>
                </View>
              ) : null}

              {product.color ? (
                <View style={styles.specRow}>
                  <Text style={styles.specKey}>Color</Text>
                  <Text style={styles.specVal}>{product.color}</Text>
                </View>
              ) : null}

              {product.age_range ? (
                <View style={styles.specRow}>
                  <Text style={styles.specKey}>Age Group</Text>
                  <Text style={styles.specVal}>{product.age_range} Years</Text>
                </View>
              ) : null}

              {product.weight ? (
                <View style={styles.specRow}>
                  <Text style={styles.specKey}>Weight</Text>
                  <Text style={styles.specVal}>{product.weight} g</Text>
                </View>
              ) : null}

              {product.dimensions ? (
                <View style={styles.specRow}>
                  <Text style={styles.specKey}>Dimensions</Text>
                  <Text style={styles.specVal}>{product.dimensions} cm</Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.divider} />

          {/* ── 9. PRODUCT REVIEWS & RATINGS (Cool Modern Luxury UI) ── */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeaderRow}>
              <View>
                <Text style={styles.sectionHeading}>RATINGS & REVIEWS</Text>
                <Text style={styles.reviewsSubtitle}>Verified Customer Impressions</Text>
              </View>

              <TouchableOpacity
                style={styles.writeReviewBtn}
                onPress={() => setShowReviewModal(true)}
                activeOpacity={0.85}
              >
                <Ionicons name="create-outline" size={15} color="#FFFFFF" />
                <Text style={styles.writeReviewBtnText}>Write Review</Text>
              </TouchableOpacity>
            </View>

            {/* Rating Overview Score Card */}
            <View style={styles.ratingOverviewCard}>
              {/* Left Score Block */}
              <View style={styles.scoreBlock}>
                <Text style={styles.bigScoreNumber}>
                  {reviewStats.averageRating > 0 ? Number(reviewStats.averageRating).toFixed(1) : '5.0'}
                </Text>
                <View style={styles.starsRow}>
                  {renderStars(reviewStats.averageRating || 5, 14)}
                </View>
                <Text style={styles.totalRatingLabel}>
                  {reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? 'Rating' : 'Ratings'}
                </Text>
              </View>

              {/* Vertical Divider */}
              <View style={styles.scoreDivider} />

              {/* Right Breakdown Bars */}
              <View style={styles.barsBlock}>
                {[5, 4, 3, 2, 1].map((starNum) => {
                  const count = reviewStats.ratingBreakdown?.[starNum] || 0;
                  const total = reviewStats.totalReviews || 1;
                  const percent = reviewStats.totalReviews > 0 ? (count / total) * 100 : starNum === 5 ? 100 : 0;

                  return (
                    <View key={starNum} style={styles.barRow}>
                      <Text style={styles.barStarNum}>{starNum}★</Text>
                      <View style={styles.barTrack}>
                        <View style={[styles.barFill, { width: `${percent}%` }]} />
                      </View>
                      <Text style={styles.barCount}>{count}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Reviews List */}
            {loadingReviews ? (
              <ActivityIndicator size="small" color="#6B4E37" style={{ marginVertical: 16 }} />
            ) : reviews.length > 0 ? (
              <View style={styles.reviewsList}>
                {reviews.map((rev) => {
                  const initials = rev.reviewer_name
                    ? rev.reviewer_name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase()
                    : 'U';

                  return (
                    <View key={rev.id} style={styles.reviewCard}>
                      {/* Review Header */}
                      <View style={styles.revCardHeader}>
                        <View style={styles.revAvatar}>
                          <Text style={styles.revAvatarText}>{initials}</Text>
                        </View>

                        <View style={{ flex: 1 }}>
                          <View style={styles.revNameRow}>
                            <Text style={styles.revName}>{rev.reviewer_name}</Text>
                            <View style={styles.verifiedBadge}>
                              <Ionicons name="checkmark-circle" size={12} color="#38A169" />
                              <Text style={styles.verifiedText}>Verified Buyer</Text>
                            </View>
                          </View>
                          <Text style={styles.revDate}>{formatDate(rev.created_at)}</Text>
                        </View>

                        <View style={styles.revStars}>
                          {renderStars(rev.rating, 12)}
                        </View>
                      </View>

                      {/* Review Title */}
                      {rev.title ? (
                        <Text style={styles.revTitle}>{rev.title}</Text>
                      ) : null}

                      {/* Review Comment */}
                      <Text style={styles.revComment}>{rev.comment}</Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyReviewsCard}>
                <Ionicons name="chatbubbles-outline" size={30} color="#A3998F" />
                <Text style={styles.emptyReviewsTitle}>No Reviews Yet</Text>
                <Text style={styles.emptyReviewsSubtitle}>
                  Be the first to share your thoughts and style experience with this garment.
                </Text>
                <TouchableOpacity
                  style={styles.emptyWriteBtn}
                  onPress={() => setShowReviewModal(true)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.emptyWriteBtnText}>Write First Review</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Bottom spacer with comfortable clearance */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* ── 10. STICKY BOTTOM ACTION BAR ── */}
      <View style={[styles.bottomStickyBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.bottomPriceWrap}>
          <Text style={styles.totalPriceLabel}>Total Price</Text>
          <Text style={styles.totalPriceValue}>₹{currentPrice.toLocaleString('en-IN')}</Text>
        </View>

        <View style={styles.bottomActionButtonsRow}>
          {/* Add to Bag Button */}
          <TouchableOpacity
            style={[styles.addToBagBtn, isOutOfStock && styles.actionBtnDisabled]}
            onPress={handleAddToCart}
            activeOpacity={0.85}
            disabled={isOutOfStock}
          >
            <Ionicons
              name="bag-handle-outline"
              size={16}
              color={isOutOfStock ? '#A3998F' : '#6B4E37'}
            />
            <Text style={[styles.addToBagBtnText, isOutOfStock && { color: '#A3998F' }]}>
              Add to Bag
            </Text>
          </TouchableOpacity>

          {/* Buy Now Button */}
          <TouchableOpacity
            style={[styles.buyNowBtn, isOutOfStock && styles.actionBtnDisabled]}
            onPress={handleBuyNow}
            activeOpacity={0.88}
            disabled={isOutOfStock}
          >
            <Ionicons
              name={isOutOfStock ? 'alert-circle-outline' : 'flash'}
              size={15}
              color="#FFFFFF"
            />
            <Text style={styles.buyNowBtnText}>
              {isOutOfStock ? 'Sold Out' : 'Buy Now'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── 11. WRITE REVIEW MODAL ── */}
      <Modal
        visible={showReviewModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReviewModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalBackdrop}
        >
          <View style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Rate & Review Piece</Text>
                <Text style={styles.modalSub}>{product.name}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowReviewModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color="#1E1B18" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 440 }}>
              {/* Star Rating Picker */}
              <Text style={styles.inputLabel}>YOUR OVERALL RATING</Text>
              <View style={styles.starPickerRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setReviewRating(star)}
                    style={styles.starPickerBtn}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={star <= reviewRating ? 'star' : 'star-outline'}
                      size={32}
                      color="#D4AF37"
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Review Title Input */}
              <Text style={styles.inputLabel}>HEADLINE / TITLE (OPTIONAL)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Excellent fabric and structured drape!"
                placeholderTextColor="#A3998F"
                value={reviewTitle}
                onChangeText={setReviewTitle}
              />

              {/* Review Comment Input */}
              <Text style={styles.inputLabel}>YOUR REVIEW / FEEDBACK *</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                placeholder="Share your thoughts about the fit, material, comfort, and styling..."
                placeholderTextColor="#A3998F"
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
                value={reviewComment}
                onChangeText={setReviewComment}
              />

              {/* Reviewer Name */}
              <Text style={styles.inputLabel}>YOUR NAME *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="John Doe"
                placeholderTextColor="#A3998F"
                value={reviewerName}
                onChangeText={setReviewerName}
              />

              {/* Reviewer Email */}
              <Text style={styles.inputLabel}>YOUR EMAIL (FOR VERIFICATION) *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="john@example.com"
                placeholderTextColor="#A3998F"
                keyboardType="email-address"
                autoCapitalize="none"
                value={reviewerEmail}
                onChangeText={setReviewerEmail}
              />
            </ScrollView>

            <TouchableOpacity
              style={[styles.submitReviewBtn, submittingReview && { opacity: 0.7 }]}
              onPress={handleReviewSubmit}
              activeOpacity={0.85}
              disabled={submittingReview}
            >
              {submittingReview ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.submitReviewBtnText}>Submit Verified Review</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Google Sign-In Gate Modal */}
      <GoogleAuthModal
        visible={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSuccess={() => {
          setShowGoogleModal(false);
          navigation.navigate('Checkout');
        }}
        title="Sign In to Complete Purchase"
        subtitle="Sign in with your Google account to auto-fill delivery details, track orders, and secure express checkout."
      />
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF8F5',
  },
  loadingText: {
    marginTop: 12,
    fontFamily: typography.fontSans,
    fontSize: 14,
    color: colors.textSecondary,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#FAF8F5',
  },
  notFoundText: {
    fontFamily: typography.fontSans,
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
  backBtn: {
    backgroundColor: '#1E1B18',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontFamily: typography.fontSansBold,
    fontSize: 14,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#FAF8F5',
    zIndex: 10,
  },
  circleIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EAE4DC',
    ...shadows.card,
  },
  headerTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 15,
    color: '#1E1B18',
    letterSpacing: 0.5,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  mainImageWrap: {
    width: width - 32,
    height: (width - 32) * 1.12,
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#EDE7E0',
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageDiscountBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: '#C53030',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  imageDiscountText: {
    color: '#FFFFFF',
    fontFamily: typography.fontSansBold,
    fontSize: 11.5,
    letterSpacing: 0.5,
  },
  imageCounterBadge: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    backgroundColor: 'rgba(30, 27, 24, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCounterText: {
    color: '#FFFFFF',
    fontFamily: typography.fontSans,
    fontSize: 12,
  },
  thumbnailsRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  thumbnailWrap: {
    width: 56,
    height: 56,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#EDE7E0',
  },
  thumbnailWrapActive: {
    borderColor: '#6B4E37',
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  brandTag: {
    fontFamily: typography.fontSansBold,
    fontSize: 12,
    color: '#6B4E37',
    letterSpacing: 1,
  },
  subcatPill: {
    backgroundColor: '#EDE7E0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  subcatText: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    color: '#5C544E',
  },
  productTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 20,
    color: '#1E1B18',
    lineHeight: 26,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  skuText: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    color: '#8A7F75',
  },
  starQuickBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  starQuickRating: {
    fontFamily: typography.fontSansBold,
    fontSize: 12,
    color: '#6B4E37',
  },
  starQuickCount: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    color: '#8A7F75',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  currentPriceText: {
    fontFamily: typography.fontSansBold,
    fontSize: 22,
    color: '#1E1B18',
  },
  originalPriceText: {
    fontFamily: typography.fontSans,
    fontSize: 16,
    color: '#A3998F',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#EBF8FF',
    borderWidth: 1,
    borderColor: '#BEE3F8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discountBadgeText: {
    fontFamily: typography.fontSansBold,
    fontSize: 11,
    color: '#2B6CB0',
  },
  taxInclusiveText: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    color: '#8A7F75',
    marginTop: 3,
  },
  divider: {
    height: 1,
    backgroundColor: '#EAE4DC',
    marginVertical: 14,
  },
  sectionBlock: {
    marginBottom: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionHeading: {
    fontFamily: typography.fontSansBold,
    fontSize: 13,
    color: '#1E1B18',
    letterSpacing: 0.8,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  stockBadgeIn: {
    backgroundColor: '#F0FFF4',
  },
  stockBadgeLow: {
    backgroundColor: '#FFFAF0',
  },
  stockBadgeOut: {
    backgroundColor: '#FFF5F5',
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  stockDotIn: {
    backgroundColor: '#38A169',
  },
  stockDotLow: {
    backgroundColor: '#DD6B20',
  },
  stockDotOut: {
    backgroundColor: '#E53E3E',
  },
  stockText: {
    fontFamily: typography.fontSansBold,
    fontSize: 11,
  },
  stockTextIn: {
    color: '#2F855A',
  },
  stockTextLow: {
    color: '#C05621',
  },
  stockTextOut: {
    color: '#C53030',
  },
  sizePillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sizePill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EAE4DC',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 56,
  },
  sizePillActive: {
    backgroundColor: '#1E1B18',
    borderColor: '#1E1B18',
  },
  sizePillDisabled: {
    backgroundColor: '#F5F2ED',
    borderColor: '#EAE4DC',
    opacity: 0.5,
  },
  sizePillText: {
    fontFamily: typography.fontSansBold,
    fontSize: 14,
    color: '#1E1B18',
  },
  sizePillTextActive: {
    color: '#FFFFFF',
  },
  sizePillTextDisabled: {
    color: '#A3998F',
  },
  sizePriceSub: {
    fontFamily: typography.fontSans,
    fontSize: 10,
    color: '#8A7F75',
    marginTop: 2,
  },
  sizePriceSubActive: {
    color: '#D4AF37',
  },
  highlightPillRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 4,
  },
  highlightCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAE4DC',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
  },
  highlightLabel: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    color: '#8A7F75',
    marginTop: 4,
  },
  highlightValue: {
    fontFamily: typography.fontSansBold,
    fontSize: 13,
    color: '#1E1B18',
    marginTop: 2,
    textAlign: 'center',
  },
  descriptionText: {
    fontFamily: typography.fontSans,
    fontSize: 13.5,
    color: '#5C544E',
    lineHeight: 21,
    marginTop: 6,
  },
  readMoreTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  readMoreText: {
    fontFamily: typography.fontSansBold,
    fontSize: 13,
    color: '#6B4E37',
  },
  careBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAE4DC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  careHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  careTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 12,
    color: '#6B4E37',
    letterSpacing: 0.5,
  },
  careText: {
    fontFamily: typography.fontSans,
    fontSize: 12.5,
    color: '#5C544E',
    lineHeight: 19,
  },
  specsTable: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAE4DC',
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F2ED',
  },
  specKey: {
    fontFamily: typography.fontSans,
    fontSize: 12.5,
    color: '#8A7F75',
  },
  specVal: {
    fontFamily: typography.fontSansBold,
    fontSize: 12.5,
    color: '#1E1B18',
  },

  /* ── REVIEWS SECTION ── */
  reviewsSection: {
    marginTop: 2,
  },
  reviewsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  reviewsSubtitle: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    color: '#8A7F75',
    marginTop: 1,
  },
  writeReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#6B4E37',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    ...shadows.card,
  },
  writeReviewBtnText: {
    color: '#FFFFFF',
    fontFamily: typography.fontSansBold,
    fontSize: 12,
  },
  ratingOverviewCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAE4DC',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    marginBottom: 14,
  },
  scoreBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 12,
    minWidth: 90,
  },
  bigScoreNumber: {
    fontFamily: typography.fontSansBold,
    fontSize: 32,
    color: '#1E1B18',
    lineHeight: 36,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    marginBottom: 3,
  },
  totalRatingLabel: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    color: '#8A7F75',
  },
  scoreDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#EAE4DC',
    marginRight: 12,
  },
  barsBlock: {
    flex: 1,
    gap: 4,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  barStarNum: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    color: '#5C544E',
    width: 20,
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#EDE7E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 3,
  },
  barCount: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    color: '#8A7F75',
    width: 18,
    textAlign: 'right',
  },
  reviewsList: {
    gap: 10,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAE4DC',
    borderRadius: 14,
    padding: 12,
  },
  revCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  revAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EDE7E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  revAvatarText: {
    fontFamily: typography.fontSansBold,
    fontSize: 12.5,
    color: '#6B4E37',
  },
  revNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  revName: {
    fontFamily: typography.fontSansBold,
    fontSize: 13,
    color: '#1E1B18',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#F0FFF4',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  verifiedText: {
    fontFamily: typography.fontSans,
    fontSize: 9.5,
    color: '#2F855A',
  },
  revDate: {
    fontFamily: typography.fontSans,
    fontSize: 10.5,
    color: '#A3998F',
    marginTop: 1,
  },
  revStars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  revTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 12.5,
    color: '#1E1B18',
    marginBottom: 3,
  },
  revComment: {
    fontFamily: typography.fontSans,
    fontSize: 12.5,
    color: '#5C544E',
    lineHeight: 18,
  },
  emptyReviewsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAE4DC',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyReviewsTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 14.5,
    color: '#1E1B18',
    marginTop: 6,
  },
  emptyReviewsSubtitle: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    color: '#8A7F75',
    textAlign: 'center',
    marginTop: 3,
    marginBottom: 12,
    lineHeight: 17,
  },
  emptyWriteBtn: {
    backgroundColor: '#1E1B18',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  emptyWriteBtnText: {
    color: '#FFFFFF',
    fontFamily: typography.fontSansBold,
    fontSize: 12,
  },

  /* ── BOTTOM STICKY BAR ── */
  bottomStickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EAE4DC',
    paddingHorizontal: 16,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    ...shadows.bottomBar,
  },
  bottomPriceWrap: {
    justifyContent: 'center',
    minWidth: 70,
  },
  totalPriceLabel: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    color: '#8A7F75',
  },
  totalPriceValue: {
    fontFamily: typography.fontSansBold,
    fontSize: 19,
    color: '#1E1B18',
  },
  bottomActionButtonsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addToBagBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#FAF5EE',
    borderWidth: 1.5,
    borderColor: '#6B4E37',
    paddingVertical: 12,
    borderRadius: 24,
  },
  addToBagBtnText: {
    fontFamily: typography.fontSansBold,
    fontSize: 13,
    color: '#6B4E37',
  },
  buyNowBtn: {
    flex: 1.15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#1E1B18',
    paddingVertical: 12,
    borderRadius: 24,
    ...shadows.card,
  },
  buyNowBtnText: {
    fontFamily: typography.fontSansBold,
    fontSize: 13.5,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  actionBtnDisabled: {
    backgroundColor: '#EDE7E0',
    borderColor: '#EDE7E0',
  },

  /* ── MODAL ── */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FAF8F5',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EAE4DC',
  },
  modalTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 17,
    color: '#1E1B18',
  },
  modalSub: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    color: '#8A7F75',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EDE7E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: {
    fontFamily: typography.fontSansBold,
    fontSize: 11,
    color: '#5C544E',
    letterSpacing: 0.5,
    marginTop: 10,
    marginBottom: 6,
  },
  starPickerRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  starPickerBtn: {
    padding: 2,
  },
  modalInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAE4DC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: typography.fontSans,
    fontSize: 14,
    color: '#1E1B18',
  },
  modalTextArea: {
    height: 80,
    paddingTop: 10,
  },
  submitReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1E1B18',
    paddingVertical: 13,
    borderRadius: 24,
    marginTop: 14,
  },
  submitReviewBtnText: {
    color: '#FFFFFF',
    fontFamily: typography.fontSansBold,
    fontSize: 14,
  },
});
