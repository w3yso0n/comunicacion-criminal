"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

import { AlertTriangle } from "lucide-react";

type ChartErrorBoundaryProps = {
  children: ReactNode;
  title?: string;
};

type ChartErrorBoundaryState = {
  hasError: boolean;
};

export class ChartErrorBoundary extends Component<
  ChartErrorBoundaryProps,
  ChartErrorBoundaryState
> {
  state: ChartErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ChartErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[ChartErrorBoundary]", error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex h-[240px] flex-col items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 text-center">
          <AlertTriangle className="size-8 text-red-400" aria-hidden />
          <p className="text-sm font-medium text-zinc-200">
            {this.props.title ?? "No se pudo cargar la gráfica"}
          </p>
          <p className="text-xs text-zinc-500">
            Intenta recargar la página o vuelve más tarde.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
