import { useState, useEffect } from "react";
import axios from "axios";
import FormItem from "../../components/form/FormItem.jsx";
import Input from "../../components/form/Input.jsx";
import FormMessage from "../../components/form/FormMessage.jsx";
import FormControl from "../../components/form/FormControl.jsx";
import FormLabel from "../../components/form/FormLabel.jsx";

const Timetable = () => {

    // In your Timetable component (React)

    const handleGenerateTimetables = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                "http://localhost:8000/api/generate-s1-timetables", // New endpoint
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            // alert(response.data.message);
            console.log(response.data.data)// Success message from backend
            // console.log(response.data.subjects)// Success message from backend
        } catch (error) {
            console.error("Error generating timetables:", error);
            alert("An error occurred while generating the timetables.");
        }
    };

    return (
        <div>
            <button
                onClick={handleGenerateTimetables}
                className="bg-blue-600 text-white p-2 rounded-md"
            >
                Generate S1 Timetables
            </button>
        </div>
    );

};

export default Timetable;
