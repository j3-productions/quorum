import React from 'react';
import cn from 'classnames';
import { Spinner, Failer } from './Decals';

interface BoundaryProps {
  fallback?: React.ReactNode;
};

export function Hero({children, className}: {children: React.ReactNode; className?: string;}) {
  return (
    <div className={cn("text-center py-8", className)}>
      <h1 className="text-3xl md:text-4xl xl:text-5xl font-bold tracking-tight mb-12">
        {children}
      </h1>
    </div>
  );
}

// https://reactjs.org/docs/error-boundaries.html
export class ErrorBoundary extends React.Component<BoundaryProps, {}> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error: error };
  }

  render() {
    return (this.state.hasError && this.props?.fallback) ?
      this.props.fallback : this.props.children;
  }
}

// https://stackoverflow.com/questions/55303409/react-component-children-detect-if-empty-null-before-render
export class EmptyBoundary extends React.Component<BoundaryProps, {}> {
  render() {
    const isEmpty = !React.Children.count(
      React.Children.toArray(this.props?.children).
        filter((child) => React.isValidElement(child)) as React.ReactElement[]
    );
    return (isEmpty && this.props?.fallback) ?
      this.props.fallback : this.props.children;
  }
}
