import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps }) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 32, paddingVertical: 16 }}>
      {steps.map((label, i) => {
        const isDone = i < currentStep;
        const isActive = i === currentStep;

        return (
          <React.Fragment key={i}>
            {/* Step circle + label stacked */}
            <View style={{ alignItems: 'center' }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: isDone ? '#DDD6FE' : isActive ? Colors.accent : '#F3F4F6', // Lighter purple for done
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isDone ? (
                  <Ionicons name="checkmark" size={16} color={Colors.accent} /> // Dark check on light bg
                ) : (
                  <Text style={{ color: isActive ? '#fff' : '#9CA3AF', fontWeight: '900', fontSize: 13 }}>
                    {i + 1}
                  </Text>
                )}
              </View>
              <Text
                style={{
                  marginTop: 4,
                  fontSize: 11,
                  fontWeight: '700',
                  color: isActive ? Colors.accent : isDone ? Colors.accent : '#9CA3AF',
                  width: 52,
                  textAlign: 'center',
                }}
                numberOfLines={1}
              >
                {label}
              </Text>
            </View>

            {/* Connector line — only between steps, vertically centered with circles */}
            {i < steps.length - 1 && (
              <View
                style={{
                  flex: 1,
                  height: 2,
                  marginBottom: 22, // push up to align with circle center
                  marginHorizontal: 4,
                  backgroundColor: i < currentStep ? '#DDD6FE' : '#E5E7EB', // Lighter purple connector
                  borderRadius: 1,
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

export default StepIndicator;
