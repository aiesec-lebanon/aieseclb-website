// Shown only while developing (never in a production build): a reminder that the entries on the
// page are placeholders waiting for real content.
export default function SampleNote({ file, children }) {
  if (!import.meta.env.DEV) return null;
  return (
    <div className="shell pt-6">
      {/* solid, so it reads on a dark page as well as a light one */}
      <p className="relative z-20 rounded-2xl border-2 border-dashed border-ink/40 bg-sun px-5 py-4 text-[0.98rem] font-bold text-ink">
        {children || "Sample content. The entries on this page are placeholders."} Replace them in <code>{file}</code>. This
        note is only visible in development.
      </p>
    </div>
  );
}
