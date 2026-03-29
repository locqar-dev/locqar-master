import React, { useState } from 'react';
import './Receipt.css';

export default function Receipt({ packageData, onClose }) {
  const [printing, setPrinting] = useState(false);

  const handlePrint = () => {
    setPrinting(true);
    window.print();
    setTimeout(() => setPrinting(false), 500);
  };

  const handleDownloadPDF = async () => {
    // This would require a PDF library
    const receiptHTML = document.getElementById('receipt-content').innerHTML;
    console.log('Downloading PDF:', receiptHTML);
    // Implementation would use a library like jspdf or html2pdf
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
    }).format(amount);
  };

  return (
    <div className="receipt-modal">
      <div className="receipt-dialog">
        <div className="receipt-header">
          <h2>📄 Receipt / Invoice</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div id="receipt-content" className="receipt-content">
          {/* Receipt Header */}
          <div className="receipt-logo">
            <h1>LOCQAR</h1>
            <p>Secure Logistics Solutions</p>
          </div>

          <div className="receipt-divider"></div>

          {/* Transaction Info */}
          <div className="transaction-info">
            <div className="transaction-row">
              <span className="label">Receipt #:</span>
              <span className="value">{packageData.waybill}</span>
            </div>
            <div className="transaction-row">
              <span className="label">Date:</span>
              <span className="value">
                {new Date(packageData.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="transaction-row">
              <span className="label">Time:</span>
              <span className="value">
                {new Date(packageData.createdAt).toLocaleTimeString()}
              </span>
            </div>
          </div>

          <div className="receipt-divider"></div>

          {/* Sender & Recipient */}
          <div className="parties-info">
            <div className="party">
              <h4>From</h4>
              <p>{packageData.fromPhone}</p>
            </div>
            <div className="party">
              <h4>To</h4>
              <p>{packageData.customerName || 'Customer'}</p>
              <p className="phone">{packageData.customerPhone}</p>
            </div>
          </div>

          <div className="receipt-divider"></div>

          {/* Package Details */}
          <div className="package-details-receipt">
            <h4>Package Details</h4>
            <table className="details-table">
              <tbody>
                <tr>
                  <td className="label">Description:</td>
                  <td className="value">{packageData.name}</td>
                </tr>
                <tr>
                  <td className="label">Location:</td>
                  <td className="value">{packageData.location}</td>
                </tr>
                <tr>
                  <td className="label">Pickup Code:</td>
                  <td className="value pickup-code">
                    {packageData.pickupCode}
                  </td>
                </tr>
                <tr>
                  <td className="label">Status:</td>
                  <td className={`value status-${packageData.status.toLowerCase()}`}>
                    {packageData.status}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="receipt-divider"></div>

          {/* Terms & Conditions */}
          <div className="terms-section">
            <h4>Important Information</h4>
            <ul className="terms-list">
              <li>
                Keep your pickup code safe. You'll need it to collect your package.
              </li>
              <li>
                Packages must be picked up within 7 days. After that, they may be
                returned to sender.
              </li>
              <li>
                LocQar is not responsible for items of high value without prior
                declaration.
              </li>
              <li>
                Proof of delivery is available upon request within 30 days of
                transaction.
              </li>
            </ul>
          </div>

          <div className="receipt-divider"></div>

          {/* Footer */}
          <div className="receipt-footer">
            <p>Thank you for using LocQar!</p>
            <p className="footer-contact">
              📞 Support: +233 XXX XXX XXXX | 📧 help@locqar.com
            </p>
            <p className="footer-note">
              This is a digital receipt. Keep it for your records.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="receipt-actions">
          <button className="btn-print" onClick={handlePrint} disabled={printing}>
            🖨️ {printing ? 'Printing...' : 'Print'}
          </button>
          <button className="btn-pdf" onClick={handleDownloadPDF}>
            💾 Download PDF
          </button>
          <button className="btn-share">📤 Share</button>
          <button className="btn-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
