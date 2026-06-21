/**
 * Softteco wordmark — styled in the same spirit as the Itelgie logo
 * (clean geometric sans, two-tone with an accent dot).
 */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-navy text-white">
        <span className="text-[15px] font-extrabold tracking-tight">S</span>
      </div>
      <span className="text-[19px] font-extrabold tracking-tight text-navy">
        Soft<span className="text-green">teco</span>
      </span>
    </div>
  )
}
