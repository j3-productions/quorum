// from: https://www.copycat.dev/blog/react-suspense/
import React from "react";

interface ErrorBoundaryProps {
  fallback?: string;
};

// Error boundaries currently have to be a class component.
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, {}> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error: error };
  }

  render() {
    return (this.state.hasError && this.props?.fallback) ?
      this.props.fallback : this.props.children;
  }
}
