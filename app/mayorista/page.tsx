import { Suspense } from 'react';
import MayoristaContent from './MayoristaContent';

export const metadata = {
  title: 'Ventas Mayoristas | MAX Limpieza',
  description: 'Adquiere suministros de limpieza a granel, pastas base y concentrados industriales con los mejores precios del mercado.',
};

export default function MayoristaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    }>
      <MayoristaContent />
    </Suspense>
  );
}
