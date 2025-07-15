import { Calendar, AlertTriangle } from "lucide-react";

export function AppLoadingScreen() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-100">
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="h-14 w-14 text-eventhub-primary animate-pulse" />
          <span className="font-bold text-4xl text-eventhub-primary tracking-wide select-none">EventHub</span>
        </div>
        <div className="flex items-center justify-center mb-4">
          <span className="relative flex h-10 w-10">
            <span className="animate-spin absolute inline-flex h-full w-full rounded-full border-4 border-indigo-300 border-t-eventhub-primary opacity-80"></span>
            <span className="relative inline-flex rounded-full h-10 w-10 bg-indigo-100 opacity-0"></span>
          </span>
        </div>
      </div>
    </div>
  );
}

export function AppErrorScreen({ message }: { message?: string }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-red-100">
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="h-14 w-14 text-red-500 animate-pulse" />
          <span className="font-bold text-4xl text-red-600 tracking-wide select-none">Erro</span>
        </div>
        <div className="flex flex-col items-center justify-center mb-4">
          <span className="text-lg text-red-700 font-medium text-center max-w-md">
            {message || "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde."}
          </span>
        </div>
      </div>
    </div>
  );
} 