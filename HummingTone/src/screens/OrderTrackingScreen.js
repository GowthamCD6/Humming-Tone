import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  Platform,
  Image,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '../components/Icons';
import { colors, shadows } from '../theme/colors';
import { typography, spacing } from '../theme/typography';
import { OrderService } from '../api/services';

const STEPS = [
  { id: 'placed', title: 'Order Placed', desc: 'Order verified & payment confirmed', icon: 'bag-check-outline' },
  { id: 'confirmed', title: 'Quality Check & Packing', desc: 'Handcrafted inspection & packaging', icon: 'sparkles-outline' },
  { id: 'shipped', title: 'Dispatched in Transit', desc: 'Handed over to express courier partner', icon: 'airplane-outline' },
  { id: 'delivered', title: 'Delivered', desc: 'Delivered safely to your delivery address', icon: 'checkmark-done-circle-outline' },
];

export const OrderTrackingScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { initialOrderId } = route.params || {};

  const [orderQuery, setOrderQuery] = useState(initialOrderId || '');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const topPadding = Math.max(
    (insets.top || 0) + 10,
    (StatusBar.currentHeight || 0) + 10,
    Platform.OS === 'android' ? 32 : 44
  );

  const fetchTracking = async (idToTrack) => {
    const q = (idToTrack || orderQuery).trim();
    if (!q) {
      Alert.alert('Missing Input', 'Please enter your Order Reference ID or registered phone number.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      const data = await OrderService.trackOrder(q);
      if (data && (data.order || data.id || data.order_id)) {
        setOrderData(data.order || data);
      } else {
        setOrderData(null);
        setErrorMessage('No order found with this reference ID or phone number.');
      }
    } catch (e) {
      setOrderData(null);
      setErrorMessage(e.response?.data?.message || 'Unable to locate order. Please check your reference ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderId) {
      fetchTracking(initialOrderId);
    }
  }, [initialOrderId]);

  const getActiveStepIndex = (status = 'placed') => {
    const s = String(status).toLowerCase();
    if (s.includes('deliver')) return 3;
    if (s.includes('ship') || s.includes('transit') || s.includes('dispatch')) return 2;
    if (s.includes('confirm') || s.includes('tailor') || s.includes('process') || s.includes('pack')) return 1;
    return 0;
  };

  const activeIndex = orderData ? getActiveStepIndex(orderData.status) : 0;

  const openWhatsApp = () => {
    const ref = orderData?.order_id || orderData?.id || orderQuery;
    const msg = encodeURIComponent(`Hello Humming Tone Concierge, I need assistance with Order #${ref}.`);
    Linking.openURL(`https://wa.me/919876543210?text=${msg}`).catch(() => {
      navigation.navigate('Support');
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF8F5" translucent={true} />

      {/* ── 1. TOP APP BAR ── */}
      <View style={[styles.topBar, { paddingTop: topPadding }]}>
        <TouchableOpacity
          style={styles.backCircleBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#1E1B18" />
        </TouchableOpacity>

        <View style={styles.topBarCenter}>
          <Text style={styles.headerTitle}>Order Tracking</Text>
          <Text style={styles.headerSubtitle}>Real-time delivery milestones</Text>
        </View>

        <TouchableOpacity
          style={styles.helpIconBtn}
          onPress={openWhatsApp}
          activeOpacity={0.8}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={19} color="#6B4E37" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max((insets.bottom || 0) + 30, 40) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 2. SEARCH / LOOKUP SECTION ── */}
        <View style={styles.lookupCard}>
          <Text style={styles.lookupLabel}>ENTER ORDER REFERENCE ID</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputWrap}>
              <Ionicons name="search-outline" size={18} color="#8A7F75" style={{ marginLeft: 12 }} />
              <TextInput
                style={styles.input}
                placeholder="e.g. HT-849201 or Phone"
                placeholderTextColor="#A3998F"
                value={orderQuery}
                onChangeText={(t) => {
                  setOrderQuery(t);
                  if (errorMessage) setErrorMessage('');
                }}
                autoCapitalize="characters"
              />
              {orderQuery ? (
                <TouchableOpacity onPress={() => setOrderQuery('')} style={{ padding: 8 }}>
                  <Ionicons name="close-circle" size={16} color="#A3998F" />
                </TouchableOpacity>
              ) : null}
            </View>

            <TouchableOpacity
              style={[styles.trackBtn, loading && { opacity: 0.7 }]}
              onPress={() => fetchTracking(orderQuery)}
              activeOpacity={0.88}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.trackBtnText}>TRACK</Text>
              )}
            </TouchableOpacity>
          </View>

          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={16} color="#C53030" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}
        </View>

        {/* ── 3. TRACKING RESULTS ── */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#6B4E37" />
            <Text style={styles.loadingText}>Fetching delivery status...</Text>
          </View>
        ) : orderData ? (
          <View style={styles.resultsWrap}>
            {/* Status Header Card */}
            <View style={styles.statusHeaderCard}>
              <View style={styles.statusHeaderLeft}>
                <Text style={styles.refSub}>ORDER REFERENCE</Text>
                <Text style={styles.refNumber}>#{orderData.order_id || orderData.id || orderQuery}</Text>
                <Text style={styles.placedDate}>
                  {orderData.created_at
                    ? new Date(orderData.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Recent Order'}
                </Text>
              </View>

              <View style={styles.statusBadge}>
                <Ionicons
                  name={activeIndex === 3 ? 'checkmark-circle' : 'time-outline'}
                  size={14}
                  color="#D4AF37"
                />
                <Text style={styles.statusBadgeText}>
                  {(orderData.status || 'PROCESSING').toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Step-by-Step Progress Tracker */}
            <View style={styles.trackerCard}>
              <Text style={styles.trackerHeading}>DELIVERY TIMELINE</Text>

              {STEPS.map((step, idx) => {
                const isCompleted = idx <= activeIndex;
                const isCurrent = idx === activeIndex;

                return (
                  <View key={step.id} style={styles.timelineRow}>
                    {/* Left Icon & Connector Column */}
                    <View style={styles.timelineCol}>
                      <View
                        style={[
                          styles.stepCircle,
                          isCompleted && styles.stepCircleCompleted,
                          isCurrent && styles.stepCircleCurrent,
                        ]}
                      >
                        <Ionicons
                          name={isCompleted ? 'checkmark' : step.icon}
                          size={13}
                          color={isCompleted ? '#FFFFFF' : '#8A7F75'}
                        />
                      </View>
                      {idx < STEPS.length - 1 && (
                        <View
                          style={[
                            styles.connectorLine,
                            idx < activeIndex && styles.connectorLineCompleted,
                          ]}
                        />
                      )}
                    </View>

                    {/* Right Step Info */}
                    <View style={styles.stepInfoWrap}>
                      <View style={styles.stepTitleRow}>
                        <Text style={[styles.stepTitle, isCompleted && styles.stepTitleCompleted]}>
                          {step.title}
                        </Text>
                        {isCurrent && (
                          <View style={styles.currentPill}>
                            <Text style={styles.currentPillText}>IN PROGRESS</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.stepDesc}>{step.desc}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Order Items Preview */}
            {Array.isArray(orderData.items) && orderData.items.length > 0 && (
              <View style={styles.itemsCard}>
                <Text style={styles.itemsHeading}>ORDERED ITEMS ({orderData.items.length})</Text>

                {orderData.items.map((item, idx) => (
                  <View key={idx} style={styles.itemRow}>
                    <View style={styles.itemImgWrap}>
                      {item.image ? (
                        <Image source={{ uri: item.image }} style={styles.itemImg} />
                      ) : (
                        <Ionicons name="shirt-outline" size={22} color="#8A7F75" />
                      )}
                    </View>

                    <View style={styles.itemDetails}>
                      <Text style={styles.itemName} numberOfLines={1}>{item.name || 'Humming Tone Garment'}</Text>
                      <Text style={styles.itemMeta}>Size: {item.size || 'Standard'} • Qty: {item.quantity || 1}</Text>
                    </View>

                    <Text style={styles.itemPrice}>₹{Number(item.price || 0).toLocaleString('en-IN')}</Text>
                  </View>
                ))}

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Amount Paid</Text>
                  <Text style={styles.totalValue}>
                    ₹{Number(orderData.total_amount || orderData.total || 0).toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
            )}

            {/* Delivery Address Details */}
            {orderData.shipping_address ? (
              <View style={styles.addressCard}>
                <View style={styles.addressHeaderRow}>
                  <Ionicons name="location-outline" size={18} color="#6B4E37" />
                  <Text style={styles.addressHeading}>DELIVERY DESTINATION</Text>
                </View>
                <Text style={styles.addressText}>{orderData.shipping_address}</Text>
                {orderData.customer_phone ? (
                  <Text style={styles.phoneText}>Contact: {orderData.customer_phone}</Text>
                ) : null}
              </View>
            ) : null}

            {/* Direct Actions: Return Request / WhatsApp */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={styles.returnActionBtn}
                onPress={() =>
                  navigation.navigate('ReturnRequest', {
                    orderId: orderData.order_id || orderData.id || orderQuery,
                  })
                }
                activeOpacity={0.8}
              >
                <Ionicons name="repeat-outline" size={16} color="#6B4E37" />
                <Text style={styles.returnActionText}>Return / Exchange</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.conciergeActionBtn}
                onPress={openWhatsApp}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-whatsapp" size={16} color="#FFFFFF" />
                <Text style={styles.conciergeActionText}>Contact Stylist</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Initial Empty State */
          <View style={styles.initialStateWrap}>
            <View style={styles.initialIconCircle}>
              <Ionicons name="cube-outline" size={38} color="#8A7F75" />
            </View>
            <Text style={styles.initialTitle}>Track Your Shipment</Text>
            <Text style={styles.initialDesc}>
              Enter your Order Reference ID from your SMS, Email, or WhatsApp confirmation to view real-time delivery progress.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 12,
    backgroundColor: '#FAF8F5',
    borderBottomWidth: 1,
    borderBottomColor: '#EAE4DC',
  },
  backCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECE4DC',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.subtle,
  },
  topBarCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 16.5,
    color: '#1E1B18',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    color: '#8A7F75',
    marginTop: 1,
  },
  helpIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#EAE2D8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Scroll & Content */
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
  },

  /* Search Lookup Card */
  lookupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECE4DC',
    marginBottom: 18,
    ...shadows.subtle,
  },
  lookupLabel: {
    fontFamily: typography.fontSansBold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: '#8A7F75',
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAE4DC',
  },
  input: {
    flex: 1,
    fontFamily: typography.fontSans,
    fontSize: 13.5,
    color: '#1E1B18',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  trackBtn: {
    backgroundColor: '#1E1B18',
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackBtnText: {
    fontFamily: typography.fontSansBold,
    fontSize: 12.5,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FDF2F2',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FBD5D5',
  },
  errorText: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    color: '#C53030',
    flex: 1,
  },

  /* Loading State */
  loadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: typography.fontSans,
    fontSize: 13,
    color: '#7D726A',
    marginTop: 12,
  },

  /* Results Wrap */
  resultsWrap: {
    gap: 16,
  },
  statusHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E1B18',
    borderRadius: 18,
    padding: 18,
    ...shadows.elevated,
  },
  statusHeaderLeft: {
    flex: 1,
  },
  refSub: {
    fontFamily: typography.fontSansBold,
    fontSize: 9.5,
    letterSpacing: 1,
    color: '#D8CEBF',
    marginBottom: 2,
  },
  refNumber: {
    fontFamily: typography.fontSansBold,
    fontSize: 17,
    color: '#FAF8F5',
    letterSpacing: 0.3,
  },
  placedDate: {
    fontFamily: typography.fontSans,
    fontSize: 11.5,
    color: '#A3998F',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 5,
  },
  statusBadgeText: {
    fontFamily: typography.fontSansBold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: '#D4AF37',
  },

  /* Timeline Tracker Card */
  trackerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#ECE4DC',
    ...shadows.subtle,
  },
  trackerHeading: {
    fontFamily: typography.fontSansBold,
    fontSize: 11,
    letterSpacing: 1.2,
    color: '#8A7F75',
    marginBottom: 16,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineCol: {
    alignItems: 'center',
    width: 28,
    marginRight: 12,
  },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F3EDE6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ECE4DC',
  },
  stepCircleCompleted: {
    backgroundColor: '#6B4E37',
    borderColor: '#6B4E37',
  },
  stepCircleCurrent: {
    backgroundColor: '#1E1B18',
    borderColor: '#D4AF37',
    borderWidth: 2,
  },
  connectorLine: {
    width: 2,
    height: 38,
    backgroundColor: '#ECE4DC',
    marginVertical: 2,
  },
  connectorLineCompleted: {
    backgroundColor: '#6B4E37',
  },
  stepInfoWrap: {
    flex: 1,
    paddingBottom: 22,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  stepTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 13.5,
    color: '#8A7F75',
  },
  stepTitleCompleted: {
    color: '#1E1B18',
  },
  currentPill: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  currentPillText: {
    fontFamily: typography.fontSansBold,
    fontSize: 8.5,
    color: '#D4AF37',
    letterSpacing: 0.6,
  },
  stepDesc: {
    fontFamily: typography.fontSans,
    fontSize: 11.5,
    color: '#8A7F75',
    lineHeight: 16,
  },

  /* Items Card */
  itemsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECE4DC',
    ...shadows.subtle,
  },
  itemsHeading: {
    fontFamily: typography.fontSansBold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: '#8A7F75',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5EFEB',
    gap: 12,
  },
  itemImgWrap: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#FAF5EE',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  itemImg: {
    width: '100%',
    height: '100%',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontFamily: typography.fontSansBold,
    fontSize: 13,
    color: '#1E1B18',
  },
  itemMeta: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    color: '#8A7F75',
    marginTop: 2,
  },
  itemPrice: {
    fontFamily: typography.fontSansBold,
    fontSize: 13.5,
    color: '#1E1B18',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    fontFamily: typography.fontSansBold,
    fontSize: 13,
    color: '#1E1B18',
  },
  totalValue: {
    fontFamily: typography.fontSansBold,
    fontSize: 15,
    color: '#6B4E37',
  },

  /* Address Card */
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECE4DC',
    ...shadows.subtle,
  },
  addressHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  addressHeading: {
    fontFamily: typography.fontSansBold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: '#8A7F75',
  },
  addressText: {
    fontFamily: typography.fontSans,
    fontSize: 12.5,
    color: '#1E1B18',
    lineHeight: 18,
  },
  phoneText: {
    fontFamily: typography.fontSans,
    fontSize: 11.5,
    color: '#7D726A',
    marginTop: 4,
  },

  /* Action Buttons */
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  returnActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF5EE',
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: '#EAE2D8',
    gap: 6,
  },
  returnActionText: {
    fontFamily: typography.fontSansBold,
    fontSize: 12.5,
    color: '#6B4E37',
  },
  conciergeActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
    height: 46,
    borderRadius: 23,
    gap: 6,
    ...shadows.subtle,
  },
  conciergeActionText: {
    fontFamily: typography.fontSansBold,
    fontSize: 12.5,
    color: '#FFFFFF',
  },

  /* Initial State */
  initialStateWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 24,
  },
  initialIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#ECE4DC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...shadows.card,
  },
  initialTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 18,
    color: '#1E1B18',
    marginBottom: 6,
  },
  initialDesc: {
    fontFamily: typography.fontSans,
    fontSize: 12.5,
    color: '#7D726A',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default OrderTrackingScreen;
