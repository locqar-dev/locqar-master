import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Live presence panel for kiosk terminals.
 *
 * Polls `GET /api/admin/terminals/status` every 15s and renders an
 * online/offline card per terminal. Backend pairing PR:
 *   locqar-dev/dashboard-api#6 (feat/terminal-heartbeat)
 *
 * The dashboard-api keeps an in-memory map of the last heartbeat from
 * each kiosk (terminal-app pings every 30s) and exposes it at this
 * endpoint with a 90s staleness cutoff driving the `online` flag.
 *
 * This panel is intentionally decoupled from the mock-driven Terminals
 * table so it can ship independently. If the endpoint 401s or is
 * unreachable we render a compact empty state instead of crashing.
 */

const POLL_MS = 15_000;
const STATUS_ENDPOINT = '/api/admin/terminals/status';

const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  'http://localhost:3000';

function relativeTime(ms) {
  const s = Math.round(ms / 1000);
  if (s < 5) return 'just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  return `${h}h ago`;
}

export function TerminalPresencePanel() {
  const { theme } = useTheme();
  const [terminals, setTerminals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(0);

  const load = async () => {
    try {
      const res = await fetch(`${API_BASE}${STATUS_ENDPOINT}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTerminals(Array.isArray(data) ? data : []);
      setError(null);
      setLastRefresh(Date.now());
    } catch (err) {
      setError(err?.message || 'Unable to reach terminal service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onlineCount = terminals.filter((t) => t.online).length;

  return (
    <div
      className="rounded-2xl border p-6 mb-6"
      style={{ backgroundColor: theme.bg.card, borderColor: theme.border.primary }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: theme.text.primary }}>
            Terminals — Live Presence
          </h2>
          <p className="text-xs mt-1" style={{ color: theme.text.muted }}>
            Heartbeats from kiosks over the last 90 seconds
            {lastRefresh > 0 && ` · refreshed ${relativeTime(Date.now() - lastRefresh)}`}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Wifi size={14} style={{ color: '#81C995' }} />
            <span className="font-medium" style={{ color: theme.text.primary }}>
              {onlineCount}
            </span>
            <span style={{ color: theme.text.muted }}>online</span>
          </div>
          <button
            onClick={load}
            aria-label="Refresh"
            className="p-2 rounded-lg border transition-colors"
            style={{ borderColor: theme.border.primary }}
          >
            <RefreshCw
              size={14}
              className={loading ? 'animate-spin' : ''}
              style={{ color: theme.text.muted }}
            />
          </button>
        </div>
      </div>

      {error && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
          style={{
            backgroundColor: '#D4AA5A15',
            borderColor: '#D4AA5A',
            border: '1px solid #D4AA5A',
            color: '#D4AA5A',
          }}
        >
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {!error && !loading && terminals.length === 0 && (
        <div className="py-8 text-center text-sm" style={{ color: theme.text.muted }}>
          No terminals have pinged yet. They'll appear here as soon as a kiosk reports in.
        </div>
      )}

      {!error && terminals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {terminals.map((t) => (
            <div
              key={t.terminalId}
              className="flex items-start gap-3 p-4 rounded-xl border"
              style={{ backgroundColor: theme.bg.input, borderColor: theme.border.primary }}
            >
              <div
                className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  t.online ? 'animate-pulse' : ''
                }`}
                style={{ backgroundColor: t.online ? '#81C995' : theme.text.muted }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p
                    className="text-sm font-semibold truncate"
                    style={{ color: theme.text.primary }}
                  >
                    {t.lockerName || t.terminalId}
                  </p>
                  {t.online ? (
                    <Wifi size={12} style={{ color: '#81C995' }} />
                  ) : (
                    <WifiOff size={12} style={{ color: theme.text.muted }} />
                  )}
                </div>
                <p className="text-xs truncate" style={{ color: theme.text.muted }}>
                  {t.lockerCode || t.lockerSN || t.terminalId}
                  {t.location && ` · ${t.location}`}
                </p>
                <div
                  className="flex items-center gap-3 mt-2 text-[11px]"
                  style={{ color: theme.text.muted }}
                >
                  {t.screen && <span className="truncate">screen: {t.screen}</span>}
                  {t.version && <span>v{t.version}</span>}
                  <span className="ml-auto">{relativeTime(t.lastSeenMsAgo)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
