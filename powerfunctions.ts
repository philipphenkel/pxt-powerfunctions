/**
 * Power Functions IR Sender
 * Control your Power Functions motors using your micro:bit or Calliope-Mini, an infrared LED and MakeCode.
 *
 * (c) 2017-2019, Philipp Henkel
 */

enum PowerFunctionsChannel {
    //% block="1"
    One = 0,
    //% block="2"
    Two = 1,
    //% block="3"
    Three = 2,
    //% block="4"
    Four = 3
}

enum PowerFunctionsDirection {
    //% block="forward"
    Forward = 1,
    //% block="backward"
    Backward = -1
}

enum PowerFunctionsOutput {
    //% block="red"
    Red = 0,
    //% block="blue"
    Blue = 1
}

enum PowerFunctionsMotor {
    //% block="red | channel 1"
    Red1 = 0,
    //% block="red | channel 2"
    Red2 = 1,
    //% block="red | channel 3"
    Red3 = 2,
    //% block="red | channel 4"
    Red4 = 3,
    //% block="blue | channel 1"
    Blue1 = 4,
    //% block="blue | channel 2"
    Blue2 = 5,
    //% block="blue | channel 3"
    Blue3 = 6,
    //% block="blue | channel 4"
    Blue4 = 7
}

enum PowerFunctionsCommand {
    //% block="float"
    Float = 0,
    //% block="forward"
    Forward = 1,
    //% block="backward"
    Backward = 2,
    //% block="brake"
    Brake = 3
}

//% weight=99 color=#0fbc11 icon="\uf0e4" block="Power Functions"
namespace powerfunctions {

    interface PowerFunctionsState {
        irDevice: InfraredDevice
        motorDirections: PowerFunctionsDirection[]
    }

    let state: PowerFunctionsState

    function getChannel(motor: PowerFunctionsMotor): PowerFunctionsChannel {
        const MOTOR_TO_CHANNEL = [
            PowerFunctionsChannel.One, PowerFunctionsChannel.Two, PowerFunctionsChannel.Three, PowerFunctionsChannel.Four,
            PowerFunctionsChannel.One, PowerFunctionsChannel.Two, PowerFunctionsChannel.Three, PowerFunctionsChannel.Four
        ]
        return MOTOR_TO_CHANNEL[motor]
    }

    function getOutput(motor: PowerFunctionsMotor): PowerFunctionsOutput {
        const MOTOR_TO_OUTPUT = [
            PowerFunctionsOutput.Red, PowerFunctionsOutput.Red, PowerFunctionsOutput.Red, PowerFunctionsOutput.Red,
            PowerFunctionsOutput.Blue, PowerFunctionsOutput.Blue, PowerFunctionsOutput.Blue, PowerFunctionsOutput.Blue
        ]
        return MOTOR_TO_OUTPUT[motor]
    }

    function sendSingleOutputCommand(channel: PowerFunctionsChannel, output: PowerFunctionsOutput, speed: number) {
        const msg = message.createSingleOutputPwmMessage(channel, output, speed)
        if (state) {
            state.irDevice.sendMessage(msg)
        }
    }

    /**
     * Configures the infrared LED pin. A 940 nm emitting diode is required.
     * @param pin pin an attached IR LED
     */
    //% blockId=pf_initialize_ir_led
    //% block="initialize IR LED on pin %pin"
    //% weight=90
    //% pin.fieldEditor="gridpicker" pin.fieldOptions.columns=4 pin.fieldOptions.tooltips="false"
    export function initializeIrLed(pin: AnalogPin) {
        state = {
            irDevice: new InfraredDevice(pin),
            motorDirections: [
                PowerFunctionsDirection.Forward,
                PowerFunctionsDirection.Forward,
                PowerFunctionsDirection.Forward,
                PowerFunctionsDirection.Forward,
                PowerFunctionsDirection.Forward,
                PowerFunctionsDirection.Forward,
                PowerFunctionsDirection.Forward,
                PowerFunctionsDirection.Forward,
            ]
        }
    }

    /**
     * Set speed of a motor.
     * @param motor the motor
     * @param speed speed of the motor, eg: 3
     */
    //% blockId=powerfunctions_set_speed
    //% block="set | motor %motor | to %speed"
    //% speed.min=-7 speed.max=7
    //% weight=80
    //% motor.fieldEditor="gridpicker" motor.fieldOptions.columns=4 motor.fieldOptions.tooltips="false"
    export function setSpeed(motor: PowerFunctionsMotor, speed: number) {
        speed = Math.max(-7, Math.min(7, speed))
        if (state) {
            sendSingleOutputCommand(getChannel(motor), getOutput(motor), speed * state.motorDirections[motor])
        }
    }

    /**
     * Brake then float.
     * The motor's power is quickly reversed and thus the motor will stop abruptly.
     * @param motor the motor
     */
    //% blockId=powerfunctions_brake
    //% block="brake| motor %motor"
    //% weight=75
    //% motor.fieldEditor="gridpicker" motor.fieldOptions.columns=4 motor.fieldOptions.tooltips="false"
    export function brake(motor: PowerFunctionsMotor) {
        setSpeed(motor, 0)
    }

    /**
     * Float a motor to stop.
     * The motor's power is switched off and thus the motor will roll to a stop.
     * @param motor the motor
     */
    //% blockId=pf_float
    //% block="float | motor %motor | to stop"
    //% weight=70
    //% motor.fieldEditor="gridpicker" motor.fieldOptions.columns=4 motor.fieldOptions.tooltips="false"
    export function float(motor: PowerFunctionsMotor) {
        if (state) {
            sendSingleOutputCommand(getChannel(motor), getOutput(motor), 8)
        }
    }

    /**
     * Configures a motor direction.
     * @param motor the motor
     * @param direction the direction
     */
    //% blockId=pf_set_motor_direction
    //% block="set direction | of motor %motor | to %direction"
    //% weight=20
    //% motor.fieldEditor="gridpicker" motor.fieldOptions.columns=4 motor.fieldOptions.tooltips="false"
    export function setMotorDirection(motor: PowerFunctionsMotor, direction: PowerFunctionsDirection) {
        if (state) {
            state.motorDirections[motor] = direction
        }
    }

    namespace message {

        function mapValueToPwmElseFloat(value: number): number {
            switch (value) {
                case 7: return 0b0111
                case 6: return 0b0110
                case 5: return 0b0101
                case 4: return 0b0100
                case 3: return 0b0011
                case 2: return 0b0010
                case 1: return 0b0001
                case 0: return 0b1000 // brake then float
                case -1: return 0b1111
                case -2: return 0b1110
                case -3: return 0b1101
                case -4: return 0b1100
                case -5: return 0b1011
                case -6: return 0b1010
                case -7: return 0b1001
                default: return 0b0000 // float
            }
        }

        function createMessageFromNibbles(nibble1: number, nibble2: number, nibble3: number) {
            const lrc = 0xF ^ nibble1 ^ nibble2 ^ nibble3
            return (nibble1 << 12) | (nibble2 << 8) | (nibble3 << 4) | lrc
        }

        export function createSingleOutputPwmMessage(channel: PowerFunctionsChannel, output: PowerFunctionsOutput, value: number) {
            const nibble1 = 0b0000 + channel
            const nibble2 = 0b0100 + output
            const nibble3 = mapValueToPwmElseFloat(value)
            return createMessageFromNibbles(nibble1, nibble2, nibble3)
        }

        export function createComboDirectMessage(channel: PowerFunctionsChannel, outputRed: PowerFunctionsCommand, outputBlue: PowerFunctionsCommand) {
            const nibble1 = 0b0000 + channel
            const nibble2 = 0b0001
            const nibble3 = (outputBlue << 2) + outputRed
            return createMessageFromNibbles(nibble1, nibble2, nibble3)
        }

        export function createComboPwmMessage(channel: PowerFunctionsChannel, outputRed: number, outputBlue: number) {
            const nibble1 = 0b0100 + channel
            const nibble2 = mapValueToPwmElseFloat(outputBlue)
            const nibble3 = mapValueToPwmElseFloat(outputRed)
            return createMessageFromNibbles(nibble1, nibble2, nibble3)
        }
    }

    const IR_MARK = Math.idiv(6 * 1000000, 38000)
    const START_STOP_PAUSE = Math.idiv((45 - 6) * 1000000, 38000)
    const LOW_PAUSE = Math.idiv((16 - 6) * 1000000, 38000)
    const HIGH_PAUSE = Math.idiv((27 - 6) * 1000000, 38000)

    export class InfraredDevice {
        private pin: AnalogPin
        private writeAndWaitEffort: number
        private messageProcessingEffort: number

        constructor(
            pin: AnalogPin,
            pwmPeriod = 26
        ) {
            this.pin = pin
            pins.analogWritePin(this.pin, 0)
            pins.analogSetPeriod(this.pin, pwmPeriod)

            // Meassure analogWrite and wait effort
            {
                const start = input.runningTimeMicros()
                for (let i = 0; i < 8; i++) {
                    pins.analogWritePin(this.pin, 511)
                    control.waitMicros(1)
                }
                const end = input.runningTimeMicros()
                this.writeAndWaitEffort += end - start
                this.writeAndWaitEffort = this.writeAndWaitEffort >> 3
            }

            // Meassure message processing effort
            {
                const MESSAGE_BITS = 16
                let mask = 1 << (MESSAGE_BITS - 1)
                const message = 232

                const start = input.runningTimeMicros()
                while (mask > 0) {
                    if (message & mask) {
                        this.transmitBitCallibrationDummy(IR_MARK, HIGH_PAUSE)
                    } else {
                        this.transmitBitCallibrationDummy(IR_MARK, LOW_PAUSE)
                    }
                    mask >>= 1
                }
                const end = input.runningTimeMicros()
                this.messageProcessingEffort += end - start
                this.messageProcessingEffort >>= 4
            }

            // Make sure we have a pause between callibration and first message
            control.waitMicros(2000)
        }

        public transmitBit(markMicroSeconds: number, pauseMicroSeconds: number): void {
            pins.analogWritePin(this.pin, 511)
            control.waitMicros(markMicroSeconds - this.writeAndWaitEffort)
            pins.analogWritePin(this.pin, 0)
            control.waitMicros(Math.max(1, pauseMicroSeconds - this.writeAndWaitEffort - this.messageProcessingEffort))
        }

        private transmitBitCallibrationDummy(markMicroSeconds: number, pauseMicroSeconds: number): void {
            const p1 = markMicroSeconds - this.writeAndWaitEffort
        }

        public sendMessage(message: number): void {
            const MAX_LENGTH_MS = 16
            const channel = 1 + ((message >> 12) & 0b0011)

            for (let sendCount = 0; sendCount < 5; sendCount++) {
                const MESSAGE_BITS = 16

                let mask = 1 << (MESSAGE_BITS - 1)

                this.transmitBit(IR_MARK, START_STOP_PAUSE)

                while (mask > 0) {
                    if (message & mask) {
                        this.transmitBit(IR_MARK, HIGH_PAUSE)
                    } else {
                        this.transmitBit(IR_MARK, LOW_PAUSE)
                    }
                    mask >>= 1
                }

                this.transmitBit(IR_MARK, START_STOP_PAUSE)

                if (sendCount == 0 || sendCount == 1) {
                    basic.pause(5 * MAX_LENGTH_MS)
                } else {
                    basic.pause((6 + 2 * channel) * MAX_LENGTH_MS)
                }
            }
        }
    }


    export function runTests() {
        {
            const c1RedFullForward = message.createSingleOutputPwmMessage(PowerFunctionsChannel.One, PowerFunctionsOutput.Red, 7)
            const expectedC1RedFullForward = 0b0000010001111100 // 1148
            control.assert(
                c1RedFullForward === expectedC1RedFullForward,
                "createSingleOutputPwmMessage motor Red1 with speed 7")
        }

        {
            const c1ComboRedForwardBlueBackward = message.createComboDirectMessage(PowerFunctionsChannel.One, PowerFunctionsCommand.Forward, PowerFunctionsCommand.Backward)
            const expectedC1ComboRedForwardBlueBackward = 0b0000000110010111 // 407
            control.assert(
                c1ComboRedForwardBlueBackward === expectedC1ComboRedForwardBlueBackward,
                "createComboDirectMessage Red1 forward, Blue1 backward full speed")
        }

        {
            const c1ComboRedFloatBlueBrake = message.createComboPwmMessage(PowerFunctionsChannel.One, 8, 0)
            const expectedC1ComboRedFloatBlueBrake = 0b0100100000000011 // 18435
            control.assert(
                c1ComboRedFloatBlueBrake === expectedC1ComboRedFloatBlueBrake,
                "createComboPwmMessage Red1 float, Blue1 brake")
        }
    }
}
