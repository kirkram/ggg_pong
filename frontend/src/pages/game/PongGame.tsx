'use client'

import React, { useRef, useEffect } from 'react'
import {gameLogic } from './gameLogic'

export default function PongGame()
{
	const canvasRef = useRef<HTMLCanvasElement | null>(null)

	useEffect(() => 
	{
		gameLogic(canvasRef)
	}, [])

	return (
			<canvas
				ref={canvasRef}
				width={800}
				height={600}
				className="border-4 border-white"
			/>
		)
}