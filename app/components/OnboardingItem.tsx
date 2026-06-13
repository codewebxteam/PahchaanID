import React from 'react';
import { View, Text, useWindowDimensions, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface Slide {
  id: string;
  title: string;
  subtitle: string;
  body: string;
  icon: string;
  bubbleBg: string;
  iconColor: string;
}

const OnboardingItem = ({ item }: { item: Slide }) => {
  const { width } = useWindowDimensions();
  const cardSize = width * 0.78;

  return (
    <View style={{ width }} className="flex-1 px-6 pt-8 pb-4">

      {/* ── Illustration card ── */}
      <View className="flex-1 justify-center items-center">
        <View
          style={[
            {
              width: cardSize,
              height: cardSize,
              backgroundColor: item.bubbleBg,
              borderRadius: 32,
            },
            styles.card,
          ]}
        >
          {/* Decorative corner accent — top-left */}
          <View
            style={[
              styles.cornerAccent,
              {
                top: 20,
                left: 20,
                borderColor: item.iconColor + '30',
              },
            ]}
          />

          {/* Decorative corner accent — bottom-right */}
          <View
            style={[
              styles.cornerAccent,
              {
                bottom: 20,
                right: 20,
                borderColor: item.iconColor + '30',
              },
            ]}
          />

          {/* Icon in a pill */}
          <View
            style={{
              width: cardSize * 0.42,
              height: cardSize * 0.42,
              borderRadius: cardSize * 0.21,
              backgroundColor: item.iconColor + '18',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons
              name={item.icon as any}
              size={cardSize * 0.22}
              color={item.iconColor}
            />
          </View>
        </View>
      </View>

      {/* ── Text area ── */}
      <View style={{ paddingHorizontal: 24, paddingTop: 36, paddingBottom: 24 }}>

        {/* Label pill */}
        <View
          style={{
            alignSelf: 'flex-start',
            backgroundColor: item.iconColor + '18',
            borderRadius: 100,
            paddingHorizontal: 14,
            paddingVertical: 5,
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              color: item.iconColor,
              fontSize: 11,
              fontWeight: '800',
              letterSpacing: 2.5,
              textTransform: 'uppercase',
            }}
          >
            {item.subtitle}
          </Text>
        </View>

        {/* Main heading */}
        <Text
          style={{
            fontSize: 38,
            fontWeight: '800',
            lineHeight: 46,
            color: '#111827',
            letterSpacing: -0.5,
            marginBottom: 14,
          }}
        >
          {item.title}
        </Text>

        {/* Body */}
        <Text
          style={{
            fontSize: 16,
            fontWeight: '400',
            lineHeight: 26,
            color: '#6B7280',
          }}
        >
          {item.body}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.07,
    shadowRadius: 32,
    elevation: 6,
  },
  cornerAccent: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
  },
});

export default OnboardingItem;
