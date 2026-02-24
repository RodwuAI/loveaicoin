'use client';

export default function ProjectButtons({ label, className }: { label: string; className?: string }) {
  return (
    <button
      className={className || "btn btn-secondary w-full group-hover:border-gold transition-colors"}
      onClick={() => window.__toast?.('功能即将上线，敬请期待 🚀')}
    >
      {label}
    </button>
  );
}
