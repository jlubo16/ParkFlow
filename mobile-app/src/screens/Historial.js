import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TextInput,
    TouchableOpacity,
    Alert,
} from 'react-native';
import api from '../services/api';

export default function Historial() {
    const [historial, setHistorial] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');

    const cargarHistorial = async () => {
        try {
            let url = '/historial';
            if (fechaInicio && fechaFin) {
                url += `?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
            }
            const response = await api.get(url);
            setHistorial(response.data);
        } catch (error) {
            Alert.alert('Error', 'No se pudo cargar el historial.');
        }
    };

    useEffect(() => {
        cargarHistorial();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await cargarHistorial();
        setRefreshing(false);
    };

    const filtrar = () => {
        cargarHistorial();
    };

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <View style={styles.filtros}>
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
                <TouchableOpacity style={styles.filterButton} onPress={filtrar}>
                    <Text style={styles.filterButtonText}>🔍 Filtrar</Text>
                </TouchableOpacity>
            </View>

            {historial.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyEmoji}>📋</Text>
                    <Text style={styles.emptyText}>No hay registros</Text>
                </View>
            ) : (
                historial.map((item) => (
                    <View key={item.id_registro} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.placa}>{item.placa}</Text>
                            <Text style={styles.tipo}>
                                {item.tipo_vehiculo === 'carro' ? '🚗' : '🛵'}
                            </Text>
                        </View>
                        <View style={styles.cardBody}>
                            <Text style={styles.detail}>
                                Espacio: {item.espacio}
                            </Text>
                            <Text style={styles.detail}>
                                Entrada: {new Date(item.hora_entrada).toLocaleString()}
                            </Text>
                            {item.hora_salida && (
                                <>
                                    <Text style={styles.detail}>
                                        Salida: {new Date(item.hora_salida).toLocaleString()}
                                    </Text>
                                    <Text style={styles.detail}>
                                        Tiempo: {item.tiempo_estacionado} min
                                    </Text>
                                    <Text style={[styles.detail, styles.total]}>
                                        Total: ${item.total_pagado?.toLocaleString() || '0'}
                                    </Text>
                                </>
                            )}
                            <Text style={styles.empleado}>
                                👤 {item.empleado || 'Sin empleado'}
                            </Text>
                        </View>
                    </View>
                ))
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
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    input: {
        height: 40,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 10,
        fontSize: 14,
        backgroundColor: '#fafafa',
    },
    filterButton: {
        backgroundColor: '#3498db',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    filterButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 50,
    },
    emptyEmoji: {
        fontSize: 60,
    },
    emptyText: {
        fontSize: 18,
        color: '#7f8c8d',
        marginTop: 15,
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
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
        paddingBottom: 10,
        marginBottom: 10,
    },
    placa: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    tipo: {
        fontSize: 24,
    },
    cardBody: {
        gap: 4,
    },
    detail: {
        fontSize: 14,
        color: '#34495e',
        paddingVertical: 2,
    },
    total: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#27ae60',
        marginTop: 5,
    },
    empleado: {
        fontSize: 12,
        color: '#7f8c8d',
        marginTop: 5,
        fontStyle: 'italic',
    },
});