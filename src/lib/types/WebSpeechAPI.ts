export interface SpeechRecognitionResult {
	[index: number]: SpeechRecognitionAlternative;
	isFinal: boolean;
	length: number;
}

export interface SpeechRecognitionAlternative {
	transcript: string;
}

export interface SpeechRecognitionEvent {
	results: {
		[index: number]: SpeechRecognitionResult;
		length: number;
	};
}

export interface SpeechRecognition {
	continuous: boolean;
	interimResults: boolean;
	start(): void;
	stop(): void;
	onresult: (event: SpeechRecognitionEvent) => void;
	onerror: (event: { error: string }) => void;
}

export interface WebSpeechWindow extends Window {
	webkitSpeechRecognition: new () => SpeechRecognition;
}
