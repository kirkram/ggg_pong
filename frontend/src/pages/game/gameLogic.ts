'use client'

import { RefObject } from 'react'
import { loadGameAssets } from './loadAssets'
import { drawOpening, drawEnding, drawFinalScreen } from "./startAndEnding"
import { forgottenItemsInit, drawForgotten, clearForgottenItems } from "./forgottenItems"

//import { gameOptions } from './gameOptions'

enum GamePhase
{
	Opening,
	Playing,
	Ending,
	Final
}

const gameState =
{
	phase: GamePhase.Opening,
	round: 1,
	pl1Name: "PL1", //sessionData?.player1?.name || "PL1",
	pl2Name: "PL2", //sessionData?.player2?.name || "PL2",
	winnerName: "winnerIsnotLoser",
	winnerAvatar: new Image()
}

/*
//this needs to be added on the prvious page
export const gameOptions = {
	enableMadness: true,
}
*/


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

		const player1Avatar = new Image();
		player1Avatar.src = sessionData?.userAvatar?.image || "/fallback1.png";
		
		const player2Avatar = new Image();
		player2Avatar.src = sessionData?.guestAvatar?.image || "/fallback2.png";

		music = loadedMusic

		let paddleY = 250
		let paddleY2 = 250
		let paddleProgress = 0.5
		let paddle2Progress = 0.5
		const paddleSpeed = 23

		let p1Score = 0
		let p2Score = 0
		let p1Wins = 0
		let p2Wins = 0

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
			ctx.clearRect(0, 0, canvas.width, canvas.height)

			switch (gameState.phase)
			{
				case GamePhase.Opening:
					drawOpening(ctx, {
						round: gameState.round,
						pl1Name: gameState.pl1Name,
						pl2Name: gameState.pl2Name,
						pl1Avatar: paddle1,
						pl2Avatar: paddle2,
					})
					return
				case GamePhase.Ending:
					drawEnding(ctx, {
						round: gameState.round,
						pl1Name: gameState.pl1Name,
						pl2Name: gameState.pl2Name,
						pl1Avatar: paddle1,
						pl2Avatar: paddle2,
						winnerName: p1Score > p2Score ? gameState.pl1Name : gameState.pl2Name,
					})
					return
				
				case GamePhase.Final:
					drawFinalScreen(ctx, {
						winnerName: gameState.winnerName,
						winnerAvatar: gameState.winnerAvatar
					})
					return
	
				case GamePhase.Playing:
						break
			} 
			
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

			//if (gameOptions.enableMadness) {
				drawForgotten(ctx)
			//}

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
				if (p1Score === 2 || p2Score === 2) {
					gameState.phase = GamePhase.Ending
				}
				ball.x = canvas.width / 2
				ball.y = canvas.height / 2
				//BALL SPEED!!!!
				ball.dx = 2 * (Math.random() > 0.5 ? 1 : -1)
				ball.dy = 1.5 * (Math.random() > 0.5 ? 1 : -1)
			}
			if (p1Score === 2 || p2Score === 2) {
				gameState.phase = GamePhase.Ending
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
			if (e.code === 'Space')
			{
				if (gameState.phase === GamePhase.Opening) {
					gameState.phase = GamePhase.Playing
				}
				else if (gameState.phase === GamePhase.Ending)
				{
					if (p1Score > p2Score) p1Wins++
					else if (p2Score > p1Score) p2Wins++

					gameState.round += 1

					if (gameState.round > 1) { // && gameOptions.enableMadness) {
						forgottenItemsInit(ctx, canvas)
					}

					if (gameState.round > 3) 
					{
						gameState.phase = GamePhase.Final
						gameState.winnerName = p1Wins > p2Wins ? gameState.pl1Name : gameState.pl2Name
						gameState.winnerAvatar = p1Wins > p2Wins ? player1Avatar : player2Avatar
					}
					else {
						gameState.phase = GamePhase.Opening
					}
					p1Score = 0
					p2Score = 0
				}
				else if (gameState.phase === GamePhase.Final)
				{
					gameState.phase = GamePhase.Opening
					gameState.round = 1
					p1Score = 0
					p2Score = 0
					p1Wins = 0
					p2Wins = 0
				}
				return
			}
			if (gameState.phase !== GamePhase.Playing) return

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
		if (gameState.phase === GamePhase.Final)
		{
			clearForgottenItems()
		}
	}
}
