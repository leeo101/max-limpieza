'use client';

import { Suspense } from 'react';
import OrderConfirmedContent from './OrderConfirmedContent';

export default function OrderConfirmedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
        </div>
      </div>
    }>
      <OrderConfirmedContent />
    </Suspense>
  );
}
