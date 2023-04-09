const web2vr = new Web2VR("#html-container", {
	position: {
		x: 0,
		y: 2.1,
		z: -0.6,
	},
})
web2vr.start()

let questionPanel = new Web2VR("#questionPanel", {
	position: {
		x: 0.05,
		y: 2.1,
		z: -1.2,
	},
	rotation: {
		x: 0,
		y: -45,
		z: -2,
	},
})
questionPanel.start()

let doubtPanel = new Web2VR("#doubtPanel", {
	position: {
		x: -1.3,
		y: 1.8,
		z: -0.5,
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

		if (videoId) {
			document.getElementById("formContainer").innerHTML = ""

			let videoTag = document.createElement("video")
			videoTag.id = "video"
			videoTag.src = `https://relay-youtube.adaptable.app/${videoId}`
			videoTag.width = 640
			videoTag.height = 360
			videoTag.controls = true
			videoTag.crossOrigin = "anonymous"

			document.getElementById("content").appendChild(videoTag)

			document.getElementById(
				"liveStatus"
			).innerHTML = `Status: Generating Questions...`

			let questions = await fetch(
				"https://youtube-questions.vercel.app",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						youtubeVideoId: videoId,
					}),
				}
			)

			questions = await questions.json()

			document.getElementById(
				"liveStatus"
			).innerHTML = `Status: Questions Generated`

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

			setTimeout(() => {
				document.getElementById("liveStatus").innerHTML = ""
			}, 1000)

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
		}
	})
