const mainPanel = new QuickXR("#html-container", {
	position: {
		x: 0,
		y: 2.1,
		z: -0.9,
	},
})
mainPanel.start()

let questionPanel = new QuickXR("#questionPanel", {
	position: {
		x: 0.05,
		y: 2.232,
		z: -1.1,
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
		y: 2.657,
		z: -0.465,
	},
	rotation: {
		x: 0,
		y: 45,
		z: 2,
	},
})
doubtPanel.start()

let stirPanel = new QuickXR("#stirPanel", {
	position: {
		x: -1.076,
		y: 3.345,
		z: -0.444,
	},
	rotation: {
		x: 0,
		y: 45,
		z: 2,
	},
})
stirPanel.start()

let summarizePanel = new QuickXR("#summarizePanel", {
	position: {
		x: 0,
		y: 2.583,
		z: -1.3,
	},
	rotation: {
		x: -20,
		y: 0,
		z: 0,
	},
})

summarizePanel.start()

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

		try {
			let videoTitleSpan = document.createElement("span")
			videoTitleSpan.id = "videoTitle"

			let videoTitle = await fetch(`
			https://www.youtube.com/oembed?format=json&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D${videoId}
		`)

			videoTitle = await videoTitle.json()

			videoTitleSpan.innerHTML = videoTitle.title

			document.getElementById("content").appendChild(videoTitleSpan)
		} catch (error) {
			console.log(error)
			console.log("Probably YouTube servers are blocked in this network")
		}

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

			answerSpan.innerHTML = answer.data[0]
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

		let stirImage = document.createElement("img")
		stirImage.src = "./assets/images/stir.png"
		stirImage.alt = "stir"
		stirImage.height = "50"
		stirImage.width = "50"

		let stirInput = document.createElement("input")
		stirInput.type = "text"
		stirInput.id = "stirInput"
		stirInput.placeholder = "Enter entity..."
		stirInput.width = "100"

		let stirButton = document.createElement("button")
		stirButton.id = "stirButton"
		stirButton.type = "button"
		stirButton.innerHTML = "STIR"

		stirButton.addEventListener("click", () => {
			let entity = document.getElementById("stirInput").value
			if (entity == "mushroom") {
				document
					.querySelector("#stir")
					.setAttribute("gltf-model", "./assets/models/mushroom.glb")
			}
		})

		let stirPanelContainer = document.createElement("div")
		stirPanelContainer.id = "stirPanelContainer"

		stirPanelContainer.appendChild(stirImage)
		stirPanelContainer.appendChild(stirInput)
		stirPanelContainer.appendChild(stirButton)

		document.getElementById("stirPanel").appendChild(stirPanelContainer)

		// let summarizeContainer = document.createElement("div")
		// summarizeContainer.id = "summarizeContainer"

		// let summarizeContent = document.createElement("p")
		// summarizeContent.id = "summarizeContent"
		// summarizeContent.textContent = window.localStorage.getItem("summarization")

		// summarizeContainer.appendChild(summarizeContent)

		let summarizeContent = `<div id="summarizeContainer">
			<p id="summarizeContent">${window.localStorage.getItem("summarization")}</p>
		</div>`

		document.getElementById("summarizePanel").innerHTML = summarizeContent


		
		document.getElementById(
			"liveStatus"
		).innerHTML = `Status: Model ready to answer your questions!`
	})
