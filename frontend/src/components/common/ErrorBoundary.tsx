import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console for debugging
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Log to state for display
    this.setState({
      error,
      errorInfo,
    });

    // In production, you could send this to an error tracking service
    // Example: Sentry, LogRocket, etc.
    if (import.meta.env.PROD) {
      // Log error details that can be seen in browser console
      console.error("Production Error Details:", {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      });
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback with inline styles in case CSS fails to load
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            backgroundColor: "#f3f4f6",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          <div
            style={{
              maxWidth: "500px",
              width: "100%",
              backgroundColor: "white",
              borderRadius: "16px",
              padding: "32px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
              textAlign: "center",
            }}
          >
            <div style={{ marginBottom: "24px" }}>
              <svg
                style={{
                  width: "80px",
                  height: "80px",
                  margin: "0 auto",
                  color: "#ef4444",
                }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#111827",
                marginBottom: "8px",
              }}
            >
              Something went wrong
            </h1>
            <p
              style={{
                color: "#6b7280",
                marginBottom: "24px",
              }}
            >
              We're sorry, but something unexpected happened. Please try
              refreshing the page.
            </p>
            {this.state.error && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "16px",
                  backgroundColor: "#f9fafb",
                  borderRadius: "8px",
                  textAlign: "left",
                  marginBottom: "24px",
                }}
              >
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#111827",
                    marginBottom: "8px",
                  }}
                >
                  Error Details:
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#374151",
                    fontFamily: "monospace",
                    wordBreak: "break-all",
                  }}
                >
                  {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <details style={{ marginTop: "8px" }}>
                    <summary
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        cursor: "pointer",
                      }}
                    >
                      Stack Trace
                    </summary>
                    <pre
                      style={{
                        fontSize: "11px",
                        color: "#374151",
                        marginTop: "8px",
                        overflow: "auto",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}
            <button
              onClick={() => {
                window.location.reload();
              }}
              style={{
                marginTop: "24px",
                padding: "12px 24px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#2563eb";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#3b82f6";
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
