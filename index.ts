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

  //% blockId="aht21Init" block="AHT21.init"
  //% color=#3677a9
  export function aht21Init(): void {
    const status = pins.i2cReadNumber(addressAht21, NumberFormat.UInt8BE);
    if (!(status & 0x08)) {
      pins.i2cWriteBuffer(addressAht21, array2buffer([0xbe, 0x08, 0x00]));
      basic.pause(10);
    }
  }

  //% blockId="aht21Humidity" block="AHT21.humidity"
  //% color=#3677a9
  export function aht21Humidity(): number {
    pins.i2cWriteBuffer(addressAht21, array2buffer([0xac, 0x33, 0x08]));
    basic.pause(80);

    const buff = pins.i2cReadBuffer(addressAht21, 7);

    const h1 = buff.getNumber(NumberFormat.UInt16BE, 1);
    const h2 = buff.getNumber(NumberFormat.UInt8BE, 3);

    const humidiy = (h1 * 16 + (Math.idiv(h2, 16) )) / 1048576;

    return humidiy;
  }

  const addressAht21 = 0x38;

  //% blockId="aht21Temperature" block="AHT21.temperature"
  //% color=#3677a9
  export function aht21Temperature(): number {
    pins.i2cWriteBuffer(addressAht21, array2buffer([0xac, 0x33, 0x08]));
    basic.pause(80);

    const buff = pins.i2cReadBuffer(addressAht21, 7);

    const t1 = buff.getNumber(NumberFormat.UInt8BE, 3);
    const t2 = buff.getNumber(NumberFormat.UInt16BE, 4);

    const temperature = ((t1 % 16) * 65536 + t2 ) * 200 / 1048576 - 50;

    return temperature;
  }

  const addressMlx90604 = 0x5a;

  //% blockId="mlx90604Ambient" block="MLX90614.ambient"
  //% color=#a136a9
  export function mlx90604Ambient(): number {
    basic.pause(10);
    pins.i2cWriteBuffer(addressMlx90604, array2buffer([0x06]), true);
    const buff = pins.i2cReadBuffer(addressMlx90604, 2);
    const v = buff.getNumber(NumberFormat.UInt16LE, 0);
    return v * 0.02 - 273.15;
  }

  //% blockId="mlx90604Target" block="MLX90614.target"
  //% color=#a136a9
  export function mlx90604Target(): number {
    basic.pause(10);
    pins.i2cWriteBuffer(addressMlx90604, array2buffer([0x07]), true);
    const buff = pins.i2cReadBuffer(addressMlx90604, 2);
    const v = buff.getNumber(NumberFormat.UInt16LE, 0);
    return v * 0.02 - 273.15;
  }

  const addressSpl06 = 0x76;

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
    pins.i2cWriteBuffer(addressSpl06, array2buffer([0x0c, 0x89]));
    basic.pause(40)
    pins.i2cWriteBuffer(addressSpl06, array2buffer([0x06, 0x03]));
    pins.i2cWriteBuffer(addressSpl06, array2buffer([0x07, 0x83]));
    pins.i2cWriteBuffer(addressSpl06, array2buffer([0x08, 0x07]));
    pins.i2cWriteBuffer(addressSpl06, array2buffer([0x09, 0x00]));
    pins.i2cWriteBuffer(addressSpl06, array2buffer([0x10]), true);
    const buff = pins.i2cReadBuffer(addressSpl06, 18);
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
  //% color=#a136a9
  export function spl06Airpressure(): number {
    pins.i2cWriteBuffer(addressSpl06, array2buffer([0x00]), true);
    const buff = pins.i2cReadBuffer(addressSpl06, 6);
    const pRaw = buff.getNumber(NumberFormat.Int32BE, 0);
    const tRaw = buff.getNumber(NumberFormat.Int32BE, 2) << 8 >>> 8;

    const tSc = tRaw / 7864320;
    const pSc = pRaw / 7864320;
    
    const pressure = coefs.c00
      + pSc * (coefs.c10 + pSc * (coefs.c20 + pSc * coefs.c30))
      + tSc * coefs.c01 + tSc * pSc * (coefs.c11 + pSc * coefs.c21);
    return pressure;
  }
}
