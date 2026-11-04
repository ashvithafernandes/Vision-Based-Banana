import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';

export default function CustomBottomNav({ selectedIndex, onSelect }) {
  const items = [
    { index: 0, icon: 'home-outline', activeIcon: 'home' },
    { index: 1, icon: 'scan-outline', activeIcon: 'scan' },
    { index: 2, icon: 'time-outline', activeIcon: 'time' },
    { index: 3, icon: 'information-circle-outline', activeIcon: 'information-circle' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {items.map((item) => {
          const isSelected = selectedIndex === item.index;
          return (
            <TouchableOpacity
              key={item.index}
              activeOpacity={0.8}
              onPress={() => onSelect(item.index)}
              style={[
                styles.navItem,
                isSelected && styles.navItemActive,
              ]}
            >
              <Ionicons
                name={isSelected ? item.activeIcon : item.icon}
                size={22}
                color={isSelected ? COLORS.darkSlate : '#718096'}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORS.darkSlate,
    borderRadius: 36,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  navItem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navItemActive: {
    backgroundColor: COLORS.softGlacierBlue,
  },
});
