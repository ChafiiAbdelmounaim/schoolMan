
function Input({ type = "text", placeholder, ...props }) {
    return (
        <input
            type={type}
            placeholder={placeholder}
            className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50"
            {...props} // Ensures extra props (like onChange) work correctly
        />
    );
}

export default Input;
