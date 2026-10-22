import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import api from '../services/api';

export default function ConfigurarTarifas() {
    const [tarifaCarro, setTarifaCarro] = useState('');
    const [tarifaMoto, setTarifaMoto] = useState('');
    const [loading, setLoading] = useState(false);
    const [cargando, setCargando] = useState(true);
    const [historial, setHistorial] = useState([]);

    useEffect(() => {
        cargarTarifas();
        cargarHistorial();
    }, []);

    const cargarTarifas = async () => {
        try {
            const response = await api.get('/tarifas');
            const carro = response.data.find(t => t.tipo_vehiculo === 'carro');
            const moto = response.data.find(t => t.tipo_vehiculo === 'moto');
            setTarifaCarro(carro?.tarifa_por_hora?.toString() || '');
            setTarifaMoto(moto?.tarifa_por_hora?.toString() || '');
        } catch (error) {
            Alert.alert('Error', 'No se pudieron cargar las tarifas.');
        } finally {
            setCargando(false);
        }
    };

    const cargarHistorial = async () => {
        try {
            const response = await api.get('/tarifas/historial');
            setHistorial(response.data.slice(0, 10));
        } catch (error) {
            console.error('Error al cargar historial:', error);
        }
    };

    const handleGuardar = async () => {
        const carro = parseFloat(tarifaCarro);
        const moto = parseFloat(tarifaMoto);

        if (isNaN(carro) || isNaN(moto) || carro <= 0 || moto <= 0) {
            Alert.alert('Error', 'Ingresa valores numéricos válidos mayores a 0.');
            return;
        }

        setLoading(true);
        try {
            await api.put('/tarifas', { carro, moto });
            Alert.alert(' Éxito', 'Tarifas actualizadas correctamente.');
            await cargarTarifas();
            await cargarHistorial();
        } catch (error) {
            Alert.alert('Error', error.response?.data?.error || 'Error al actualizar tarifas.');
        } finally {
            setLoading(false);
        }
    };

    if (cargando) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#3498db" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>💰 Tarifas por Hora</Text>
                <Text style={styles.subtitle}>Modifica los precios según necesites</Text>

                <View style={styles.field}>
                    <Text style={styles.label}>🚗 Carro</Text>
                    <TextInput
                        style={styles.input}
                        value={tarifaCarro}
                        onChangeText={setTarifaCarro}
                        keyboardType="numeric"
                        placeholder="Ej: 5000"
                        placeholderTextColor="#999"
                    />
                    <Text style={styles.hint}>Precio por hora en pesos colombianos</Text>
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>🛵 Moto</Text>
                    <TextInput
                        style={styles.input}
                        value={tarifaMoto}
                        onChangeText={setTarifaMoto}
                        keyboardType="numeric"
                        placeholder="Ej: 3000"
                        placeholderTextColor="#999"
                    />
                    <Text style={styles.hint}>Precio por hora en pesos colombianos</Text>
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleGuardar}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>💾 Guardar Cambios</Text>
                    )}
                </TouchableOpacity>
            </View>

            {historial.length > 0 && (
                <View style={[styles.card, styles.historialCard]}>
                    <Text style={styles.historialTitle}>📜 Historial de Cambios</Text>
                    {historial.map((item, index) => (
                        <View key={index} style={styles.historialItem}>
                            <Text style={styles.historialTipo}>
                                {item.tipo_vehiculo === 'carro' ? '🚗' : '🛵'}
                            </Text>
                            <Text style={styles.historialCambio}>
                                ${item.tarifa_anterior} → ${item.tarifa_nueva}
                            </Text>
                            <Text style={styles.historialFecha}>
                                {new Date(item.fecha_cambio).toLocaleDateString()}
                            </Text>
                            <Text style={styles.historialUsuario}>
                                👤 {item.nombre_completo}
                            </Text>
                        </View>
                    ))}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 15,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        marginBottom: 15,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2c3e50',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#7f8c8d',
        textAlign: 'center',
        marginBottom: 20,
    },
    field: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 18,
        backgroundColor: '#fafafa',
    },
    hint: {
        fontSize: 12,
        color: '#95a5a6',
        marginTop: 5,
    },
    button: {
        backgroundColor: '#27ae60',
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    historialCard: {
        marginBottom: 20,
    },
    historialTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 15,
    },
    historialItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
        flexWrap: 'wrap',
    },
    historialTipo: {
        fontSize: 20,
        width: 40,
    },
    historialCambio: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2c3e50',
        flex: 1,
        marginHorizontal: 10,
    },
    historialFecha: {
        fontSize: 12,
        color: '#7f8c8d',
        width: 80,
    },
    historialUsuario: {
        fontSize: 12,
        color: '#95a5a6',
        width: '100%',
        marginTop: 2,
        paddingLeft: 40,
    },
});