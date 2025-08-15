'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles, Plus, X } from 'lucide-react';

type Section = {
  id: string;
  fields: Field[];
  sortIndex: number;
  title: string;
  created_at: string;
};

type FieldType = 'text' | 'email';

type Field = {
    id: string,
    type: FieldType,
    title: string
}

const MAX_NUMBER_OF_SECTIONS = 2;
const MAX_NUMBER_OF_FIELDS = 3;

const CreateForm = () => {
    const [formTitle, setFormTitle] = useState('Enter New Form Title');
    const [form, setForm] = useState<Section[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newSectionTitle, setNewSectionTitle] = useState('');
    const [newSectionFields, setNewSectionFields] = useState<{ id: string; title: string; type: FieldType }[]>([{ id: 'field1', title: '', type: 'text' }]);
    const [isGenerating, setIsGenerating] = useState(false);

    const router = useRouter();

    const setSectionTitle = ({ sectionId, value }: { sectionId: string; value: string }) => {
        setForm((currentForm) => 
            currentForm.map((section) => 
                section.id === sectionId ? { ...section, title: value } : section
            )
        );
    };

    const handleOpenModal = () => {
        setNewSectionTitle('');
        setNewSectionFields([{ id: `field-${Date.now()}`, title: '', type: 'text' }]);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleAddField = () => {
        if (newSectionFields.length < MAX_NUMBER_OF_FIELDS) {
            setNewSectionFields([...newSectionFields, { id: `field-${Date.now()}`, title: '', type: 'text' }]);
        }
    };

    const handleFieldTitleChange = (index: number, title: string) => {
        const updatedFields = [...newSectionFields];
        updatedFields[index].title = title;
        setNewSectionFields(updatedFields);
    };

    const handleFieldTypeChange = (index: number, type: FieldType) => {
        const updatedFields = [...newSectionFields];
        updatedFields[index].type = type;
        setNewSectionFields(updatedFields);
    };

    const handleAddSection = () => {
        const newSection: Section = {
            id: `section-${Date.now()}`,
            sortIndex: form.length + 1,
            title: newSectionTitle || 'Untitled Section',
            fields: newSectionFields.filter(field => field.title.trim() !== ''),
            created_at: new Date().toISOString(),
        };
        setForm([...form, newSection]);
        handleCloseModal();
    };

    const handleRemoveSection = (sectionId: string) => {
        setForm((currentForm) => 
            currentForm.filter((section) => section.id !== sectionId)
        );
    };

    const handleSaveForm = async () => {
        const payload = {
            formTitle: formTitle,
            sections: form.map(section => ({
                title: section.title,
                sortIndex: section.sortIndex,
                fields: section.fields.map(field => ({
                    title: field.title,
                    type: field.type,
                })),
            })),
        };

        try {
            const response = await fetch('/api/forms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save the form.');
            }

            const result = await response.json();
            console.log('Form saved successfully:', result);
            router.push('/dashboard');
        } catch (error) {
            console.error(error);
        }
    };

    const handleGenerateFields = async () => {
        setIsGenerating(true);
        try {
            const response = await fetch('/api/forms/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ formTitle }),
            });
            if (!response.ok) throw new Error('Failed to generate fields.');
            
            const data = await response.json();
            console.log({ data });
            const generatedFields = data.fields.slice(0, MAX_NUMBER_OF_FIELDS).map((title: string) => ({
                id: `field-${Date.now()}-${Math.random()}`,
                title,
                type: 'text' as FieldType,
            }));
            setNewSectionFields(generatedFields);
            setNewSectionTitle(data.sectionTitle);
        } catch (error) {
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-900 min-h-screen">
            <div className="max-w-3xl mx-auto">
                <div className="mb-10">
                    <input 
                        type="text" 
                        value={formTitle} 
                        onChange={(e) => setFormTitle(e.target.value)} 
                        className="text-3xl font-bold text-center block w-full rounded-md border-0 py-2.5 px-3.5 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-3xl sm:leading-9 transition-all duration-150" 
                        placeholder="Form Title"
                    />
                </div>
                <div>
                    { form.length > 0 && (
                        form.map((section) => (
                            <div key={section.id} className="mb-8 p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md bg-white dark:bg-gray-800">
                                <div className="flex items-center justify-between mb-6">
                                    <input 
                                        type="text" 
                                        value={section.title} 
                                        onChange={(e) => setSectionTitle({ sectionId: section.id, value: e.target.value })} 
                                        className="flex-grow block w-full rounded-md border-0 py-2.5 px-3.5 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-lg font-semibold sm:leading-6 transition-all duration-150" 
                                        placeholder="Section Title"
                                    />
                                    <button 
                                        onClick={() => handleRemoveSection(section.id)} 
                                        className="ml-4 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-150"
                                        aria-label="Remove section"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    { section.fields.map((field) => (
                                        <div key={field.id}>
                                            <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">{field.title || 'Untitled Field'}</label>
                                            <div className="mt-2">
                                                <input type={field.type} name={field.id} id={field.id} placeholder={field.type === 'email' ? 'john.doe@example.com' : 'User input goes here'} className="block w-full rounded-md border-0 py-2.5 px-3.5 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all duration-150" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                    { form.length < MAX_NUMBER_OF_SECTIONS &&
                        <div className="mt-10">
                            <button onClick={handleOpenModal} type="button" className="block w-full rounded-md bg-indigo-600 px-3.5 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all duration-150">
                                Add Section
                            </button>
                        </div>
                    }
                </div>
                <div className="mt-12 flex justify-end">
                    <button
                        onClick={handleSaveForm}
                        type="button"
                        className="rounded-md bg-green-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 transition-colors"
                    >
                        Save Form
                    </button>
                </div>
                {isModalOpen && (
                    <div className="fixed inset-0 bg-gray-800/75 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Create a New Section</h2>
                                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                    <X size={24} />
                                </button>
                            </div>
                            <div>
                                <label htmlFor="sectionTitle" className="text-sm font-medium text-gray-700 dark:text-gray-300">Section Title</label>
                                <input id="sectionTitle" type="text" value={newSectionTitle} onChange={(e) => setNewSectionTitle(e.target.value)} placeholder="e.g., Contact Information" className="mt-1 block w-full rounded-md border-0 py-2.5 px-3.5 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Fields</label>
                                {newSectionFields.map((field, index) => (
                                    <div key={field.id} className="flex items-center space-x-2">
                                        <input type="text" value={field.title} onChange={(e) => handleFieldTitleChange(index, e.target.value)} placeholder={`Field ${index + 1} Title`} className="flex-grow block w-full rounded-md border-0 py-2.5 px-3.5 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600" />
                                        <select value={field.type} onChange={(e) => handleFieldTypeChange(index, e.target.value as FieldType)} className="rounded-md border-0 py-2.5 px-3.5 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600">
                                            <option value="text">Text</option>
                                            <option value="email">Email</option>
                                        </select>
                                    </div>
                                ))}
                                {newSectionFields.length < MAX_NUMBER_OF_FIELDS && (
                                    <button onClick={handleAddField} className="w-full text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 py-2 rounded-md bg-indigo-50 dark:bg-indigo-900/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 transition-colors">
                                        <Plus className="inline mr-1 h-4 w-4" />
                                        Add Another Field
                                    </button>
                                )}
                            </div>
                            <div className="flex justify-end space-x-3 pt-2">
                                <div className="relative group inline-block">
                                    <button 
                                        onClick={handleGenerateFields}
                                        disabled={isGenerating || !formTitle.trim()} 
                                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 rounded-md transition-colors disabled:bg-sky-300 disabled:cursor-not-allowed"
                                    >
                                        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                                        Generate with AI
                                    </button>
                                    {!newSectionTitle.trim() && (
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max invisible group-hover:visible bg-gray-800 text-white text-xs font-semibold rounded-md py-1 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            Please enter a form title first.
                                        </div>
                                    )}
                                </div>
                                <button onClick={handleAddSection} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md">
                                    Create Section
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CreateForm;
