import React, { ReactNode } from 'react';
import {
  Modal,
  Pressable,
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';

interface DropdownProps {
  visible: boolean;
  onClose: () => void;
  anchor: { x: number; y: number; width: number; height: number } | null;
  children: ReactNode;
  placement?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

/**
 * Dropdown component that positions content relative to an anchor point
 * Follows SKILL.md Rule 7 (dumb component) - props in, JSX out
 */
export function Dropdown({ 
  visible, 
  onClose, 
  anchor, 
  children,
  placement = 'bottom-right' 
}: DropdownProps) {
  if (!anchor) return null;

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  // Calculate dropdown position based on anchor and placement
  const getDropdownStyle = () => {
    const margin = 8; // Distance from anchor
    let left = anchor.x;
    let top = anchor.y + anchor.height + margin;

    // Adjust horizontal position based on placement
    if (placement.includes('right')) {
      left = anchor.x + anchor.width - 200; // Assume dropdown width of 200
    }

    // Adjust vertical position if there's not enough space below
    if (top + 120 > screenHeight) { // Assume dropdown height of 120
      top = anchor.y - 120 - margin; // Position above anchor
    }

    // Ensure dropdown stays within screen bounds
    if (left < margin) left = margin;
    if (left + 200 > screenWidth - margin) left = screenWidth - 200 - margin;

    return {
      position: 'absolute' as const,
      left,
      top,
      minWidth: 200,
    };
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent={false}
      hardwareAccelerated={true}
      presentationStyle="overFullScreen"
    >
      {/* Overlay background */}
      <View style={styles.overlay}>
        <Pressable 
          style={StyleSheet.absoluteFillObject}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close menu"
        />
        {/* Dropdown content - positioned absolutely */}
        <View style={[styles.dropdown, getDropdownStyle()]}>
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  dropdown: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(201, 151, 58, 0.1)',
  },
});