/** El tipo de vehículo admitido por las operaciones del parqueadero. */
export type VehicleType = 'carro' | 'moto';

/** Los estados que puede tener un espacio en el parqueadero. */
export type ParkingSpaceState = 'disponible' | 'ocupado' | 'mantenimiento';

/** La información del usuario autenticado que consume la aplicación. */
export interface AuthUser {
    id_usuario: number;
    nombre_completo: string;
    correo: string;
    rol: 'admin' | 'empleado';
    estado?: boolean;
}

/** Los datos de identificación, categoría y disponibilidad de un espacio. */
export interface ParkingSpace {
    id_espacio: number;
    codigo: string;
    tipo_vehiculo: VehicleType;
    estado: ParkingSpaceState;
}

/** El resumen de ocupación y la lista de espacios que devuelve la API. */
export interface ParkingSummary {
    total: number | string;
    disponibles: number | string;
    ocupados: number | string;
    espacios: ParkingSpace[];
}

/** La tarifa vigente por hora para cada tipo de vehículo. */
export interface Tariff {
    id_tarifa: number;
    tipo_vehiculo: VehicleType;
    tarifa_por_hora: number | string;
}

/** Un registro del historial de modificaciones de tarifas. */
export interface TariffHistoryEntry {
    id_historial: number;
    tipo_vehiculo: VehicleType;
    tarifa_anterior: number | string;
    tarifa_nueva: number | string;
    fecha_cambio: string;
    nombre_completo: string;
}

/** La información necesaria para mostrar un vehículo que sigue estacionado. */
export interface ParkedVehicle {
    id_registro: number;
    placa: string;
    tipo_vehiculo: VehicleType;
    id_espacio: number;
    espacio_codigo: string;
    hora_entrada: string;
}

/** Los datos calculados que presenta la pantalla antes de registrar una salida. */
export interface ExitDetails extends ParkedVehicle {
    minutos: number;
    horas: number;
    total: number;
    tarifaPorHora: number;
}

/** Un registro de entrada o salida que se muestra en el historial. */
export interface HistoryEntry {
    id_registro: number;
    placa: string;
    tipo_vehiculo: VehicleType;
    espacio: string;
    hora_entrada: string;
    hora_salida: string | null;
    tiempo_estacionado: number | string | null;
    total_pagado: number | string | null;
    empleado: string | null;
}

/** Los datos de un empleado que devuelve la API de administración. */
export interface Employee {
    id_usuario: number;
    nombre_completo: string;
    correo: string;
    rol: 'empleado';
    fecha_creacion: string;
    estado: boolean;
}

/** El desglose de ingresos y cantidad para una categoría de vehículo. */
export interface IncomeBreakdown {
    cantidad: number | string;
    total: number | string;
}

/** La estructura del reporte de ingresos que devuelve el servidor. */
export interface IncomeReport {
    periodo: {
        inicio: string;
        fin: string;
    };
    total_ingresos: number | string;
    total_vehiculos: number | string;
    promedio_diario: number | string;
    desglose: Partial<Record<VehicleType, IncomeBreakdown>>;
    mejor_dia: {
        fecha: string;
        total: number | string;
    } | null;
}

/** La respuesta de autenticación que entrega la API al iniciar sesión. */
export interface LoginResponse {
    success: boolean;
    token: string;
    usuario: AuthUser;
}

/** El formato de error que la API puede devolver al cliente. */
export interface ApiErrorResponse {
    error?: string;
}
