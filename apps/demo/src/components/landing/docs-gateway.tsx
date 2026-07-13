"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

export function DocsGateway() {
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (isWaitlistOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isWaitlistOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isWaitlistOpen) {
        setIsWaitlistOpen(false);
        setTimeout(() => {
          setIsSubmitted(false);
          setEmail("");
        }, 300);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isWaitlistOpen]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.1 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 900);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const BAR_COUNT = 220;
  // Jagged, peaky math formula to resemble the reference screenshot
  const barHeights = Array.from({ length: BAR_COUNT }).map((_, i) => {
    const progress = i / BAR_COUNT;

    // Base upward slope
    const base = 8 + progress * 40;

    // Jagged wave fluctuations (combining multiple frequencies)
    const w1 = Math.sin(progress * Math.PI * 6.5) * 16;  // medium frequency
    const w2 = Math.cos(progress * Math.PI * 18.2) * 12; // high frequency (creates jagged peaks)
    const w3 = Math.sin(progress * Math.PI * 34.5) * 6;  // very high frequency (micro peaks)

    // Custom sharp spikes/peaks in specific regions
    let spike = 0;
    if (progress > 0.12 && progress < 0.18) {
      spike = (1 - Math.abs((progress - 0.15) / 0.03)) * 28;
    } else if (progress > 0.42 && progress < 0.52) {
      spike = (1 - Math.abs((progress - 0.47) / 0.05)) * 32;
    } else if (progress > 0.78 && progress < 0.88) {
      spike = (1 - Math.abs((progress - 0.83) / 0.05)) * 42;
    } else if (progress > 0.88) {
      spike = (1 - Math.abs((progress - 1.0) / 0.12)) * 12;
    }

    const val = base + w1 + w2 + w3 + spike;

    // Minimum height to cover the space below the white card
    // On mobile, the card covers the whole width, so we need a high minimum height everywhere.
    // On desktop, the card covers the middle region (approx 0.25 to 0.85).
    let minH = 4;
    if (isMobile) {
      const noise = (w2 * 0.6 + w3 * 0.6);
      minH = Math.max(52, 54 + noise);
    } else {
      if (progress >= 0.2 && progress <= 0.88) {
        let rampBase = 4;
        let noiseScale = 0;
        if (progress < 0.35) {
          const t = (progress - 0.2) / 0.15;
          rampBase = 4 + t * 50; // ramp from 4 to 54
          noiseScale = t;
        } else if (progress > 0.75) {
          const t = (0.88 - progress) / 0.13;
          rampBase = 4 + t * 50; // ramp from 54 to 4
          noiseScale = t;
        } else {
          rampBase = 54;
          noiseScale = 1;
        }
        const noise = (w2 * 0.6 + w3 * 0.6) * noiseScale;
        minH = Math.max(4, rampBase + noise);
      }
    }

    const maxH = progress > 0.75 ? 98 : 92;
    return Math.min(maxH, Math.max(minH, val));
  });

  return (
    <section
      ref={containerRef}
      className={`docs-gateway-section ${inView ? "in-view" : ""}`}
    >
      {/* 1. Animated Graph Bars at bottom */}
      <div className="gateway-graph-wrap" aria-hidden="true">
        {barHeights.map((h, i) => (
          <div
            key={i}
            className="gateway-bar"
            style={{
              // @ts-expect-error: Custom CSS variable keys not typed in standard style prop
              "--h": `${h.toFixed(4)}%`,
              "--delay": `${(i * 0.0035).toFixed(4)}s`,
            }}
          />
        ))}
      </div>

      {/* 2. Concentric Target & Question Mark on Right */}
      <div className="gateway-target-wrap" aria-hidden="true">
        <div className="gateway-target-glow" />
        <div className="gateway-target-ring-1" />
        <div className="gateway-target-ring-2" />
        <div className="gateway-target-ring-3" />
        <div className="gateway-target-center">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Left Bracket */}
            <path d="M 6 7 L 2 12 L 6 17" />
            {/* Forward Slash */}
            <path d="M 14.5 4.5 L 9.5 19.5" />
            {/* Right Bracket */}
            <path d="M 18 7 L 22 12 L 18 17" />
          </svg>
        </div>
        <div className="gateway-target-line" />
      </div>

      {/* 3. Overlay Content Cards */}
      <div className="gateway-content-wrap">
        <div className="gateway-card-main">
          <div className="gateway-card-small">
            Curious?
          </div>

          <div className="gateway-card-header">
            PRIVATE MAINNET BETA
          </div>

          <p className="gateway-card-desc">
            Join the first cohort of traders to experience confidential execution on Solana. Early access is limited while we validate the protocol in production.
          </p>

          {/* Badges / Tech Row */}
          <div className="gateway-tech-row">
            <div className="gateway-tech-item">
              <span className="gateway-tech-label">OPPORTUNITY</span>
              <span className="gateway-tech-val">Become part of the next big thing on SOLANA</span>
            </div>
          </div>

          <div className="gateway-cta">
            <button
              className="btn gateway-btn"
              onClick={() => setIsWaitlistOpen(true)}
              type="button"
            >
              JOIN WAITLIST
            </button>
          </div>
        </div>
      </div>

      {/* Waitlist Modal Overlay */}
      <div
        className={`waitlist-overlay ${isWaitlistOpen ? "open" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setIsWaitlistOpen(false);
            setTimeout(() => {
              setIsSubmitted(false);
              setEmail("");
            }, 300);
          }
        }}
      >
        <div className="waitlist-modal" role="dialog" aria-modal="true" aria-labelledby="waitlist-title">
          <button
            className="waitlist-close-btn"
            onClick={() => {
              setIsWaitlistOpen(false);
              setTimeout(() => {
                setIsSubmitted(false);
                setEmail("");
              }, 300);
            }}
            aria-label="Close modal"
            type="button"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {!isSubmitted ? (
            <>
              <div className="waitlist-kicker">
                Join Waitlist
              </div>
              <h3 id="waitlist-title" className="waitlist-title">
                SECURE PRIVATE BETA ACCESS
              </h3>
              <p className="waitlist-desc">
                Early access is limited. Enter your email to secure your spot for the next trading cohort on Solana.
              </p>
              <form
                className="waitlist-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!email.trim()) return;
                  setIsLoading(true);
                  setSubmitError("");
                  try {
                    const res = await fetch("/api/waitlist", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email }),
                    });
                    if (res.status === 409) {
                      setSubmitError("This email is already on the waitlist.");
                      return;
                    }
                    if (!res.ok) throw new Error("Failed");
                    setIsSubmitted(true);
                  } catch {
                    setSubmitError("Something went wrong. Please try again.");
                  } finally {
                    setIsLoading(false);
                  }
                }}
              >
                <div className="waitlist-input-group">
                  <label htmlFor="waitlist-email" className="waitlist-label">
                    Email Address
                  </label>
                  <input
                    id="waitlist-email"
                    type="email"
                    required
                    placeholder="trader@darknyx.trade"
                    className="waitlist-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {submitError && (
                  <p style={{ color: "var(--rose)", fontSize: 13, margin: 0 }}>{submitError}</p>
                )}
                <button type="submit" className="waitlist-submit-btn" disabled={isLoading}>
                  {isLoading ? "Submitting..." : "Submit Request"}
                </button>
              </form>
            </>
          ) : (
            <div className="waitlist-success">
              <div className="waitlist-success-icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="waitlist-success-title">YOU'RE ON THE LIST</h3>
              <p className="waitlist-success-desc">
                Thank you for your interest. We will email you at <strong>{email}</strong> when a spot becomes available in the next cohort.
              </p>
              <button
                type="button"
                className="waitlist-done-btn"
                onClick={() => {
                  setIsWaitlistOpen(false);
                  setTimeout(() => {
                    setIsSubmitted(false);
                    setEmail("");
                  }, 300);
                }}
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
