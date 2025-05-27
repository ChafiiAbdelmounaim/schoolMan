import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import useAuth from "../../hooks/useAuth.js";

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const timeSlots = [
    { label: '09:00 - 12:00', start: '09:00:00', end: '12:00:00' },
    { label: '14:00 - 17:00', start: '14:00:00', end: '17:00:00' }
];

const TeacherEmploi = () => {
    const { user } = useAuth();
    const [timetables, setTimetables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const printRef = useRef();

    useEffect(() => {
        if (user?.id) {
            axios.get(`http://127.0.0.1:8000/api/teacher/${user.id}/timetable`)
                .then(res => {
                    setTimetables(Array.isArray(res.data) ? res.data : []);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Error loading teacher timetable:", err);
                    setLoading(false);
                });
        }
    }, [user]);

    const getCellContent = (day, slot) => {
        const entry = timetables.find(item =>
            item.day === day &&
            item.start_time === slot.start &&
            item.end_time === slot.end
        );

        if (!entry) {
            return {
                content: <span className="text-gray-400 text-sm">-</span>,
                className: "bg-white"
            };
        }

        return {
            content: (
                <div className="text-sm text-gray-800 leading-5">
                    <div><strong>{entry.course?.name || 'N/A'}</strong></div>
                    <div>{entry.classroom?.name || 'N/A'}</div>
                    <div className="text-xs text-gray-500">
                        {entry.semester?.year.filier.name || 'N/A'} - {entry.semester?.semName || 'N/A'}
                    </div>
                </div>
            ),
            className: "bg-blue-100"
        };
    };

    const handlePrint = () => {
        window.print();
    };

    const generatePDF = async () => {
        setIsGeneratingPDF(true);
        try {
            // Dynamic import to avoid bundling issues
            const jsPDF = (await import('jspdf')).default;
            const html2canvas = (await import('html2canvas')).default;

            const element = printRef.current;
            if (!element) {
                throw new Error('Timetable element not found');
            }

            // Create canvas from the timetable element
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');

            // Create PDF
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 297; // A4 landscape width in mm
            const pageHeight = 210; // A4 landscape height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;

            let position = 0;

            // Add image to PDF
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // Add additional pages if needed
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // Generate filename with timestamp
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `teaching_timetable_${user?.full_name?.replace(/\s+/g, '_') || 'teacher'}_${timestamp}.pdf`;

            // Save the PDF
            pdf.save(filename);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    if (loading) return <div className="p-4 text-center">⏳ Loading your timetable...</div>;

    return (
        <div className="max-w-4xl mx-auto mt-8 p-6 border rounded-md shadow-md">
            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mb-6 print:hidden">
                <button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print
                </button>
                <button
                    onClick={generatePDF}
                    disabled={isGeneratingPDF}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center gap-2"
                >
                    {isGeneratingPDF ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Generating...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download PDF
                        </>
                    )}
                </button>
            </div>

            {/* Timetable Content */}
            <div ref={printRef} className="print-content">
                <h2 className="text-2xl font-bold text-center mb-6">Your Teaching Timetable</h2>
                <p className="text-center text-gray-600 mb-6">
                    {user?.full_name} | {user?.email}
                </p>

                <div className="overflow-x-auto">
                    <table className="table-auto w-full border-collapse border border-gray-300 text-center">
                        <thead className="bg-gray-800 text-white">
                        <tr>
                            <th className="border px-4 py-2">Day</th>
                            {timeSlots.map((slot, i) => (
                                <th key={i} className="border px-4 py-2">
                                    {slot.label}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {daysOfWeek.map((day) => (
                            <tr key={day}>
                                <td className="border px-4 py-4 font-medium text-white bg-gray-800">{day}</td>
                                {timeSlots.map((slot, i) => {
                                    const cell = getCellContent(day, slot);
                                    return (
                                        <td key={i} className={`border px-4 py-4 align-top ${cell.className}`}>
                                            {cell.content}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print-content,
                    .print-content * {
                        visibility: visible;
                    }
                    .print-content {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    @page {
                        size: landscape;
                        margin: 0.5in;
                    }
                }
            `}</style>
        </div>
    );
};

export default TeacherEmploi;