let startListening = false

function speechToText(button, inputField) {
	let context = ""
	startListening = true
	let speechRecognition = new webkitSpeechRecognition()
	speechRecognition.continuous = true
	speechRecognition.interimResults = true
	speechRecognition.lang = "en-US"
	speechRecognition.onresult = function (event) {
		if (startListening == false) {
			speechRecognition.stop()
		}
		let interimTranscript = ""
		for (let i = event.resultIndex; i < event.results.length; i++) {
			if (event.results[i].isFinal) {
				context += event.results[i][0].transcript
				inputField.setAttribute("text", "value: " + context)
			} else {
				interimTranscript += event.results[i][0].transcript
				inputField.setAttribute(
					"text",
					"value: " + context + interimTranscript
				)
			}
		}
	}
	button.addEventListener("click", function () {
		speechRecognition.start()
	})
}
