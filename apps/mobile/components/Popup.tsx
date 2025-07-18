import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';

type PopupProps = {
  message: string;
  onClose?: () => void;
  variant?: 'success' | 'warning' | 'error';
  duration?: number;
};

const { width } = Dimensions.get('window');

const Popup = ({
  message,
  onClose,
  variant = 'error',
  duration = 5000
}: PopupProps) => {
  const [visible, setVisible] = useState(true);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-40)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const insets = useSafeAreaInsets(); 

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true
    }).start();

    Animated.timing(translateY, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true
    }).start();

    timerRef.current = setTimeout(() => {
      closePopup();
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const closePopup = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(translateY, {
        toValue: -20,
        duration: 300,
        useNativeDriver: true
      })
    ]).start(() => {
      setVisible(false);
      onClose?.();
    });
  };

  const getBackgroundColor = () => {
    switch (variant) {
      case 'success':
        return Colors.green;
      case 'warning':
        return Colors.yellow;
      case 'error':
      default:
        return Colors.red;
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.popup,
        {
          backgroundColor: getBackgroundColor(),
          top: insets.top + 12, 
          opacity: opacity,
          transform: [{ translateY }]
        }
      ]}
    >
      <Text style={styles.text}>{message}</Text>
      <TouchableOpacity onPress={closePopup} style={styles.closeButton}>
        <Text style={styles.closeText}>×</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default Popup;

const styles = StyleSheet.create({
  popup: {
    position: 'absolute',
    right: 20,
    maxWidth: width - 40,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 9999
  },
  text: {
    color: Colors.beige,
    fontFamily: 'CormorantGaramond-Regular',
    fontSize: 17,
    flex: 1
  },
  closeButton: {
    paddingHorizontal: 4
  },
  closeText: {
    color: Colors.beige,
    fontSize: 22,
    fontFamily: 'CormorantGaramond-Regular'
  }
});