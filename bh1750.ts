


//% weight=100 color=#000011 icon="\uf185"
namespace BH1750 {

  const Address = 35;

    /**
     * turn on BH1750.
     */
    //% blockId="BH1750_ON" block="turn on"
    //% weight=90 blockGap=8
    export function on(): void {
        pins.i2cWriteNumber(Address, 0x10, NumberFormat.UInt8BE)
    }

    /**
     * turn off BH1750, to reduce power consumption.
     */
    //% blockId="BH1750_OFF" block="turn off"
    //% weight=90 blockGap=8
    export function off(): void {
        pins.i2cWriteNumber(Address, 0, NumberFormat.UInt8BE)
    }

    /**
     * get ambient light data (lx)
     */
    //% blockId="BH1750_GET_INTENSITY" block="get intensity (lx)"
    //% weight=80 blockGap=8
    export function getIntensity(): number {
        return Math.idiv(pins.i2cReadNumber(Address, NumberFormat.UInt16BE) * 5, 6)
    }
}
