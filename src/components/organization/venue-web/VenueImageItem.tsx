import { UseFormRegisterReturn } from 'react-hook-form';

export function VenueImageItem({ img, inputProps, error }: {
  img: import('@/types/image').Image;
  inputProps: UseFormRegisterReturn;
  error?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <div className="relative w-full h-64">
        <img 
          src={img.imageUrl} 
          alt={`Imagem da venue - ${img.id}`} 
          className="w-full h-64 object-cover rounded border" 
        />
        <input
          type="checkbox"
          {...inputProps}
          className={`absolute top-2 right-2 w-5 h-5 rounded bg-white shadow-md border-2 border-gray-300 focus:ring-2 focus:ring-green-600 z-10 cursor-pointer ${error ? 'border-red-500' : ''}`}
          style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
          aria-label={`Selecionar imagem ${img.id}`}
        />
      </div>
    </div>
  );
} 