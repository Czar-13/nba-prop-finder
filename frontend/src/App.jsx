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

  const [recommendationFilter, setRecommendationFilter] = useState("");
  const [bestOnly, setBestOnly] = useState(false);
  const [limit, setLimit] = useState("");
  const [sortBy, setSortBy] = useState("score");
  const [viewMode, setViewMode] = useState("props");

  useEffect(() => {
    setLoading(true);

    let url = "http://127.0.0.1:8000/props";

    if (viewMode === "totals") {
      url = "http://127.0.0.1:8000/props/totals";
    } else if (bestOnly) {
      url = "http://127.0.0.1:8000/props/top";
    }

    const params = new URLSearchParams();

    if (recommendationFilter && !bestOnly && viewMode === "props") {
      params.append("recommendation", recommendationFilter);
    }

    if (limit) {
      params.append("limit", limit);
    }

    const finalUrl = params.toString() ? `${url}?${params.toString()}` : url;

    fetch(finalUrl)
      .then((res) => res.json())
      .then((data) => {
        if (viewMode === "totals") {
          setPropsData(data.totals || []);
        } else if (bestOnly) {
          setPropsData(data.top_props || []);
        } else {
          setPropsData(data.props || []);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, [recommendationFilter, bestOnly, limit, viewMode]);

  const sortedData = [...propsData].sort((a, b) => {
    if (viewMode === "totals") {
      if (sortBy === "edge") return Math.abs(b.edge) - Math.abs(a.edge);
      return Math.abs(b.edge) - Math.abs(a.edge);
    }
    return (b[sortBy] ?? 0) - (a[sortBy] ?? 0);
  });

  return (
    <div className="container">
      <h1>NBA Props Dashboard</h1>

      <div className="controls">
        <button onClick={() => setViewMode("props")}>Player Props</button>
        <button onClick={() => setViewMode("totals")}>Game Totals</button>
      </div>

      {viewMode === "props" && (
        <div className="controls">
          <select
            value={recommendationFilter}
            onChange={(e) => setRecommendationFilter(e.target.value)}
            disabled={bestOnly}
          >
            <option value="">All Recommendations</option>
            <option value="OVER">OVER</option>
            <option value="LEAN OVER">LEAN OVER</option>
            <option value="UNDER">UNDER</option>
            <option value="LEAN UNDER">LEAN UNDER</option>
            <option value="PASS">PASS</option>
            <option value="NUKE OVER">NUKE OVER</option>
            <option value="NUKE UNDER">NUKE UNDER</option>
          </select>

          <input
            type="number"
            min="1"
            placeholder="Limit results"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
          />

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={bestOnly}
              onChange={(e) => setBestOnly(e.target.checked)}
            />
            Best Plays Only
          </label>
        </div>
      )}

      {viewMode === "totals" && (
        <div className="controls">
          <input
            type="number"
            min="1"
            placeholder="Limit results"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
          />
        </div>
      )}

      {viewMode === "props" && (
        <div className="controls">
          <button onClick={() => setSortBy("score")}>Sort by Score</button>
          <button onClick={() => setSortBy("edge")}>Sort by Edge</button>
          <button onClick={() => setSortBy("confidence")}>Sort by Confidence</button>
        </div>
      )}

      {viewMode === "totals" && (
        <div className="controls">
          <button onClick={() => setSortBy("edge")}>Sort by Edge</button>
        </div>
      )}

      {!loading && sortedData.length > 0 && viewMode === "props" && (
        <div className="best-card">
          <h2>🔥 Best Bet</h2>
          <p>
            {sortedData[0].player} — {sortedData[0].stat}
          </p>
          <p>
            Line: {sortedData[0].line} | Predicted: {sortedData[0].predicted}
          </p>
          <p>
            Edge: {sortedData[0].edge} | Score: {sortedData[0].score}
          </p>
          <p className={getRecommendationClass(sortedData[0].recommendation)}>
            {sortedData[0].recommendation}
          </p>
        </div>
      )}

      {!loading && sortedData.length > 0 && viewMode === "totals" && (
        <div className="best-card">
          <h2>🔥 Best Total</h2>
          <p>{sortedData[0].matchup}</p>
          <p>
            Book: {sortedData[0].bookmaker} | Line: {sortedData[0].line}
          </p>
          <p>
            Predicted: {sortedData[0].predicted_total} | Edge: {sortedData[0].edge}
          </p>
          <p className={getRecommendationClass(sortedData[0].recommendation)}>
            {sortedData[0].recommendation}
          </p>
        </div>
      )}

      {loading ? (
        <p>Loading data...</p>
      ) : viewMode === "props" ? (
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
            {sortedData.map((prop, index) => (
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
      ) : (
        <table>
          <thead>
            <tr>
              <th>Matchup</th>
              <th>Bookmaker</th>
              <th>Time</th>
              <th>Line</th>
              <th>Predicted Total</th>
              <th>Edge</th>
              <th>Recommendation</th>
              <th>Best Play</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((game, index) => (
              <tr key={index} className={game.best_play ? "best-play-row" : ""}>
                <td>{game.matchup}</td>
                <td>{game.bookmaker}</td>
                <td>{game.commence_time}</td>
                <td>{game.line}</td>
                <td>{game.predicted_total}</td>
                <td>{game.edge}</td>
                <td className={getRecommendationClass(game.recommendation)}>
                  {game.recommendation}
                </td>
                <td>{game.best_play ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}