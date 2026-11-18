"use client";

import { useEffect, useRef } from "react";
import type { AuctionLotItem } from "./types";

export interface BidModalProps {
  lot: AuctionLotItem | null;
  onClose: () => void;
}

export function BidModal({ lot, onClose }: BidModalProps) {
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (!lot) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lot, onClose]);

  useEffect(() => {
    if (lot) {
      if (!wasOpenRef.current) {
        previousFocusRef.current =
          document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
        wasOpenRef.current = true;
      }
      cancelRef.current?.focus({ preventScroll: true });
      return;
    }

    if (wasOpenRef.current) {
      wasOpenRef.current = false;
      previousFocusRef.current?.focus({ preventScroll: true });
      previousFocusRef.current = null;
    }
  }, [lot]);

  return (
    <div className="enigma-bid-modal" hidden={!lot}>
      <div className="enigma-bid-modal__backdrop" onClick={onClose} />
      <div
        className="enigma-bid-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bid-modal-title"
      >
        <p className="enigma-bid-modal__eyebrow">
          Confirm bid <span aria-hidden="true">·</span>{" "}
          <span className="js-modal-lot">Lot #{lot ? lot.id : ""}</span>
        </p>
        <p id="bid-modal-title" className="enigma-bid-modal__title">
          Log in to bid
        </p>
        <p className="enigma-bid-modal__terms">
          Bidding needs an account so we can hold your seat and charge the card on
          file if you win.
        </p>
        <div className="enigma-bid-modal__actions">
          <button
            ref={cancelRef}
            type="button"
            className="enigma-bid-modal__cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <a className="enigma-bid-modal__confirm" href="/my-account/">
            Log in
          </a>
        </div>
      </div>
    </div>
  );
}

export default BidModal;
