-- ============================================
-- SMARTPARK - BASE DE DATOS COMPLETA
-- ============================================

CREATE DATABASE IF NOT EXISTS smartpark;
USE smartpark;

-- ============================================
-- 1. TABLA USUARIO
-- ============================================
CREATE TABLE usuario (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nombre_completo VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'empleado') NOT NULL DEFAULT 'empleado',
    fecha_creacion DATETIME DEFAULT NOW(),
    estado BOOLEAN DEFAULT TRUE
);

-- ============================================
-- 2. TABLA ESPACIO
-- ============================================
CREATE TABLE espacio (
    id_espacio INT PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(10) NOT NULL, -- Ej: "A1", "B3"
    tipo_vehiculo ENUM('carro', 'moto') NOT NULL,
    estado ENUM('disponible', 'ocupado', 'mantenimiento') DEFAULT 'disponible'
);

-- ============================================
-- 3. TABLA VEHICULO_ESTACIONADO
-- ============================================
CREATE TABLE vehiculo_estacionado (
    id_registro INT PRIMARY KEY AUTO_INCREMENT,
    placa VARCHAR(10) NOT NULL,
    tipo_vehiculo ENUM('carro', 'moto') NOT NULL,
    id_espacio INT NOT NULL,
    id_usuario INT NOT NULL,
    hora_entrada DATETIME NOT NULL,
    hora_salida DATETIME NULL,
    tiempo_estacionado INT NULL, -- en minutos
    total_pagado DECIMAL(10,2) NULL,
    FOREIGN KEY (id_espacio) REFERENCES espacio(id_espacio),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

-- ============================================
-- 4. TABLA TARIFAS
-- ============================================
CREATE TABLE tarifas (
    id_tarifa INT PRIMARY KEY AUTO_INCREMENT,
    tipo_vehiculo ENUM('carro', 'moto') UNIQUE NOT NULL,
    tarifa_por_hora DECIMAL(10,2) NOT NULL,
    ultima_actualizacion DATETIME DEFAULT NOW()
);

-- ============================================
-- 5. TABLA HISTORIAL_TARIFAS
-- ============================================
CREATE TABLE historial_tarifas (
    id_historial INT PRIMARY KEY AUTO_INCREMENT,
    tipo_vehiculo ENUM('carro', 'moto') NOT NULL,
    tarifa_anterior DECIMAL(10,2) NOT NULL,
    tarifa_nueva DECIMAL(10,2) NOT NULL,
    fecha_cambio DATETIME DEFAULT NOW(),
    id_usuario INT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

-- ============================================
-- 6. TABLA TRANSACCION_PAGO
-- ============================================
CREATE TABLE transaccion_pago (
    id_transaccion INT PRIMARY KEY AUTO_INCREMENT,
    id_registro INT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    metodo_pago ENUM('efectivo', 'tarjeta', 'qr') NOT NULL DEFAULT 'efectivo',
    fecha_pago DATETIME DEFAULT NOW(),
    id_usuario INT NOT NULL,
    FOREIGN KEY (id_registro) REFERENCES vehiculo_estacionado(id_registro),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

-- ============================================
-- 7. DATOS INICIALES
-- ============================================

-- Usuario Admin (contraseña: admin123)
INSERT INTO usuario (nombre_completo, correo, contrasena, rol) VALUES
('Administrador', 'admin@smartpark.com', '$2b$10$UQqK0.NY8H0LknDKaJdJgegBrE5MErdQ/5HmD0FIsykK.gk3QEHKO', 'admin');

-- Usuario Empleado (contraseña: empleado123)
INSERT INTO usuario (nombre_completo, correo, contrasena, rol) VALUES
('Empleado 1', 'empleado@smartpark.com', '$2b$10$XzY9w8v7u6t5s4r3q2p1o0n9m8l7k6j5h4g3f2d1s0a9p8o7i6u5y4t3r2', 'empleado');

-- Espacios
INSERT INTO espacio (codigo, tipo_vehiculo) VALUES
('A1', 'carro'), ('A2', 'carro'), ('A3', 'carro'),
('B1', 'moto'), ('B2', 'moto'), ('B3', 'moto'),
('A4', 'carro'), ('A5', 'carro'), ('A6', 'carro'),
('B4', 'moto'), ('B5', 'moto'), ('B6', 'moto');

-- Tarifas iniciales
INSERT INTO tarifas (tipo_vehiculo, tarifa_por_hora) VALUES
('carro', 5000),
('moto', 3000);