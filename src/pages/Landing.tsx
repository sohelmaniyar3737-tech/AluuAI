import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import {
  ArrowRight,
  Sparkles,
  MessageSquare,
  Code2,
  Lightbulb,
  Moon,
  Sun,
  Zap,
  ShieldCheck,
  Menu,
} from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark";

  const features = [
    {
      icon: MessageSquare,
      title: "Smart Conversations",
      description:
        "Ask questions, explore ideas, and get helpful answers in seconds.",
    },
    {
      icon: Code2,
      title: "Coding Assistance",
      description:
        "Understand code, solve programming problems, and build projects faster.",
    },
    {
      icon: Lightbulb,
      title: "Creative Thinking",
      description:
        "Brainstorm ideas, improve your writing, and turn thoughts into action.",
    },
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-xl font-bold tracking-tight"
            aria-label="AluuAI home"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles size={20} />
            </span>
            AluuAI
          </button>

          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#features" className="transition hover:text-foreground">
              Features
            </a>
            <a href="#about" className="transition hover:text-foreground">
              About
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border transition hover:bg-muted"
              aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
              title={`Switch to ${isDark ? "light" : "dark"} mode`}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              onClick={() => navigate("/auth")}
              className="hidden rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition hover:bg-muted sm:block"
            >
              Sign In
            </button>

            <button
              onClick={() => navigate("/try")}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative isolate">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute right-0 top-48 h-64 w-64 rounded-full bg-violet-500/10 blur-[100px]" />
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-2 lg:gap-16 lg:py-32">
          <div className="max-w-2xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles size={16} />
              Meet your AI companion
            </div>

            <h1 className="text-5xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
              Think bigger.
              <span className="mt-2 block bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                Create smarter.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">
              Meet AluuAI — your everyday AI assistant for learning, coding,
              creativity, and turning your ideas into something real.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => navigate("/try")}
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-7 py-4 font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:opacity-90"
              >
                Start Chatting
                <ArrowRight
                  size={18}
                  className="transition group-hover:translate-x-1"
                />
              </button>

              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-2xl border border-border px-7 py-4 font-semibold transition hover:bg-muted"
              >
                Explore Features
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Zap size={16} className="text-primary" />
                Fast AI assistance
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-primary" />
                Personal chat history
              </span>
            </div>
          </div>

          {/* Chat preview */}
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-primary/20 via-violet-500/10 to-fuchsia-500/20 blur-2xl" />

            <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <p className="font-semibold">AluuAI Assistant</p>
                    <p className="text-xs text-muted-foreground">
                      Your ideas start here
                    </p>
                  </div>
                </div>
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </div>

              <div className="space-y-5 p-5 sm:p-7">
                <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-muted p-4 text-sm leading-6">
                  Hey AluuAI! How can I learn something new today?
                </div>

                <div className="ml-auto max-w-[95%] rounded-2xl rounded-tr-sm bg-primary p-4 text-sm leading-6 text-primary-foreground">
                  Hey! 👋 Tell me what you're curious about. We can learn a
                  concept, write code, plan a project, or brainstorm something
                  amazing together.
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {[
                    "Explain a difficult topic",
                    "Help me write code",
                    "Brainstorm project ideas",
                    "Improve my writing",
                  ].map((suggestion) => (
                    <div
                      key={suggestion}
                      className="rounded-xl border border-border px-3 py-3 text-xs text-muted-foreground"
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm text-muted-foreground">
                  <span>Imagine what you can create...</span>
                  <Sparkles size={17} className="text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
              What you can do
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
              One assistant. More possibilities.
            </h2>
            <p className="mt-5 leading-7 text-muted-foreground">
              From your first question to your next big project, AluuAI is
              here to help you move forward.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="group rounded-2xl border border-border bg-card p-7 transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon size={23} />
                  </div>
                  <h3 className="mt-6 text-xl font-bold">{feature.title}</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* About / CTA */}
      <section id="about" className="px-5 py-20 sm:px-8 sm:py-24">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-primary/20 bg-primary/5 px-6 py-12 text-center sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-72 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />

          <div className="relative">
            <Sparkles size={30} className="mx-auto text-primary" />
            <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-5xl">
              Your next idea starts here.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl leading-7 text-muted-foreground">
              Learn, build, and explore with an AI assistant designed to help
              you think through your next challenge.
            </p>
            <button
              onClick={() => navigate("/try")}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Get Started <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-7 text-sm text-muted-foreground sm:flex-row sm:px-8">
          <p className="font-semibold text-foreground">
            ✨ AluuAI
          </p>
          <p>Built to help you think, learn, and create.</p>
        </div>
      </footer>
    </main>
  );
}