import React from "react";
import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, title, children, customClassName, headerIcon }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content glass-card ${customClassName || ""}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrapper">
            {headerIcon && <div className="modal-header-icon">{headerIcon}</div>}
            <h3 className="modal-title">{title}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
