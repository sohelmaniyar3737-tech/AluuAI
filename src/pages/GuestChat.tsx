import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Sparkles, UserRound } from "lucide-react";
import { api } from "@/lib/api";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function GuestChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSend() {
    const message = input.trim();

    if (!message || loading) return;

    const previousMessages = messages;
    const updatedMessages: ChatMessage[] = [
      ...previousMessages,
      { role: "user", content: message },
    ];

    setMessages(updatedMessages);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const data = await api<{ reply: string }>("/guest-chat", {
        method: "POST",
        body: JSON.stringify({
          message,
          conversationHistory: previousMessages,
        }),
      });

      setMessages([
        ...updatedMessages,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to contact AluuAI. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-muted"
        >
          <ArrowLeft size={18} />
          Home
        </button>

        <div className="flex items-center gap-2 font-bold">
          <Sparkles className="text-primary" size={21} />
          AluuAI
          <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
            Guest
          </span>
        </div>

        <button
          onClick={() => navigate("/auth")}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Sign In
        </button>
      </header>

      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6">
        <div className="flex-1 space-y-5">
          {messages.length === 0 ? (
            <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles size={32} />
              </div>

              <h1 className="mt-6 text-3xl font-bold">
                Try AluuAI for free
              </h1>

              <p className="mt-3 max-w-md text-muted-foreground">
                Ask a question, learn something new, or get help with your
                next idea. No account needed to try it.
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={`${index}-${message.role}`}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <Sparkles size={18} />
                  </div>
                )}

                <div
                  className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 leading-7 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.content}
                </div>

                {message.role === "user" && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border">
                    <UserRound size={18} />
                  </div>
                )}
              </div>
            ))
          )}

          {loading && (
            <div className="text-sm text-muted-foreground">
              AluuAI is thinking...
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        <form
          className="sticky bottom-0 mt-6 rounded-2xl border border-border bg-card p-3 shadow-lg"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSend();
          }}
        >
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handleSend();
              }
            }}
            placeholder="Message AluuAI..."
            rows={2}
            maxLength={2000}
            className="w-full resize-none bg-transparent p-2 outline-none placeholder:text-muted-foreground"
          />

          <div className="flex items-center justify-between gap-3 px-2 pb-1">
            <p className="text-xs text-muted-foreground">
              Guest messages aren't saved to your account.
            </p>

            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Send message"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}