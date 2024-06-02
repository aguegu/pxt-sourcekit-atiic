//% color=#a96836 icon="\f0e4"
namespace Atiic {

  function array2buffer (list: number[]) {
    const buff = pins.createBuffer(list.length);
    list.forEach((x, i) => {
      buff.setNumber(NumberFormat.UInt8LE, i, x);
    });
    return buff;
  }

  const addressBH1750 = 0x23;

  //% blockId="bh1750Init" block="bh1750.init"
  //% color=#a96836
  export function bh1750Init(): void {
    pins.i2cWriteBuffer(addressBH1750, array2buffer([0x10]));
    pins.i2cWriteBuffer(addressBH1750, array2buffer([0x42, 0x65]));
  }

  //% blockId="bh1750Intensity" block="bh1750.measure"
  //% weight=80 blockGap=8
  export function bh1750Intensity(): number {
    basic.pause(120);
    return Math.idiv(pins.i2cReadNumber(addressBH1750, NumberFormat.UInt16BE) * 5, 6);
  }

  // export function init(): void {
  //   const status = pins.i2cReadNumber(Address, NumberFormat.UInt8BE);
  //   if (!(status & 0x08)) {
  //     pins.i2cWriteBuffer(Address, array2buffer([0xbe, 0x08, 0x00]));
  //     basic.pause(10);
  //   }
  // }
  //
  // //% blockId="AHT21_humidity" block="aht21 humidity"
  // //% weight=80 blockGap=8
  // export function humidiy(): number {
  //   pins.i2cWriteBuffer(Address, array2buffer([0xac, 0x33, 0x08]));
  //   basic.pause(80);
  //
  //   const buff = pins.i2cReadBuffer(Address, 7);
  //
  //   const humidiy = buff.getNumber(NumberFormat.UInt32BE, 1);
  //
  //   humidiy >>= 12;
  //   humidiy /= 1 << 20;
  //
  //   return humidiy;
  // }
}
