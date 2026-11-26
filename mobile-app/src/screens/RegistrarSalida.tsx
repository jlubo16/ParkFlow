import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import api from '../services/api';
import AppButton from '../components/AppButton';
import { getApiErrorMessage } from '../services/api';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';
import type { ExitDetails, ParkedVehicle, Tariff } from '../types';

type Props = StackScreenProps<RootStackParamList, 'RegistrarSalida'>;

export default function RegistrarSalida({ navigation }: Props) {
    // Los estados conservan vehículos activos, tarifas, selección y datos calculados de salida.
    const [vehiculos, setVehiculos] = useState<ParkedVehicle[]>([]);
    const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<ParkedVehicle | null>(null);
    const [detalle, setDetalle] = useState<ExitDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [cargando, setCargando] = useState(true);
    const [tarifas, setTarifas] = useState<Tariff[]>([]);

    // El efecto carga los vehículos y las tarifas cuando se abre la pantalla.
    useEffect(() => {
        cargarVehiculos();
        cargarTarifas();
    }, []);

    // La función obtiene los vehículos que todavía permanecen en el parqueadero.
    const cargarVehiculos = async () => {
        setCargando(true);
        try {
            const response = await api.get<ParkedVehicle[]>('/vehiculos/estacionados');
            setVehiculos(response.data);
        } catch (error) {
            Alert.alert('Error', 'No se pudieron cargar los vehículos.');
        } finally {
            setCargando(false);
        }
    };

    // La función recupera las tarifas vigentes que se usan para estimar el cobro.
    const cargarTarifas = async () => {
        try {
            const response = await api.get<Tariff[]>('/tarifas');
            setTarifas(response.data);
        } catch (error) {
            console.error('Error al cargar tarifas:', error);
        }
    };

    // La función calcula el tiempo y el valor estimado para el vehículo seleccionado.
    const seleccionarVehiculo = (vehiculo: ParkedVehicle): void => {
        setVehiculoSeleccionado(vehiculo);
        
        const tarifa = tarifas.find(t => t.tipo_vehiculo === vehiculo.tipo_vehiculo);
        const tarifaPorHora = tarifa ? Number(tarifa.tarifa_por_hora) : 5000;
        
        // El cálculo redondea minutos y horas hacia arriba, igual que la lógica del servidor.
        const ahora = new Date();
        const entrada = new Date(vehiculo.hora_entrada);
        const minutos = Math.ceil((ahora.getTime() - entrada.getTime()) / (1000 * 60));
        const horas = Math.ceil(minutos / 60);
        const total = horas * tarifaPorHora;

        setDetalle({
            ...vehiculo,
            minutos,
            horas,
            total,
            tarifaPorHora,
        });
    };

    // La función confirma la salida y muestra el valor final devuelto por el servidor.
    const handleRegistrarSalida = async () => {
        if (!vehiculoSeleccionado) {
            Alert.alert('Error', 'Selecciona un vehículo.');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/vehiculos/salida', {
                id_registro: vehiculoSeleccionado.id_registro,
            });

            Alert.alert(
                '  Salida Registrada',
                `Vehículo ${vehiculoSeleccionado.placa}\nTotal a pagar: $${response.data.total_pagado.toLocaleString()}`,
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            Alert.alert('Error', getApiErrorMessage(error, 'Error al registrar salida.'));
        } finally {
            setLoading(false);
        }
    };

    // La pantalla muestra un indicador hasta completar la carga inicial de vehículos.
    if (cargando) {
        // La lista permite elegir un vehículo y revisar el cobro antes de confirmar su salida.
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#3498db" />
                <Text style={styles.centerText}>Cargando vehículos...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>📤 Registrar Salida</Text>
            </View>

            {/* La condición separa el estado vacío de la lista de vehículos estacionados. */}
            {vehiculos.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyEmoji}>🚗</Text>
                    <Text style={styles.emptyText}>No hay vehículos estacionados</Text>
                </View>
            ) : (
                <>
                    <View style={styles.listaContainer}>
                        <Text style={styles.sectionTitle}>Vehículos Estacionados</Text>
                        {vehiculos.map((v) => (
                            <TouchableOpacity
                                key={v.id_registro}
                                style={[
                                    styles.vehiculoCard,
                                    vehiculoSeleccionado?.id_registro === v.id_registro &&
                                        styles.vehiculoSelected,
                                ]}
                                onPress={() => seleccionarVehiculo(v)}
                            >
                                <View style={styles.vehiculoInfo}>
                                    <Text style={styles.vehiculoPlaca}>{v.placa}</Text>
                                    <Text style={styles.vehiculoTipo}>
                                        {v.tipo_vehiculo === 'carro' ? '🚗' : '🛵'}
                                    </Text>
                                </View>
                                <Text style={styles.vehiculoEspacio}>
                                    Espacio {v.espacio_codigo}
                                </Text>
                                <Text style={styles.vehiculoHora}>
                                    Entrada: {new Date(v.hora_entrada).toLocaleTimeString()}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* El detalle y la confirmación aparecen después de elegir un vehículo. */}
                    {detalle && (
                        <View style={styles.detalleContainer}>
                            <Text style={styles.detalleTitle}>🧾 Detalle de Salida</Text>
                            <View style={styles.detalleRow}>
                                <Text style={styles.detalleLabel}>Placa:</Text>
                                <Text style={styles.detalleValue}>{detalle.placa}</Text>
                            </View>
                            <View style={styles.detalleRow}>
                                <Text style={styles.detalleLabel}>Espacio:</Text>
                                <Text style={styles.detalleValue}>{detalle.espacio_codigo}</Text>
                            </View>
                            <View style={styles.detalleRow}>
                                <Text style={styles.detalleLabel}>Hora entrada:</Text>
                                <Text style={styles.detalleValue}>
                                    {new Date(detalle.hora_entrada).toLocaleTimeString()}
                                </Text>
                            </View>
                            <View style={styles.detalleRow}>
                                <Text style={styles.detalleLabel}>Tarifa por hora:</Text>
                                <Text style={styles.detalleValue}>
                                    ${detalle.tarifaPorHora?.toLocaleString() || '0'}
                                </Text>
                            </View>
                            <View style={styles.detalleRow}>
                                <Text style={styles.detalleLabel}>Tiempo:</Text>
                                <Text style={styles.detalleValue}>
                                    {detalle.horas}h ({detalle.minutos} min)
                                </Text>
                            </View>
                            <View style={[styles.detalleRow, styles.totalRow]}>
                                <Text style={styles.detalleLabel}>Total a pagar:</Text>
                                <Text style={styles.totalValue}>
                                    ${detalle.total.toLocaleString()}
                                </Text>
                            </View>

                            <AppButton
                                title="Confirmar Salida"
                                style={styles.button}
                                textStyle={styles.buttonText}
                                onPress={handleRegistrarSalida}
                                loading={loading}
                            />
                        </View>
                    )}
                </>
            )}
        </ScrollView>
    );
}

// Los estilos diferencian estados vacíos, tarjetas de vehículos y resumen del cobro.
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    centerText: {
        marginTop: 15,
        color: '#7f8c8d',
    },
    header: {
        backgroundColor: '#2c3e50',
        padding: 20,
        paddingTop: 50,
        paddingBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
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
    listaContainer: {
        backgroundColor: '#fff',
        margin: 15,
        borderRadius: 10,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 10,
    },
    vehiculoCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    vehiculoSelected: {
        borderColor: '#3498db',
        backgroundColor: '#ebf5fb',
    },
    vehiculoInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    vehiculoPlaca: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginRight: 10,
    },
    vehiculoTipo: {
        fontSize: 20,
    },
    vehiculoEspacio: {
        fontSize: 14,
        color: '#7f8c8d',
        marginHorizontal: 10,
    },
    vehiculoHora: {
        fontSize: 12,
        color: '#95a5a6',
    },
    detalleContainer: {
        backgroundColor: '#fff',
        margin: 15,
        marginTop: 0,
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        marginBottom: 20,
    },
    detalleTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 15,
        textAlign: 'center',
    },
    detalleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
    },
    totalRow: {
        borderBottomWidth: 0,
        paddingVertical: 15,
        marginTop: 5,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        paddingHorizontal: 10,
    },
    detalleLabel: {
        fontSize: 16,
        color: '#7f8c8d',
    },
    detalleValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
    },
    totalValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#27ae60',
    },
    button: {
        backgroundColor: '#27ae60',
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});