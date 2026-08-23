"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          dir="rtl"
          style={{ fontFamily: "system-ui, sans-serif" }}
          className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-6 text-center"
        >
          <div>
            <p className="text-lg font-bold mb-2">حدث خطأ غير متوقع</p>
            <p className="text-sm text-slate-400 mb-5">جرّب إعادة تحميل الصفحة.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm"
            >
              إعادة التحميل
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
