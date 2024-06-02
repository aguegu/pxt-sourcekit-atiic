


//% weight=100 color=#a96836 icon="\uf185"
namespace BH1750 {

  const Address = 35;

  /**
   * turn on BH1750.
   */
  //% blockId="BH1750_init" block="bh1750 init"
  //% weight=90 blockGap=8
  export function init(): void {
    pins.i2cWriteNumber(Address, 0x10, NumberFormat.UInt8BE);
    pins.i2cWriteNumber(Address, 0x4265, NumberFormat.UInt16BE);
  }

    /**
     * turn off BH1750, to reduce power consumption.
     */
    //% blockId="BH1750_deinit" block="bh1750 deinit"
    //% weight=90 blockGap=8
  export function deinit(): void {
    pins.i2cWriteNumber(Address, 0, NumberFormat.UInt8BE);
  }

  /**
   * get ambient light data (lx)
   */
  //% blockId="BH1750_measure" block="bh1750 measure"
  //% weight=80 blockGap=8
  export function measure(): number {
    basic.pause(120);
    return Math.idiv(pins.i2cReadNumber(Address, NumberFormat.UInt16BE) * 5, 6);
  }
}
