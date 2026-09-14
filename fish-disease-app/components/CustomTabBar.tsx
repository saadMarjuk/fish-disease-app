import React from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Text,
} from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const isCenter = route.name === 'detect';

          let iconSource;
          let label = '';

          if (route.name === 'index') {
            iconSource = require('../assets/images/home.png');
            label = 'Home';
          } else if (route.name === 'details') {
            iconSource = require('../assets/images/file-info.png');
            label = 'Details';
          } else if (route.name === 'detect') {
            iconSource = require('../assets/images/image-recognition.png');
            label = 'Detect';
          } else if (route.name === 'history') {
            iconSource = require('../assets/images/history.png');
            label = 'History';
          } else {
            iconSource = require('../assets/images/group.png');
            label = 'service';
          }

          if (isCenter) {
            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={styles.centerWrapper}
                activeOpacity={0.8}
              >
                <View style={styles.centerButton}>
                  <Image source={iconSource} style={styles.centerIcon} />
                </View>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.8}
            >
              <Image
                source={iconSource}
                style={[
                  styles.icon,
                  { opacity: isFocused ? 1 : 0.4 },
                ]}
              />
              <Text
                style={[
                  styles.label,
                  { color: isFocused ? '#2F80ED' : '#999' },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingHorizontal: 10,
    paddingBottom: 14,
    backgroundColor: '#fff',
  },
  tabBar: {
    flexDirection: 'row',
    height: 75,
    backgroundColor: '#fff',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'space-around',
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  icon: {
    width: 22,
    height: 22,
    marginBottom: 4,
    resizeMode: 'contain',
  },
  label: {
    fontSize: 11,
  },
  centerWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  centerButton: {
    width: 65,
    height: 65,
    borderRadius: 32,
    backgroundColor: '#2F80ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -35,
    elevation: 15,
  },
  centerIcon: {
    width: 30,
    height: 30,
    tintColor: '#fff',
    resizeMode: 'contain',
  },
});