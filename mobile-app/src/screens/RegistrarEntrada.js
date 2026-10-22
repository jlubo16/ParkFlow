import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import api from '../services/api';

export default function RegistrarEntrada({ navigation }) {
    const [placa, setPlaca] = useState('');
    const [tipoVehiculo, setTipoVehiculo] = useState('carro');
    const [espacios, setEspacios] = useState([]);
    const [espacioSeleccionado, setEspacioSeleccionado] = useState(null);
    const [loading, setLoading] = useState(false);
    const [cargandoEspacios, setCargandoEspacios] = useState(true);

    useEffect(() => {
        cargarEspacios();
    }, [tipoVehiculo]);

    const cargarEspacios = async () => {
        setCargandoEspacios(true);
        try {
            const response = await api.get('/vehiculos/resumen');
            const espaciosFiltrados = response.data.espacios.filter(
                e => e.tipo_vehiculo === tipoVehiculo && e.estado === 'disponible'
            );
            setEspacios(espaciosFiltrados);
        } catch (error) {
            Alert.alert('Error', 'No se pudieron cargar los espacios.');
        } finally {
            setCargandoEspacios(false);
        }
    };

    const handleRegistrar = async () => {
        if (!placa || placa.length < 3) {
            Alert.alert('Error', 'Ingresa una placa válida (mínimo 3 caracteres).');
            return;
        }

        if (!espacioSeleccionado) {
            Alert.alert('Error', 'Selecciona un espacio disponible.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/vehiculos/entrada', {
                placa: placa.toUpperCase(),
                tipo_vehiculo: tipoVehiculo,
                id_espacio: espacioSeleccionado.id_espacio,
            });

            Alert.alert(
                '  Éxito',
                `Vehículo ${placa} registrado en espacio ${espacioSeleccionado.codigo}`,
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            Alert.alert('Error', error.response?.data?.error || 'Error al registrar entrada.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>📥 Registrar Entrada</Text>
            </View>

            <View style={styles.form}>
                <Text style={styles.label}>Tipo de Vehículo</Text>
                <View style={styles.tipoContainer}>
                    <TouchableOpacity
                        style={[
                            styles.tipoButton,
                            tipoVehiculo === 'carro' && styles.tipoButtonActive,
                        ]}
                        onPress={() => setTipoVehiculo('carro')}
                    >
                        <Text style={styles.tipoEmoji}>🚗</Text>
                        <Text style={styles.tipoText}>Carro</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.tipoButton,
                            tipoVehiculo === 'moto' && styles.tipoButtonActive,
                        ]}
                        onPress={() => setTipoVehiculo('moto')}
                    >
                        <Text style={styles.tipoEmoji}>🛵</Text>
                        <Text style={styles.tipoText}>Moto</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.label}>Placa del Vehículo</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ej: ABC-123"
                    placeholderTextColor="#999"
                    value={placa}
                    onChangeText={setPlaca}
                    autoCapitalize="characters"
                    maxLength={10}
                />

                <Text style={styles.label}>Selecciona un Espacio</Text>
                {cargandoEspacios ? (
                    <ActivityIndicator size="large" color="#3498db" />
                ) : (
                    <View style={styles.espaciosGrid}>
                        {espacios.length === 0 ? (
                            <Text style={styles.noEspacios}>
                                No hay espacios disponibles para {tipoVehiculo}s
                            </Text>
                        ) : (
                            espacios.map((espacio) => (
                                <TouchableOpacity
                                    key={espacio.id_espacio}
                                    style={[
                                        styles.espacioButton,
                                        espacioSeleccionado?.id_espacio === espacio.id_espacio &&
                                            styles.espacioSelected,
                                    ]}
                                    onPress={() => setEspacioSeleccionado(espacio)}
                                >
                                    <Text style={styles.espacioCodigo}>
                                        {espacio.codigo}
                                    </Text>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                )}

                {espacioSeleccionado && (
                    <View style={styles.selectedInfo}>
                        <Text style={styles.selectedText}>
                              Espacio seleccionado: {espacioSeleccionado.codigo}
                        </Text>
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleRegistrar}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Registrar Entrada</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
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
    form: {
        backgroundColor: '#fff',
        margin: 15,
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
        marginTop: 10,
    },
    tipoContainer: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    tipoButton: {
        flex: 1,
        padding: 15,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#ddd',
        alignItems: 'center',
        marginHorizontal: 5,
        backgroundColor: '#fafafa',
    },
    tipoButtonActive: {
        borderColor: '#3498db',
        backgroundColor: '#ebf5fb',
    },
    tipoEmoji: {
        fontSize: 30,
    },
    tipoText: {
        fontSize: 14,
        marginTop: 5,
        color: '#2c3e50',
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        backgroundColor: '#fafafa',
        marginBottom: 15,
    },
    espaciosGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 15,
    },
    espacioButton: {
        width: 60,
        height: 60,
        margin: 5,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#27ae60',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e8f8f5',
    },
    espacioSelected: {
        borderColor: '#2980b9',
        backgroundColor: '#d6eaf8',
        borderWidth: 3,
    },
    espacioCodigo: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    noEspacios: {
        textAlign: 'center',
        color: '#e74c3c',
        padding: 20,
        fontSize: 16,
    },
    selectedInfo: {
        backgroundColor: '#d5f5e3',
        padding: 15,
        borderRadius: 8,
        marginVertical: 10,
    },
    selectedText: {
        fontSize: 16,
        color: '#1a7a3a',
        fontWeight: '600',
        textAlign: 'center',
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
});