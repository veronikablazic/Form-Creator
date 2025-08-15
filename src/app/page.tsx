import prisma from '@/lib/prisma';

import type { Form } from '../generated/prisma';

export default async function Home() {
  const form: Form | null = await prisma.form.findFirst({
    where: { id: '1' },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-4xl font-bold mb-8">Latest Posts</h1>
      <div className="w-full max-w-2xl">
        <div key={form?.id} className="p-4 mb-4 border rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold">{form?.title}</h2>
        </div>
      </div>
    </main>
  );
}