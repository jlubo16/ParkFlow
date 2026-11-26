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
    type ListRenderItem,
} from 'react-native';
import api, { getApiErrorMessage } from '../services/api';
import FloatingActionButton from '../components/FloatingActionButton';
import type { Employee } from '../types';

export default function GestionarEmpleados() {
    // Los estados mantienen empleados, campos del modal y operación activa.
    const [empleados, setEmpleados] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [editando, setEditando] = useState<Employee | null>(null);

    // La función consulta los empleados y finaliza el indicador al recibir la respuesta.
    const cargarEmpleados = async () => {
        try {
            const response = await api.get<Employee[]>('/empleados');
            setEmpleados(response.data);
        } catch (error) {
            Alert.alert('Error', 'No se pudieron cargar los empleados.');
        } finally {
            setLoading(false);
        }
    };

    // El efecto obtiene la lista inicial al montar la pantalla.
    useEffect(() => {
        cargarEmpleados();
    }, []);

    // La función crea o actualiza el empleado según exista un registro en edición.
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
            Alert.alert('Error', getApiErrorMessage(error, 'Error al guardar.'));
        } finally {
            setLoading(false);
        }
    };

    // La función solicita confirmación antes de desactivar al empleado en el servidor.
    const handleEliminar = async (id: number): Promise<void> => {
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

    // La función prepara el modal con los datos existentes o con campos vacíos.
    const abrirModal = (empleado: Employee | null = null): void => {
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

    // La función cierra el modal y limpia los valores usados en el formulario.
    const cerrarModal = (): void => {
        setModalVisible(false);
        setEditando(null);
        setNombre('');
        setCorreo('');
    };

    // El renderizador presenta la información y las acciones para cada empleado.
    const renderItem: ListRenderItem<Employee> = ({ item }) => (
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

    // El indicador aparece durante la primera consulta, antes de tener filas para mostrar.
    if (loading && empleados.length === 0) {
        // La lista ocupa la pantalla y comparte espacio con el botón flotante y el modal.
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#3498db" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* FlatList renderiza eficientemente la lista y ofrece un mensaje si está vacía. */}
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

            {/* El FAB abre el formulario para crear un empleado. */}
            <FloatingActionButton
                label="+"
                accessibilityLabel="Agregar empleado"
                onPress={() => abrirModal()}
            />

            {/* El modal reutiliza el formulario tanto para crear como para editar. */}
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

// Los estilos distinguen la lista, las acciones por empleado y el formulario modal.
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
    list: {
        paddingBottom: 90,
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