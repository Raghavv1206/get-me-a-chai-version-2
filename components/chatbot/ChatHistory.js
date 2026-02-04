// components/chatbot/ChatHistory.js
"use client"

const STORAGE_KEY = 'chatbot_history';

export const ChatHistory = {
    // Save messages to session storage
    save: (messages) => {
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    },

    // Load messages from session storage
    load: () => {
        try {
            const stored = sessionStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('Error loading chat history:', error);
            return null;
        }
    },

    // Clear chat history
    clear: () => {
        try {
            sessionStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error('Error clearing chat history:', error);
        }
    },

    // Check if history exists
    exists: () => {
        try {
            return sessionStorage.getItem(STORAGE_KEY) !== null;
        } catch (error) {
            return false;
        }
    }
};
