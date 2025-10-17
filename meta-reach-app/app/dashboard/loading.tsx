import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

