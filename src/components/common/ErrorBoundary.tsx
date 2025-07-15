import { Alert } from "@mui/material";
import React, { type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(_error: Error, _info: React.ErrorInfo): void {}

  render() {
    if (this.state.hasError) {
      return <Alert severity="error">Error rendering UI. Please fix the JSON specfication file.</Alert>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
