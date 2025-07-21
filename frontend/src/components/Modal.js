// src/Modal.js
import React from 'react';
import { createPortal } from 'react-dom';

function Modal({ isOpen, onClose, title, children, footer }) {
  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-11/12 max-w-lg relative">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
          <button
            className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        <div className="modal-body mb-4">
          {children}
        </div>
        {footer && <div className="border-t pt-4 text-right">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

export default Modal;