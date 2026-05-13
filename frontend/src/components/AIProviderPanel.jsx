import { useState } from "react";
import axios from "axios";
import { Bot, KeyRound, Loader2, ShieldCheck } from "lucide-react";

export default function AIProviderPanel({ apiBaseUrl, onItemsReady, addActivity }) {
  const [provider, setProvider] = useState("azure_openai");
  const [endpoint, setEndpoint] = useState("");
  const [deployment, setDeployment] = useState("");
  const [hasKey, setHasKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const prepareProvider = async () => {
    setLoading(true);
    setMessage("");

    try {
      await axios.post(`${apiBaseUrl}/api/connect/ai-provider`, {
        provider,
        endpoint,
        deployment,
        hasKey,
      });

      addActivity?.("AI provider sent to backend configuration route.");
      setMessage("AI provider prepared through backend route.");
    } catch {
      setMessage("AI provider blueprint prepared locally. Put real keys in backend .env, not inside frontend.");
      addActivity?.("AI provider blueprint prepared.");
    }

    const item = {
      name: "ai_provider_blueprint.json",
      type: "json",
      size: 760,
      sizeBytes: 760,
      path: `/AI/${provider}/ai_provider_blueprint.json`,
      modifiedDate: new Date().toLocaleString(),
      source: "ai_provider",
      content: {
        provider,
        endpoint: endpoint || "backend-env",
        deployment: deployment || "backend-env",
        keyHandling: hasKey ? "Key should be stored in backend .env" : "No key entered",
      },
    };

    onItemsReady?.([item], {
      type: "ai_provider",
      label: provider,
    });

    setLoading(false);
  };

  return (
    <div className="dm-source-box">
      <div className="dm-source-title">
        <Bot />
        <div>
          <h3>AI Provider Ready</h3>
          <p>Prepared for Azure OpenAI, OpenAI API, local model, or future backend AI engine.</p>
        </div>
      </div>

      <div className="dm-form-grid">
        <select value={provider} onChange={(event) => setProvider(event.target.value)}>
          <option value="azure_openai">Azure OpenAI</option>
          <option value="openai">OpenAI API</option>
          <option value="local_llm">Local LLM</option>
          <option value="mock_engine">Mock Safe Engine</option>
        </select>

        <input value={endpoint} onChange={(event) => setEndpoint(event.target.value)} placeholder="Endpoint / base URL" />
        <input value={deployment} onChange={(event) => setDeployment(event.target.value)} placeholder="Deployment / model name" />

        <label className="dm-check-row">
          <input
            type="checkbox"
            checked={hasKey}
            onChange={(event) => setHasKey(event.target.checked)}
          />
          <KeyRound size={15} />
          Key exists in backend env
        </label>

        <button onClick={prepareProvider} disabled={loading}>
          {loading ? <Loader2 className="spin" size={16} /> : <ShieldCheck size={16} />}
          Prepare AI
        </button>
      </div>

      {message && <p className="dm-source-message">{message}</p>}
    </div>
  );
}