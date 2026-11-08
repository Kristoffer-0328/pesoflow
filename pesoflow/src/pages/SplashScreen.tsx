export default function SplashScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center bg-[#278568] text-5xl font-bold text-white shadow-xl">
          ₱
        </div>
        <h1 className="mt-6 text-3xl font-semibold text-[#202A35]">PesoFlow</h1>
        <p className="mt-2 text-sm text-slate-500">Know where your money goes.</p>
        <div className="mt-8 flex justify-center gap-2" aria-label="Loading">
          <span className="h-2 w-2 animate-pulse bg-[#278568]" />
          <span className="h-2 w-2 animate-pulse bg-[#278568] [animation-delay:150ms]" />
          <span className="h-2 w-2 animate-pulse bg-[#278568] [animation-delay:300ms]" />
        </div>
      </div>
    </main>
  )
}
