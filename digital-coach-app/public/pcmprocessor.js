/**
 * When streaming audio data to AssemblyAI, the API expects the data as raw 16-bit PCM data at 16kHz. We use the Web Audio API to record the user's microphone but the data is 32-bit data at around 44kHz. We use this Audio Worklet node to convert audio data from 32-bit floats to 16-bit ints so it can be sent to AssemblyAI's STT API. Audio Worklet nodes run in their own audio rendering thread.
 */

class PCMProcessor extends AudioWorkletProcessor {

    constructor() {
        super();
        // create a buffer to hold approximately 250ms of audio data (i.e. 4096 samples / 16000Hz = ~ 250ms of audio)
        // we use a buffer so we send chunks to audio to AssemblyAI is a large enough size
        this.bufferSize = 4096;
        this.buffer = new Int16Array(this.bufferSize); // create 16-bit int array to store the processed audio
        this.bufferIndex = 0;
    }

    /**
     * Called whenever audio data is received, 
     * @param {*} inputs Multi-dimensional array containing all audio streams given to this node
     * @param {*} outputs Where the modified audio data would be sent if we wanted to pass it to the speakers (we can ignore this because we're extracting the data) 
     * @param {*} parameters Automatable audio parameters (e..g volume)
     */
    process(inputs, outputs, parameters) {
        const input = inputs[0]; // extract the audio stream from the user's microphone
        
        // check if we have audio data to process
        if (input && input.length > 0) {
            const float32buffer = input[0]; // get the first channel (left or right, i.e. a mono track), Web Audio API stores audio data as 32-bit floats from [-1, 1]

            // downsample the audio data frame-by-frame: from Float32 [-1, 1] to Int16 [-32768, 32767]
            for (let i=0; i < float32buffer.length; i++) {
                const s = Math.max(-1, Math.min(1, float32buffer[i])); // bound the audio   frame between [-1, 1] in case the value slightly exceeds these bounds

                this.buffer[this.bufferIndex++] = s < 0 ? s * 0x8000 : s * 0x7FFF; // depending on the sign of the value, multiply it by the max size of a 16-bit int (0x8000 = 32768 (smallest 16-bit int)) (0x7FFF = 32767 (largest 16-bit int))

                // once the buffer is full, send it to the main thread then reset buffer
                if (this.bufferIndex >= this.bufferSize) {
                    // send the raw PCM buffer back to our browser's main thread via postMessage
                    // our main thread will catch this in its .onmessage listener
                    this.port.postMessage(this.buffer.slice(0).buffer);
                    this.bufferIndex = 0; 
                }
            }

        }
        return true; // keep the audio processor alive
    }
}

registerProcessor("pcm-processor", PCMProcessor); // register Audio Worklet processor as pcm-processor so our frontend can call it