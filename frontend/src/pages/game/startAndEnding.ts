export interface ScreenInfo
{
	round: number
	pl1Name: string;
	pl2Name: string;
	pl1Avatar: HTMLImageElement;
	pl2Avatar: HTMLImageElement;
	winnerName?: string;
	winnerAvatar: HTMLImageElement;
}

export function drawOpening(ctx: CanvasRenderingContext2D, info: Screen) 
{
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

	ctx.font = "48px Arial"
	ctx.fillStyle = "white"
	ctx.textAlign = "center"
	ctx.fillText(`Round ${info.round}`, ctx.canvas.width / 2, 100)

	const avatarSize = 100
	ctx.drawImage(info.pl1Avatar, 100, ctx.canvas.height / 2 - avatarSize / 2, avatarSize, avatarSize)
	ctx.drawImage(info.pl2Avatar, ctx.canvas.width - 200, ctx.canvas.height / 2 - avatarSize / 2, avatarSize, avatarSize)

	ctx.font = "32px Arial"
	ctx.fillText(info.pl1Name, 150, ctx.canvas.height / 2 + avatarSize + 30)
	ctx.fillText("vs", ctx.canvas.width / 2, ctx.canvas.height / 2 + 20)
	ctx.fillText(info.pl2Name, ctx.canvas.width - 150, ctx.canvas.height / 2 + avatarSize + 30)
  
	// Press space
	ctx.font = "28px Arial"
	ctx.fillText("Press Space to Start", ctx.canvas.width / 2, ctx.canvas.height - 100)
}

export function drawEnding(ctx: CanvasRenderingContext2D, info: ScreenInfo) 
{
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  
	ctx.font = "48px Arial"
	ctx.fillStyle = "gold"
	ctx.textAlign = "center"
	ctx.fillText(`${info.winnerName || "Someone"} wins the round!`, ctx.canvas.width / 2, ctx.canvas.height / 2 - 50)
  
	ctx.font = "28px Arial"
	ctx.fillStyle = "white"
	ctx.fillText("Press Space to Continue", ctx.canvas.width / 2, ctx.canvas.height / 2 + 50)
}

export function drawFinalScreen(ctx: CanvasRenderingContext2D, info: FinalScreenInfo) 
{
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
	// Background
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
	// WINNER! Text
	ctx.font = "64px Impact";
	ctx.fillStyle = "gold";
	ctx.textAlign = "center";
	ctx.fillText("🏆 WINNER! 🏆", ctx.canvas.width / 2, 100);
  
	// Avatar
	const size = 200;
	ctx.drawImage(
	  info.winnerAvatar,
	  ctx.canvas.width / 2 - size / 2,
	  ctx.canvas.height / 2 - size / 2,
	  size,
	  size
	);
  
	// Name
	ctx.font = "48px Arial";
	ctx.fillStyle = "white";
	ctx.fillText(info.winnerName, ctx.canvas.width / 2, ctx.canvas.height / 2 + size);
  
	// Prompt
	ctx.font = "28px Arial";
	ctx.fillStyle = "lightgray";
	ctx.fillText("Press Space to return to menu", ctx.canvas.width / 2, ctx.canvas.height - 80);
  }