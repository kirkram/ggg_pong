
//save duel for backend

export async function saveGameResult(params: 
{
	user: string;
	userAvatar: string;
	guest: string;
	guestAvatar: string;
	userWins: number;
	guestWins: number;
}) 
{
	try 
	{
		const response = await fetch("/api/save-game-session", 
		{
			method: "POST",
			headers: {
			  "Content-Type": "application/json",
			},
			body: JSON.stringify(params),
	 	});
  
		if (!response.ok) {
			throw new Error("Failed to save game session");
		}
  
		console.log("✅ Game session saved successfully!");
		} catch (error) {
		console.error("❌ Error saving game session:", error);
		}
	}
  