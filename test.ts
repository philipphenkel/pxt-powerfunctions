powerfunctions.runTests()

basic.showIcon(IconNames.Heart)
powerfunctions.useIrLedPin(AnalogPin.P1)
powerfunctions.setMotorDirection(PowerFunctionsMotor.Blue1, PowerFunctionsDirection.Backward)

input.onButtonPressed(Button.A, () => {
    powerfunctions.moveForward(PowerFunctionsMotor.Blue1)
})

input.onButtonPressed(Button.B, () => {
    powerfunctions.float(PowerFunctionsMotor.Blue1)
})

basic.forever(() => {
    led.plotBarGraph(
    input.lightLevel(),
    255
    )
    if (input.lightLevel() > 200) {
        powerfunctions.float(PowerFunctionsMotor.Blue1)
        basic.pause(5000)
        powerfunctions.setSpeed(PowerFunctionsMotor.Blue1, 2)
        basic.pause(3000)
    }
})

