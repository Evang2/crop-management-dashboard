// src/components/ui/Button.jsx
export function Button({ children, ...props }) {
    return (
        <button
            {...props}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
            {children}
        </button>
    );
}
