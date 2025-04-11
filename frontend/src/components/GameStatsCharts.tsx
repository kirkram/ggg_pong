import React from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface GameStatsChartProps {
  labels: string[];
  data: number[];
  title: string;
  type?: "bar" | "line" | "pie"; // Add "pie" as a valid type
}

const GameStatsChart: React.FC<GameStatsChartProps> = ({
  labels,
  data,
  title,
  type = "bar", // Default to bar chart
}) => {
  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data,
        backgroundColor:
          type === "pie"
            ? ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"]
            : "rgba(75, 192, 192, 0.6)",
        borderColor:
          type === "pie"
            ? ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"]
            : "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        fill: type === "line", // Fill area for line charts
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
  };

  // Dynamically render the correct chart type
  if (type === "line") {
    return <Line data={chartData} options={options} />;
  } else if (type === "pie") {
    return <Pie data={chartData} options={options} />;
  } else {
    return <Bar data={chartData} options={options} />;
  }
};

export default GameStatsChart;
