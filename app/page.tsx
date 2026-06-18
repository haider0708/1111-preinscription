import SignupForm from "@/components/SignupForm";

export default function Home() {
  return (
    <main className="relative min-h-dvh w-full overflow-x-hidden bg-navy-950">
      {/* Desktop / tablet background — full poster, scaled to fit (never stretched) */}
      <div
        className="fixed inset-0 hidden bg-contain bg-center bg-no-repeat md:block"
        style={{ backgroundImage: "url('/background.png')" }}
        aria-hidden
      />

      {/* Mobile background — portrait poster fills the screen */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat md:hidden"
        style={{ backgroundImage: "url('/background-mobile.png')" }}
        aria-hidden
      />

      {/* Police-light signals layered over the poster, behind the form */}
      <div className="siren-signals" aria-hidden>
        <span className="siren-signal siren-signal-left" />
        <span className="siren-signal siren-signal-right" />
      </div>

      {/* Content — only the form; the spotlight that seats it lives in the form itself */}
      <div className="relative z-10 flex min-h-dvh w-full items-center justify-center px-4 py-8 sm:px-6 md:-translate-y-4 lg:-translate-y-6">
        <SignupForm />
      </div>
    </main>
  );
}
