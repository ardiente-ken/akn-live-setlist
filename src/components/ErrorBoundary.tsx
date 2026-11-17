import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <pre style={{ padding: 16, whiteSpace: 'pre-wrap', color: 'crimson', background: '#fff' }}>
        {error.message}
        {'\n\n'}
        {error.stack}
      </pre>
    );
  }
}