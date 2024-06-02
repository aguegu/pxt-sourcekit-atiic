//% weight=100 color=#3677a9 icon="\uf043"
namespace AHT21 {
  const Address = 0x38;

  function array2buffer (list: number[]) {
    const buff = pins.createBuffer(list.length);
    list.forEach((x, i) => {
      buff.setNumber(NumberFormat.UInt8LE, i, x);
    });
    return buff;
  }

  //% blockId="AHT21_init" block="aht21 init"
  //% weight=90 blockGap=8
  export function init(): void {
    const status = pins.i2cReadNumber(Address, NumberFormat.UInt8BE);
    if (!(status & 0x08)) {
      pins.i2cWriteBuffer(Address, array2buffer([0xbe, 0x08, 0x00]));
      basic.pause(10);
    }
  }

  //% blockId="AHT21_humidity" block="aht21 humidity"
  //% weight=80 blockGap=8
  export function humidiy(): number {
    pins.i2cWriteBuffer(Address, array2buffer([0xac, 0x33, 0x08]));
    basic.pause(80);

    const buff = pins.i2cReadBuffer(Address, 7);

    const humidiy = buff.getNumber(NumberFormat.UInt32BE, 1);

    humidiy >>= 12;
    humidiy /= 1 << 20;

    return humidiy;
  }

  // //% blockId="AHT21_temperature" block="aht21 temperature"
  // //% weight=80 blockGap=8
  // export function temperature(): number {
  //   pins.i2cWriteBuffer(Address, array2buffer([0xac, 0x33, 0x08]));
  //   basic.pause(80);
  //
  //   const buff = pins.i2cReadBuffer(Address, 7);
  //
  //   const temperature = buff.getNumber(NumberFormat.UInt32BE, 3);
  //
  //
  //
  //   return humidiy;
  // }
}
