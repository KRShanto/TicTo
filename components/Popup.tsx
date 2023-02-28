import { useEffect } from "react";
import { usePopupStore } from "../stores/popup";
import { useConfirmStore } from "../stores/confirm";

export default function Popup() {
  const text = usePopupStore((state) => state.text);
  const closePopup = usePopupStore((state) => state.closePopup);
  const closeConfirm = useConfirmStore((state) => state.closePopup);
  const onOk = usePopupStore((state) => state.onOk);

  useEffect(() => {
    closeConfirm();
  }, []);

  return (
    <div id="popup">
      <p className="text">{text}</p>
      <button
        className="btn green"
        onClick={() => {
          onOk();
          closePopup();
        }}
      >
        Ok
      </button>
    </div>
  );
}
