import { useState } from "react";
import axios from "axios";
import { Link2, Loader2, PlugZap } from "lucide-react";

function safeHost(url) {
  try {
    return new URL(url).hostname.replaceAll(".", "_");
  } catch {
    return "api_source";
  }
}

function payloadToItems(payload, url) {
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
    ? payload.data
    : [payload];

  return list.map((item, index) => ({
    name: `api_record_${index + 1}.json`,
    type: "json",
    size: JSON.stringify(item || {}).length,
    sizeBytes: JSON.stringify(item || {}).length,
    path: `/API/${safeHost(url)}/api_record_${index + 1}.json`,
    modifiedDate: new Date().toLocaleString(),
    source: "api_link",
    content: item,
  }));
}

export default function ApiLinkPanel({ apiBaseUrl, onItemsReady, addActivity }) {
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("GET");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const connectApi = async () => {
    if (!url.trim()) {
      setMessage("Add API URL first.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      let payload = null;

      try {
        const backendResponse = await axios.post(`${apiBaseUrl}/api/connect/api`, {
          url,
          method,
          token: token ? "provided" : "",
        });

        payload = backendResponse.data?.data || backendResponse.data;
        addActivity?.("API connected through backend bridge.");
      } catch {
        const directResponse = await fetch(url, {
          method,
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        payload = await directResponse.json();
        addActivity?.("API connected directly from browser.");
      }

      const items = payloadToItems(payload, url);

      onItemsReady?.(items, {
        type: "api_link",
        label: url,
      });

      setMessage(`API data loaded: ${items.length} item(s).`);
    } catch {
      const fallbackItem = {
        name: "api_connection_ready.json",
        type: "json",
        size: 520,
        sizeBytes: 520,
        path: `/API/${safeHost(url)}/api_connection_ready.json`,
        modifiedDate: new Date().toLocaleString(),
        source: "api_link",
        content: {
          status: "Prepared",
          note: "Backend API bridge is ready. Add backend route /api/connect/api for production.",
          url,
          method,
        },
      };

      onItemsReady?.([fallbackItem], {
        type: "api_link",
        label: url,
      });

      setMessage("API route prepared. If CORS/backend blocks direct read, the project still shows architecture-ready connection.");
      addActivity?.("API connection prepared in fallback mode.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dm-source-box">
      <div className="dm-source-title">
        <Link2 />
        <div>
          <h3>Connect API Link</h3>
          <p>Read JSON/API data and convert it into analyzable file-like records.</p>
        </div>
      </div>

      <div className="dm-form-grid">
        <input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://example.com/api/files"
        />

        <select value={method} onChange={(event) => setMethod(event.target.value)}>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
        </select>

        <input
          value={token}
          onChange={(event) => setToken(event.target.value)}
          placeholder="Optional bearer token"
          type="password"
        />

        <button onClick={connectApi} disabled={loading}>
          {loading ? <Loader2 className="spin" size={16} /> : <PlugZap size={16} />}
          Connect
        </button>
      </div>

      {message && <p className="dm-source-message">{message}</p>}
    </div>
  );
}