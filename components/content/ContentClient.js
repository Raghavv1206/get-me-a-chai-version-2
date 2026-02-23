'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CreateUpdateForm from './CreateUpdateForm';
import UpdatesList from './UpdatesList';
import { createUpdate, updateUpdate, deleteUpdate } from '@/actions/contentActions';
import { toast } from '@/lib/apiToast';

export default function ContentClient({ campaigns, updates }) {
    const router = useRouter();
    const [editingUpdate, setEditingUpdate] = useState(null);
    const [formKey, setFormKey] = useState(0);

    const handleSave = async (data) => {
        let result;
        if (editingUpdate) {
            result = await updateUpdate(editingUpdate._id, data);
        } else {
            result = await createUpdate(data);
        }

        if (result.success) {
            setEditingUpdate(null);
            setFormKey(prev => prev + 1); // Force form reset
            router.refresh();
        } else {
            toast.error(result.error || 'Failed to save');
        }

        return result;
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this update?')) {
            const result = await deleteUpdate(id);
            if (result.success) {
                router.refresh();
            } else {
                toast.error(result.error);
            }
        }
    };

    const handleEdit = (update) => {
        // Flatten campaign object to ID for the form
        const formatted = {
            ...update,
            campaign: update.campaign?._id || update.campaign
        };
        setEditingUpdate(formatted);
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="space-y-6">
            <div>
                <CreateUpdateForm
                    campaigns={campaigns}
                    initialData={editingUpdate}
                    onSave={handleSave}
                    key={editingUpdate ? editingUpdate._id : `new-${formKey}`}
                />
                {editingUpdate && (
                    <button
                        onClick={() => setEditingUpdate(null)}
                        className="mt-4 text-sm text-gray-400 hover:text-white underline"
                    >
                        Cancel Editing
                    </button>
                )}
            </div>

            <div>
                <UpdatesList
                    updates={updates}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>
        </div>
    );
}
