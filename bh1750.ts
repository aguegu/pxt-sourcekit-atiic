//% weight=100 color=#a96836 icon="\uf185"
namespace BH1750 {
  const Address = 0x23;

  function array2buffer (list: number[]) {
    const buff = pins.createBuffer(list.length);
    list.forEach((x, i) => {
      buff.setNumber(NumberFormat.UInt8LE, i, x);
    });
    return buff;
  }

  //% blockId="BH1750_init" block="bh1750.init"
  //% weight=90 blockGap=8
  export function init(): void {
    pins.i2cWriteBuffer(Address, array2buffer([0x10]));
    pins.i2cWriteBuffer(Address, array2buffer([0x42, 0x65]));
  }
  
  //% blockId="BH1750_measure" block="bh1750.measure"
  //% weight=80 blockGap=8
  export function measure(): number {
    basic.pause(120);
    return Math.idiv(pins.i2cReadNumber(Address, NumberFormat.UInt16BE) * 5, 6);
  }
}
