import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function FloatingActionButton({
    label = '+',
    accessibilityLabel = 'Acción principal',
    position = 'right',
    onPress,
    onLongPress,
}) {
    return (
        <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            style={[
                styles.button,
                position === 'left' ? styles.left : styles.right,
            ]}
            onPress={onPress}
            onLongPress={onLongPress}
        >
            <Text style={styles.label}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        position: 'absolute',
        bottom: 24,
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: '#3498db',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    left: {
        left: 20,
    },
    right: {
        right: 20,
    },
    label: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '600',
    },
});
