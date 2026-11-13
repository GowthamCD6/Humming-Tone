/* eslint-env jest */

jest.mock('@react-native-async-storage/async-storage', () => {
  const storage = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn((key) => Promise.resolve(storage[key] || null)),
      setItem: jest.fn((key, val) => {
        storage[key] = val;
        return Promise.resolve();
      }),
      removeItem: jest.fn((key) => {
        delete storage[key];
        return Promise.resolve();
      }),
      clear: jest.fn(() => {
        Object.keys(storage).forEach((k) => delete storage[k]);
        return Promise.resolve();
      }),
      getAllKeys: jest.fn(() => Promise.resolve(Object.keys(storage))),
      multiGet: jest.fn((keys) => Promise.resolve(keys.map((k) => [k, storage[k] || null]))),
      multiSet: jest.fn((pairs) => {
        pairs.forEach(([k, v]) => {
          storage[k] = v;
        });
        return Promise.resolve();
      }),
      multiRemove: jest.fn((keys) => {
        keys.forEach((k) => delete storage[k]);
        return Promise.resolve();
      }),
    },
    getItem: jest.fn((key) => Promise.resolve(storage[key] || null)),
    setItem: jest.fn((key, val) => {
      storage[key] = val;
      return Promise.resolve();
    }),
    removeItem: jest.fn((key) => {
      delete storage[key];
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      Object.keys(storage).forEach((k) => delete storage[k]);
      return Promise.resolve();
    }),
  };
});

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn().mockResolvedValue(true),
    signIn: jest.fn().mockResolvedValue({
      user: { id: 'test_1', name: 'Test User', email: 'test@hummingtone.com' },
      data: { idToken: 'mock_token' },
    }),
    signOut: jest.fn().mockResolvedValue(null),
  },
  statusCodes: {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  },
}));

jest.mock('react-native-razorpay', () => ({
  open: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  const frame = { x: 0, y: 0, width: 375, height: 812 };
  const InsetsContext = React.createContext(inset);
  const FrameContext = React.createContext(frame);

  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaConsumer: ({ children }) => children(inset),
    SafeAreaInsetsContext: InsetsContext,
    SafeAreaFrameContext: FrameContext,
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => frame,
    initialWindowMetrics: {
      frame,
      insets: inset,
    },
  };
});

jest.mock('react-native-vector-icons/Ionicons', () => 'Ionicons');
