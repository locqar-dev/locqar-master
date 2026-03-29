import React from "react";
import { T, ff } from "../theme/themes";
import StatusBar from "../components/StatusBar";
import PageHeader from "../components/PageHeader";

export default function LegalPage(props) {
  var isTerms = props.type === 'terms';
  var title = isTerms ? 'Terms of Service' : 'Privacy Policy';
  var lastUpdated = 'February 2026';

  var termsSections = [
    { t: '1. Acceptance of Terms', b: 'By accessing or using the LocQar application, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.' },
    { t: '2. Service Description', b: 'LocQar provides a smart locker delivery service operating in Accra, Ghana. Users can send, receive, and store packages using our network of automated lockers located across the city.' },
    { t: '3. User Accounts', b: 'You must register with a valid Ghanaian mobile phone number (+233). You are responsible for maintaining the security of your account credentials and PIN. You must be at least 18 years old to create an account.' },
    { t: '4. Payments & Fees', b: 'All prices are displayed in Ghana Cedis (GH\u20B5). Payment methods include Mobile Money (MTN, Vodafone, AirtelTigo), debit/credit cards, and LocQar Wallet. Fees are charged per transaction and vary by package size and service type.' },
    { t: '5. Package Guidelines', b: 'Prohibited items include hazardous materials, illegal substances, perishable foods, live animals, and items exceeding locker size limits. LocQar reserves the right to refuse any package that violates these guidelines.' },
    { t: '6. Liability', b: 'LocQar provides insurance coverage up to GH\u20B5500 per package. Items exceeding this value should be declared. LocQar is not liable for uncollected packages after the 48-hour pickup window.' },
    { t: '7. Cancellations & Refunds', b: 'Cancellations made before package drop-off receive a full refund. After drop-off, a GH\u20B52 processing fee applies. Refunds are processed within 2-3 business days to the original payment method.' },
    { t: '8. Account Termination', b: 'LocQar reserves the right to suspend or terminate accounts that violate these terms. Users may delete their account at any time through the app settings.' }
  ];

  var privacySections = [
    { t: '1. Information We Collect', b: 'We collect your name, phone number, email address, location data (for nearest locker), payment information, and package transaction history. We do not store full card numbers.' },
    { t: '2. How We Use Your Data', b: 'Your data is used to provide delivery services, process payments, send SMS notifications, improve our service, and communicate offers (with your consent). We analyze usage patterns in aggregate form.' },
    { t: '3. Data Storage & Security', b: 'All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Payment data is processed by PCI-DSS compliant partners. Your security PIN is hashed and never stored in plain text.' },
    { t: '4. Data Sharing', b: 'We share limited data with payment processors (MTN MoMo, Visa) and delivery partners only as needed to complete transactions. We never sell your personal data to third parties.' },
    { t: '5. Your Rights', b: 'You have the right to access, correct, or delete your personal data. You can export your transaction history. You can opt out of marketing communications at any time.' },
    { t: '6. Location Data', b: 'We use your location to show nearby lockers and calculate distances. Location access is optional \u2014 you can manually select lockers without granting location permission.' },
    { t: '7. Cookies & Analytics', b: 'The LocQar app uses minimal analytics to track app crashes and performance. No third-party advertising trackers are used.' },
    { t: '8. Contact & Complaints', b: 'For privacy concerns, contact our Data Protection Officer at privacy@locqar.com or through the in-app support chat. We respond to all inquiries within 48 hours.' }
  ];

  var sections = isTerms ? termsSections : privacySections;

  return (
    <div className="min-h-screen pb-12" style={{ background: T.bg }}><StatusBar />
      <PageHeader title={title} onBack={props.onBack} subtitle={"Last updated: " + lastUpdated} />

      <div style={{ padding: '0 20px' }}>
        <div className="space-y-4">
          {sections.map(function (s, i) {
            return (
              <div key={i} className="fu glass" style={{ padding: 20, borderRadius: 24, background: '#fff', border: '1.5px solid ' + T.border, boxShadow: T.shadow, animationDelay: (i * 0.05) + 's' }}>
                <h3 style={{ fontSize: 16, fontWeight: 900, fontFamily: ff, marginBottom: 10, color: T.text, letterSpacing: '-0.02em' }}>{s.t}</h3>
                <p style={{ fontSize: 13, lineHeight: '1.7', color: T.sec, fontFamily: ff, fontWeight: 500 }}>{s.b}</p>
              </div>
            );
          })}
        </div>

        <div className="glass mt-8 p-6 text-center" style={{ borderRadius: 24, background: T.fill, border: '1.5px solid ' + T.border }}>
          <p style={{ fontSize: 13, color: T.sec, fontFamily: ff, fontWeight: 600 }}>Questions regarding our {isTerms ? 'Terms' : 'Privacy'}?</p>
          <a href={"mailto:" + (isTerms ? 'legal@locqar.com' : 'privacy@locqar.com')} style={{ display: 'block', fontSize: 14, fontWeight: 800, color: T.accent, fontFamily: ff, marginTop: 4, textDecoration: 'none' }}>
            {isTerms ? 'legal@locqar.com' : 'privacy@locqar.com'}
          </a>
        </div>
      </div>
    </div>
  );
}
