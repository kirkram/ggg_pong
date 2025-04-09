'use client'

import { RefObject } from 'react'
import { loadGameAssets } from './loadAssets'

export function gameLogic(canvasRef: RefObject<HTMLCanvasElement>, mode?: string, sessionData?: any)
{
	const canvas = canvasRef.current
	if (!canvas) return
	const ctx = canvas.getContext('2d')
	if (!ctx) return

	//music
	let animationId: number
	let music: HTMLAudioElement
	let keydownHandler: (e: KeyboardEvent) => void;
	let stopped = false;

	loadGameAssets().then(({ table, paddle1, paddle2, music: loadedMusic }) =>
	{
		if (stopped) return

		music = loadedMusic

		let paddleY = 250
		let paddleY2 = 250
		let paddleProgress = 0.5
		let paddle2Progress = 0.5
		const paddleSpeed = 23

		let p1Score = 0;
		let p2Score = 0;

		// the values to 3D the paddles
		const minX = -80
		const maxX = 100
		const minY = 500
		const maxY = 0

		const minScale = 1.5
		const maxScale = 0.5

		const ball =
		{
			x: canvas.width / 2,
			y: canvas.height / 2,
			radius: 10,
			dx: 2 * (Math.random() > 0.5 ? 1 : -1),
			dy: 1.5 * (Math.random() > 0.5 ? 1 : -1),
		}

		const draw = () => 
		{
			
			//draw background
			ctx.fillStyle = '#87CEEB'
			ctx.fillRect(0, 0, canvas.width, canvas.height)

		// paddles

				//count interpolation paddle1
			const x = minX + (maxX - minX) * paddleProgress
			const y = minY + (maxY - minY) * paddleProgress
			const scale = minScale + (maxScale - minScale) * paddleProgress

			const paddleWidth = 80 * scale
			const paddleHeight = 120 * scale

			//paddle2
			const scale2 = minScale + (maxScale - minScale) * paddle2Progress
			const x2 = canvas.width - (minX + (maxX - minX) * paddle2Progress + 80 * scale2)
			const y2 = minY + (maxY - minY) * paddle2Progress

			const paddleWidth2 = 80 * scale2
			const paddleHeight2 = 120 * scale2

			ctx.drawImage(paddle1, x, y, paddleWidth, paddleHeight)
			ctx.drawImage(paddle2, x2, y2, paddleWidth2, paddleHeight2)

		// draw the table after the paddles to make paddles go under it
			ctx.drawImage(table, 0, 0, canvas.width, canvas.height)

		//ball
			const maxBallScale = 1.5
			const minBallScale = 0.5

			const ballProg = (ball.y - maxY) / (minY - maxY)
			const ballSclae = minBallScale + (maxBallScale - minBallScale) * ballProg

			const ballRadius = ball.radius * ballSclae

			ctx.beginPath()
			ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2)
			ctx.fillStyle = 'white'
			ctx.fill()

		///move the BALL!!
			ball.x += ball.dx
			ball.y += ball.dy
			//bounce
			if (ball.y <= 0 || ball.y >= canvas.height) ball.dy *= -1

		//collision

			const speedUp = 1.05
//			ball.dx *= speedUp
//			ball.dy *= speedUp

			if 
			(
				ball.x - ball.radius <= x + paddleWidth &&
				ball.x + ball.radius >= x &&
				ball.y >= y &&
				ball.y <= y + paddleHeight
			)
			{
				ball.dx *= -1
				ball.x = x + paddleWidth + ball.radius
				ball.dx *= speedUp
				ball.dy *= speedUp			
			}
			if 
			(
				ball.x + ball.radius >= x2 &&
				ball.x - ball.radius <= x2 + paddleWidth2 &&
				ball.y >= y2 &&
				ball.y <= y2 + paddleHeight2
			)
			{
				ball.dx *= -1
				ball.x = x2 - ball.radius
				ball.dx *= speedUp
				ball.dy *= speedUp

			}
			//check death
			if (ball.x < -ball.radius || ball.x > canvas.width + ball.radius)
			{
				if (ball.x < -ball.radius) {
					p2Score++
				}
				else if (ball.x > canvas.width + ball.radius) {
					p1Score++
				}
				ball.x = canvas.width / 2
				ball.y = canvas.height / 2
				//BALL SPEED!!!!
				ball.dx = 2 * (Math.random() > 0.5 ? 1 : -1)
				ball.dy = 1.5 * (Math.random() > 0.5 ? 1 : -1)
			}
			// draw score
			ctx.fillStyle = 'white'
			ctx.font = '40px monospace'
			ctx.textAlign = 'center'

			ctx.fillText(`${p1Score}`, canvas.width / 2 - 80, 300);
			ctx.fillText(`${p2Score}`, canvas.width / 2 + 60, 300)
		}

		const update = () => 
		{
			draw()
			animationId = requestAnimationFrame(update)
		}

		// THE KEYS ARE HERE!!
		keydownHandler = (e: KeyboardEvent) =>
		{
			if (music && music.paused)
			{
				music.loop = true
				music.volume = 0.6
				music.play().catch((e) =>
				{
					console.log("Audio failed to play:", e)
				})
			}
			if (e.key === 'd') {
				paddleProgress = Math.min(1, paddleProgress + 0.02)
			}
			if (e.key === 'a') {
				paddleProgress = Math.max(0, paddleProgress - 0.02)
			}

			if (e.key === 'ArrowRight') {
				paddle2Progress = Math.max(0, paddle2Progress - 0.02)
			}
			if (e.key === 'ArrowLeft') {
				paddle2Progress = Math.min(1, paddle2Progress + 0.02)
			}

		}

		document.addEventListener('keydown', keydownHandler)

		update()
	})

	//CLEANING!
	return () =>
	{
		stopped = true
		console.log("🧹 Cleaning up game loop and music ")

		if (animationId) cancelAnimationFrame(animationId)
		if (music)
		{
			music.pause()
			music.currentTime = 0
		}
		if (keydownHandler) {
			document.removeEventListener('keydown', keydownHandler)
		}
	}
}
