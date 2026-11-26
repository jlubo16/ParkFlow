import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import type { RootStackParamList } from '../navigation/types';
import type { ParkingSpace, ParkingSummary } from '../types';

type Props = StackScreenProps<RootStackParamList, 'Dashboard'>;

export default function Dashboard({ navigation }: Props) {
    // La pantalla obtiene los datos de sesión y mantiene el resumen de ocupación.
    const { user, logout } = useAuth();
    const [resumen, setResumen] = useState<ParkingSummary | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [espacios, setEspacios] = useState<ParkingSpace[]>([]);

    // La función consulta la disponibilidad y el inventario de espacios al servidor.
    const cargarDatos = async (): Promise<void> => {
        try {
            const response = await api.get<ParkingSummary>('/vehiculos/resumen');
            setResumen(response.data);
            setEspacios(response.data.espacios || []);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        }
    };

    // El efecto de navegación actualiza el resumen cada vez que la pantalla recibe foco.
    useFocusEffect(
        useCallback(() => {
            cargarDatos();
        }, [])
    );

    // El efecto inicial carga los datos cuando se crea la pantalla.
    useEffect(() => {
        cargarDatos();
    }, []);

    // La función gestiona el indicador de actualización manual de la lista.
    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await cargarDatos();
        } finally {
            setRefreshing(false);
        }
    };

    // La función cierra la sesión actual desde el contexto de autenticación.
    const handleLogout = async () => {
        await logout();
    };

    // La condición limita las opciones administrativas al rol de administrador.
    const esAdmin = user?.rol === 'admin';

    // El contenedor permite desplazarse y actualizar los datos con el gesto de refresco.
    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* La cabecera identifica al usuario y ofrece la acción para salir. */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>👋 Hola, {user?.nombre_completo}</Text>
                    <Text style={styles.role}>{user?.rol === 'admin' ? 'Administrador' : 'Empleado'}</Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Text style={styles.logoutText}>Salir</Text>
                </TouchableOpacity>
            </View>

            {/* El resumen aparece cuando la respuesta del servidor ya está disponible. */}
            {resumen && (
                <View style={styles.resumenContainer}>
                    <View style={styles.resumenCard}>
                        <Text style={styles.resumenNumero}>{resumen.total}</Text>
                        <Text style={styles.resumenLabel}>Total Espacios</Text>
                    </View>
                    <View style={[styles.resumenCard, styles.cardDisponible]}>
                        <Text style={styles.resumenNumero}>{resumen.disponibles}</Text>
                        <Text style={styles.resumenLabel}>Disponibles</Text>
                    </View>
                    <View style={[styles.resumenCard, styles.cardOcupado]}>
                        <Text style={styles.resumenNumero}>{resumen.ocupados}</Text>
                        <Text style={styles.resumenLabel}>Ocupados</Text>
                    </View>
                </View>
            )}

            {/* El mapa recorre los espacios y refleja visualmente su estado actual. */}
            <View style={styles.mapContainer}>
                <Text style={styles.sectionTitle}>🗺️ Mapa de Espacios</Text>
                <View style={styles.grid}>
                    {espacios.map((espacio) => (
                        <View
                            key={espacio.id_espacio}
                            style={[
                                styles.espacioItem,
                                espacio.estado === 'disponible' && styles.espacioDisponible,
                                espacio.estado === 'ocupado' && styles.espacioOcupado,
                                espacio.estado === 'mantenimiento' && styles.espacioMantenimiento,
                            ]}
                        >
                            <Text style={styles.espacioCodigo}>{espacio.codigo}</Text>
                            <Text style={styles.espacioTipo}>
                                {espacio.tipo_vehiculo === 'carro' ? '🚗' : '🛵'}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Las acciones comunes y administrativas llevan a las funciones de la app. */}
            <View style={styles.actionsContainer}>
                <Text style={styles.sectionTitle}>⚡ Acciones Rápidas</Text>
                <View style={styles.actionsGrid}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.actionPrimary]}
                        onPress={() => navigation.navigate('RegistrarEntrada')}
                    >
                        <Text style={styles.actionIcon}>📥</Text>
                        <Text style={styles.actionText}>Registrar Entrada</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.actionSuccess]}
                        onPress={() => navigation.navigate('RegistrarSalida')}
                    >
                        <Text style={styles.actionIcon}>📤</Text>
                        <Text style={styles.actionText}>Registrar Salida</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.actionInfo]}
                        onPress={() => navigation.navigate('Historial')}
                    >
                        <Text style={styles.actionIcon}>📋</Text>
                        <Text style={styles.actionText}>Ver Historial</Text>
                    </TouchableOpacity>

                    {esAdmin && (
                        <>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.actionWarning]}
                                onPress={() => navigation.navigate('Reportes')}
                            >
                                <Text style={styles.actionIcon}>📊</Text>
                                <Text style={styles.actionText}>Reportes</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, styles.actionPurple]}
                                onPress={() => navigation.navigate('ConfigurarTarifas')}
                            >
                                <Text style={styles.actionIcon}>💰</Text>
                                <Text style={styles.actionText}>Tarifas</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, styles.actionDark]}
                                onPress={() => navigation.navigate('GestionarEmpleados')}
                            >
                                <Text style={styles.actionIcon}>👥</Text>
                                <Text style={styles.actionText}>Empleados</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </ScrollView>
    );
}

// Los estilos agrupan la presentación de tarjetas, mapa y accesos rápidos.
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#2c3e50',
        padding: 20,
        paddingTop: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greeting: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    role: {
        fontSize: 14,
        color: '#bdc3c7',
        marginTop: 2,
    },
    logoutButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    logoutText: {
        color: '#fff',
        fontWeight: '600',
    },
    resumenContainer: {
        flexDirection: 'row',
        padding: 15,
        backgroundColor: '#fff',
        marginHorizontal: 15,
        marginTop: -20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    resumenCard: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
    },
    cardDisponible: {
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#ecf0f1',
    },
    cardOcupado: {
        // El estilo deja el borde derecho libre.
    },
    resumenNumero: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    resumenLabel: {
        fontSize: 12,
        color: '#7f8c8d',
        marginTop: 2,
    },
    mapContainer: {
        backgroundColor: '#fff',
        margin: 15,
        marginTop: 15,
        borderRadius: 10,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 15,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    espacioItem: {
        width: 60,
        height: 60,
        margin: 5,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    espacioDisponible: {
        backgroundColor: '#27ae60', // El verde identifica un espacio disponible.
    },
    espacioOcupado: {
        backgroundColor: '#e74c3c', // El rojo identifica un espacio ocupado.
    },
    espacioMantenimiento: {
        backgroundColor: '#95a5a6', // El gris identifica un espacio en mantenimiento.
    },
    espacioCodigo: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    espacioTipo: {
        color: '#fff',
        fontSize: 16,
        marginTop: 2,
    },
    actionsContainer: {
        backgroundColor: '#fff',
        margin: 15,
        marginTop: 0,
        borderRadius: 10,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        marginBottom: 20,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    actionButton: {
        width: '48%',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 5,
    },
    actionPrimary: {
        backgroundColor: '#3498db',
    },
    actionSuccess: {
        backgroundColor: '#27ae60',
    },
    actionInfo: {
        backgroundColor: '#2980b9',
    },
    actionWarning: {
        backgroundColor: '#f39c12',
    },
    actionPurple: {
        backgroundColor: '#8e44ad',
    },
    actionDark: {
        backgroundColor: '#2c3e50',
    },
    actionIcon: {
        fontSize: 24,
        color: '#fff',
    },
    actionText: {
        color: '#fff',
        fontSize: 12,
        marginTop: 5,
        textAlign: 'center',
    },
});