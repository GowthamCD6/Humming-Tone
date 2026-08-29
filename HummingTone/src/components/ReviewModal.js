import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from './Icons';
import { colors } from '../theme/colors';
import { typography, spacing } from '../theme/typography';
import { ProductService } from '../api/services';

export const ReviewModal = ({ visible, onClose, productId, productName, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [author, setAuthor] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!author.trim()) {
      Alert.alert('Required', 'Please enter your name.');
      return;
    }
    if (!comment.trim()) {
      Alert.alert('Required', 'Please enter your review experience.');
      return;
    }

    try {
      setSubmitting(true);
      await ProductService.submitReview(productId, {
        userName: author.trim(),
        rating,
        comment: comment.trim(),
      });

      Alert.alert(
        'Review Submitted',
        'Thank you for your feedback! Your review will be published shortly.',
        [
          {
            text: 'OK',
            onPress: () => {
              setAuthor('');
              setComment('');
              setRating(5);
              if (onReviewSubmitted) onReviewSubmitted();
              onClose();
            },
          },
        ]
      );
    } catch (e) {
      Alert.alert('Error', 'Could not submit review at this moment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.subtitle}>VERIFIED ATELIER EXPERIENCE</Text>
              <Text style={styles.title} numberOfLines={1}>
                {productName || 'Write a Review'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Star Rating Picker */}
          <View style={styles.ratingSection}>
            <Text style={styles.label}>Your Rating</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={32}
                    color={star <= rating ? colors.gold : colors.textMuted}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Eleanor Vance"
              placeholderTextColor={colors.textMuted}
              value={author}
              onChangeText={setAuthor}
            />
          </View>

          {/* Review Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your Experience</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Share details on texture, fit, acoustics, and craftsmanship..."
              placeholderTextColor={colors.textMuted}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={submitting}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={colors.textInverse} />
              ) : (
                <Text style={styles.submitBtnText}>Submit Review</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  subtitle: {
    fontFamily: typography.fontSans,
    fontSize: 10,
    fontWeight: typography.weightBold,
    letterSpacing: 1.5,
    color: colors.primary,
    marginBottom: 4,
  },
  title: {
    fontFamily: typography.fontSerif,
    fontSize: 18,
    fontWeight: typography.weightSemiBold,
    color: colors.textPrimary,
    maxWidth: 260,
  },
  ratingSection: {
    marginBottom: spacing.lg,
  },
  label: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    fontWeight: typography.weightSemiBold,
    letterSpacing: 0.5,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  starBtn: {
    padding: 4,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: typography.fontSans,
    fontSize: 14,
    color: colors.textPrimary,
  },
  textArea: {
    height: 100,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontFamily: typography.fontSans,
    fontSize: 13,
    fontWeight: typography.weightSemiBold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  submitBtn: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    fontFamily: typography.fontSans,
    fontSize: 13,
    fontWeight: typography.weightSemiBold,
    color: colors.textInverse,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

export default ReviewModal;
