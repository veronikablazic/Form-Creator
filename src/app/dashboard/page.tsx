'use client';

import { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/navigation';
import { Plus, FileText, Loader2, LogOut, Trash2, Copy, Check } from 'lucide-react';

type Form = {
  id: string;
  title: string;
  createdAt: string;
};

const DashboardPage: NextPage = () => {
    const router = useRouter();
    const [forms, setForms] = useState<Form[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
    const [formToDelete, setFormToDelete] = useState<string | null>(null);
    const [copiedFormId, setCopiedFormId] = useState<string | null>(null);

    useEffect(() => {
        const fetchForms = async () => {
            try {
                const response = await fetch('/api/forms');
                
                if (!response.ok) {
                    throw new Error('Failed to fetch forms');
                }

                const data: Form[] = await response.json();
                setForms(data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchForms();
    }, []);

    const openDeleteConfirm = (formId: string) => {
        setFormToDelete(formId);
        setShowDeleteConfirm(true);
    };

    const closeDeleteConfirm = () => {
        setFormToDelete(null);
        setShowDeleteConfirm(false);
    };
    
    const handleCopyUrl = (formId: string) => {
        const url = `${window.location.origin}/forms/${formId}`;
        navigator.clipboard.writeText(url);
        setCopiedFormId(formId);
        setTimeout(() => setCopiedFormId(null), 2000); 
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
        } catch (error) {
            console.error('Failed to log out:', error);
        }
    };

    const handleDeleteForm = async () => {
        if (!formToDelete) return;
        try {
            const response = await fetch(`/api/forms/${formToDelete}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete form');
            setForms(forms.filter(form => form.id !== formToDelete));
        } catch (error) {
            console.error(error);
        } finally {
            closeDeleteConfirm();
        }
    };

    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
    });

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <header className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b border-gray-200 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Your Forms Dashboard</h1>
                        <p className="mt-1 text-sm text-gray-600">Create and view your forms here.</p>
                    </div>
                    <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                        <button
                            onClick={() => router.push(`/forms/new`)}
                            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
                        >
                            <Plus className="mr-2 h-5 w-5" />
                            Create New Form
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 border border-gray-300 text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <LogOut className="mr-2 h-5 w-5" />
                            Logout
                        </button>
                    </div>
                </header>
                <main>
                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                                <p className="ml-3 text-gray-500">Loading forms...</p>
                            </div>
                        ) : forms.length > 0 ? (
                            forms.map((form) => (
                                <div
                                    key={form.id}
                                    className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between"
                                >
                                    <div className="flex items-center mb-4 sm:mb-0">
                                        <div className="bg-blue-100 p-3 rounded-full mr-4">
                                            <FileText className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-900">{form.title}</h2>
                                            <p className="text-xs text-gray-500">
                                                Created on {formatDate(form.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                                        <button onClick={() => handleCopyUrl(form.id)} className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors">
                                            {copiedFormId === form.id ? <Check className="h-4 w-4 inline mr-1 text-green-600" /> : <Copy className="h-4 w-4 inline mr-1" />}
                                            {copiedFormId === form.id ? 'Copied!' : 'Copy URL'}
                                        </button>
                                        <button onClick={() => router.push(`/forms/${form.id}`)} className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                                            View Form
                                        </button>
                                        <button onClick={() => openDeleteConfirm(form.id)} className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
                                            <Trash2 className="h-4 w-4 inline mr-1" /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                                <p className="text-gray-500">You have not created any forms yet.</p>
                                <p className="text-sm text-gray-400 mt-1">Click &quot;Create New Form&quot; to get started!</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-gray-600/75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 m-4">
                        <h3 className="text-lg font-bold text-gray-900">Delete Form</h3>
                        <p className="text-sm text-gray-600 mt-2">Are you sure you want to delete this form? This action cannot be undone.</p>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button onClick={closeDeleteConfirm} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">Cancel</button>
                            <button onClick={handleDeleteForm} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
