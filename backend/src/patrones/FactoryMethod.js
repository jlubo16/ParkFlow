class VehiculoFactory {
  crear(tipoVehiculo) {
    if (tipoVehiculo === 'carro') {
      return new Carro();
    }

    if (tipoVehiculo === 'moto') {
      return new Moto();
    }

    throw new Error('Tipo de vehículo no soportado');
  }
}

class Carro {
  constructor() {
    this.tipo = 'carro';
    this.tarifaBase = 5000;
  }
}

class Moto {
  constructor() {
    this.tipo = 'moto';
    this.tarifaBase = 3000;
  }
}

module.exports = new VehiculoFactory();
