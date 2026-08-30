import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  ScrollView,
  Platform,
  ActivityIndicator,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '../components/Icons';
import { colors, shadows } from '../theme/colors';
import { typography, spacing } from '../theme/typography';
import { useNotifications } from '../context/NotificationContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TYPE_FILTERS = [
  { id: 'all', label: 'All Updates' },
  { id: 'orders', label: 'Orders' },
  { id: 'featured_drop', label: 'Featured Drops' },
  { id: 'new_arrival', label: 'New Arrivals' },
];

export const NotificationScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  } = useNotifications();

  // Primary Tab: 'unread' | 'read' | 'all'
  const [readStatusTab, setReadStatusTab] = useState('unread');
  // Secondary Filter: 'all' | 'orders' | 'featured_drop' | 'new_arrival'
  const [typeFilter, setTypeFilter] = useState('all');

  const topPadding = Math.max(
    (insets.top || 0) + 10,
    (StatusBar.currentHeight || 0) + 10,
    Platform.OS === 'android' ? 32 : 44
  );

  const readCount = useMemo(() => {
    return notifications.filter((n) => n.is_read === 1 || n.is_read === true).length;
  }, [notifications]);

  const totalCount = notifications.length;

  const filteredNotifications = useMemo(() => {
    let list = notifications;

    // 1. Filter by Read / Unread / All status
    if (readStatusTab === 'unread') {
      list = list.filter((n) => !n.is_read);
    } else if (readStatusTab === 'read') {
      list = list.filter((n) => n.is_read === 1 || n.is_read === true);
    }

    // 2. Filter by Type
    if (typeFilter === 'orders') {
      list = list.filter((n) => n.type === 'order_update' || n.order_id);
    } else if (typeFilter === 'featured_drop') {
      list = list.filter((n) => n.type === 'featured_drop');
    } else if (typeFilter === 'new_arrival') {
      list = list.filter((n) => n.type === 'new_arrival');
    }

    return list;
  }, [notifications, readStatusTab, typeFilter]);

  const handleNotificationPress = async (item) => {
    if (!item.is_read) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      await markAsRead(item.id);
    }

    if (item.order_id) {
      navigation.navigate('OrderTracking', { initialOrderId: item.order_id });
    } else if (item.product_id) {
      navigation.navigate('ProductDetails', {
        productId: item.product_id,
        initialProduct: {
          id: item.product_id,
          name: item.product_name || item.title,
          brand: item.product_brand,
          price: parseFloat(item.product_price) || 0,
          image: item.image_url,
        },
      });
    }
  };

  const handleDismissUnread = async (item) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    await markAsRead(item.id);
  };

  const handleMarkAllRead = async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    await markAllAsRead();
  };

  const formatTime = (isoString) => {
    if (!isoString) return 'Recent';
    try {
      const now = new Date();
      const past = new Date(isoString);
      const diffMs = now - past;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 5) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (e) {
      return 'Recent';
    }
  };

  const getBadgeConfig = (type, orderId) => {
    if (type === 'order_update' || orderId) {
      return {
        icon: 'cube-outline',
        color: '#2E7D32',
        bg: '#E8F5E9',
        label: 'ORDER UPDATE',
      };
    }
    if (type === 'featured_drop') {
      return {
        icon: 'sparkles',
        color: '#D4AF37',
        bg: 'rgba(212, 175, 55, 0.14)',
        label: 'FEATURED DROP',
      };
    }
    if (type === 'new_arrival') {
      return {
        icon: 'flame',
        color: '#E65100',
        bg: 'rgba(230, 81, 0, 0.12)',
        label: 'NEW ARRIVAL',
      };
    }
    return {
      icon: 'notifications',
      color: '#6B4E37',
      bg: '#FAF5EE',
      label: 'ATELIER PRIVILEGE',
    };
  };

  const renderItem = ({ item }) => {
    const isUnread = !item.is_read;
    const badge = getBadgeConfig(item.type, item.order_id);

    return (
      <TouchableOpacity
        style={[styles.card, isUnread ? styles.cardUnread : styles.cardRead]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.88}
      >
        {/* Card Header Row */}
        <View style={styles.cardHeader}>
          <View style={[styles.badgePill, { backgroundColor: badge.bg }]}>
            <Ionicons name={badge.icon} size={11.5} color={badge.color} />
            <Text style={[styles.badgePillText, { color: badge.color }]}>{badge.label}</Text>
          </View>

          <View style={styles.cardHeaderRight}>
            <Text style={styles.timestamp}>{formatTime(item.created_at)}</Text>
            {isUnread && (
              <TouchableOpacity
                style={styles.markReadBtn}
                onPress={() => handleDismissUnread(item)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="checkmark-circle-outline" size={18} color="#6B4E37" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Card Body */}
        <View style={styles.cardBody}>
          {item.image_url ? (
            <View style={styles.thumbWrap}>
              <Image source={{ uri: item.image_url }} style={styles.thumbImg} resizeMode="cover" />
            </View>
          ) : (
            <View style={[styles.thumbWrap, { backgroundColor: badge.bg }]}>
              <Ionicons name={badge.icon} size={24} color={badge.color} />
            </View>
          )}

          <View style={styles.textWrap}>
            <Text style={[styles.title, isUnread && styles.titleUnread]} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.message} numberOfLines={3}>
              {item.message}
            </Text>

            {/* Action CTA */}
            {item.order_id ? (
              <View style={styles.actionPrompt}>
                <Ionicons name="location-outline" size={13} color="#2E7D32" />
                <Text style={[styles.actionPromptText, { color: '#2E7D32' }]}>
                  Track Order #{item.order_id}
                </Text>
                <Ionicons name="arrow-forward" size={11} color="#2E7D32" />
              </View>
            ) : item.product_id ? (
              <View style={styles.actionPrompt}>
                <Ionicons name="sparkles-outline" size={13} color="#6B4E37" />
                <Text style={styles.actionPromptText}>Explore Handcrafted Piece</Text>
                <Ionicons name="arrow-forward" size={11} color="#6B4E37" />
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
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
          <Text style={styles.headerTitle}>Atelier Notifications</Text>
          <Text style={styles.headerSubtitle}>
            {unreadCount > 0 ? `${unreadCount} unread updates` : 'All caught up'}
          </Text>
        </View>

        {unreadCount > 0 ? (
          <TouchableOpacity
            style={styles.markAllBtn}
            onPress={handleMarkAllRead}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-done" size={18} color="#6B4E37" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={fetchNotifications}
            activeOpacity={0.8}
          >
            <Ionicons name="reload-outline" size={18} color="#8A7F75" />
          </TouchableOpacity>
        )}
      </View>

      {/* ── 2. READ / UNREAD SEGMENTED TABS ── */}
      <View style={styles.statusSegmentWrap}>
        <TouchableOpacity
          style={[styles.statusSegmentBtn, readStatusTab === 'unread' && styles.statusSegmentBtnActive]}
          onPress={() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setReadStatusTab('unread');
          }}
          activeOpacity={0.85}
        >
          <Text
            style={[
              styles.statusSegmentText,
              readStatusTab === 'unread' && styles.statusSegmentTextActive,
            ]}
          >
            Unread ({unreadCount})
          </Text>
          {unreadCount > 0 && <View style={styles.segmentUnreadDot} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statusSegmentBtn, readStatusTab === 'read' && styles.statusSegmentBtnActive]}
          onPress={() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setReadStatusTab('read');
          }}
          activeOpacity={0.85}
        >
          <Text
            style={[
              styles.statusSegmentText,
              readStatusTab === 'read' && styles.statusSegmentTextActive,
            ]}
          >
            Read History ({readCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statusSegmentBtn, readStatusTab === 'all' && styles.statusSegmentBtnActive]}
          onPress={() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setReadStatusTab('all');
          }}
          activeOpacity={0.85}
        >
          <Text
            style={[
              styles.statusSegmentText,
              readStatusTab === 'all' && styles.statusSegmentTextActive,
            ]}
          >
            All ({totalCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── 3. SECONDARY CATEGORY PILLS ── */}
      <View style={styles.filterWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {TYPE_FILTERS.map((f) => {
            const isActive = typeFilter === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                style={[styles.filterPill, isActive && styles.filterPillActive]}
                onPress={() => setTypeFilter(f.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── 4. NOTIFICATIONS LIST OR EMPTY STATE ── */}
      {loading && notifications.length === 0 ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#6B4E37" />
          <Text style={styles.loadingText}>Syncing atelier notifications...</Text>
        </View>
      ) : filteredNotifications.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIconCircle}>
            <Ionicons
              name={readStatusTab === 'unread' ? 'checkmark-circle-outline' : 'notifications-outline'}
              size={42}
              color={readStatusTab === 'unread' ? '#38A169' : '#8A7F75'}
            />
          </View>
          <Text style={styles.emptyTitle}>
            {readStatusTab === 'unread' ? "You're All Caught Up" : 'No Notifications'}
          </Text>
          <Text style={styles.emptyDesc}>
            {readStatusTab === 'unread'
              ? 'All unread notifications have been reviewed. When new featured pieces drop or orders update, they will appear here.'
              : 'You have no archived notifications in this category.'}
          </Text>

          {readStatusTab === 'unread' && readCount > 0 ? (
            <TouchableOpacity
              style={styles.viewHistoryBtn}
              onPress={() => setReadStatusTab('read')}
              activeOpacity={0.85}
            >
              <Text style={styles.viewHistoryBtnText}>View Read History ({readCount})</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => navigation.navigate('MainTabs', { screen: 'ExploreTab' })}
              activeOpacity={0.88}
            >
              <Text style={styles.exploreBtnText}>Discover Collections</Text>
              <Ionicons name="arrow-forward" size={15} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Math.max((insets.bottom || 0) + 30, 40) },
          ]}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchNotifications}
        />
      )}
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
  markAllBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#EAE2D8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECE4DC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Status Segmented Tabs */
  statusSegmentWrap: {
    flexDirection: 'row',
    backgroundColor: '#EFEAE2',
    marginHorizontal: 18,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 22,
    padding: 3.5,
  },
  statusSegmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 18,
    gap: 5,
  },
  statusSegmentBtnActive: {
    backgroundColor: '#1E1B18',
    ...shadows.subtle,
  },
  statusSegmentText: {
    fontFamily: typography.fontSansBold,
    fontSize: 11.5,
    color: '#7D726A',
  },
  statusSegmentTextActive: {
    color: '#FFFFFF',
  },
  segmentUnreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C53030',
  },

  /* Type Filter Pills */
  filterWrap: {
    paddingVertical: 8,
    backgroundColor: '#FAF8F5',
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE3',
  },
  filterScroll: {
    paddingHorizontal: 18,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECE4DC',
  },
  filterPillActive: {
    backgroundColor: '#6B4E37',
    borderColor: '#6B4E37',
  },
  filterPillText: {
    fontFamily: typography.fontSansBold,
    fontSize: 11,
    color: '#7D726A',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },

  /* List & Cards */
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECE4DC',
    ...shadows.subtle,
  },
  cardUnread: {
    borderColor: '#DFD3C4',
    backgroundColor: '#FFFDF9',
    borderLeftWidth: 4,
    borderLeftColor: '#6B4E37',
  },
  cardRead: {
    backgroundColor: '#FAF8F5',
    opacity: 0.88,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  badgePillText: {
    fontFamily: typography.fontSansBold,
    fontSize: 9,
    letterSpacing: 0.8,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timestamp: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    color: '#A3998F',
  },
  markReadBtn: {
    padding: 2,
  },
  cardBody: {
    flexDirection: 'row',
    gap: 12,
  },
  thumbWrap: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#FAF5EE',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontFamily: typography.fontSansBold,
    fontSize: 13.5,
    color: '#4A4036',
    marginBottom: 3,
  },
  titleUnread: {
    color: '#1E1B18',
  },
  message: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    color: '#7D726A',
    lineHeight: 16.5,
  },
  actionPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },
  actionPromptText: {
    fontFamily: typography.fontSansBold,
    fontSize: 11.5,
    color: '#6B4E37',
  },

  /* Loading State */
  loadingBox: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: typography.fontSans,
    fontSize: 13,
    color: '#7D726A',
    marginTop: 12,
  },

  /* Empty State */
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyIconCircle: {
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
  emptyTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 18,
    color: '#1E1B18',
    marginBottom: 6,
  },
  emptyDesc: {
    fontFamily: typography.fontSans,
    fontSize: 12.5,
    color: '#7D726A',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  viewHistoryBtn: {
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#EAE2D8',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  viewHistoryBtnText: {
    fontFamily: typography.fontSansBold,
    fontSize: 12.5,
    color: '#6B4E37',
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1B18',
    height: 46,
    paddingHorizontal: 22,
    borderRadius: 23,
    gap: 6,
    ...shadows.card,
  },
  exploreBtnText: {
    fontFamily: typography.fontSansBold,
    fontSize: 13,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});

export default NotificationScreen;
