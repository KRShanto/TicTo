import React, { useEffect } from "react";
import { useConfirmStore } from "../stores/confirm";
import { usePopupStore } from "../stores/popup";

export default function Confirm() {
  const text = useConfirmStore((state) => state.text);
  const onConfirm = useConfirmStore((state) => state.onConfirm);
  const closeConfirm = useConfirmStore((state) => state.closePopup);
  const onCancel = useConfirmStore((state) => state.onCancel);
  const closePopup = usePopupStore((state) => state.closePopup);

  useEffect(() => {
    closePopup();
  }, []);

  return (
    <div id="confirm-popup">
      <p className="text">{text}</p>

      <div className="options">
        <button
          className="btn red"
          onClick={() => {
            onCancel();
            closeConfirm();
          }}
        >
          Cancel
        </button>

        <button
          className="btn green"
          onClick={() => {
            onConfirm();
            closeConfirm();
          }}
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
