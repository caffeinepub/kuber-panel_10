import { ExternalLink, MessageCircle } from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function HelpSupport() {
  const { supportLink } = useApp();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold gold-text">Help &amp; Support</h2>

      <div className="max-w-lg">
        <div className="dark-card rounded-2xl p-8 text-center space-y-5">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto"
            style={{
              background: "oklch(0.5 0.15 220 / 20%)",
              border: "1px solid oklch(0.5 0.15 220 / 30%)",
            }}
          >
            <MessageCircle
              className="w-10 h-10"
              style={{ color: "oklch(0.7 0.2 220)" }}
            />
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">
              Contact Support Team
            </h3>
            <p className="text-gray-500 text-sm mt-2">
              Get instant help from our support team on Telegram. Available 24/7
              for all your queries.
            </p>
          </div>

          <a
            href={supportLink}
            target="_blank"
            rel="noopener noreferrer"
            data-ocid="help_support.button"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-black gold-gradient text-sm"
          >
            <MessageCircle className="w-4 h-4" />
            HELP SUPPORT
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <p className="text-xs text-gray-600">
            Click to open Telegram support group
          </p>
        </div>
      </div>
    </div>
  );
}
