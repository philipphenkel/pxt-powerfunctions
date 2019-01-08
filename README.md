# pxt-powerfunctions - Power Functions IR Sender

Control your LEGO® Power Functions motors using your micro:bit or Calliope-Mini, an infrared LED and MakeCode.
This extension turns your device into a remote control for your Power Functions devices.

## Installation
Open MakeCode and select '+ Extensions' in the 'Advanced' menu. You need to enter our project URL https://github.com/philipphenkel/pxt-powerfunctions in the search field, hit return and then select the powerfunctions extension.

## MakeCode Blocks Example

![alt text](https://github.com/philipphenkel/pxt-powerfunctions/raw/master/code_example.png "MakeCode Blocks Example")

## MakeCode JavaScript Example

```javascript
basic.showIcon(IconNames.Heart)
powerfunctions.initializeIrLed(AnalogPin.P1)
powerfunctions.setMotorDirection(PowerFunctionsMotor.Blue1, PowerFunctionsDirection.Backward)

input.onButtonPressed(Button.A, () => {
    powerfunctions.setSpeed(PowerFunctionsMotor.Blue1, 3)
})

input.onButtonPressed(Button.B, () => {
    powerfunctions.float(PowerFunctionsMotor.Blue1)
})

basic.forever(() => {
    led.plotBarGraph(input.lightLevel(), 255)

    if (input.lightLevel() > 200) {
        powerfunctions.float(PowerFunctionsMotor.Blue1)
        basic.pause(5000)
        powerfunctions.setSpeed(PowerFunctionsMotor.Blue1, 2)
        basic.pause(3000)
    }
})
```

## Disclaimer

LEGO® is a trademark of the LEGO Group of companies which does not sponsor, authorize or endorse this project.

## License

Copyright (C) 2017-2019 Philipp Henkel

Licensed under the MIT License (MIT). See LICENSE file for more details.

## Supported targets

* for PXT/microbit
* for PXT/calliope
