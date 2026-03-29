import React, { useState, useEffect } from 'react';
import './PackageTracking.css';

export default function PackageTrackingPage() {
  const [packageId, setPackageId] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [auditTrail, setAuditTrail] = useState([]);

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Fetch package details
      const response = await fetch(`/api/packages/${packageId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Package not found');
      }

      const data = await response.json();
      setTrackingData(data);

      // Fetch audit trail for this package
      const auditResponse = await fetch(
        `/api/audit/trail/Package/${packageId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (auditResponse.ok) {
        const auditData = await auditResponse.json();
        setAuditTrail(auditData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      PENDING: '⏳',
      IN_TRANSIT: '📍',
      DELIVERED_TO_LOCKER: '📦',
      PICKED_UP: '✅',
      EXPIRED: '❌',
    };
    return icons[status] || '📬';
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: '#f39c12',
      IN_TRANSIT: '#3498db',
      DELIVERED_TO_LOCKER: '#2ecc71',
      PICKED_UP: '#27ae60',
      EXPIRED: '#e74c3c',
    };
    return colors[status] || '#95a5a6';
  };

  const getStatusDescription = (status) => {
    const descriptions = {
      PENDING: 'Order placed and awaiting dispatch',
      IN_TRANSIT: 'Package is on its way',
      DELIVERED_TO_LOCKER: 'Package arrived at locker',
      PICKED_UP: 'Package picked up successfully',
      EXPIRED: 'Package delivery period expired',
    };
    return descriptions[status] || 'Unknown status';
  };

  return (
    <div className="package-tracking">
      <div className="tracking-container">
        <h1>📍 Real-Time Package Tracking</h1>

        {/* Search Form */}
        <form onSubmit={handleTrack} className="tracking-form">
          <input
            type="text"
            placeholder="Enter Waybill Number (e.g., LQ-2024-00001)"
            value={packageId}
            onChange={(e) => setPackageId(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Tracking...' : 'Track Package'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        {trackingData && (
          <div className="tracking-results">
            {/* Package Header */}
            <div className="package-header">
              <div className="package-info">
                <h2>{trackingData.waybill}</h2>
                <p>
                  Sent by: <strong>{trackingData.fromPhone}</strong>
                </p>
                <p>
                  To: <strong>{trackingData.customerName || 'Customer'}</strong>
                </p>
              </div>
              <div
                className="package-status"
                style={{ borderColor: getStatusColor(trackingData.status) }}
              >
                <span className="status-icon">
                  {getStatusIcon(trackingData.status)}
                </span>
                <span className="status-text">{trackingData.status}</span>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="status-timeline">
              <div className="timeline-item current">
                <div
                  className="timeline-dot"
                  style={{ backgroundColor: getStatusColor(trackingData.status) }}
                />
                <div className="timeline-content">
                  <h3>{trackingData.status}</h3>
                  <p>{getStatusDescription(trackingData.status)}</p>
                  {trackingData.location && (
                    <p className="location">📍 {trackingData.location}</p>
                  )}
                </div>
              </div>

              {/* Audit Trail as Timeline */}
              {auditTrail.map((log, index) => (
                <div key={log.id} className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <h4>{log.action}</h4>
                    <p>
                      {log.user
                        ? `by ${log.user.name} (${log.user.email})`
                        : 'System'}
                    </p>
                    <small>
                      {new Date(log.createdAt).toLocaleString()}
                    </small>
                  </div>
                </div>
              ))}
            </div>

            {/* Package Details */}
            <div className="package-details">
              <h3>Package Details</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <label>Waybill:</label>
                  <span>{trackingData.waybill}</span>
                </div>
                <div className="detail-item">
                  <label>Status:</label>
                  <span>{trackingData.status}</span>
                </div>
                <div className="detail-item">
                  <label>Location:</label>
                  <span>{trackingData.location || 'Not available'}</span>
                </div>
                <div className="detail-item">
                  <label>Pickup Code:</label>
                  <span className="pickup-code">{trackingData.pickupCode || 'Not assigned'}</span>
                </div>
                <div className="detail-item">
                  <label>Created:</label>
                  <span>{new Date(trackingData.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <label>Updated:</label>
                  <span>{new Date(trackingData.updatedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {trackingData.status === 'DELIVERED_TO_LOCKER' && (
              <div className="package-actions">
                <button className="btn-primary">📦 Pick Up Package</button>
                <button className="btn-secondary">📧 Send Reminder</button>
              </div>
            )}
          </div>
        )}

        {!trackingData && !error && (
          <div className="empty-state">
            <p>Enter a waybill number above to track your package</p>
          </div>
        )}
      </div>
    </div>
  );
}
