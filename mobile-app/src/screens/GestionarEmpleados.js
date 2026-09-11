import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Alert,
    ActivityIndicator,
    Modal,
} from 'react-native';
import api from '../services/api';

export default function GestionarEmpleados() {
    const [empleados, setEmpleados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [editando, setEditando] = useState(null);

    const cargarEmpleados = async () => {
        try {
            const response = await api.get('/empleados');
            setEmpleados(response.data);
        } catch (error) {
            Alert.alert('Error', 'No se pudieron cargar los empleados.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarEmpleados();
    }, []);

    const handleGuardar = async () => {
        if (!nombre || !correo) {
            Alert.alert('Error', 'Todos los campos son requeridos.');
            return;
        }

        setLoading(true);
        try {
            if (editando) {
                await api.put(`/empleados/${editando.id_usuario}`, {
                    nombre_completo: nombre,
                    correo,
                    estado: true,
                });
                Alert.alert('  Éxito', 'Empleado actualizado.');
            } else {
                await api.post('/empleados', { nombre_completo: nombre, correo });
                Alert.alert('  Éxito', 'Empleado creado correctamente.');
            }
            cerrarModal();
            await cargarEmpleados();
        } catch (error) {
            Alert.alert('Error', error.response?.data?.error || 'Error al guardar.');
        } finally {
            setLoading(false);
        }
    };

    const handleEliminar = async (id) => {
        Alert.alert(
            'Confirmar',
            '¿Estás seguro de desactivar este empleado?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/empleados/${id}`);
                            Alert.alert('  Éxito', 'Empleado desactivado.');
                            await cargarEmpleados();
                        } catch (error) {
                            Alert.alert('Error', 'No se pudo eliminar el empleado.');
                        }
                    }
                }
            ]
        );
    };

    const abrirModal = (empleado = null) => {
        if (empleado) {
            setEditando(empleado);
            setNombre(empleado.nombre_completo);
            setCorreo(empleado.correo);
        } else {
            setEditando(null);
            setNombre('');
            setCorreo('');
        }
        setModalVisible(true);
    };

    const cerrarModal = () => {
        setModalVisible(false);
        setEditando(null);
        setNombre('');
        setCorreo('');
    };

    const renderItem = ({ item }) => (
        <View style={styles.empleadoCard}>
            <View style={styles.empleadoInfo}>
                <Text style={styles.empleadoNombre}>{item.nombre_completo}</Text>
                <Text style={styles.empleadoCorreo}>{item.correo}</Text>
                <View style={styles.empleadoEstado}>
                    <Text style={[
                        styles.estadoBadge,
                        item.estado ? styles.estadoActivo : styles.estadoInactivo
                    ]}>
                        {item.estado ? '  Activo' : '❌ Inactivo'}
                    </Text>
                </View>
            </View>
            <View style={styles.empleadoAcciones}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => abrirModal(item)}
                >
                    <Text style={styles.actionText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleEliminar(item.id_usuario)}
                >
                    <Text style={styles.actionText}>🗑️</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading && empleados.length === 0) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#3498db" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => abrirModal()}
            >
                <Text style={styles.addButtonText}>➕ Agregar Empleado</Text>
            </TouchableOpacity>

            <FlatList
                data={empleados}
                renderItem={renderItem}
                keyExtractor={item => item.id_usuario.toString()}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyEmoji}>👥</Text>
                        <Text style={styles.emptyText}>No hay empleados registrados</Text>
                    </View>
                }
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={cerrarModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {editando ? '✏️ Editar Empleado' : '➕ Nuevo Empleado'}
                        </Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Nombre completo"
                            placeholderTextColor="#999"
                            value={nombre}
                            onChangeText={setNombre}
                        />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Correo electrónico"
                            placeholderTextColor="#999"
                            value={correo}
                            onChangeText={setCorreo}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalCancel]}
                                onPress={cerrarModal}
                            >
                                <Text style={styles.modalButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalSave]}
                                onPress={handleGuardar}
                            >
                                <Text style={styles.modalButtonText}>Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
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
    addButton: {
        backgroundColor: '#3498db',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 15,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    list: {
        paddingBottom: 20,
    },
    empleadoCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    empleadoInfo: {
        flex: 1,
    },
    empleadoNombre: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    empleadoCorreo: {
        fontSize: 14,
        color: '#7f8c8d',
        marginTop: 2,
    },
    empleadoEstado: {
        marginTop: 5,
    },
    estadoBadge: {
        fontSize: 12,
        fontWeight: '600',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
        overflow: 'hidden',
        alignSelf: 'flex-start',
    },
    estadoActivo: {
        backgroundColor: '#d5f5e3',
        color: '#1a7a3a',
    },
    estadoInactivo: {
        backgroundColor: '#fadbd8',
        color: '#922b21',
    },
    empleadoAcciones: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 5,
    },
    editButton: {
        backgroundColor: '#ebf5fb',
    },
    deleteButton: {
        backgroundColor: '#fadbd8',
    },
    actionText: {
        fontSize: 18,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    emptyEmoji: {
        fontSize: 60,
    },
    emptyText: {
        fontSize: 18,
        color: '#7f8c8d',
        marginTop: 15,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 25,
        width: '90%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalInput: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        backgroundColor: '#fafafa',
        marginBottom: 15,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 10,
    },
    modalButton: {
        flex: 1,
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCancel: {
        backgroundColor: '#ecf0f1',
    },
    modalSave: {
        backgroundColor: '#27ae60',
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
    },
});