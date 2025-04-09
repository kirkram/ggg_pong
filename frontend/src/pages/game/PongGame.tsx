'use client'

import React, { useRef, useEffect } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import {gameLogic } from './gameLogic'

export default function PongGame()
{
	const canvasRef = useRef<HTMLCanvasElement | null>(null)

	// import stuff 
	const [searchParams] = useSearchParams()
	const location = useLocation()

	const mode = searchParams.get('mode') // duel vs tournament
	const sessionData = location.state    // contains user, avatars, guests, etc.


	useEffect(() => 
	{
		// test print
		console.log("🎮 PongGame loaded")
		//set the mode
		console.log("Mode is:", mode)
		console.log("Session Data:", sessionData)

		gameLogic(canvasRef)
	}, [mode, sessionData])

	return (
			<canvas
				ref={canvasRef}
				width={800}
				height={600}
				className="border-4 border-white"
			/>
		)
}