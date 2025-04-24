"use client";

import React, { useRef, useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { gameLogic } from "./gameLogic";
import { gameLogicTournament } from "./gameLogicTournament";

import {
	createMatchups,
	assignPoints,
	PlayerData,
	Matchup,
} from "./tournamentManager";

import { drawFinalScreen } from "./startAndEnding";

export default function PongGame()
{
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	// import stuff
	const [searchParams] = useSearchParams();
	const location = useLocation();

	const mode = searchParams.get("mode"); // duel vs tournament
	const sessionData = location.state; // contains user, avatars, guests, etc.

	const [currentMatch, setCurrentMatch] = useState<Matchup | null>(null);
	const [matchQue, setMatchQue] = useState<Matchup[]>([]);
	const [matchups, setMatchups] = useState<Matchup[]>([]);

	// FOR TOURNAMENT
	const [playerScores, setPlayerScores] = useState<Record<string, number>>({});
	const [currentRound, setCurrentRound] = useState<number>(1);
	const [roundWinners, setRoundWinners] = useState<PlayerData[]>([]);

	// player pictures
	const leftAvatarImage = mode === "tournament" ? currentMatch?.player1.avatar : sessionData?.userAvatar?.image
	const rightAvatarImage = mode === "tournament" ? currentMatch?.player2?.avatar : sessionData?.guestAvatar?.image

	function showFinalScreen(winnerName: string, avatarUrl: string)
	{
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const finalAvatar = new Image();
		finalAvatar.src = avatarUrl;

		finalAvatar.onload = () =>
		{
			const draw = () =>
			{
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				drawFinalScreen(ctx, { winnerName, winnerAvatar: finalAvatar });
			};

			draw();

			const spaceHandler = (e: KeyboardEvent) =>
			{
				if (e.code === "Space")
				{
					document.removeEventListener("keydown", spaceHandler);
					window.location.href = "/menu";
				}
			};

			document.addEventListener("keydown", spaceHandler);
		};
	}


	useEffect(() => 
	{
		if (!canvasRef.current || !mode || !sessionData) return;

		if (mode === "duel")
		{
			const cleanup = gameLogic(canvasRef, "duel", sessionData);
			return () => cleanup?.();
		}

		if (mode === "tournament")
		{
			const players: PlayerData[] = [
				{
					username: sessionData.user,
					avatar: sessionData.userAvatar.image,
					score: 0,
					color: sessionData.userColor,
				},
				...sessionData.guests.map((g: any) => ({
					username: g.username,
					avatar: g.avatar.image,
					score: 0,
					color: g.color,
				})),
			];

			const allMatchups = createMatchups(players);
			setMatchups(allMatchups);
			setCurrentMatch(allMatchups[0]);
			setMatchQue(allMatchups.slice(1));

			console.log("Mode is:", mode);
			console.log("Session Data:", sessionData);
		}
	}, [mode, sessionData]);

	useEffect(() => 
	{
		if (mode !== "tournament" || !currentMatch) return;

		const matchSession = 
		{
			user: currentMatch.player1.username,
			guest: currentMatch.player2?.username,
			userAvatar: { image: currentMatch.player1.avatar },
			guestAvatar: currentMatch.player2
				? { image: currentMatch.player2.avatar }
				: null,
			gameType: sessionData?.gameType,
			tournamentBracket: {
				round: currentRound,
				pairs: matchups.map((m) => [
					m.player1.username,
					m.player2?.username || "POP",
				]) as [string,string][],
			},
			userColor: currentMatch.player1.color,
			guestColor: currentMatch.player2?.color,
		};

		const onMatchEnd = (winnerUsername: string) =>
		{
			console.log("Winner is:", winnerUsername);

			setPlayerScores(prevScores =>
			{
				const updated = { ...prevScores };
				assignPoints(updated, winnerUsername, currentRound);

				const winnerData = [currentMatch.player1, currentMatch.player2].find(
						(p) => p?.username === winnerUsername
				)
				
				const updateWinners = winnerData ? [...roundWinners, winnerData] : [...roundWinners]

				setRoundWinners(updateWinners)


				if (matchQue.length > 0)
				{
					setCurrentMatch(matchQue[0]);
					setMatchQue(matchQue.slice(1));
				}
				else
				{
					if (updateWinners.length > 1)
					{
						const newMatchups = createMatchups(updateWinners)
						setCurrentRound((prev) => prev + 1)
						setMatchups(newMatchups)
						setCurrentMatch(newMatchups[0])
						setMatchQue(newMatchups.slice(1))
						setRoundWinners([])
					}
					else
					{
					//	const finalWinner = Object.keys(updated).reduce((a, b) =>
					//	updated[a] > updated[b] ? a : b
					//);
						const finalWinner = winnerUsername
						console.log("Tournament winner is:", finalWinner);

						setMatchups([])
						setMatchQue([])
						setCurrentMatch(null);

						if (winnerData) {
							showFinalScreen(finalWinner, winnerData.avatar)
						}
					}
				}

				return updated;
			});
		};

		const cleanup = gameLogicTournament(canvasRef, matchSession, onMatchEnd);

		return () => cleanup?.();
	}, [mode, currentMatch]);

	return (
		<>
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "100vh",
					gap: "2rem",
					backgroundColor: "white",
				}}
			>
				{leftAvatarImage && (
					<img
						src={leftAvatarImage}
						alt="Left Avatar"
						style={{
							width: "150px",
							height: "350px",
							objectFit: "cover",
							borderRadius: "10px",
						}}
					/>
				)}

				<canvas
					ref={canvasRef}
					width={800}
					height={600}
					className="border-4 border-black"
					style={{ backgroundColor: "#87CEEB" }}
				/>

				{rightAvatarImage && (
					<img
						src={rightAvatarImage}
						alt="Right Avatar"
						style={{
							width: "150px",
							height: "350px",
							objectFit: "cover",
							borderRadius: "10px",
						}}
					/>
				)}
			</div>
		</>
	);
}





/// THE BACKUP VERSION FOR DUEL::


//export interface PlayerData 
//{
//	username: string;
//	avatar: string;
//	schore: number;
//}

//export interface Matchup
//{
//	player1: PlayerData;
//	player2?: PlayerData; // outnum player safespace
//}

//export function shufflPlayers(players: PlayerData[]): PlayerData[]
//{
//	return players
//		.map((p) => ({ sort: Math.random(), value: p }))
//		.sort((a, b) => a.sort = b.sort)
//		.map((a) => a.value)
//}

//export function createMatchups(players: PlayerData[]): Matchup[]
//{
//	const matchups: Matchup[] = []
//	const shuffled = shufflPlayers(players);

//	for (let i = 0; i < shuffled.length; i += 2)
//	{
//		const player1 = shuffled[i];
//		const player2 = shuffled[i + 1];
//		matchups.push({ player1, player2 })
//	}
//	return matchups;
//}

//export function assignPoints(
//	PlayerScores: Record<string, number>,
//	winner: string,
//	round: number
//)
//{
//	const points = round === 1 ? 10 : round === 2 ? 20 : 40;
//	PlayerScores[winner] = (PlayerScores[winner] || 0) + points;
//}