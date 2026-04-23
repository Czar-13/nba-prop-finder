import { useEffect, useMemo, useState } from "react";
import "./App.css";

function getRecommendationClass(recommendation) {
  if (recommendation.includes("NUKE")) return "nuke";
  if (recommendation.includes("OVER")) return "over";
  if (recommendation.includes("UNDER")) return "under";
  if (recommendation.includes("PASS")) return "pass";
  return "";
}

function formatTime(isoString) {
  if (!isoString) return "—";

  const date = new Date(isoString);

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getEdgeBadgeClass(edge) {
  const absEdge = Math.abs(edge);

  if (absEdge >= 5) return "edge-high";
  if (absEdge >= 2) return "edge-medium";
  return "edge-low";
}

function formatEdge(edge) {
  return edge > 0 ? `+${edge}` : `${edge}`;
}

export default function App() {
  const [propsData, setPropsData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [recommendationFilter, setRecommendationFilter] = useState("");
  const [bestOnly, setBestOnly] = useState(false);
  const [totalsBestOnly, setTotalsBestOnly] = useState(false);
  const [limit, setLimit] = useState("");
  const [sortBy, setSortBy] = useState("score");
  const [viewMode, setViewMode] = useState("props");
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = () => {
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
          if (!isMounted) return;

          if (viewMode === "totals") {
            setPropsData(data.totals || []);
          } else if (bestOnly) {
            setPropsData(data.top_props || []);
          } else {
            setPropsData(data.props || []);
          }

          setLastUpdated(new Date());
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          if (!isMounted) return;
          setLoading(false);
        });
    };

    fetchData();

    const intervalId = setInterval(fetchData, 30000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [recommendationFilter, bestOnly, limit, viewMode]);

  const displayedData = useMemo(() => {
    let data = [...propsData];

    if (viewMode === "totals" && totalsBestOnly) {
      data = data.filter((game) => game.best_play);
    }

    data.sort((a, b) => {
      if (viewMode === "totals") {
        return Math.abs(b.edge) - Math.abs(a.edge);
      }

      return (b[sortBy] ?? 0) - (a[sortBy] ?? 0);
    });

    return data;
  }, [propsData, totalsBestOnly, viewMode, sortBy]);

  return (
    <div className="container">
      <h1>NBA Props Dashboard</h1>

      <div className="subheader">
        <span className="live-dot"></span>
        <span>
          Auto-refreshing every 30s
          {lastUpdated &&
            ` • Updated ${lastUpdated.toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })}`}
        </span>
      </div>

      <div className="controls">
        <button
          className={viewMode === "props" ? "active-btn" : ""}
          onClick={() => setViewMode("props")}
        >
          Player Props
        </button>
        <button
          className={viewMode === "totals" ? "active-btn" : ""}
          onClick={() => setViewMode("totals")}
        >
          Game Totals
        </button>
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

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={totalsBestOnly}
              onChange={(e) => setTotalsBestOnly(e.target.checked)}
            />
            Best Totals Only
          </label>
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

      {!loading && displayedData.length > 0 && viewMode === "props" && (
        <div className="best-card">
          <h2>🔥 Best Bet</h2>
          <p>
            {displayedData[0].player} — {displayedData[0].stat}
          </p>
          <p>
            Line: {displayedData[0].line} | Predicted: {displayedData[0].predicted}
          </p>
          <p>
            Edge:{" "}
            <span className={`edge-badge ${getEdgeBadgeClass(displayedData[0].edge)}`}>
              {formatEdge(displayedData[0].edge)}
            </span>{" "}
            | Score: {displayedData[0].score}
          </p>
          <p className={getRecommendationClass(displayedData[0].recommendation)}>
            {displayedData[0].recommendation}
          </p>
        </div>
      )}

      {!loading && displayedData.length > 0 && viewMode === "totals" && (
        <div className="best-card">
          <h2>🔥 Best Total</h2>
          <p>{displayedData[0].matchup}</p>
          <p>
            Book: {displayedData[0].bookmaker} | Line: {displayedData[0].line}
          </p>
          <p>
            Predicted: {displayedData[0].predicted_total} | Edge:{" "}
            <span className={`edge-badge ${getEdgeBadgeClass(displayedData[0].edge)}`}>
              {formatEdge(displayedData[0].edge)}
            </span>
          </p>
          <p className={getRecommendationClass(displayedData[0].recommendation)}>
            {displayedData[0].recommendation}
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
            {displayedData.map((prop, index) => (
              <tr key={index} className={prop.best_play ? "best-play-row" : ""}>
                <td>{prop.player}</td>
                <td>{prop.stat}</td>
                <td>{prop.line}</td>
                <td>{prop.predicted}</td>
                <td>
                  <span className={`edge-badge ${getEdgeBadgeClass(prop.edge)}`}>
                    {formatEdge(prop.edge)}
                  </span>
                </td>
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
            {displayedData.map((game, index) => (
              <tr key={index} className={game.best_play ? "best-play-row" : ""}>
                <td>{game.matchup}</td>
                <td>{game.bookmaker}</td>
                <td>{formatTime(game.commence_time)}</td>
                <td>{game.line}</td>
                <td>{game.predicted_total}</td>
                <td>
                  <span className={`edge-badge ${getEdgeBadgeClass(game.edge)}`}>
                    {formatEdge(game.edge)}
                  </span>
                </td>
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