enum MPU6050_ACCELEROMETOR_SCALES {
  //% block="±2g"
  SCALE_2G = 0,
  //% block="±4g"
  SCALE_4G = 1,
  //% block="±8g"
  SCALE_8G = 2,
  //% block="±16g"
  SCALE_16G = 3,
}

enum MPU6050_GYROSCOPE_SCALES {
  //% block="±250°/s"
  SCALE_250 = 0,
  //% block="±500°/s"
  SCALE_500 = 1,
  //% block="±1000°/s"
  SCALE_1000 = 2,
  //% block="±2000°/s"
  SCALE_2000 = 3,
}


//% color=#a96836 icon="\uf152"
namespace Atiic {

  function array2buffer (list: number[]) {
    const buff = pins.createBuffer(list.length);
    list.forEach((x, i) => {
      buff.setNumber(NumberFormat.UInt8LE, i, x);
    });
    return buff;
  }

  const addressBH1750 = 0x23;

  //% blockId="bh1750Init" block="BH1750.init"
  //% color=#a96836
  export function bh1750Init(): void {
    pins.i2cWriteBuffer(addressBH1750, array2buffer([0x10]));
    pins.i2cWriteBuffer(addressBH1750, array2buffer([0x42, 0x65]));
  }

  //% blockId="bh1750Intensity" block="BH1750.intensity"
  //% color=#a96836
  export function bh1750Intensity(): number {
    basic.pause(120);
    return Math.idiv(pins.i2cReadNumber(addressBH1750, NumberFormat.UInt16BE) * 5, 6);
  }

  const addressAHT21 = 0x38;

  //% blockId="aht21Init" block="AHT21.init"
  //% color=#3677a9
  export function aht21Init(): void {
    const status = pins.i2cReadNumber(addressAHT21, NumberFormat.UInt8BE);
    if (!(status & 0x08)) {
      pins.i2cWriteBuffer(addressAHT21, array2buffer([0xbe, 0x08, 0x00]));
      basic.pause(10);
    }
  }

  //% blockId="aht21Humidity" block="AHT21.humidity"
  //% color=#3677a9
  export function aht21Humidity(): number {
    pins.i2cWriteBuffer(addressAHT21, array2buffer([0xac, 0x33, 0x08]));
    basic.pause(80);

    const buff = pins.i2cReadBuffer(addressAHT21, 7);

    const h1 = buff.getNumber(NumberFormat.UInt16BE, 1);
    const h2 = buff.getNumber(NumberFormat.UInt8BE, 3);

    const humidiy = (h1 * 16 + (Math.idiv(h2, 16) )) / 1048576;

    return humidiy;
  }

  //% blockId="aht21Temperature" block="AHT21.temperature"
  //% color=#3677a9
  export function aht21Temperature(): number {
    pins.i2cWriteBuffer(addressAHT21, array2buffer([0xac, 0x33, 0x08]));
    basic.pause(80);

    const buff = pins.i2cReadBuffer(addressAHT21, 7);

    const t1 = buff.getNumber(NumberFormat.UInt8BE, 3);
    const t2 = buff.getNumber(NumberFormat.UInt16BE, 4);

    const temperature = ((t1 % 16) * 65536 + t2 ) * 200 / 1048576 - 50;

    return temperature;
  }

  const addressMLX90604 = 0x5a;

  //% blockId="mlx90604Ambient" block="MLX90614.ambient"
  //% color=#a136a9
  export function mlx90604Ambient(): number {
    basic.pause(10);
    pins.i2cWriteBuffer(addressMLX90604, array2buffer([0x06]), true);
    const buff = pins.i2cReadBuffer(addressMLX90604, 2);
    const v = buff.getNumber(NumberFormat.UInt16LE, 0);
    return v * 0.02 - 273.15;
  }

  //% blockId="mlx90604Target" block="MLX90614.target"
  //% color=#a136a9
  export function mlx90604Target(): number {
    basic.pause(10);
    pins.i2cWriteBuffer(addressMLX90604, array2buffer([0x07]), true);
    const buff = pins.i2cReadBuffer(addressMLX90604, 2);
    const v = buff.getNumber(NumberFormat.UInt16LE, 0);
    return v * 0.02 - 273.15;
  }

  const addressSPL06 = 0x76;

  const coefs = {
    c0: 0,
    c1: 0,
    c00: 0,
    c10: 0,
    c01: 0,
    c11: 0,
    c20: 0,
    c21: 0,
    c30: 0,
  };

  //% blockId="spl06Init" block="SPL06.init"
  //% color=#3ea936
  export function spl06Init(): void {
    pins.i2cWriteBuffer(addressSPL06, array2buffer([0x0c, 0x89]));
    basic.pause(40)
    pins.i2cWriteBuffer(addressSPL06, array2buffer([0x06, 0x03]));
    pins.i2cWriteBuffer(addressSPL06, array2buffer([0x07, 0x83]));
    pins.i2cWriteBuffer(addressSPL06, array2buffer([0x08, 0x07]));
    pins.i2cWriteBuffer(addressSPL06, array2buffer([0x09, 0x00]));
    pins.i2cWriteBuffer(addressSPL06, array2buffer([0x10]), true);
    const buff = pins.i2cReadBuffer(addressSPL06, 18);
    coefs.c0 = Math.idiv(buff.getNumber(NumberFormat.Int16BE, 0), 16);
    coefs.c1 = (buff.getNumber(NumberFormat.Int32BE, 1) << 4) >> 20;
    coefs.c00 = buff.getNumber(NumberFormat.Int32BE, 3) >> 12;
    coefs.c10 = (buff.getNumber(NumberFormat.Int32BE, 5) << 4) >> 12;
    coefs.c01 = buff.getNumber(NumberFormat.Int16BE, 0x08);
    coefs.c11 = buff.getNumber(NumberFormat.Int16BE, 0x0a);
    coefs.c20 = buff.getNumber(NumberFormat.Int16BE, 0x0c);
    coefs.c21 = buff.getNumber(NumberFormat.Int16BE, 0x0e);
    coefs.c30 = buff.getNumber(NumberFormat.Int16BE, 0x10);
  }

  //% blockId="spl06Airpressure" block="SPL06.airpressure"
  //% color=#3ea936
  export function spl06Airpressure(): number {
    pins.i2cWriteBuffer(addressSPL06, array2buffer([0x00]), true);
    const buff = pins.i2cReadBuffer(addressSPL06, 6);
    const pRaw = buff.getNumber(NumberFormat.Int32BE, 0);
    const tRaw = buff.getNumber(NumberFormat.Int32BE, 2) << 8 >>> 8;

    const tSc = tRaw / 7864320;
    const pSc = pRaw / 7864320;

    const pressure = coefs.c00
      + pSc * (coefs.c10 + pSc * (coefs.c20 + pSc * coefs.c30))
      + tSc * coefs.c01 + tSc * pSc * (coefs.c11 + pSc * coefs.c21);
    return pressure;
  }

  const addressVl53l01 = 0x29;

  function vl53l01ClearInterrupt(): void {
    pins.i2cWriteBuffer(addressVl53l01, array2buffer([0x00, 0x86, 0x01]));
  }

  //% blockId="vl53l01Init" block="VL53L01.init"
  //% color=#a9a136
  export function vl53l01Init(): void {
    const settings = [
      0x00, 0x01, 0x01, 0x01, 0x02, 0x00, 0x02, 0x08,
      0x00, 0x08, 0x10, 0x01, 0x01, 0x00, 0x00, 0x00,
      0x00, 0xff, 0x00, 0x0F, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x20, 0x0b, 0x00, 0x00, 0x02, 0x0a, 0x21,
      0x00, 0x00, 0x05, 0x00, 0x00, 0x00, 0x00, 0xc8,
      0x00, 0x00, 0x38, 0xff, 0x01, 0x00, 0x08, 0x00,
      0x00, 0x01, 0xdb, 0x0f, 0x01, 0xf1, 0x0d, 0x01,
      0x68, 0x00, 0x80, 0x08, 0xb8, 0x00, 0x00, 0x00,
      0x00, 0x0f, 0x89, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x01, 0x0f, 0x0d, 0x0e, 0x0e, 0x00,
      0x00, 0x02, 0xc7, 0xff, 0x9B, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x00
    ];

    settings.forEach((v, i) => {
      pins.i2cWriteBuffer(addressVl53l01, array2buffer([0x00, 0x2d + i, v]));
    });

    vl53l01ClearInterrupt()
    pins.i2cWriteBuffer(addressVl53l01, array2buffer([0x00, 0x87, 0x40]));
    basic.pause(0x70);
    vl53l01ClearInterrupt();
    pins.i2cWriteBuffer(addressVl53l01, array2buffer([0x00, 0x87, 0x00]));
    pins.i2cWriteBuffer(addressVl53l01, array2buffer([0x00, 0x08, 0x09]));
    pins.i2cWriteBuffer(addressVl53l01, array2buffer([0x00, 0x0b, 0x00]));
  }

  //% blockId="vl53l01Distance" block="VL53L01.distance"
  //% color=#a9a136
  export function vl53l01Distance(): number {
    vl53l01ClearInterrupt();
    pins.i2cWriteBuffer(addressVl53l01, array2buffer([0x00, 0x87, 0x10]));
    basic.pause(0x70);
    pins.i2cWriteBuffer(addressVl53l01, array2buffer([0x00, 0x96]), true);
    const buff = pins.i2cReadBuffer(addressVl53l01, 2);
    return buff.getNumber(NumberFormat.UInt16BE, 0)
  }

  const addressMPU6050 = 0x68;

  const mpu6050Sensitivities = {
    gyroscope: 131.072,
    accelerometer: 16384,
  };

  //% blockId="mpu6050Init" block="MPU6050.init accelerometer scale: %accelerometorScale, gyroscope scale: %gyroscopeScale"
  //% color=#363ea9
  export function mpu6050Init(accelerometorScale: MPU6050_ACCELEROMETOR_SCALES, gyroscopeScale: MPU6050_GYROSCOPE_SCALES): void {
    mpu6050Sensitivities.gyroscope = (131072 >> gyroscopeScale) / 1000;
    mpu6050Sensitivities.accelerometer = 16384 >> accelerometorScale;

    pins.i2cWriteBuffer(addressMPU6050, array2buffer([0x6b, 0x00]));
    pins.i2cWriteBuffer(addressMPU6050, array2buffer([0x19, 0x0f]));
    pins.i2cWriteBuffer(addressMPU6050, array2buffer([0x1a, 0x04]));

    pins.i2cWriteBuffer(addressMPU6050, array2buffer([0x1b, gyroscopeScale << 3]));
    pins.i2cWriteBuffer(addressMPU6050, array2buffer([0x1c, accelerometorScale << 3]));
  }

  //% blockId="mpu6050Accelerometers" block="MPU6050.accelerometors"
  //% color=#363ea9
  export function mpu6050Accelerometers() {
    pins.i2cWriteBuffer(addressMPU6050, array2buffer([0x3B]), true);
    const buff = pins.i2cReadBuffer(addressMPU6050, 0x06);

    return {
      x: buff.getNumber(NumberFormat.Int16BE, 0) / mpu6050Sensitivities.accelerometer,
      y: buff.getNumber(NumberFormat.Int16BE, 2) / mpu6050Sensitivities.accelerometer,
      z: buff.getNumber(NumberFormat.Int16BE, 4) / mpu6050Sensitivities.accelerometer,
    };
  }
  
  //% blockId="mpu6050Gyroscopes" block="MPU6050.gyroscopes"
  //% color=#363ea9
  export function mpu6050Gyroscopes() {
    pins.i2cWriteBuffer(addressMPU6050, array2buffer([0x43]), true);
    const buff = pins.i2cReadBuffer(addressMPU6050, 0x06);

    return {
      x: buff.getNumber(NumberFormat.Int16BE, 0) / mpu6050Sensitivities.gyroscope,
      y: buff.getNumber(NumberFormat.Int16BE, 2) / mpu6050Sensitivities.gyroscope,
      z: buff.getNumber(NumberFormat.Int16BE, 4) / mpu6050Sensitivities.gyroscope,
    };
  }
}
