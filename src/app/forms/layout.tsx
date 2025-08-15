import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const defaultLayout = ({ children }: {
  children: React.ReactNode;
}) => {
    return (
        <section className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center py-12">
            <div className="container mx-auto max-w-3xl px-4 w-full">
                <div className="mb-6">
                    <Link href="/dashboard" className="inline-flex items-center text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
                    {children}
                </div>
            </div>
        </section>
    );
};

export default defaultLayout;
