import React from 'react';
import {
    ActivityIndicator,
    type StyleProp,
    StyleSheet,
    Text,
    type TextStyle,
    TouchableOpacity,
    type ViewStyle,
} from 'react-native';

/** Las propiedades que permiten reutilizar el botón con texto, estilos y carga. */
interface AppButtonProps {
    title: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
}

/** El botón compartido muestra progreso y bloquea pulsaciones duplicadas. */
export default function AppButton({
    title,
    onPress,
    loading = false,
    disabled = false,
    style,
    textStyle,
}: AppButtonProps) {
    // El botón queda inactivo mientras procesa una acción o recibe una desactivación externa.
    const isDisabled = disabled || loading;

    return (
        // El indicador sustituye el texto mientras se ejecuta la acción.
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

// Los estilos base se combinan con los estilos opcionales que recibe el componente.
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
