import React from "react";
import { T, ff } from "../theme/themes";
import { RefreshCw, AlertTriangle } from "./Icons";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);

    this.setState({
      error,
      errorInfo
    });

    // Log to error reporting service in production
    if (import.meta.env.PROD) {
      // logErrorToService(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });

    // If resetOnError prop is provided, call it
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          errorInfo: this.state.errorInfo,
          reset: this.handleReset
        });
      }

      // Default error UI
      return (
        <div
          className="min-h-screen flex flex-col items-center justify-center"
          style={{
            padding: '20px',
            background: T.bg
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              background: T.errBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20
            }}
          >
            <AlertTriangle style={{ width: 40, height: 40, color: T.err }} />
          </div>

          <h2
            style={{
              fontSize: 20,
              fontWeight: 800,
              marginBottom: 8,
              fontFamily: ff,
              textAlign: 'center'
            }}
          >
            Something went wrong
          </h2>

          <p
            style={{
              fontSize: 14,
              color: T.sec,
              textAlign: 'center',
              marginBottom: 24,
              maxWidth: 320,
              lineHeight: 1.5,
              fontFamily: ff
            }}
          >
            We're sorry for the inconvenience. The app encountered an unexpected error.
          </p>

          {/* Show error details in development */}
          {import.meta.env.DEV && this.state.error && (
            <div
              style={{
                width: '100%',
                maxWidth: 400,
                padding: 16,
                borderRadius: 12,
                background: T.fill,
                border: '1px solid ' + T.border,
                marginBottom: 20
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: T.err,
                  marginBottom: 8,
                  fontFamily: ff
                }}
              >
                ERROR DETAILS (DEV ONLY):
              </p>
              <p
                style={{
                  fontSize: 11,
                  color: T.text,
                  fontFamily: 'monospace',
                  wordBreak: 'break-word'
                }}
              >
                {this.state.error.toString()}
              </p>
            </div>
          )}

          <button
            onClick={this.handleReset}
            className="tap"
            style={{
              padding: '14px 24px',
              borderRadius: 14,
              fontSize: 14,
              fontWeight: 700,
              color: '#fff',
              background: T.text,
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: ff,
              boxShadow: T.shadowLg
            }}
          >
            <RefreshCw style={{ width: 16, height: 16 }} />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
