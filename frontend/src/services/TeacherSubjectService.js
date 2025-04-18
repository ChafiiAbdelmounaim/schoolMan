import axios from 'axios';

const TeacherSubjectService = {
    assignTeacher: async (teacherId, subjectId) => {
        try {
            const response = await axios.post('/api/teacher-subjects/assign', {
                teacher_id: teacherId,
                subject_id: subjectId
            });
            return response.data;
        } catch (error) {
            console.error('Error assigning teacher:', error);
            throw error;
        }
    },

    removeTeacher: async (teacherId, subjectId) => {
        try {
            const response = await axios.post('/api/teacher-subjects/remove', {
                teacher_id: teacherId,
                subject_id: subjectId
            });
            return response.data;
        } catch (error) {
            console.error('Error removing teacher:', error);
            throw error;
        }
    },

    getTeachersForSubject: async (subjectId) => {
        try {
            const response = await axios.get(`/api/teacher-subjects/subject/${subjectId}/teachers`);
            return response.data;
        } catch (error) {
            console.error('Error fetching teachers for subject:', error);
            throw error;
        }
    },

    getSubjectsForTeacher: async (teacherId) => {
        try {
            const response = await axios.get(`/api/teacher-subjects/teacher/${teacherId}/subjects`);
            return response.data;
        } catch (error) {
            console.error('Error fetching subjects for teacher:', error);
            throw error;
        }
    },

    getAllAssignments: async () => {
        try {
            const response = await axios.get('/api/teacher-subjects/assignments');
            return response.data;
        } catch (error) {
            console.error('Error fetching all assignments:', error);
            throw error;
        }
    }
};

export default TeacherSubjectService;