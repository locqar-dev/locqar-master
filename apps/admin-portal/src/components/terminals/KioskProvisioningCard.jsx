import React, { useCallback, useEffect, useState } from 'react';
import {
  RefreshCw,
  Link2,
  AlertCircle,
  Trash2,
  PlusCircle,
  Cpu,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Kiosk provisioning card.
 *
 * Paired with dashboard-api `feat/kiosk-provisioning`:
 *   GET    /api/admin/terminals/provisioning            — claimed list
 *   GET    /api/admin/terminals/provisioning/unclaimed  — pending list
 *   POST   /api/admin/terminals/provisioning            — claim
 *   DELETE /api/admin/terminals/provisioning/:deviceId  — revoke
 *
 * The in-memory registry on the backend means mappings survive restart
 * only via `KIOSK_PROVISIONING_SEED`. Admin-added rows are good for
 * pilot; a follow-up PR will persist them to the KioskDevice table.
 */

const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  'http://localhost:3000';

const POLL_MS = 20_000;

function relativeTime(ms) {
  const s = Math.round(ms / 1000);
  if (s < 5) return 'just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  return `${h}h ago`;
}

export function KioskProvisioningCard() {
  const { theme } = useTheme();
  const [claimed, setClaimed] = useState([]);
  const [unclaimed, setUnclaimed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Claim form state
  const [form, setForm] = useState({ deviceId: '', lockerSN: '', terminalId: '', lockerName: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const [claimedRes, unclaimedRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/terminals/provisioning`, { credentials: 'include' }),
        fetch(`${API_BASE}/api/admin/terminals/provisioning/unclaimed`, { credentials: 'include' }),
      ]);
      if (!claimedRes.ok) throw new Error(`claimed HTTP ${claimedRes.status}`);
      if (!unclaimedRes.ok) throw new Error(`unclaimed HTTP ${unclaimedRes.status}`);
      setClaimed(await claimedRes.json());
      setUnclaimed(await unclaimedRes.json());
      setError(null);
    } catch (err) {
      setError(err?.message || 'Unable to reach provisioning service');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, POLL_MS);
    return () => clearInterval(id);
  }, [fetchAll]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.deviceId.trim() || !form.lockerSN.trim()) {
      setFormError('Device ID and Locker SN are required');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/terminals/provisioning`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: form.deviceId.trim(),
          lockerSN: form.lockerSN.trim(),
          terminalId: form.terminalId.trim() || undefined,
          lockerName: form.lockerName.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setForm({ deviceId: '', lockerSN: '', terminalId: '', lockerName: '' });
      await fetchAll();
    } catch (err) {
      setFormError(err?.message || 'Failed to provision');
    } finally {
      setSubmitting(false);
    }
  };

  const prefillFromUnclaimed = (deviceId) => {
    setForm((f) => ({ ...f, deviceId }));
  };

  const handleRevoke = async (deviceId) => {
    if (!window.confirm(`Revoke provisioning for ${deviceId}?`)) return;
    try {
      await fetch(`${API_BASE}/api/admin/terminals/provisioning/${encodeURIComponent(deviceId)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      await fetchAll();
    } catch (err) {
      setError(err?.message || 'Failed to revoke');
    }
  };

  const input = (field, placeholder) => (
    <input
      value={form[field]}
      onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-xl border text-sm"
      style={{
        backgroundColor: theme.bg.input,
        borderColor: theme.border.primary,
        color: theme.text.primary,
      }}
    />
  );

  return (
    <div
      className="rounded-2xl border p-6 mb-6"
      style={{ backgroundColor: theme.bg.card, borderColor: theme.border.primary }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: theme.text.primary }}>
            Kiosk Provisioning
          </h2>
          <p className="text-xs mt-1" style={{ color: theme.text.muted }}>
            Bind physical tablets to lockers. A kiosk showing "Awaiting Provisioning" appears under "Pending Devices" below.
          </p>
        </div>
        <button
          onClick={fetchAll}
          aria-label="Refresh"
          className="p-2 rounded-lg border"
          style={{ borderColor: theme.border.primary }}
        >
          <RefreshCw
            size={14}
            className={loading ? 'animate-spin' : ''}
            style={{ color: theme.text.muted }}
          />
        </button>
      </div>

      {error && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm mb-4"
          style={{
            backgroundColor: '#D4AA5A15',
            border: '1px solid #D4AA5A',
            color: '#D4AA5A',
          }}
        >
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Claim form */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end mb-4"
      >
        <div className="md:col-span-2">
          <label className="block text-xs font-medium mb-1" style={{ color: theme.text.muted }}>
            Device ID
          </label>
          {input('deviceId', 'Android ID from kiosk')}
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: theme.text.muted }}>
            Locker SN
          </label>
          {input('lockerSN', 'LCQR-ACCRA-01')}
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: theme.text.muted }}>
            Terminal ID
          </label>
          {input('terminalId', 'optional')}
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium h-[38px]"
          style={{
            backgroundColor: theme.accent.primary,
            color: theme.accent.contrast,
            opacity: submitting ? 0.6 : 1,
          }}
        >
          <PlusCircle size={16} />
          {submitting ? 'Claiming…' : 'Claim'}
        </button>
      </form>
      {formError && (
        <p className="text-xs mb-4" style={{ color: '#D48E8A' }}>
          {formError}
        </p>
      )}

      {/* Pending devices — kiosks that called /provision without a match */}
      <div className="mb-5">
        <h3
          className="text-xs uppercase tracking-wider font-semibold mb-2"
          style={{ color: theme.text.muted }}
        >
          Pending Devices ({unclaimed.length})
        </h3>
        {unclaimed.length === 0 ? (
          <p className="text-xs py-2" style={{ color: theme.text.muted }}>
            No unclaimed kiosks. New devices appear here within ~15s of first boot.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {unclaimed.map((u) => (
              <button
                key={u.deviceId}
                onClick={() => prefillFromUnclaimed(u.deviceId)}
                className="flex items-start gap-3 p-3 rounded-xl border text-left transition-colors"
                style={{ backgroundColor: theme.bg.input, borderColor: theme.border.primary }}
              >
                <Cpu size={16} style={{ color: theme.accent.primary, marginTop: 2 }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono font-semibold truncate" style={{ color: theme.text.primary }}>
                    {u.deviceId}
                  </p>
                  <p className="text-[11px]" style={{ color: theme.text.muted }}>
                    {u.model || 'unknown model'}
                    {u.androidVersion && ` · Android ${u.androidVersion}`}
                    {u.appVersion && ` · v${u.appVersion}`}
                  </p>
                  <p className="text-[11px]" style={{ color: theme.text.muted }}>
                    seen {relativeTime(Date.now() - u.lastSeenAt)} · click to prefill
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Claimed devices */}
      <div>
        <h3
          className="text-xs uppercase tracking-wider font-semibold mb-2"
          style={{ color: theme.text.muted }}
        >
          Claimed Kiosks ({claimed.length})
        </h3>
        {claimed.length === 0 ? (
          <p className="text-xs py-2" style={{ color: theme.text.muted }}>
            No kiosks registered yet.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {claimed.map((c) => (
              <div
                key={c.deviceId}
                className="flex items-center gap-3 p-3 rounded-xl border"
                style={{ backgroundColor: theme.bg.input, borderColor: theme.border.primary }}
              >
                <Link2 size={16} style={{ color: '#81C995' }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold" style={{ color: theme.text.primary }}>
                      {c.lockerName || c.lockerSN}
                    </p>
                    <span
                      className="text-[11px] px-2 py-[2px] rounded-full font-mono"
                      style={{ backgroundColor: theme.bg.card, color: theme.text.muted }}
                    >
                      {c.lockerSN}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono" style={{ color: theme.text.muted }}>
                    {c.deviceId} · terminal {c.terminalId || c.lockerSN}
                  </p>
                </div>
                <button
                  onClick={() => handleRevoke(c.deviceId)}
                  aria-label="Revoke"
                  className="p-2 rounded-lg border"
                  style={{ borderColor: theme.border.primary, color: '#D48E8A' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
