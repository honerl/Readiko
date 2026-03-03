 import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ClassProfile = () => {
  const studentAnalytics = [
    { title: "Literal Retrieval", progress: 95, color: "bg-green-500" },
    { title: "Inference & Logic", progress: 40, color: "bg-yellow-400" },
    { title: "Reflective Evaluation", progress: 15, color: "bg-red-500" },
  ];

  const chartData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7", "Week 8"],
    datasets: [
      {
        label: "Score",
        data: [55, 60, 65, 62, 70, 75, 72, 80],
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.parsed.y}%`;
          },
        },
      },
    },
    scales: {
      y: { min: 0, max: 100, ticks: { stepSize: 20, callback: (v) => v + "%" } },
    },
  };

  return (
    <div className="max-w-lg mx-auto p-4 bg-gray-50 rounded-xl shadow-lg space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="w-14 h-14 bg-gray-300 rounded-full flex items-center justify-center text-white text-xl font-bold">
          E
        </div>
        <h2 className="text-2xl font-semibold text-gray-800">Earl Echavez</h2>
      </div>

      {/* Rank & Average */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition duration-200 text-center">
          <p className="text-gray-500 text-sm">Rank #</p>
          <p className="text-2xl font-bold text-gray-800">2</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition duration-200 text-center">
          <p className="text-gray-500 text-sm">Average</p>
          <p className="text-2xl font-bold text-gray-800">98.6</p>
        </div>
      </div>

      {/* Student Analytics */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <h3 className="font-semibold text-gray-700 text-lg">Student Analytics</h3>
        {studentAnalytics.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">{item.title}</span>
              <button className="px-3 py-1 text-sm rounded-full bg-blue-500 text-white hover:bg-blue-600 transition">
                View
              </button>
            </div>
            <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
              <div
                className={`${item.color} h-3 rounded-full transition-all duration-500`}
                style={{ width: `${item.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Student Progress Chart */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold text-gray-700 mb-3 text-lg">Student Progress</h3>
        <Line data={chartData} options={chartOptions} height={150} />
      </div>
    </div>
  );
};

export default ClassProfile;