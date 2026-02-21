import { toast } from 'react-toastify';

/**
 * Wraps an async API call with loading/success/error toasts.
 * 
 * @param {Function} asyncFn - The async function to execute (should return a response)
 * @param {Object} options - Toast messages
 * @param {string} options.loading - Loading message (default: 'Please wait...')
 * @param {string} options.success - Success message (default: 'Done!')
 * @param {string} options.error - Error message (default: 'Something went wrong')
 * @returns {Promise<any>} - The result of the async function
 * 
 * Usage:
 *   const result = await apiToast(
 *     () => fetch('/api/something', { method: 'POST' }),
 *     { loading: 'Saving...', success: 'Saved!', error: 'Failed to save' }
 *   );
 */
export async function apiToast(asyncFn, options = {}) {
    const {
        loading = 'Please wait...',
        success = 'Done!',
        error = 'Something went wrong',
    } = options;

    const toastId = toast.loading(loading);

    try {
        const result = await asyncFn();

        // If it's a fetch response, check if it's ok
        if (result && typeof result.ok !== 'undefined') {
            if (!result.ok) {
                let errorMsg = error;
                try {
                    const data = await result.clone().json();
                    errorMsg = data.message || data.error || error;
                } catch (e) {
                    // ignore parse errors
                }
                toast.update(toastId, {
                    render: errorMsg,
                    type: 'error',
                    isLoading: false,
                    autoClose: 4000,
                    closeOnClick: true,
                });
                return result;
            }
        }

        toast.update(toastId, {
            render: success,
            type: 'success',
            isLoading: false,
            autoClose: 2500,
            closeOnClick: true,
        });

        return result;
    } catch (err) {
        toast.update(toastId, {
            render: err.message || error,
            type: 'error',
            isLoading: false,
            autoClose: 4000,
            closeOnClick: true,
        });
        throw err;
    }
}

export { toast };
