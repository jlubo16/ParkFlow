import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import api from '../services/api';

export default function Reportes() {
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [reporte, setReporte] = useState(null);
    const [loading, setLoading] = useState(false);

    const generarReporte = async () => {
        if (!fechaInicio || !fechaFin) {
            Alert.alert('Error', 'Selecciona un rango de fechas.');
            return;
        }

        setLoading(true);
        try {
            const response = await api.get(
                `/reportes/ingresos?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`
            );
            setReporte(response.data);
        } catch (error) {
            Alert.alert('Error', 'No se pudo generar el reporte.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.filtros}>
                <Text style={styles.label}>Rango de Fechas</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Fecha Inicio (YYYY-MM-DD)"
                    placeholderTextColor="#999"
                    value={fechaInicio}
                    onChangeText={setFechaInicio}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Fecha Fin (YYYY-MM-DD)"
                    placeholderTextColor="#999"
                    value={fechaFin}
                    onChangeText={setFechaFin}
                />
                <TouchableOpacity style={styles.button} onPress={generarReporte}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>📊 Generar Reporte</Text>
                    )}
                </TouchableOpacity>
            </View>

            {reporte && (
                <View style={styles.resultados}>
                    <Text style={styles.resultadoTitle}>📈 Resumen de Ingresos</Text>
                    <View style={styles.card}>
                        <Text style={styles.cardLabel}>Periodo</Text>
                        <Text style={styles.cardValue}>
                            {reporte.periodo.inicio} → {reporte.periodo.fin}
                        </Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.cardLabel}>💰 Total de Ingresos</Text>
                        <Text style={[styles.cardValue, styles.totalIngresos]}>
                            ${reporte.total_ingresos.toLocaleString()}
                        </Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.cardLabel}>🚗 Vehículos Atendidos</Text>
                        <Text style={styles.cardValue}>{reporte.total_vehiculos}</Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.cardLabel}>📊 Promedio Diario</Text>
                        <Text style={styles.cardValue}>
                            ${reporte.promedio_diario?.toLocaleString() || '0'}
                        </Text>
                    </View>
                    {reporte.desglose?.carro && (
                        <View style={styles.card}>
                            <Text style={styles.cardLabel}>🚗 Carros</Text>
                            <Text style={styles.cardValue}>
                                {reporte.desglose.carro.cantidad} vehículos - ${reporte.desglose.carro.total?.toLocaleString() || '0'}
                            </Text>
                        </View>
                    )}
                    {reporte.desglose?.moto && (
                        <View style={styles.card}>
                            <Text style={styles.cardLabel}>🛵 Motos</Text>
                            <Text style={styles.cardValue}>
                                {reporte.desglose.moto.cantidad} vehículos - ${reporte.desglose.moto.total?.toLocaleString() || '0'}
                            </Text>
                        </View>
                    )}
                    {reporte.mejor_dia && (
                        <View style={[styles.card, styles.mejorDia]}>
                            <Text style={styles.cardLabel}>⭐ Mejor Día</Text>
                            <Text style={styles.cardValue}>
                                {reporte.mejor_dia.fecha}: ${reporte.mejor_dia.total?.toLocaleString() || '0'}
                            </Text>
                        </View>
                    )}
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
    filtros: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 10,
    },
    input: {
        height: 45,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        backgroundColor: '#fafafa',
        marginBottom: 12,
    },
    button: {
        backgroundColor: '#3498db',
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    resultados: {
        marginTop: 15,
        marginBottom: 20,
    },
    resultadoTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 15,
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardLabel: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 5,
    },
    cardValue: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50',
    },
    totalIngresos: {
        fontSize: 28,
        color: '#27ae60',
    },
    mejorDia: {
        backgroundColor: '#fef9e7',
        borderWidth: 1,
        borderColor: '#f39c12',
    },
});