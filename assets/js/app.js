let actionButtons = document.querySelectorAll(".actionButtons")
let clearButton = document.querySelector("#clearButton")
let answerButton = document.querySelector("#answerButton")
let stopListeningButton = document.querySelector("#stopListeningButton")

let QUESTION_ANSWER_SPACE_ENDPOINT =
	"https://currentlyexhausted-mariorossi-t5-base-finetuned-que-ac173dd.hf.space/run/predict"

function speechToText(button, inputField) {
	let context = ""
	startListening = true
	let speechRecognition = new webkitSpeechRecognition()
	speechRecognition.continuous = true
	speechRecognition.interimResults = true
	speechRecognition.lang = "en-US"
	speechRecognition.onresult = function (event) {
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
		startListening = true
		stopListeningButton.setAttribute("visible", "true")
		speechRecognition.start()
	})
	return speechRecognition
}

let contextListener = speechToText(
	document.querySelector("#contextButton"),
	document.querySelector("#contextInputField")
)

let questionListener = speechToText(
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

async function query(data) {
	const response = await fetch(QUESTION_ANSWER_SPACE_ENDPOINT, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	})

	const result = await response.json()
	return result
}

function constructQuery(context, question) {
	return {
		data: [`question: ${question} context: ${context}`],
	}
}

answerButton.addEventListener("click", async function () {
	
	stopListeningButton.click() // stop listening if user clicks on answer button
	
	let context = document
		.querySelector("#contextInputField")
		.getAttribute("text").value
	let question = document
		.querySelector("#questionInputField")
		.getAttribute("text").value

	document
		.querySelector("#answerInputField")
		.setAttribute("text", "value: Generating.... Please wait")
	textToSpeech("Generating.... Please wait")

	let queryData = constructQuery(context, question)
	let result = await query(queryData)
	console.log(result)

	let answer = result.data[0]
	let predictionTime = result.duration

	document
		.querySelector("#answerInputField")
		.setAttribute(
			"text",
			"value: " + answer + " (took " + predictionTime + " seconds)"
		)
	textToSpeech(answer)
})

clearButton.addEventListener("click", function () {
    document
        .querySelector("#contextInputField")
        .setAttribute("text", "value: Context")
    document
        .querySelector("#questionInputField")
        .setAttribute("text", "value: Question")
    document
        .querySelector("#answerInputField")
        .setAttribute("text", "value: Generated Answer")
})

stopListeningButton.addEventListener("click", function () {
	stopListeningButton.setAttribute("visible", "false")
	contextListener.stop()
	questionListener.stop()
})