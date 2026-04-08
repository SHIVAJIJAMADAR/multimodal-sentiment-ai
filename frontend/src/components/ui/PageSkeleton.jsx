import React from "react";

function Block({ className = "" }) {
  return <div className={`animate-pulse rounded-xl bg-white/5 ring-1 ring-white/10 ${className}`} />;
}

export default function PageSkeleton({ title = "Loading" }) {
  return (
    <div className="container-centered py-10">
      <div className="card p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">{title}</div>
            <Block className="mt-2 h-7 w-48" />
          </div>
          <Block className="h-9 w-28" />
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Block className="h-32" />
          <Block className="h-32" />
          <Block className="h-32" />
          <Block className="h-32" />
        </div>
        <div className="mt-6">
          <Block className="h-56" />
        </div>
      </div>
    </div>
  );
}
