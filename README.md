# Power Functions IR Sender

[![Build Status](https://travis-ci.org/philipphenkel/pxt-powerfunctions.svg?branch=master)](https://travis-ci.org/philipphenkel/pxt-powerfunctions)

Control your LEGO® Power Functions motors using your micro:bit or Calliope-Mini, an infrared LED and MakeCode.
This extension turns your device into a remote control for your Power Functions devices.

A project using this extension is documented on [hackster.io](https://www.hackster.io/philipp-henkel/lego-power-functions-ir-sender-for-micro-bit-aecc10)

## Installation

Open MakeCode and select '+ Extensions' in the 'Advanced' menu. You need to enter our project URL https://github.com/philipphenkel/pxt-powerfunctions in the search field, hit return and then select the powerfunctions extension.

# Documentation

## powerfunctions.connectIrLed

Configures the infrared LED pin. A 940 nm emitting diode is required.

```sig
powerfunctions.connectIrLed(AnalogPin.P0)
```

### Parameters

- `pin` - analog pin with an attached IR-emitting LED

## powerfunctions.setSpeed

Sets the speed of a motor.

```sig
powerfunctions.setSpeed(PowerFunctionsMotor.Red1, 3)
```

### Parameters

- `motor` - the motor
- `speed` - the speed of the motor from `-7` to `7`.

## powerfunctions.brake

Brakes then float. The motor's power is quickly reversed and thus the motor will stop abruptly.

```sig
powerfunctions.brake(PowerFunctionsMotor.Red1)
```

### Parameters

- `motor` - the motor

## powerfunctions.float

Floats a motor to stop. The motor's power is switched off and thus the motor will roll to a stop.

```sig
powerfunctions.float(PowerFunctionsMotor.Red1)
```

### Parameters

- `motor` - the motor

## powerfunctions.setMotorDirection

Configures a motor direction.

```sig
powerfunctions.setMotorDirection(PowerFunctionsMotor.Red1, PowerFunctionsDirection.Right)
```

### Parameters

- `motor` - the motor
- `direction` - the direction of the motor

## MakeCode Example

```blocks
basic.showIcon(IconNames.Heart);
powerfunctions.initializeIrLed(AnalogPin.P1);

powerfunctions.setMotorDirection(
  PowerFunctionsMotor.Blue1,
  PowerFunctionsDirection.Backward
);

input.onButtonPressed(Button.A, () => {
  powerfunctions.setSpeed(PowerFunctionsMotor.Blue1, 3);
});

input.onButtonPressed(Button.B, () => {
  powerfunctions.float(PowerFunctionsMotor.Blue1);
});

basic.forever(() => {
  led.plotBarGraph(input.lightLevel(), 255);

  if (input.lightLevel() > 200) {
    powerfunctions.float(PowerFunctionsMotor.Blue1);
    basic.pause(5000);
    powerfunctions.setSpeed(PowerFunctionsMotor.Blue1, 2);
    basic.pause(3000);
  }
});
```

## Disclaimer

LEGO® is a trademark of the LEGO Group of companies which does not sponsor, authorize or endorse this project.

## License

Copyright (C) 2017-2020 Philipp Henkel

Licensed under the MIT License (MIT). See LICENSE file for more details.

## Supported targets

- for PXT/microbit
