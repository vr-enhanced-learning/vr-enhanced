const mainPanel = new QuickXR("#html-container", {
	position: {
		x: 0,
		y: 2.1,
		z: -0.6,
	},
})
mainPanel.start()

let questionPanel = new QuickXR("#questionPanel", {
	position: {
		x: 0.05,
		y: 2.132,
		z: -1.2,
	},
	rotation: {
		x: 0,
		y: -45,
		z: -2,
	},
})
questionPanel.start()

let doubtPanel = new QuickXR("#doubtPanel", {
	position: {
		x: -1.076,
		y: 2.627,
		z: -0.165,
	},
	rotation: {
		x: 0,
		y: 45,
		z: 2,
	},
})
doubtPanel.start()

document.getElementById("enterVR").addEventListener("click", () => {
	document.getElementById("a-scene").enterVR()
	document.getElementById("enterVRButtonContainer").innerHTML = ""
})

document
	.getElementById("submitYoutubeId")
	.addEventListener("click", async () => {
		let videoId = document.getElementById("videoId").value

		if (!videoId) return alert("Please enter a valid youtube video id")

		document.getElementById("formContainer").innerHTML = ""

		let videoTag = document.createElement("video")
		videoTag.id = "video"
		videoTag.src = `https://relay-youtube.adaptable.app/${videoId}`
		videoTag.width = 640
		videoTag.height = 360
		videoTag.controls = true
		videoTag.crossOrigin = "anonymous"

		document.getElementById("content").appendChild(videoTag)

		let videoTitleSpan = document.createElement("span")
		videoTitleSpan.id = "videoTitle"

		let videoTitle = await fetch(`
			https://www.youtube.com/oembed?format=json&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D${videoId}
		`)

		videoTitle = await videoTitle.json()

		videoTitleSpan.innerHTML = videoTitle.title

		document.getElementById("content").appendChild(videoTitleSpan)

		document.getElementById(
			"liveStatus"
		).innerHTML = `Status: Getting the captions...`

		let captions = await fetch(
			`https://youtube-questions.vercel.app/captions?youtubeVideoId=${videoId}`
		)
		captions = await captions.json()
		window.localStorage.setItem("captions", JSON.stringify(captions))

		document.getElementById(
			"liveStatus"
		).innerHTML = `Status: Generating Questions...`

		let questions = await fetch("https://youtube-questions.vercel.app", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				youtubeVideoId: videoId,
			}),
		})

		questions = await questions.json()

		document.getElementById(
			"liveStatus"
		).innerHTML = `Status: Getting the model ready to answer your questions...`

		let questionsContainer = document.createElement("div")
		questionsContainer.id = "questionsContainer"

		let questionsDiv = document.createElement("div")
		questionsDiv.id = "questions"

		let imageTag = document.createElement("img")
		imageTag.src = "./assets/images/question.png"
		imageTag.alt = "question"
		imageTag.height = "150"
		imageTag.width = "300"

		questionsContainer.appendChild(imageTag)

		questions.forEach((question, index) => {
			let questionSpan = document.createElement("span")
			questionSpan.innerHTML = question

			let answerInput = document.createElement("input")
			answerInput.type = "text"
			answerInput.placeholder = "Enter Answer"
			answerInput.dataset.id = index + 1

			questionsDiv.appendChild(questionSpan)
			questionsDiv.appendChild(answerInput)
		})

		questionsContainer.appendChild(questionsDiv)

		document.getElementById("questionPanel").prepend(questionsContainer)

		document.getElementById(
			"buttonsContainer"
		).innerHTML = `<button id="submitAnswer" type="button">Submit Answers</button>`

		document
			.getElementById("submitAnswer")
			.addEventListener("click", async () => {
				let answers = []
				document
					.querySelectorAll("#questions input")
					.forEach((input) => {
						answers.push({
							questionId: input.dataset.id,
							answer: input.value,
						})
					})

				console.log(answers)
			})

		await fetch(
			"https://currentlyexhausted-question-answering.hf.space/run/predict",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					data: [
						JSON.parse(window.localStorage.getItem("captions")),
						"what is this about?",
					],
				}),
			}
		)

		let doubtContainer = document.createElement("div")
		doubtContainer.id = "doubtContainer"

		let doubtImage = document.createElement("img")
		doubtImage.src = "./assets/images/doubt.png"
		doubtImage.alt = "doubt"
		doubtImage.height = "150"
		doubtImage.width = "300"

		let doubtDiv = document.createElement("div")
		doubtDiv.id = "doubtDiv"

		let doubtTextArea = document.createElement("textarea")
		doubtTextArea.id = "doubt"
		doubtTextArea.placeholder = "Enter your doubt"
		doubtTextArea.rows = "3"

		let doubtSubmitButton = document.createElement("button")
		doubtSubmitButton.id = "submitDoubt"
		doubtSubmitButton.type = "button"
		doubtSubmitButton.innerHTML = "Submit"
		doubtSubmitButton.addEventListener("click", async () => {
			let textArea = document.getElementById("doubt")
			let answerSpan = document.getElementById("doubtAnswer")
			let context = JSON.parse(window.localStorage.getItem("captions"))

			answerSpan.innerHTML = "Getting the answer..."

			let answer = await fetch(
				"https://currentlyexhausted-question-answering.hf.space/run/predict",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						data: [context, textArea.value + "?"],
					}),
				}
			)

			answer = await answer.json()

			let confidencePercent = answer.data[1].label * 100
			confidencePercent = confidencePercent.toFixed(2)

			answerSpan.innerHTML =
				answer.data[0] + " - " + confidencePercent + "%" + " confidence"
		})

		doubtDiv.appendChild(doubtTextArea)
		doubtDiv.appendChild(doubtSubmitButton)

		doubtContainer.appendChild(doubtImage)

		doubtContainer.appendChild(doubtDiv)

		let doubtAnswerSpan = document.createElement("span")
		doubtAnswerSpan.id = "doubtAnswer"

		let doubtPanelContents = document.createElement("div")
		doubtPanelContents.id = "doubtPanelContents"

		doubtPanelContents.appendChild(doubtContainer)
		doubtPanelContents.appendChild(doubtAnswerSpan)

		document.getElementById("doubtPanel").prepend(doubtPanelContents)

		document.getElementById(
			"liveStatus"
		).innerHTML = `Status: Model ready to answer your questions!`
	})
