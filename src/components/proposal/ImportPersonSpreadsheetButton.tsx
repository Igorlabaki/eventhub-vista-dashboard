import { useRef } from "react";
import { FiUpload } from "react-icons/fi";
import { publicActionClass } from "./public-list-pattern";

export function ImportPersonSpreadsheetButton({
  disabled,
  busy,
  onFile,
}: {
  disabled?: boolean;
  busy?: boolean;
  onFile: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        className="hidden"
        type="file"
        accept=".csv,.xls,.xlsx,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) onFile(file);
        }}
      />
      <button className={publicActionClass} type="button" disabled={disabled || busy} onClick={() => inputRef.current?.click()}>
        <FiUpload size={16} />
        {busy ? "Lendo planilha" : "Enviar planilha"}
      </button>
    </>
  );
}
