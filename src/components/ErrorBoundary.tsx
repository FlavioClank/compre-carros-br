import React from "react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Keep log for debugging without crashing the whole app
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary] Uncaught error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="min-h-screen bg-background text-foreground">
        <section className="mx-auto max-w-3xl px-6 py-16">
          <header className="space-y-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              Ocorreu um erro ao carregar a página
            </h1>
            <p className="text-muted-foreground">
              Atualize a página para tentar novamente. Se persistir, o erro foi registrado no
              console para diagnóstico.
            </p>
          </header>

          <div className="mt-8 flex items-center gap-3">
            <Button onClick={this.handleReload}>Recarregar</Button>
            <Button variant="outline" asChild>
              <a href="/home">Ir para a Home</a>
            </Button>
          </div>

          {this.state.error?.message ? (
            <pre className="mt-8 whitespace-pre-wrap rounded-md border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              {this.state.error.message}
            </pre>
          ) : null}
        </section>
      </main>
    );
  }
}
