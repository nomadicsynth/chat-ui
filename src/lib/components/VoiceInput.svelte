<script lang="ts">
    import type { SpeechRecognition, WebSpeechWindow } from '$lib/types/WebSpeechAPI';
    import { createEventDispatcher, onMount, onDestroy } from 'svelte';
    import CarbonMicrophone from "~icons/carbon/microphone";
    import CarbonMicrophoneOff from "~icons/carbon/microphone-off";

    const dispatch = createEventDispatcher<{
        transcript: string;        // For finalized text
        interimTranscript: string; // For streaming/interim text
        startRecording: void;      // New event to capture recording start
    }>();

    let isListening = false;
    let recognition: SpeechRecognition | null = null;
    let lastFinalIndex = 0;

    onMount(() => {
        if ('webkitSpeechRecognition' in window) {
            recognition = new (window as WebSpeechWindow).webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;

            recognition.onresult = (event) => {
                const results = Array.from(event.results);
                
                // Handle new final results
                const newFinalTranscripts = results
                    .slice(lastFinalIndex)
                    .filter(result => result.isFinal)
                    .map(result => result[0].transcript);
                
                if (newFinalTranscripts.length > 0) {
                    lastFinalIndex = results.findLastIndex(result => result.isFinal) + 1;
                    dispatch('transcript', newFinalTranscripts.join(' ').trim());
                }

                // For interim, just show what it currently thinks it heard
                const currentInterim = results.slice(lastFinalIndex);
                if (currentInterim.length > 0) {
                    const interimText = currentInterim
                        .map(result => result[0].transcript)
                        .join('')
                        .trim();
                    dispatch('interimTranscript', interimText);
                }
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                stopListening();
            };
        }
    });

    onDestroy(() => {
        if (recognition && isListening) {
            stopListening();
        }
    });

    function stopListening() {
        if (recognition) {
            recognition.stop();
            isListening = false;
            lastFinalIndex = 0;
            // Clear any remaining interim text
            dispatch('interimTranscript', '');
        }
    }

    function startListening() {
        if (recognition) {
            recognition.start();
            isListening = true;
            lastFinalIndex = 0;
            dispatch('startRecording');  // Let parent know we're starting
        }
    }

    function toggleListening() {
        if (!recognition) {
            alert('Speech recognition is not supported in your browser');
            return;
        }

        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }
</script>

<button
    type="button"
    on:click={toggleListening}
    class="btn mx-1 my-1 h-[2.4rem] self-end rounded-lg bg-transparent p-1 px-[0.7rem] text-gray-400 enabled:hover:text-gray-700 disabled:opacity-60 enabled:dark:hover:text-gray-100 dark:disabled:opacity-40"
    aria-label={isListening ? 'Stop recording' : 'Start recording'}
>
    {#if isListening}
        <CarbonMicrophoneOff />
    {:else}
        <CarbonMicrophone />
    {/if}
</button>