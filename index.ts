//% color=#a96836 icon="\uf0e4"
namespace Atiic {

  function array2buffer (list: number[]) {
    const buff = pins.createBuffer(list.length);
    list.forEach((x, i) => {
      buff.setNumber(NumberFormat.UInt8LE, i, x);
    });
    return buff;
  }

  const addressBH1750 = 0x23;
  const addressAht21 = 0x38;
  const addressMlx90604 = 0x5a;

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

  //% blockId="mlx90604Ambient" block="MLX90614.ambient"
  //% color=#a136a9
  export function mlx90604Ambient(): number {
    pins.i2cWriteBuffer(addressMlx90604, array2buffer([0x06]), true);
    const buff = pins.i2cReadBuffer(addressMlx90604, 3);
    const v = buff.getNumber(NumberFormat.UInt16BE, 0);
    return v * 0.02 - 273.15;
  }

  //% blockId="mlx90604Target" block="MLX90614.target"
  //% color=#a136a9
  export function mlx90604Target(): number {
    pins.i2cWriteBuffer(addressMlx90604, array2buffer([0x07]), true);
    const buff = pins.i2cReadBuffer(addressMlx90604, 3);
    const v = buff.getNumber(NumberFormat.UInt16BE, 0);
    return v * 0.02 - 273.15;
  }

}
