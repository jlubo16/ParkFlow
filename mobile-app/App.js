import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';  // <-- CAMBIADO
import Login from './src/screens/Login';
import Dashboard from './src/screens/Dashboard';
import RegistrarEntrada from './src/screens/RegistrarEntrada';
import RegistrarSalida from './src/screens/RegistrarSalida';
import Historial from './src/screens/Historial';
import Reportes from './src/screens/Reportes';
import ConfigurarTarifas from './src/screens/ConfigurarTarifas';
import GestionarEmpleados from './src/screens/GestionarEmpleados';
import { ActivityIndicator, View, Text } from 'react-native';

const Stack = createStackNavigator();

function AppNavigator() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#3498db" />
                <Text style={{ marginTop: 10, color: '#7f8c8d' }}>Cargando...</Text>
            </View>
        );
    }

    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#2c3e50',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                headerBackTitle: 'Volver',
            }}
        >
            {!user ? (
                <Stack.Screen 
                    name="Login" 
                    component={Login} 
                    options={{ headerShown: false }}
                />
            ) : (
                <>
                    <Stack.Screen 
                        name="Dashboard" 
                        component={Dashboard} 
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen 
                        name="RegistrarEntrada" 
                        component={RegistrarEntrada} 
                        options={{ title: 'Registrar Entrada' }}
                    />
                    <Stack.Screen 
                        name="RegistrarSalida" 
                        component={RegistrarSalida} 
                        options={{ title: 'Registrar Salida' }}
                    />
                    <Stack.Screen 
                        name="Historial" 
                        component={Historial} 
                        options={{ title: 'Historial' }}
                    />
                    <Stack.Screen 
                        name="Reportes" 
                        component={Reportes} 
                        options={{ title: 'Reportes' }}
                    />
                    <Stack.Screen 
                        name="ConfigurarTarifas" 
                        component={ConfigurarTarifas} 
                        options={{ title: 'Configurar Tarifas' }}
                    />
                    <Stack.Screen 
                        name="GestionarEmpleados" 
                        component={GestionarEmpleados} 
                        options={{ title: 'Gestionar Empleados' }}
                    />
                </>
            )}
        </Stack.Navigator>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <NavigationContainer>
                <AppNavigator />
            </NavigationContainer>
        </AuthProvider>
    );
}