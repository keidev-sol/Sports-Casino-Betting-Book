// Ambient animated backdrop — floating gold/green/blue aurora blobs + a faint
// pitch grid. Sits behind everything (pointer-events-none, -z-10).
export default function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-neon-gold/10 blur-[120px] animate-float" />
      <div className="absolute right-[-10rem] top-10 h-[30rem] w-[30rem] rounded-full bg-neon-cyan/10 blur-[120px] animate-float [animation-delay:-6s]" />
      <div className="absolute bottom-[-12rem] left-1/3 h-[32rem] w-[32rem] rounded-full bg-neon-green/10 blur-[120px] animate-float [animation-delay:-11s]" />
      {/* faint pitch lines */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(circle at 50% 30%, #000 0%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 30%, #000 0%, transparent 70%)',
        }}
      />
    </div>
  );
}
