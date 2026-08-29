import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '../components/Icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography, spacing } from '../theme/typography';
import { Header } from '../components/Header';
import { StarRating } from '../components/StarRating';
import { Button } from '../components/Button';
import { ProductService } from '../api/services';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const { width } = Dimensions.get('window');

export const ProductDetailsScreen = ({ route, navigation }) => {
  const { productId, initialProduct } = route.params || {};
  const insets = useSafeAreaInsets();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();


  const [product, setProduct] = useState(initialProduct || null);
  const [loading, setLoading] = useState(!initialProduct);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reviewsData, setReviewsData] = useState({ reviews: [], averageRating: 5, totalReviews: 0 });
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Review form states
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const data = await ProductService.fetchProductDetails(productId);
        setProduct(data);
        if (data.variants && data.variants.length > 0) {
          setSelectedSize(data.variants[0].size);
        }
      } catch (e) {
        console.warn('Failed to load product details:', e);
      } finally {
        setLoading(false);
      }
    };

    const loadReviews = async () => {
      try {
        const rev = await ProductService.fetchProductReviews(productId);
        setReviewsData(rev);
      } catch (e) {
        console.warn('Failed to load reviews:', e);
      } finally {
        setReviewsLoading(false);
      }
    };

    loadDetails();
    loadReviews();
  }, [productId]);

  const handleAddToCart = (showToast = true) => {
    if (!product) return;
    const selectedVariant = product.variants?.find((v) => v.size === selectedSize);
    addToCart(product, selectedVariant || { size: selectedSize || 'Standard' }, quantity);

    if (showToast) {
      Alert.alert(
        'Added to Bag',
        `${product.name} (Size: ${selectedSize || 'Standard'}) added to your shopping bag.`,
        [
          { text: 'Continue Shopping', style: 'cancel' },
          { text: 'View Bag', onPress: () => navigation.navigate('CartTab') },
        ]
      );
    }
  };

  const handleBuyNow = () => {
    handleAddToCart(false);
    navigation.navigate('CartTab');
  };

  const handleSubmitReview = async () => {
    if (!reviewName.trim() || !reviewComment.trim()) {
      Alert.alert('Missing Details', 'Please enter your name and comment.');
      return;
    }
    try {
      setSubmittingReview(true);
      await ProductService.submitReview(productId, {
        customer_name: reviewName,
        rating: reviewRating,
        comment: reviewComment,
      });
      Alert.alert('Review Submitted', 'Thank you for sharing your feedback!');
      setShowReviewForm(false);
      setReviewComment('');
      // Reload reviews
      const updatedReviews = await ProductService.fetchProductReviews(productId);
      setReviewsData(updatedReviews);
    } catch (e) {
      Alert.alert('Error', 'Unable to submit review at this time.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading || !product) {
    return (
      <View style={styles.loadingContainer}>
        <Header showBack={true} />
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />
      </View>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const formattedPrice = `₹${(product.price || 0).toLocaleString('en-IN')}`;

  const availableSizes = product.variants && product.variants.length > 0
    ? product.variants.map((v) => v.size)
    : ['S', 'M', 'L', 'XL', 'XXL'];

  return (
    <View style={styles.container}>
      <Header title={product.name} showBack={true} />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Main Image Slider */}
        <View style={styles.imageGallery}>
          <Image
            source={{ uri: images[selectedImageIndex] || product.image }}
            style={styles.mainImage}
            resizeMode="cover"
          />

          <TouchableOpacity
            style={styles.detailsWishlistBtn}
            onPress={() => toggleWishlist(product)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isInWishlist(product?.id) ? 'heart' : 'heart-outline'}
              size={22}
              color={isInWishlist(product?.id) ? colors.accent : colors.textPrimary}
            />
          </TouchableOpacity>

          {/* Thumbnail Dots/Images Bar */}
          {images.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailScroll}
            >
              {images.map((imgUri, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImageIndex(index)}
                  style={[
                    styles.thumbnail,
                    selectedImageIndex === index && styles.thumbnailActive,
                  ]}
                >
                  <Image source={{ uri: imgUri }} style={styles.thumbImage} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Product Details Section */}
        <View style={styles.detailsContent}>
          <Text style={styles.brandTag}>
            {product.brand || product.category || 'ATELIER LUXURY COLLECTION'}
          </Text>
          <Text style={styles.productTitle}>{product.name}</Text>

          {/* Rating Summary */}
          <View style={styles.ratingRow}>
            <StarRating rating={reviewsData.averageRating || 5} size={16} />
            <Text style={styles.ratingText}>
              {(reviewsData.averageRating || 5).toFixed(1)} ({reviewsData.totalReviews || reviewsData.reviews?.length || 0} reviews)
            </Text>
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.priceValue}>{formattedPrice}</Text>
            <Text style={styles.taxIncluded}>All Taxes & Duties Included</Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Size Selector */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionBlockHeader}>
              <Text style={styles.blockTitle}>SELECT SIZE</Text>
              <Text style={styles.sizeGuideText}>Size Guide</Text>
            </View>
            <View style={styles.sizesRow}>
              {availableSizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizePill,
                    selectedSize === size && styles.sizePillActive,
                  ]}
                  onPress={() => setSelectedSize(size)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.sizePillText,
                      selectedSize === size && styles.sizePillTextActive,
                    ]}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quantity Selector */}
          <View style={styles.sectionBlock}>
            <Text style={styles.blockTitle}>QUANTITY</Text>
            <View style={styles.qtyControl}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Ionicons name="remove" size={18} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Ionicons name="add" size={18} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          <View style={styles.sectionBlock}>
            <Text style={styles.blockTitle}>PRODUCT DETAILS & CRAFTSMANSHIP</Text>
            <Text style={styles.descriptionText}>
              {product.description ||
                'Crafted with premium natural fibers and tailored to perfection. Features reinforced stitching, breathable luxury drape, and timeless comfort design.'}
            </Text>
          </View>

          {/* Trust Perks List */}
          <View style={styles.perksList}>
            <View style={styles.perkItem}>
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
              <Text style={styles.perkText}>100% Authentic Humming Tone Quality</Text>
            </View>
            <View style={styles.perkItem}>
              <Ionicons name="cube-outline" size={20} color={colors.primary} />
              <Text style={styles.perkText}>Complimentary Express Delivery & Easy Returns</Text>
            </View>
          </View>

          {/* Customer Reviews Section */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.reviewsTitle}>Customer Reviews</Text>
              <TouchableOpacity
                style={styles.writeReviewBtn}
                onPress={() => setShowReviewForm(!showReviewForm)}
              >
                <Text style={styles.writeReviewText}>
                  {showReviewForm ? 'Close Form' : 'Write a Review'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Write Review Form */}
            {showReviewForm && (
              <View style={styles.reviewForm}>
                <Text style={styles.formTitle}>Write a Review</Text>

                <TextInput
                  style={styles.formInput}
                  placeholder="Your Name"
                  placeholderTextColor={colors.textMuted}
                  value={reviewName}
                  onChangeText={setReviewName}
                />

                {/* Rating selection */}
                <View style={styles.starSelectRow}>
                  <Text style={styles.starSelectLabel}>Your Rating: </Text>
                  <View style={styles.starSelectButtons}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => setReviewRating(star)}
                        style={{ padding: 4 }}
                      >
                        <Ionicons
                          name={reviewRating >= star ? 'star' : 'star-outline'}
                          size={22}
                          color={colors.gold}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TextInput
                  style={[styles.formInput, styles.formTextArea]}
                  placeholder="Tell us about the fabric quality, fit, and elegance..."
                  placeholderTextColor={colors.textMuted}
                  value={reviewComment}
                  onChangeText={setReviewComment}
                  multiline
                  numberOfLines={4}
                />

                <Button
                  title="SUBMIT VERIFIED REVIEW"
                  onPress={handleSubmitReview}
                  loading={submittingReview}
                  variant="primary"
                  size="md"
                />
              </View>
            )}

            {/* Reviews List */}
            {reviewsLoading ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
            ) : reviewsData.reviews && reviewsData.reviews.length > 0 ? (
              reviewsData.reviews.map((rev, i) => (
                <View key={rev.id || i} style={styles.reviewCard}>
                  <View style={styles.reviewTop}>
                    <Text style={styles.reviewerName}>{rev.customer_name || 'Verified Patron'}</Text>
                    <StarRating rating={rev.rating || 5} size={12} />
                  </View>
                  <Text style={styles.reviewComment}>{rev.comment}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noReviewsText}>
                Be the first to review this atelier masterpiece!
              </Text>
            )}
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Floating Bottom Sticky Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.bottomBarContent}>
          <TouchableOpacity
            style={styles.addCartBtn}
            onPress={() => handleAddToCart(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="bag-add-outline" size={20} color={colors.primary} />
            <Text style={styles.addCartText}>ADD TO BAG</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buyNowBtn}
            onPress={handleBuyNow}
            activeOpacity={0.8}
          >
            <Text style={styles.buyNowText}>BUY NOW</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  imageGallery: {
    width: width,
    height: width * 1.25,
    backgroundColor: colors.surface,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  detailsWishlistBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  thumbnailScroll: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: 'transparent',
    overflow: 'hidden',
    backgroundColor: colors.cardBg,
  },
  thumbnailActive: {
    borderColor: colors.primary,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  detailsContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 20,
  },
  brandTag: {
    fontFamily: typography.fontSans,
    fontSize: 10,
    fontWeight: typography.weightBold,
    letterSpacing: 2,
    color: colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  productTitle: {
    fontFamily: typography.fontSerif,
    fontSize: 24,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
    lineHeight: 30,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  ratingText: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    color: colors.textSecondary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: 16,
  },
  priceValue: {
    fontFamily: typography.fontSans,
    fontSize: 22,
    fontWeight: typography.weightBold,
    color: colors.primary,
  },
  taxIncluded: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 14,
  },
  sectionBlock: {
    marginBottom: 20,
  },
  sectionBlockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  blockTitle: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    fontWeight: typography.weightBold,
    letterSpacing: 1.2,
    color: colors.textPrimary,
    marginBottom: 10,
  },
  sizeGuideText: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
  sizesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sizePill: {
    minWidth: 50,
    height: 42,
    paddingHorizontal: 12,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBg,
  },
  sizePillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sizePillText: {
    fontFamily: typography.fontSans,
    fontSize: 12.5,
    fontWeight: typography.weightMedium,
    color: colors.textPrimary,
  },
  sizePillTextActive: {
    color: colors.textInverse,
    fontWeight: typography.weightBold,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 2,
    width: 120,
    height: 40,
  },
  qtyBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    backgroundColor: colors.surface,
  },
  qtyValue: {
    flex: 1,
    textAlign: 'center',
    fontFamily: typography.fontSans,
    fontSize: 14,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
  },
  descriptionText: {
    fontFamily: typography.fontSans,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  perksList: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 4,
    marginVertical: 10,
    gap: 12,
  },
  perkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  perkText: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: typography.weightMedium,
  },
  reviewsSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 20,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reviewsTitle: {
    fontFamily: typography.fontSerif,
    fontSize: 18,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
  },
  writeReviewBtn: {
    paddingVertical: 4,
  },
  writeReviewText: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    fontWeight: typography.weightBold,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  reviewForm: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formTitle: {
    fontFamily: typography.fontSerif,
    fontSize: 15,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  formInput: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontFamily: typography.fontSans,
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: 10,
  },
  formTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  starSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  starSelectLabel: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    color: colors.textSecondary,
  },
  starSelectButtons: {
    flexDirection: 'row',
  },
  reviewCard: {
    backgroundColor: colors.cardBg,
    padding: 14,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 10,
  },
  reviewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewerName: {
    fontFamily: typography.fontSans,
    fontSize: 13,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
  },
  reviewComment: {
    fontFamily: typography.fontSans,
    fontSize: 12.5,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  noReviewsText: {
    fontFamily: typography.fontSans,
    fontSize: 12.5,
    color: colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 14,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 10,
    paddingHorizontal: spacing.screenPadding,
  },
  bottomBarContent: {
    flexDirection: 'row',
    gap: 12,
  },
  addCartBtn: {
    flex: 1,
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addCartText: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    fontWeight: typography.weightBold,
    letterSpacing: 1,
    color: colors.primary,
  },
  buyNowBtn: {
    flex: 1,
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyNowText: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    fontWeight: typography.weightBold,
    letterSpacing: 1,
    color: colors.textInverse,
  },
});
