import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import axios from 'axios';
import TeacherSubjectService from '../../services/TeacherSubjectService';

// Draggable Teacher Component
const DraggableTeacher = ({ teacher, isAssigned }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'TEACHER',
        item: { id: teacher.id },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    return (
        <div
            ref={drag}
            className={`p-3 mb-2 bg-white border rounded-md shadow-sm cursor-move transition-all ${
                isAssigned ? 'border-green-200 bg-green-50' : 'border-gray-200'
            } ${
                isDragging ? 'opacity-50 bg-blue-50 border-blue-200' : 'opacity-100'
            } hover:bg-gray-50`}
        >
            {teacher.name}
        </div>
    );
};

// Droppable Subject Component
const DroppableSubject = ({ subject, assignedTeachers, onAssignment, teachers }) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'TEACHER',
        drop: (item) => onAssignment(subject.id, item.id),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    return (
        <div
            ref={drop}
            className={`p-4 bg-white border rounded-lg shadow-sm min-h-[150px] transition-all ${
                isOver ? 'bg-blue-50 border-blue-300 shadow-md' : 'border-gray-200'
            }`}
        >
            <h3 className="mt-0 mb-2 text-lg font-medium text-gray-800">{subject.name}</h3>
            <div className="flex flex-wrap gap-2">
                {assignedTeachers.map(teacherId => {
                    const teacher = teachers.find(t => t.id === teacherId);
                    return teacher ? (
                        <div
                            key={`${subject.id}-${teacherId}`}
                            className="relative group px-3 py-1 pr-6 text-sm bg-blue-100 text-blue-800 rounded-full border border-blue-200"
                        >
                            {teacher.name}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAssignment(subject.id, teacherId);
                                }}
                                className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 hover:text-blue-800"
                            >
                                ×
                            </button>
                        </div>
                    ) : null;
                })}
            </div>
        </div>
    );
};

// Main Component
const AssignTeacher = () => {
    const [teachers, setTeachers] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [assignments, setAssignments] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [assignmentsRes, teachersRes, subjectsRes] = await Promise.all([
                    TeacherSubjectService.getAllAssignments(),
                    axios.get('/api/teachers'),
                    axios.get('/api/subjects')
                ]);

                setTeachers(teachersRes.data);
                setSubjects(subjectsRes.data);
                setAssignments(assignmentsRes.data || {});
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleAssignment = async (subjectId, teacherId) => {
        try {
            const isAssigned = assignments[subjectId]?.includes(teacherId);

            if (isAssigned) {
                await TeacherSubjectService.removeTeacher(teacherId, subjectId);
                setAssignments(prev => ({
                    ...prev,
                    [subjectId]: prev[subjectId].filter(id => id !== teacherId)
                }));
            } else {
                await TeacherSubjectService.assignTeacher(teacherId, subjectId);
                setAssignments(prev => ({
                    ...prev,
                    [subjectId]: [...(prev[subjectId] || []), teacherId]
                }));
            }
        } catch (error) {
            console.error('Assignment error:', error);
            setError(error.message);
        }
    };

    // Check if teacher is assigned to any subject
    const isTeacherAssigned = (teacherId) => {
        return Object.values(assignments).some(subjectAssignments =>
            subjectAssignments.includes(teacherId)
        );
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (error) return (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">
            Error: {error}
        </div>
    );

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="container max-w-6xl px-4 py-8 mx-auto">
                <h1 className="mb-8 text-2xl font-bold text-center text-gray-800">Teacher-Subject Assignment</h1>

                <div className="flex flex-col gap-8 md:flex-row">
                    {/* Teachers Panel */}
                    <div className="flex-1 p-6 bg-gray-50 rounded-xl">
                        <h2 className="mb-4 text-xl font-semibold text-gray-700">Available Teachers</h2>
                        <div className="space-y-2">
                            {teachers.map(teacher => (
                                <DraggableTeacher
                                    key={teacher.id}
                                    teacher={teacher}
                                    isAssigned={isTeacherAssigned(teacher.id)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Subjects Panel */}
                    <div className="flex-1 p-6 bg-gray-50 rounded-xl">
                        <h2 className="mb-4 text-xl font-semibold text-gray-700">Subjects</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {subjects.map(subject => (
                                <DroppableSubject
                                    key={subject.id}
                                    subject={subject}
                                    assignedTeachers={assignments[subject.id] || []}
                                    onAssignment={handleAssignment}
                                    teachers={teachers}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DndProvider>
    );
};

export default AssignTeacher;