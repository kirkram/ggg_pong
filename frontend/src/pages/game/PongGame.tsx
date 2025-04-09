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
		//set the mode
		console.log("Mode is:", mode)
		console.log("Session Data:", sessionData)

		//store cleanup callback and start

		const cleanup = gameLogic(canvasRef, mode, sessionData)
	//	const cleanup = gameLogic(canvasRef)

		//cleanup when unmount
		return () =>
		{
			if (cleanup && typeof cleanup === 'function')
			{
				cleanup();
			}
		};
	}, [mode, sessionData])

	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				height: '100vh',
				gap: '2rem',
				backgroundColor: 'white'
			}}
		>

			{sessionData?.userAvatar?.image && (
				<img
					src={sessionData.userAvatar.image}
					alt="Left Avatar"
					style={{ width: '150px', height: '350px', objectFit: 'cover', borderRadius: '10px' }}
				/>
			)}
	
			<canvas
				ref={canvasRef}
				width={800}
				height={600}
				className="border-4 border-black"
				style={{ backgroundColor: '#87CEEB' }}
			/>
	
			{sessionData?.guestAvatar?.image && (
				<img
					src={sessionData.guestAvatar.image}
					alt="Right Avatar"
					style={{ width: '150px', height: '350px', objectFit: 'cover', borderRadius: '10px' }}
				/>

				
			)}
		</div>
	)
	
}