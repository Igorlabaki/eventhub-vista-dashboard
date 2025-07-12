import { Link } from "react-router-dom";

export default function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center flex-1">
      <h1 className="text-2xl font-bold">Acesso negado</h1>
      <Link
        to="/"
        className="text-sm text-blue-500 textligth mt-3
    "
      >
        Voltar para o inicio
      </Link>
    </div>
  );
}
