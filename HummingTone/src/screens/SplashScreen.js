import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Easing,
  Platform,
} from 'react-native';
import { Ionicons } from '../components/Icons';
import { typography } from '../theme/typography';
import { colors, shadows } from '../theme/colors';

const { width } = Dimensions.get('window');

// The wordmark is animated letter-by-letter, so it's kept as data rather than a plain string.
const BRAND_LETTERS = 'HUMMING TONE'.split('');
const LOGO_SIZE = Math.min(width * 0.42, 176);

export const SplashScreen = ({ navigation }) => {
  // ── Entrance references ──
  const cornerOpacity = useRef(new Animated.Value(0)).current;
  const seasonTagOpacity = useRef(new Animated.Value(0)).current;

  const glowOpacity = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.86)).current;
  const logoFloat = useRef(new Animated.Value(0)).current;

  const shimmerX = useRef(new Animated.Value(-1)).current;

  const letterAnims = useRef(BRAND_LETTERS.map(() => new Animated.Value(0))).current;

  const ruleScale = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  const progressWidth = useRef(new Animated.Value(0)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const ctaOpacity = useRef(new Animated.Value(0)).current;

  const exitOpacity = useRef(new Animated.Value(1)).current;
  const exitScale = useRef(new Animated.Value(1)).current;

  const [progressPct, setProgressPct] = useState(0);
  const hasExited = useRef(false);
  const loopsRef = useRef([]);

  useEffect(() => {
    // Tick the numeric counter off the same driver as the progress line.
    const listenerId = progressWidth.addListener(({ value }) => {
      setProgressPct(Math.round(value));
    });

    // 1 — Frame settles first: corner mark + season label. Quiet, not competing for attention.
    Animated.parallel([
      Animated.timing(cornerOpacity, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(seasonTagOpacity, {
        toValue: 1,
        duration: 700,
        delay: 120,
        useNativeDriver: true,
      }),
    ]).start();

    // 2 — Mark entrance: soft glow blooms, medallion settles with a single confident spring.
    Animated.sequence([
      Animated.delay(180),
      Animated.parallel([
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 650,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 8,
          tension: 46,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // One unhurried light sweep across the mark — a single pass, not a loop. Restraint reads as intentional.
      Animated.timing(shimmerX, {
        toValue: 1,
        duration: 950,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();

      // Gentle, barely-there breathing float — the only continuous loop on screen.
      const floatLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(logoFloat, {
            toValue: -5,
            duration: 1900,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(logoFloat, {
            toValue: 0,
            duration: 1900,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
      floatLoop.start();
      loopsRef.current.push(floatLoop);
    });

    // 3 — Wordmark assembles letter by letter, like type being set.
    Animated.stagger(
      36,
      letterAnims.map((val) =>
        Animated.timing(val, {
          toValue: 1,
          duration: 480,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        })
      )
    ).start();

    // 4 — Rule draws outward from center, tagline settles beneath it.
    Animated.sequence([
      Animated.delay(650),
      Animated.parallel([
        Animated.timing(ruleScale, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 550,
          delay: 120,
          useNativeDriver: true,
        }),
        Animated.timing(footerOpacity, {
          toValue: 1,
          duration: 550,
          delay: 160,
          useNativeDriver: true,
        }),
        Animated.timing(ctaOpacity, {
          toValue: 1,
          duration: 550,
          delay: 260,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // 5 — Hairline progress, the quiet mechanism of the whole screen.
    Animated.timing(progressWidth, {
      toValue: 100,
      duration: 2300,
      easing: Easing.bezier(0.22, 0.1, 0.2, 1),
      useNativeDriver: false,
    }).start();

    const tEnd = setTimeout(handleComplete, 2700);

    return () => {
      clearTimeout(tEnd);
      progressWidth.removeListener(listenerId);
      loopsRef.current.forEach((loop) => loop.stop());
    };
  }, []);

  const handleComplete = () => {
    if (hasExited.current) return;
    hasExited.current = true;

    Animated.parallel([
      Animated.timing(exitOpacity, {
        toValue: 0,
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(exitScale, {
        toValue: 1.035,
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    });
  };

  const progressInterpolate = progressWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const shimmerTranslate = shimmerX.interpolate({
    inputRange: [-1, 1],
    outputRange: [-LOGO_SIZE, LOGO_SIZE],
  });

  return (
    <TouchableWithoutFeedback onPress={handleComplete}>
      <Animated.View
        style={[
          styles.container,
          { opacity: exitOpacity, transform: [{ scale: exitScale }] },
        ]}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#FAF8F5" translucent />

        {/* Oversized monogram watermark — the kind of quiet texture a real fashion house uses */}
        <Text style={styles.watermark} pointerEvents="none">
          H
        </Text>

        {/* Asymmetric frame marks — only two corners, so the eye reads it as a device, not a border */}
        <Animated.View style={[styles.cornerTL, { opacity: cornerOpacity }]} />
        <Animated.View style={[styles.cornerBR, { opacity: cornerOpacity }]} />

        {/* Season label, top-left — a small credibility detail */}
        <Animated.Text style={[styles.seasonTag, { opacity: seasonTagOpacity }]}>
          COLLECTION SS’26
        </Animated.Text>

        {/* ── Center stage ── */}
        <View style={styles.centerStage}>
          <Animated.View
            style={[
              styles.glow,
              {
                width: LOGO_SIZE * 1.7,
                height: LOGO_SIZE * 1.7,
                borderRadius: (LOGO_SIZE * 1.7) / 2,
                opacity: glowOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.5],
                }),
              },
            ]}
          />

          <Animated.View
            style={[
              styles.logoWrapper,
              {
                width: LOGO_SIZE,
                height: LOGO_SIZE,
                borderRadius: LOGO_SIZE / 2,
                opacity: logoOpacity,
                transform: [{ scale: logoScale }, { translateY: logoFloat }],
              },
            ]}
          >
            <Image
              source={require('../assets/logo_copy.png')}
              style={styles.masterLogoImg}
              resizeMode="contain"
            />
            <View style={styles.shimmerMask} pointerEvents="none">
              <Animated.View
                style={[
                  styles.shimmerStripe,
                  { transform: [{ translateX: shimmerTranslate }, { rotate: '16deg' }] },
                ]}
              />
            </View>
          </Animated.View>

          {/* Kinetic wordmark — assembled letter by letter, not a static string */}
          <View style={styles.wordmarkRow}>
            {BRAND_LETTERS.map((char, i) => (
              <Animated.Text
                key={`${char}-${i}`}
                style={[
                  char === ' ' ? styles.wordmarkSpace : styles.wordmarkLetter,
                  {
                    opacity: letterAnims[i],
                    transform: [
                      {
                        translateY: letterAnims[i].interpolate({
                          inputRange: [0, 1],
                          outputRange: [10, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {char}
              </Animated.Text>
            ))}
          </View>

          <Animated.View style={[styles.rule, { transform: [{ scaleX: ruleScale }] }]} />

          <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
            HAUTE ATELIER · BESPOKE COUTURE
          </Animated.Text>
        </View>

        {/* ── Footer: mechanism, then invitation ── */}
        <Animated.View style={[styles.footer, { opacity: footerOpacity }]}>
          <View style={styles.progressRow}>
            <View style={styles.progressBarTrack}>
              <Animated.View style={[styles.progressBarFill, { width: progressInterpolate }]} />
            </View>
            <Text style={styles.progressCount}>{String(progressPct).padStart(3, '0')}</Text>
          </View>

          <Animated.View style={{ opacity: ctaOpacity }}>
            <TouchableOpacity
              onPress={handleComplete}
              activeOpacity={0.55}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.ctaRow}
            >
              <Text style={styles.ctaText}>ENTER ATELIER</Text>
              <Ionicons name="arrow-forward" size={11} color="#704F38" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  /* Background texture */
  watermark: {
    position: 'absolute',
    top: -width * 0.16,
    right: -width * 0.24,
    fontSize: width * 0.95,
    fontFamily: typography.fontSansBold,
    color: 'rgba(112, 79, 56, 0.045)',
    transform: [{ rotate: '-6deg' }],
  },

  /* Corner marks — asymmetric, editorial rather than a boxed frame */
  cornerTL: {
    position: 'absolute',
    top: 56,
    left: 24,
    width: 22,
    height: 22,
    borderTopWidth: 1.25,
    borderLeftWidth: 1.25,
    borderColor: '#C9BBA6',
  },
  cornerBR: {
    position: 'absolute',
    bottom: 56,
    right: 24,
    width: 22,
    height: 22,
    borderBottomWidth: 1.25,
    borderRightWidth: 1.25,
    borderColor: '#C9BBA6',
  },

  seasonTag: {
    position: 'absolute',
    top: 64,
    left: 56,
    fontFamily: typography.fontSansBold,
    fontSize: 9,
    letterSpacing: 2.2,
    color: '#A8927D',
  },

  /* Center stage */
  centerStage: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width,
    paddingHorizontal: 32,
  },
  glow: {
    position: 'absolute',
    backgroundColor: '#EFE6D9',
  },
  logoWrapper: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7DC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginBottom: 28,
    overflow: 'hidden',
    ...shadows.card,
  },
  masterLogoImg: {
    width: '100%',
    height: '100%',
  },
  shimmerMask: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  shimmerStripe: {
    position: 'absolute',
    top: -60,
    left: -20,
    width: 34,
    height: LOGO_SIZE * 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },

  /* Wordmark */
  wordmarkRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  wordmarkLetter: {
    fontFamily: typography.fontSansBold,
    fontSize: 23,
    letterSpacing: 4.5,
    color: '#332A22',
  },
  wordmarkSpace: {
    width: 10,
  },

  rule: {
    width: 40,
    height: 1,
    backgroundColor: '#704F38',
    marginBottom: 14,
  },

  tagline: {
    fontFamily: typography.fontSansBold,
    fontSize: 9.5,
    letterSpacing: 2.6,
    color: '#8A7F75',
    textAlign: 'center',
  },

  /* Footer */
  footer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 52 : 40,
    alignItems: 'center',
    width: width * 0.62,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 22,
  },
  progressBarTrack: {
    flex: 1,
    height: 1,
    backgroundColor: '#E6DCCE',
    marginRight: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#704F38',
  },
  progressCount: {
    fontFamily: typography.fontSans,
    fontSize: 9.5,
    letterSpacing: 0.5,
    color: '#A8927D',
    width: 26,
    textAlign: 'right',
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontFamily: typography.fontSansBold,
    fontSize: 9.5,
    letterSpacing: 2,
    color: '#704F38',
  },
});

export default SplashScreen;