import { useState } from "react";
import { Combobox } from "@headlessui/react";

const TestCombobox = () => {
    // State to manage the selected items (array)
    const [selectedOptions, setSelectedOptions] = useState([]);
    // State to manage the input field value
    const [query, setQuery] = useState("");
    // State to track if the options dropdown is open
    const [open, setOpen] = useState(false);

    // Example options
    const options = ["Apple", "Banana", "Cherry", "Date", "Elderberry"];

    // Filter options based on query
    const filteredOptions = query === ""
        ? options
        : options.filter((option) =>
            option.toLowerCase().includes(query.toLowerCase())
        );

    // Function to handle the selection of an option
    const toggleOption = (option) => {
        setSelectedOptions((prev) => {
            // Check if the option is already selected
            if (prev.includes(option)) {
                // Remove it from the selection if already selected
                return prev.filter((item) => item !== option);
            } else {
                // Add it to the selection if not already selected
                return [...prev, option];
            }
        });
        // Clear the query after selection
        setQuery("");
    };

    // Remove an option from selected options
    const removeOption = (option, e) => {
        e.stopPropagation();
        setSelectedOptions((prev) => prev.filter((item) => item !== option));
    };

    return (
        <div className="max-w-sm mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-center">Select Fruits</h2>

            {/* Combobox Component */}
            <Combobox
                value={selectedOptions}
                onChange={(newSelection) => {
                    // This is called when keyboard navigation + Enter is used
                    // We need to handle this differently than mouse clicks
                    const option = newSelection[newSelection.length - 1];
                    if (option && typeof option === 'string') {
                        toggleOption(option);
                    }
                }}
                multiple
            >
                <div className="relative">
                    <div className="w-full p-2 border rounded-md bg-white text-gray-700 flex flex-wrap gap-2" onClick={() => setOpen(true)}>
                        {selectedOptions.length === 0 ? (
                            <span className="text-gray-500">Select fruits</span>
                        ) : (
                            selectedOptions.map((option) => (
                                <span
                                    key={option}
                                    className="bg-blue-500 text-white px-2 py-1 rounded-md text-sm flex items-center"
                                >
                                    {option}
                                    <button
                                        type="button"
                                        onClick={(e) => removeOption(option, e)}
                                        className="ml-2 text-white hover:text-red-500"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))
                        )}

                        <Combobox.Input
                            className="flex-grow outline-none border-none p-1"
                            displayValue={() => ""}
                            onChange={(event) => setQuery(event.target.value)}
                            onClick={() => setOpen(true)}
                            onFocus={() => setOpen(true)}
                        />
                    </div>

                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2" onClick={() => setOpen(!open)}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" transform="rotate(45 10 10)" />
                        </svg>
                    </Combobox.Button>

                    {open && (
                        <Combobox.Options static className="absolute mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-auto">
                            {filteredOptions.length === 0 && query !== "" ? (
                                <div className="py-2 px-4 text-gray-500">No fruits found.</div>
                            ) : (
                                filteredOptions.map((option) => (
                                    <Combobox.Option
                                        key={option}
                                        value={option}
                                        className={({ active }) =>
                                            `p-2 cursor-pointer ${active ? "bg-blue-200" : ""} ${
                                                selectedOptions.includes(option) ? "font-bold bg-blue-100" : ""
                                            }`
                                        }
                                    >
                                        {({ active, selected }) => (
                                            <div onClick={() => toggleOption(option)}>
                                                {option}
                                            </div>
                                        )}
                                    </Combobox.Option>
                                ))
                            )}
                        </Combobox.Options>
                    )}
                </div>
            </Combobox>

            {/* Display selected options */}
            {selectedOptions.length > 0 && (
                <div className="mt-4 text-center text-lg">
                    You selected:{" "}
                    <strong>{selectedOptions.join(", ")}</strong>
                </div>
            )}
        </div>
    );
};

export default TestCombobox;