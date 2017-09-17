
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

//% weight=100 color=#0fbc11 icon=""
namespace PowerFunctions {

    function sendSingleOutputCommand(pin: AnalogPin, channel: PowerFunctionsChannel, output: PowerFunctionsOutput, speed: number) {
        const irDevice = new Transport.InfraredDevice(pin);
        const msg = Message.createSingleOutputPwmMessage(channel, output, speed);
        Transport.sendMessage(msg, irDevice);
    }

    /**
     * TODO: describe your function here
     * @param irLed describe parameter here, eg: 5
     * @param channel describe parameter here, eg: "Hello"
     * @param output describe parameter here
     * @param value describe parameter here
     */
    //% block 
    //% speed.min=-7 speed.max=7
    //"power functions send|pin %irLed|channel %step"
    export function setSpeed(pin: AnalogPin, channel: PowerFunctionsChannel, output: PowerFunctionsOutput, speed: number) {
        speed = Math.max(-7, Math.min(7, speed));
        sendSingleOutputCommand(pin, channel, output, speed)
    }

    //% block 
    export function forward(pin: AnalogPin, channel: PowerFunctionsChannel, output: PowerFunctionsOutput) {
        sendSingleOutputCommand(pin, channel, output, 7);
    }

    //% block 
    export function backward(pin: AnalogPin, channel: PowerFunctionsChannel, output: PowerFunctionsOutput) {
        sendSingleOutputCommand(pin, channel, output, -7);
    }

    //% block
    export function stop(pin: AnalogPin, channel: PowerFunctionsChannel, output: PowerFunctionsOutput) {
        sendSingleOutputCommand(pin, channel, output, 0);
    }

    //% block 
    export function float(pin: AnalogPin, channel: PowerFunctionsChannel, output: PowerFunctionsOutput) {
        sendSingleOutputCommand(pin, channel, output, 8);
    }

    function test() {

        //const msg = Message.createSingleOutputPwmMessage(Channel.One, Output.Red, 50);
        //const msg = Message.createComboDirectMessage(Channel.One, Command.Forward, Command.Backward)
        //const msg = Message.createComboPwmMessage(channel, 10, -10);


        // 1148
        const c1RedFullForward = Message.createSingleOutputPwmMessage(PowerFunctionsChannel.One, PowerFunctionsOutput.Red, 100);
        const expectedC1RedFullForward = 0b0000010001111100;

        // 1080


        // 407
        const c1ComboRedForwardBlueBackward = Message.createComboDirectMessage(PowerFunctionsChannel.One, PowerFunctionsCommand.Forward, PowerFunctionsCommand.Backward)
        const expectedC1ComboRedForwardBlueBackward = 0b0000000110010111;

    }


    namespace Message {

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

    namespace Transport {

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
