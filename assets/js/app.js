let bot = document.querySelector("#bot")
let actionButtons = document.querySelectorAll(".actionButtons")
let startListening = false

bot.addEventListener("click", function () {
	for (let i = 0; i < actionButtons.length; i++) {
		if (actionButtons[i].getAttribute("visible") == true) {
			actionButtons[i].setAttribute("visible", false)
		} else {
			actionButtons[i].setAttribute("visible", true)
		}
	}
})

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

speechToText(
	document.querySelector("#contextButton"),
	document.querySelector("#contextInputField")
)
speechToText(
	document.querySelector("#questionButton"),
	document.querySelector("#questionInputField")
)

function textToSpeech(text) {
	let msg = new SpeechSynthesisUtterance()

	let voices = window.speechSynthesis.getVoices()

	voices.forEach((voice) => {
		if (voice.name === "Google US English") {
			msg.voice = voice
		}
	})

	msg.text = text
	msg.lang = "en-US"
	window.speechSynthesis.speak(msg)
}

