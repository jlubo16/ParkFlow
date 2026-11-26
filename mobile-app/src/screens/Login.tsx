import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import AppButton from '../components/AppButton';
import useAsyncAction from '../hooks/useAsyncAction';

export default function Login(): React.JSX.Element {
    // Los estados conservan lo que la persona escribe en los campos del formulario.
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    // El hook comparte el estado de carga del botón durante la autenticación.
    const { loading, run } = useAsyncAction();
    const { login } = useAuth();

    // La función valida los campos y solicita al contexto que autentique al usuario.
    const handleLogin = async (): Promise<void> => {
        if (!correo || !contrasena) {
            Alert.alert('Error', 'Por favor ingresa correo y contraseña.');
            return;
        }

        const result = await run(() => login(correo, contrasena));

        if (result.success) {
            return;
        }

        Alert.alert('Error', result.error);
    };

    // El formulario adapta su posición cuando aparece el teclado del dispositivo.
    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.content}>
                <Text style={styles.title}>🅿️ SmartPark</Text>
                <Text style={styles.subtitle}>Sistema de Gestión de Parqueaderos</Text>

                {/* El formulario recoge el correo y la contraseña de acceso. */}
                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="Correo electrónico"
                        placeholderTextColor="#999"
                        value={correo}
                        onChangeText={setCorreo}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Contraseña"
                        placeholderTextColor="#999"
                        value={contrasena}
                        onChangeText={setContrasena}
                        secureTextEntry
                    />

                    <AppButton
                        title="Iniciar Sesión"
                        style={styles.button}
                        onPress={handleLogin}
                        textStyle={styles.buttonText}
                        loading={loading}
                    />
                </View>

                <Text style={styles.footer}>
                    SmartPark v1.0 - {new Date().getFullYear()}
                </Text>
            </View>
        </KeyboardAvoidingView>
    );
}

// Los estilos organizan el formulario de acceso para pantallas móviles.
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    title: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#2c3e50',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#7f8c8d',
        textAlign: 'center',
        marginBottom: 40,
    },
    form: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        marginBottom: 15,
        backgroundColor: '#fafafa',
    },
    button: {
        backgroundColor: '#3498db',
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    footer: {
        textAlign: 'center',
        color: '#95a5a6',
        fontSize: 12,
        marginTop: 30,
    },
});