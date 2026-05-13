import { useState } from "react";
import axios from "axios";
import { Database, Loader2, PlugZap } from "lucide-react";

export default function DatabaseLinkPanel({ apiBaseUrl, onItemsReady, addActivity }) {
  const [engine, setEngine] = useState("mysql");
  const [host, setHost] = useState("localhost");
  const [database, setDatabase] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const connectDatabase = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(`${apiBaseUrl}/api/connect/database`, {
        engine,
        host,
        database,
        username,
      });

      const tables = response.data?.tables || response.data?.data || [];

      const items =
        tables.length > 0
          ? tables.map((table, index) => ({
              name: `${table.name || `table_${index + 1}`}.json`,
              type: "json",
              size: 1024,
              sizeBytes: 1024,
              path: `/Database/${database || engine}/${table.name || `table_${index + 1}`}.json`,
              modifiedDate: new Date().toLocaleString(),
              source: "database",
              content: table,
            }))
          : [];

      onItemsReady?.(items, {
        type: "database",
        label: `${engine}:${database || host}`,
      });

      setMessage(`Database connected. ${items.length} table item(s) loaded.`);
      addActivity?.("Database connected through backend.");
    } catch {
      const fallbackItem = {
        name: "database_connection_blueprint.json",
        type: "json",
        size: 620,
        sizeBytes: 620,
        path: `/Database/${database || engine}/database_connection_blueprint.json`,
        modifiedDate: new Date().toLocaleString(),
        source: "database",
        content: {
          status: "Architecture Ready",
          engine,
          host,
          database,
          username,
          nextBackendRoute: "/api/connect/database",
        },
      };

      onItemsReady?.([fallbackItem], {
        type: "database",
        label: `${engine}:${database || host}`,
      });

      setMessage("Database bridge prepared. Add backend driver later without changing the UI.");
      addActivity?.("Database connection prepared in fallback mode.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dm-source-box">
      <div className="dm-source-title">
        <Database />
        <div>
          <h3>Connect Database</h3>
          <p>Prepared for MySQL, PostgreSQL, MongoDB, or SQL Server through backend bridge.</p>
        </div>
      </div>

      <div className="dm-form-grid">
        <select value={engine} onChange={(event) => setEngine(event.target.value)}>
          <option value="mysql">MySQL</option>
          <option value="postgresql">PostgreSQL</option>
          <option value="mongodb">MongoDB</option>
          <option value="sqlserver">SQL Server</option>
        </select>

        <input value={host} onChange={(event) => setHost(event.target.value)} placeholder="Host" />
        <input value={database} onChange={(event) => setDatabase(event.target.value)} placeholder="Database name" />
        <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Username" />

        <button onClick={connectDatabase} disabled={loading}>
          {loading ? <Loader2 className="spin" size={16} /> : <PlugZap size={16} />}
          Prepare DB
        </button>
      </div>

      {message && <p className="dm-source-message">{message}</p>}
    </div>
  );
}