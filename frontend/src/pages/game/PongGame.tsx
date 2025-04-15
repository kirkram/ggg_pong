"use client";

import React, { useRef, useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { gameLogic } from "./gameLogic";

import {
	createMatchups,
	assignPoints,
	PlayerData,
	Matchup,
} from "./tournamentManager";

export default function PongGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // import stuff
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const mode = searchParams.get("mode"); // duel vs tournament
  const sessionData = location.state; // contains user, avatars, guests, etc.

  const [currentMatch, setCurrentMatch] = useState<Matchup | null>(null);
  const [matchQue, setMatchQue] = useState<Matchup[]>([]);

  useEffect(() => 
  {
	if (!canvasRef.current || !mode || !sessionData) return;

	if (mode ==="duel")
	{
		const cleanup = gameLogic(canvasRef, "duel", sessionData);
		return () => cleanup?.();
	}

	if (mode === "tournament")
	{
		const players: PlayerData[] = [
		{
			username: sessionData.user,
			avatar: sessionData.userAvatar.name,
			score: 0,
		},
		...sessionData.guests.map((g: any) => ({
			username: g.username,
			avatar: g.avatar.name,
			score: 0
		}))
		];

		const matchups = createMatchups(players);
		//saveMatches();
		setCurrentMatch(matchups[0]);
		setMatchQue(matchups.slice(1));

		//set the mode
		console.log("Mode is:", mode);
 	   console.log("Session Data:", sessionData);
	}
}, [mode, sessionData]);

    //store cleanup callback and start

	//UNCOMMENT THIS TO TEST THE TOURNAMENT!!!!!!
	/*
	    const cleanup = gameLogic(canvasRef, mode, sessionData);
	
    //	const cleanup = gameLogic(canvasRef)

    //cleanup when unmount
    return () => {
      if (cleanup && typeof cleanup === "function") {
        cleanup();
      }
    };
  }, [mode, sessionData]);
  */

  useEffect(() => {
    if (mode !== "tournament" || !currentMatch) return;

    const matchSession = 
	{
      user: currentMatch.player1.username,
      guest: currentMatch.player2?.username,
      userAvatar: { name: currentMatch.player1.avatar },
      guestAvatar: currentMatch.player2
        ? { name: currentMatch.player2.avatar }
        : null,
    };

    const cleanup = gameLogic(canvasRef, "duel", matchSession);

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
        {sessionData?.userAvatar?.image && (
          <img
            src={sessionData.userAvatar.image}
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

        {sessionData?.guestAvatar?.image && (
          <img
            src={sessionData.guestAvatar.image}
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
