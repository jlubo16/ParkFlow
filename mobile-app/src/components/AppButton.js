import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
} from 'react-native';

export default function AppButton({
    title,
    onPress,
    loading = false,
    disabled = false,
    style,
    textStyle,
}) {
    const isDisabled = disabled || loading;

    return (
        <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ disabled: isDisabled, busy: loading }}
            style={[styles.button, style, isDisabled && styles.disabled]}
            onPress={onPress}
            disabled={isDisabled}
        >
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={[styles.text, textStyle]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        minHeight: 48,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#3498db',
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabled: {
        opacity: 0.7,
    },
    text: {
        color: '#fff',
        fontWeight: '600',
    },
});
