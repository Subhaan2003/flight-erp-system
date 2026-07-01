import React from "react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from "chart.js";

// Register all necessary components inside ChartJS to prevent crashes
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

export default function ChartCard({ title, type = "line", data, options }) {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "var(--text-secondary)",
          font: { family: "Outfit" }
        }
      },
      tooltip: {
        backgroundColor: "var(--bg-card)",
        titleColor: "var(--text-primary)",
        bodyColor: "var(--text-secondary)",
        borderColor: "var(--border-color)",
        borderWidth: 1,
        titleFont: { family: "Outfit", weight: "bold" },
        bodyFont: { family: "Outfit" }
      }
    },
    scales: type !== "doughnut" ? {
      x: {
        grid: { color: "rgba(0,0,0,0.03)" },
        ticks: { color: "var(--text-secondary)", font: { family: "Outfit" } }
      },
      y: {
        grid: { color: "rgba(0,0,0,0.03)" },
        ticks: { color: "var(--text-secondary)", font: { family: "Outfit" } }
      }
    } : undefined
  };

  const combinedOptions = { ...defaultOptions, ...options };

  const renderChart = () => {
    switch (type) {
      case "bar":
        return <Bar data={data} options={combinedOptions} />;
      case "doughnut":
        return <Doughnut data={data} options={combinedOptions} />;
      case "line":
      default:
        return <Line data={data} options={combinedOptions} />;
    }
  };

  return (
    <div className="glass-card" style={{ height: "350px", display: "flex", flexDirection: "column" }}>
      <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "16px", color: "var(--text-primary)", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
        {title}
      </h3>
      <div style={{ flex: 1, position: "relative" }}>
        {renderChart()}
      </div>
    </div>
  );
}
