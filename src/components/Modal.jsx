import React, { useEffect } from "react";
import { FaTimes } from "react-icons/fa";

/**
 * Reusable Modal component — properly centered, scrollable, never off-screen.
 * Replace all inline modal divs in your pages with this component.
 *
 * Usage:
 *   <Modal title="Add Passenger" onClose={() => setShowModal(false)}>
 *     <form>...</form>
 *   </Modal>
 */
export default function Modal({ title, onClose, children, maxWidth = "560px", danger = false }) {
    // Lock body scroll while modal is open
    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = prev; };
    }, []);

    // Close on Escape key
    useEffect(() => {
        const handler = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(4px)",
                zIndex: 1000,
                display: "flex",
                alignItems: "flex-start",       // top-aligned so tall forms aren't cut
                justifyContent: "center",
                padding: "40px 16px 40px 16px", // top padding keeps it off the very edge
                overflowY: "auto"               // overlay itself scrolls if content is very tall
            }}
        >
            <div
                onClick={e => e.stopPropagation()} // prevent close on inner click
                className="animate-fade-in"
                style={{
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "16px",
                    width: "100%",
                    maxWidth,
                    boxShadow: "var(--shadow-lg)",
                    display: "flex",
                    flexDirection: "column",
                    maxHeight: "calc(100vh - 80px)", // never taller than the viewport
                    overflow: "hidden"
                }}
            >
                {/* Header */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "20px 24px",
                    borderBottom: "1px solid var(--border-color)",
                    flexShrink: 0
                }}>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: danger ? "var(--status-cancelled)" : "var(--text-primary)" }}>
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: "var(--text-secondary)", fontSize: "1rem", padding: "4px",
                            borderRadius: "6px", display: "flex", alignItems: "center"
                        }}
                        onMouseOver={e => e.currentTarget.style.backgroundColor = "var(--border-color)"}
                        onMouseOut={e => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Scrollable body */}
                <div style={{
                    padding: "24px",
                    overflowY: "auto",
                    flex: 1
                }}>
                    {children}
                </div>
            </div>
        </div>
    );
}

/**
 * Convenience: a styled submit row for the bottom of modal forms
 */
export function ModalActions({ onCancel, submitLabel = "Save", danger = false }) {
    return (
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--border-color)" }}>
            <button
                type="button"
                onClick={onCancel}
                style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-input)", color: "var(--text-primary)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
            >
                Cancel
            </button>
            <button
                type="submit"
                style={{
                    padding: "10px 20px", borderRadius: "8px", border: "none", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer",
                    backgroundColor: danger ? "var(--status-cancelled)" : "var(--primary)",
                    color: "white",
                    boxShadow: danger ? "0 4px 12px rgba(239,68,68,0.25)" : "0 4px 12px var(--primary-glow)"
                }}
            >
                {submitLabel}
            </button>
        </div>
    );
}
