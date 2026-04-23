import { useEffect, useState } from "react";
import "./App.css";

function getRecommendationClass(recommendation) {
  if (recommendation.includes("NUKE")) return "nuke";
  if (recommendation.includes("OVER")) return "over";
  if (recommendation.includes("UNDER")) return "under";
  if (recommendation.includes("PASS")) return "pass";
  return "";
}

export default function App() {
  const [propsData, setPropsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/props")
      .then((res) => res.json())
      .then((data) => {
        setPropsData(data.props || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching props:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="container">
        <h1>NBA Props Dashboard</h1>
        <p>Loading props...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>NBA Props Dashboard</h1>

      <table>
        <thead>
          <tr>
            <th>Player</th>
            <th>Stat</th>
            <th>Line</th>
            <th>Predicted</th>
            <th>Edge</th>
            <th>Confidence</th>
            <th>Risk</th>
            <th>Score</th>
            <th>Recommendation</th>
            <th>Best Play</th>
          </tr>
        </thead>
        <tbody>
          {propsData.map((prop, index) => (
            <tr key={index} className={prop.best_play ? "best-play-row" : ""}>
              <td>{prop.player}</td>
              <td>{prop.stat}</td>
              <td>{prop.line}</td>
              <td>{prop.predicted}</td>
              <td>{prop.edge}</td>
              <td>{prop.confidence}%</td>
              <td>{prop.risk_level}</td>
              <td>{prop.score}</td>
              <td className={getRecommendationClass(prop.recommendation)}>
                {prop.recommendation}
              </td>
              <td>{prop.best_play ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}