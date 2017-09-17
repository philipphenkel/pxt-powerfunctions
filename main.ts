
/**
 * (c) Philipp Henkel, 2017
 */

enum PowerFunctionsChannel {
    //% block="1"
    One = 0,
    //% block="2"
    Two = 1,
    //% block="3"
    Three = 2,
    //% block="4"
    Four = 3,
}

enum PowerFunctionsOutput {
    //% block="red"
    Red = 0,
    //% block="blue"
    Blue = 1
}

enum PowerFunctionsCommand {
    //% block="float"
    Float = 0,
    //% block="forward"
    Forward = 1,
    //% block="backward"
    Backward = 2,
    //% block="brake"
    Brake = 3,
}

//% weight=99 color=#0fbc11 icon="\uf0e4"
namespace powerfunctions {

    function sendSingleOutputCommand(pin: AnalogPin, channel: PowerFunctionsChannel, output: PowerFunctionsOutput, speed: number) {
        const irDevice = new transport.InfraredDevice(pin);
        const msg = message.createSingleOutputPwmMessage(channel, output, speed);
        transport.sendMessage(msg, irDevice);
    }

    /**
     * Full speed forward on P0
     */
    //% blockId=pf_forward_p0
    //% block="forward | on channel %channel | and output %output"
    //% weight=100
    export function forwardP0(channel: PowerFunctionsChannel, output: PowerFunctionsOutput) {
        sendSingleOutputCommand(AnalogPin.P0, channel, output, 7);
    }

    /**
     * Full speed backward on P0
     */
    //% blockId=pf_backward_p0
    //% block="backward | on channel %channel | and output %output"
    //% weight=90
    export function backwardP0(channel: PowerFunctionsChannel, output: PowerFunctionsOutput) {
        sendSingleOutputCommand(AnalogPin.P0, channel, output, 7);
    }

    /**
     * Stop (float) on P0
     */
    //% blockId=pf_stop_p0
    //% block="stop | on channel %channel | and output %output"
    //% weight=80
    export function stopP0(channel: PowerFunctionsChannel, output: PowerFunctionsOutput) {
        sendSingleOutputCommand(AnalogPin.P0, channel, output, 8);
    }


    /**
     * Full speed forward
     */
    //% blockId=pf_forward
    //% block="forward | on pin %pin | with channel %channel | and output %output"
    //% weight=100
    //% pin.fieldEditor="gridpicker" pin.fieldOptions.columns=4 pin.fieldOptions.tooltips="false"
    //% advanced=true
    export function forward(pin: AnalogPin, channel: PowerFunctionsChannel, output: PowerFunctionsOutput) {
        sendSingleOutputCommand(pin, channel, output, 7);
    }

    /**
     * Full speed backward
     */
    //% blockId=powerfunctions_backward
    //% block="backward| using pin %pin | on channel %channel | and output %output"
    //% weight=90
    //% pin.fieldEditor="gridpicker" pin.fieldOptions.columns=4 pin.fieldOptions.tooltips="false"
    //% advanced=true
    export function backward(pin: AnalogPin, channel: PowerFunctionsChannel, output: PowerFunctionsOutput) {
        sendSingleOutputCommand(pin, channel, output, -7);
    }

    /**
     * brake then float
     */
    //% blockId=powerfunctions_brake
    //% block="brake| using pin %pin | on channel %channel | and output %output"
    //% weight=80
    //% pin.fieldEditor="gridpicker" pin.fieldOptions.columns=4 pin.fieldOptions.tooltips="false"
    //% advanced=true
    export function brake(pin: AnalogPin, channel: PowerFunctionsChannel, output: PowerFunctionsOutput) {
        sendSingleOutputCommand(pin, channel, output, 0);
    }

    /**
     * float
     */
    //% blockId=powerfunctions_float
    //% block="float | using pin %pin | on channel %channel | and output %output"
    //% weight=70
    //% pin.fieldEditor="gridpicker" pin.fieldOptions.columns=4 pin.fieldOptions.tooltips="false"
    //% advanced=true
    export function float(pin: AnalogPin, channel: PowerFunctionsChannel, output: PowerFunctionsOutput) {
        sendSingleOutputCommand(pin, channel, output, 8);
    }

    /**
     * set PWM step
     */
    //% blockId=powerfunctions_set_speed
    //% block="set speed | using pin %pin | on channel %channel | and output %output | to value %speed"
    //% speed.min=-7 speed.max=7
    //% weight=10
    //% pin.fieldEditor="gridpicker" pin.fieldOptions.columns=4 pin.fieldOptions.tooltips="false"
    //% advanced=true
    export function setSpeed(pin: AnalogPin, channel: PowerFunctionsChannel, output: PowerFunctionsOutput, speed: number) {
        speed = Math.max(-7, Math.min(7, speed));
        sendSingleOutputCommand(pin, channel, output, speed)
    }

    function test() {

        //const msg = message.createSingleOutputPwmMessage(Channel.One, Output.Red, 50);
        //const msg = message.createComboDirectMessage(Channel.One, Command.Forward, Command.Backward)
        //const msg = message.createComboPwmMessage(channel, 10, -10);


        // 1148
        const c1RedFullForward = message.createSingleOutputPwmMessage(PowerFunctionsChannel.One, PowerFunctionsOutput.Red, 100);
        const expectedC1RedFullForward = 0b0000010001111100;

        // 1080


        // 407
        const c1ComboRedForwardBlueBackward = message.createComboDirectMessage(PowerFunctionsChannel.One, PowerFunctionsCommand.Forward, PowerFunctionsCommand.Backward)
        const expectedC1ComboRedForwardBlueBackward = 0b0000000110010111;

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

        export function createComboDirectMessage(channel: PowerFunctionsChannel, outputA: PowerFunctionsCommand, outputB: PowerFunctionsCommand) {
            const nibble1 = 0b0000 + channel;
            const nibble2 = 0b0001;
            const nibble3 = (outputB << 2) + outputA
            return nibblesToMessage(nibble1, nibble2, nibble3)
        }

        export function createSingleOutputPwmMessage(channel: PowerFunctionsChannel, output: PowerFunctionsOutput, value: number) {
            const nibble1 = 0b0000 + channel;
            const nibble2 = 0b0100 + output;
            const nibble3 = mapValueToPwmElseFloat(value);
            return nibblesToMessage(nibble1, nibble2, nibble3)
        }

        export function createComboPwmMessage(channel: PowerFunctionsChannel, outputA: number, outputB: number) {
            const nibble1 = 0b0100 + channel;
            const nibble2 = mapValueToPwmElseFloat(outputB);
            const nibble3 = mapValueToPwmElseFloat(outputA);
            return nibblesToMessage(nibble1, nibble2, nibble3)
        }

        function nibblesToMessage(nibble1: number, nibble2: number, nibble3: number) {
            const lrc = 0xF ^ nibble1 ^ nibble2 ^ nibble3;
            return (nibble1 << 12) | (nibble2 << 8) | (nibble3 << 4) | lrc;
        }
    }

    namespace transport {

        const IR_MARK = 6 * 1000000 / 38000
        const START_STOP_PAUSE = 39 * 1000000 / 38000
        const LOW_PAUSE = 10 * 1000000 / 38000
        const HIGH_PAUSE = 21 * 1000000 / 38000

        export class InfraredDevice {
            private pin: AnalogPin;
            constructor(
                pin: AnalogPin,
                pwmPeriod = 26
            ) {
                this.pin = pin
                pins.analogWritePin(this.pin, 0)
                pins.analogSetPeriod(this.pin, pwmPeriod)
            }

            // calliope correction -85, -210
            // microbit correction -65, -150
            transmitBit(markMicroSeconds: number, pauseMicroSeconds: number): void {
                pins.analogWritePin(this.pin, 511)
                control.waitMicros(Math.max(1, markMicroSeconds - 65));
                pins.analogWritePin(this.pin, 0)
                control.waitMicros(Math.max(1, pauseMicroSeconds - 150));
            }
        }

        export function sendMessage(message: number, device: InfraredDevice): void {
            const MAX_LENGTH_MS = 16;
            const channel = 1 + ((message >> 12) & 0b0011);

            for (let sendCount = 0; sendCount < 5; sendCount++) {
                const MESSAGE_BITS = 16;

                sendStart(device)

                for (let mask = 1 << (MESSAGE_BITS - 1); mask > 0; mask >>= 1) {
                    if (message & mask) {
                        sendHigh(device)
                    } else {
                        sendLow(device)
                    }
                }

                sendStop(device)

                if (sendCount == 0 || sendCount == 1) {
                    basic.pause(5 * MAX_LENGTH_MS)
                } else {
                    basic.pause((6 + 2 * channel) * MAX_LENGTH_MS)
                }
            }
        }

        function sendStart(device: InfraredDevice): void {
            device.transmitBit(IR_MARK, START_STOP_PAUSE)


            /*while (true) {
                device.transmitBit(IR_MARK, LOW_PAUSE)
            }*/
        }

        function sendStop(device: InfraredDevice): void {
            device.transmitBit(IR_MARK, START_STOP_PAUSE)
        }

        function sendLow(device: InfraredDevice): void {
            device.transmitBit(IR_MARK, LOW_PAUSE)
        }

        function sendHigh(device: InfraredDevice): void {
            device.transmitBit(IR_MARK, HIGH_PAUSE)
        }
    }
}
