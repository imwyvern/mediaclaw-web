"use client";

import React, { ErrorInfo, ReactNode } from "react";
import { ErrorState } from "./error-state";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {}

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <ErrorState 
          onRetry={() => this.setState({ hasError: false })} 
          className="m-8"
        />
      );
    }

    return this.props.children;
  }
}
