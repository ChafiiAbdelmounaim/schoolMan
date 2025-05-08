import { useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const Timetable = () => {
    const navigate = useNavigate();
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationType, setGenerationType] = useState(null);

    const handleGenerateTimetables = async (type) => {
        setIsGenerating(true);
        setGenerationType(type);

        try {
            const token = localStorage.getItem("token");
            const endpoint = type === 'firstHalf'
                ? "/api/generate-s1-timetables"
                : "/api/generate-s2-timetables";

            const response = await axios.post(
                `http://localhost:8000${endpoint}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            navigate('/emploi', {
                state: {
                    generatedData: response.data,
                    generationType: type
                }
            });
        } catch (error) {
            console.error("Error generating timetables:", error);
            alert(error.response?.data?.message || "Generation failed");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-6">Generate Timetables</h1>

                <div className="space-y-4">
                    <button
                        onClick={() => handleGenerateTimetables('firstHalf')}
                        disabled={isGenerating}
                        className={`w-full py-3 px-4 rounded-md font-medium
                            ${isGenerating ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} 
                            text-white transition-colors`}
                    >
                        {isGenerating && generationType === 'firstHalf'
                            ? 'Generating First Half...'
                            : 'Generate First Half (S1, S3)'}
                    </button>

                    <button
                        onClick={() => handleGenerateTimetables('secondHalf')}
                        disabled={isGenerating}
                        className={`w-full py-3 px-4 rounded-md font-medium
                            ${isGenerating ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} 
                            text-white transition-colors`}
                    >
                        {isGenerating && generationType === 'secondHalf'
                            ? 'Generating Second Half...'
                            : 'Generate Second Half (S2, S4)'}
                    </button>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 rounded-md border border-yellow-200">
                    <p className="text-yellow-700 text-sm">
                        Note: This will automatically clear existing timetables before generation.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Timetable;