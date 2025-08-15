'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, Send, CheckCircle } from 'lucide-react';

type Field = {
  id: string;
  title: string;
  type: string;
};

type Section = {
  id: string;
  title: string;
  fields: Field[];
};

type Form = {
  id: string;
  title: string;
  sections: Section[];
};

const ViewFormPage = () => {
  const params = useParams();
  const formId = params.formId as string;
  
  const [form, setForm] = useState<Form | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!formId) return;
    const fetchForm = async () => {
      try {
        const response = await fetch(`/api/forms/${formId}`);
        if (!response.ok) throw new Error('Failed to fetch form data.');
        const data = await response.json();
        setForm(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchForm();
  }, [formId]);

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId, answers: formData }),
      });
      if (!response.ok) throw new Error('Submission failed.');
      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 min-h-screen mt-10">{error}</div>;
  }

  if (isSubmitted) {
    return (
        <div className="flex flex-col justify-center items-center text-center py-24">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Thank You!</h2>
            <p className="text-gray-600 mt-2">Your response has been submitted successfully.</p>
        </div>
    );
  }

  if (!form) {
    return <div className="text-center text-gray-500 min-h-screen mt-10">Form not found.</div>;
  }

  return (
    <div>
        <h1 className="text-3xl font-bold text-gray-900 border-b pb-4 mb-8">
            {form.title}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-10">
            {form.sections.map((section) => (
            <div key={section.id} className="p-6 border border-gray-200 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">{section.title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {section.fields.map((field) => (
                    <div key={field.id}>
                    <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
                        {field.title}
                    </label>
                    <div className="mt-2">
                        <input
                        type={field.type}
                        name={field.id}
                        id={field.id}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        placeholder={`Enter ${field.title.toLowerCase()}`}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                        />
                    </div>
                    </div>
                ))}
                </div>
            </div>
            ))}
            <div className="flex justify-end pt-4">
            <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
            >
                {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                <>
                    <Send className="mr-2 h-5 w-5" />
                    Submit
                </>
                )}
            </button>
            </div>
        </form>
    </div>
  );
};

export default ViewFormPage;
