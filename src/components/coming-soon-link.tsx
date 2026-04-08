"use client";

import { ReactNode, useCallback } from "react";

interface ComingSoonLinkProps {
  children: ReactNode;
  className?: string;
}

export function ComingSoonLink({ children, className }: ComingSoonLinkProps) {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    // Create a floating toast
    const toast = document.createElement("div");
    toast.textContent = "敬请期待";
    toast.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.8);
      background: rgba(0, 232, 184, 0.15);
      color: #00e8b8;
      border: 1px solid rgba(0, 232, 184, 0.3);
      padding: 12px 32px;
      border-radius: 9999px;
      font-size: 16px;
      font-weight: 500;
      z-index: 99999;
      pointer-events: none;
      opacity: 0;
      backdrop-filter: blur(8px);
      transition: all 0.3s ease;
    `;
    document.body.appendChild(toast);
    
    // Animate in
    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translate(-50%, -50%) scale(1)";
    });
    
    // Animate out and remove
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translate(-50%, -60%) scale(0.9)";
      setTimeout(() => toast.remove(), 300);
    }, 1500);
  }, []);

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
