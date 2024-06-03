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

  // //% blockId="vl53l01Init" block="VL53L01.init"
  // //% color=#a9a136
  // export function vl53l01Init(): void {
  //   [
  //     0x00, /* 0x2d : set bit 2 and 5 to 1 for fast plus mode (1MHz I2C), else don't touch */
  //     0x01, /* 0x2e : bit 0 if I2C pulled up at 1.8V, else set bit 0 to 1 (pull up at AVDD) */
  //     0x01, /* 0x2f : bit 0 if GPIO pulled up at 1.8V, else set bit 0 to 1 (pull up at AVDD) */
  //     0x01, /* 0x30 : set bit 4 to 0 for active high interrupt and 1 for active low (bits 3:0 must be 0x1), use SetInterruptPolarity() */
  //     0x02, /* 0x31 : bit 1 = interrupt depending on the polarity, use CheckForDataReady() */
  //     0x00, /* 0x32 : not user-modifiable */
  //     0x02, /* 0x33 : not user-modifiable */
  //     0x08, /* 0x34 : not user-modifiable */
  //     0x00, /* 0x35 : not user-modifiable */
  //     0x08, /* 0x36 : not user-modifiable */
  //     0x10, /* 0x37 : not user-modifiable */
  //     0x01, /* 0x38 : not user-modifiable */
  //     0x01, /* 0x39 : not user-modifiable */
  //     0x00, /* 0x3a : not user-modifiable */
  //     0x00, /* 0x3b : not user-modifiable */
  //     0x00, /* 0x3c : not user-modifiable */
  //     0x00, /* 0x3d : not user-modifiable */
  //     0xff, /* 0x3e : not user-modifiable */
  //     0x00, /* 0x3f : not user-modifiable */
  //     0x0F, /* 0x40 : not user-modifiable */
  //     0x00, /* 0x41 : not user-modifiable */
  //     0x00, /* 0x42 : not user-modifiable */
  //     0x00, /* 0x43 : not user-modifiable */
  //     0x00, /* 0x44 : not user-modifiable */
  //     0x00, /* 0x45 : not user-modifiable */
  //     0x20, /* 0x46 : interrupt configuration 0->level low detection, 1-> level high, 2-> Out of window, 3->In window, 0x20-> New sample ready , TBC */
  //     0x0b, /* 0x47 : not user-modifiable */
  //     0x00, /* 0x48 : not user-modifiable */
  //     0x00, /* 0x49 : not user-modifiable */
  //     0x02, /* 0x4a : not user-modifiable */
  //     0x0a, /* 0x4b : not user-modifiable */
  //     0x21, /* 0x4c : not user-modifiable */
  //     0x00, /* 0x4d : not user-modifiable */
  //     0x00, /* 0x4e : not user-modifiable */
  //     0x05, /* 0x4f : not user-modifiable */
  //     0x00, /* 0x50 : not user-modifiable */
  //     0x00, /* 0x51 : not user-modifiable */
  //     0x00, /* 0x52 : not user-modifiable */
  //     0x00, /* 0x53 : not user-modifiable */
  //     0xc8, /* 0x54 : not user-modifiable */
  //     0x00, /* 0x55 : not user-modifiable */
  //     0x00, /* 0x56 : not user-modifiable */
  //     0x38, /* 0x57 : not user-modifiable */
  //     0xff, /* 0x58 : not user-modifiable */
  //     0x01, /* 0x59 : not user-modifiable */
  //     0x00, /* 0x5a : not user-modifiable */
  //     0x08, /* 0x5b : not user-modifiable */
  //     0x00, /* 0x5c : not user-modifiable */
  //     0x00, /* 0x5d : not user-modifiable */
  //     0x01, /* 0x5e : not user-modifiable */
  //     0xdb, /* 0x5f : not user-modifiable */
  //     0x0f, /* 0x60 : not user-modifiable */
  //     0x01, /* 0x61 : not user-modifiable */
  //     0xf1, /* 0x62 : not user-modifiable */
  //     0x0d, /* 0x63 : not user-modifiable */
  //     0x01, /* 0x64 : Sigma threshold MSB (mm in 14.2 format for MSB+LSB), use SetSigmaThreshold(), default value 90 mm  */
  //     0x68, /* 0x65 : Sigma threshold LSB */
  //     0x00, /* 0x66 : Min count Rate MSB (MCPS in 9.7 format for MSB+LSB), use SetSignalThreshold() */
  //     0x80, /* 0x67 : Min count Rate LSB */
  //     0x08, /* 0x68 : not user-modifiable */
  //     0xb8, /* 0x69 : not user-modifiable */
  //     0x00, /* 0x6a : not user-modifiable */
  //     0x00, /* 0x6b : not user-modifiable */
  //     0x00, /* 0x6c : Intermeasurement period MSB, 32 bits register, use SetIntermeasurementInMs() */
  //     0x00, /* 0x6d : Intermeasurement period */
  //     0x0f, /* 0x6e : Intermeasurement period */
  //     0x89, /* 0x6f : Intermeasurement period LSB */
  //     0x00, /* 0x70 : not user-modifiable */
  //     0x00, /* 0x71 : not user-modifiable */
  //     0x00, /* 0x72 : distance threshold high MSB (in mm, MSB+LSB), use SetD:tanceThreshold() */
  //     0x00, /* 0x73 : distance threshold high LSB */
  //     0x00, /* 0x74 : distance threshold low MSB ( in mm, MSB+LSB), use SetD:tanceThreshold() */
  //     0x00, /* 0x75 : distance threshold low LSB */
  //     0x00, /* 0x76 : not user-modifiable */
  //     0x01, /* 0x77 : not user-modifiable */
  //     0x0f, /* 0x78 : not user-modifiable */
  //     0x0d, /* 0x79 : not user-modifiable */
  //     0x0e, /* 0x7a : not user-modifiable */
  //     0x0e, /* 0x7b : not user-modifiable */
  //     0x00, /* 0x7c : not user-modifiable */
  //     0x00, /* 0x7d : not user-modifiable */
  //     0x02, /* 0x7e : not user-modifiable */
  //     0xc7, /* 0x7f : ROI center, use SetROI() */
  //     0xff, /* 0x80 : XY ROI (X=Width, Y=Height), use SetROI() */
  //     0x9B, /* 0x81 : not user-modifiable */
  //     0x00, /* 0x82 : not user-modifiable */
  //     0x00, /* 0x83 : not user-modifiable */
  //     0x00, /* 0x84 : not user-modifiable */
  //     0x01, /* 0x85 : not user-modifiable */
  //     0x00, /* 0x86 : clear interrupt, use ClearInterrupt() */
  //     0x00, /* 0x87 : start ranging, use StartRanging() or StopRanging(), If you want an automatic start after VL53L1X_init() call, put 0x40 in location 0x87 */
  //   ].forEach((v, i) => {
  //     pins.i2cWriteBuffer(addressVl53l01, array2buffer([0x00, 0x2d + i, v]));
  //   });
  //
  //   vl53l01ClearInterrupt()
  //   pins.i2cWriteBuffer(addressVl53l01, array2buffer([0x00, 0x87, 0x40]));
  //   basic.pause(0x70);
  //   vl53l01ClearInterrupt();
  //   pins.i2cWriteBuffer(addressVl53l01, array2buffer([0x00, 0x87, 0x00]));
  //   pins.i2cWriteBuffer(addressVl53l01, array2buffer([0x00, 0x08, 0x09]));
  //   pins.i2cWriteBuffer(addressVl53l01, array2buffer([0x00, 0x0b, 0x00]));
  // }

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
}
