"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type KebabAction =
  | {
      type: "link";
      label: string;
      href: string;
      danger?: boolean;
      disabled?: boolean;
    }
  | {
      type: "button";
      label: string;
      onClick: () => void;
      danger?: boolean;
      disabled?: boolean;
    };

export default function KebabMenu({
  actions,
  align = "right",
}: {
  actions: KebabAction[];
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // close on outside click / esc
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="rp-kebab" ref={ref}>
      <button
        className="rp-kebab-btn"
        aria-label="Actions"
        onClick={() => setOpen((v) => !v)}
      >
        ⋮
      </button>

      {open && (
        <div
          className={`rp-kebab-menu ${
            align === "left" ? "rp-kebab-menu--left" : ""
          }`}
        >
          {actions.map((a, i) => {
            const cls =
              "rp-kebab-item" +
              (a.danger ? " rp-kebab-danger" : "") +
              (a.disabled ? " rp-kebab-disabled" : "");

            if (a.type === "link") {
              return a.disabled ? (
                <div key={i} className={cls}>
                  {a.label}
                </div>
              ) : (
                <Link
                  key={i}
                  href={a.href}
                  className={cls}
                  onClick={() => setOpen(false)}
                >
                  {a.label}
                </Link>
              );
            }

            return (
              <button
                key={i}
                className={cls}
                disabled={a.disabled}
                onClick={() => {
                  setOpen(false);
                  a.onClick();
                }}
              >
                {a.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
