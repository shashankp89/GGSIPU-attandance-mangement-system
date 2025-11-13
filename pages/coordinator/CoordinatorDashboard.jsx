import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import { generateUniqueId } from '../../utils/helpers';
import { toast } from 'react-toastify';

const CoordinatorDashboard = () => {
    const { user } = useAuth();
    const { classes, updateData } = useData();
    const [activeTab, setActiveTab] = useState('manageClasses');
    const [newClassName, setNewClassName] = useState('');
    const [selectedClassId, setSelectedClassId] = useState(null);
    
    // State for single student form
    const [studentName, setStudentName] = useState('');
    const [studentEnrollment, setStudentEnrollment] = useState('');
    const [studentEmail, setStudentEmail] = useState('');
    
    // State for bulk student add
    const [bulkStudentData, setBulkStudentData] = useState('');

    // State for editing a student
    const [editingStudentEnrollment, setEditingStudentEnrollment] = useState(null);
    const [editedStudentData, setEditedStudentData] = useState({ name: '', email: '' });

    const coordinatorClasses = Object.entries(classes)
        .filter(([, classDetails]) => classDetails.coordinatorEmail === user.email)
        .reduce((acc, [id, details]) => ({ ...acc, [id]: details }), {});

    const handleCreateClass = (e) => {
        e.preventDefault();
        const classId = generateUniqueId('CLS');
        updateData(prev => ({
            ...prev,
            classes: {
                ...prev.classes,
                [classId]: {
                    name: newClassName,
                    coordinatorEmail: user.email,
                    students: []
                }
            }
        }));
        setNewClassName('');
        toast.success(`Class "${newClassName}" created successfully!`);
    };

    const handleAddStudent = (e) => {
        e.preventDefault();
        const newStudent = { name: studentName, enrollmentNo: studentEnrollment, email: studentEmail };
        
        const currentClass = classes[selectedClassId];
        const isDuplicate = currentClass.students.some(s => s.enrollmentNo === studentEnrollment || s.email === studentEmail);
        
        if (isDuplicate) {
            toast.error("Student with this enrollment number or email already exists in this class.");
            return;
        }
        
        updateData(prev => ({
            ...prev,
            classes: {
                ...prev.classes,
                [selectedClassId]: {
                    ...prev.classes[selectedClassId],
                    students: [...prev.classes[selectedClassId].students, newStudent]
                }
            }
        }));
        setStudentName('');
        setStudentEnrollment('');
        setStudentEmail('');
        toast.success(`Student "${studentName}" added to class.`);
    };

    const handleBulkAddStudents = (e) => {
        e.preventDefault();
        const currentStudents = classes[selectedClassId].students;
        const newStudents = [];
        let duplicateCount = 0;
        let invalidCount = 0;

        const lines = bulkStudentData.trim().split('\n');
        for (const line of lines) {
            const [name, enrollmentNo, email] = line.split(',').map(s => s.trim());
            if (!name || !enrollmentNo || !email) {
                invalidCount++;
                continue;
            }
            const isDuplicate = currentStudents.some(s => s.enrollmentNo === enrollmentNo || s.email === email) ||
                                newStudents.some(s => s.enrollmentNo === enrollmentNo || s.email === email);

            if (isDuplicate) {
                duplicateCount++;
                continue;
            }
            newStudents.push({ name, enrollmentNo, email });
        }
        
        if (newStudents.length > 0) {
            updateData(prev => ({
                ...prev,
                classes: {
                    ...prev.classes,
                    [selectedClassId]: {
                        ...prev.classes[selectedClassId],
                        students: [...prev.classes[selectedClassId].students, ...newStudents]
                    }
                }
            }));
        }
        toast.success(`${newStudents.length} students added. Skipped ${duplicateCount} duplicates and ${invalidCount} invalid lines.`);
        setBulkStudentData('');
    };
    
    const handleRemoveStudent = (enrollmentNo) => {
        updateData(prev => ({
            ...prev,
            classes: {
                ...prev.classes,
                [selectedClassId]: {
                    ...prev.classes[selectedClassId],
                    students: prev.classes[selectedClassId].students.filter(s => s.enrollmentNo !== enrollmentNo)
                }
            }
        }));
        toast.warn("Student removed.");
    };
    
    const handleEditClick = (student) => {
        setEditingStudentEnrollment(student.enrollmentNo);
        setEditedStudentData({ name: student.name, email: student.email });
    };

    const handleCancelEdit = () => {
        setEditingStudentEnrollment(null);
        setEditedStudentData({ name: '', email: '' });
    };
    
    const handleSaveEdit = (enrollmentNo) => {
        updateData(prev => {
            const updatedStudents = prev.classes[selectedClassId].students.map(student => {
                if (student.enrollmentNo === enrollmentNo) {
                    return { ...student, ...editedStudentData };
                }
                return student;
            });

            return {
                ...prev,
                classes: {
                    ...prev.classes,
                    [selectedClassId]: {
                        ...prev.classes[selectedClassId],
                        students: updatedStudents
                    }
                }
            };
        });
        toast.success("Student details updated.");
        handleCancelEdit();
    };


    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.info("Class ID copied to clipboard!");
    };
    
    const renderManageClasses = () => (
        <div>
            <Card title="Create New Class" className="mb-8">
                <form onSubmit={handleCreateClass}>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="text"
                            value={newClassName}
                            onChange={(e) => setNewClassName(e.target.value)}
                            placeholder="Enter Class Name (e.g., B.Tech CSE 2024)"
                            className="flex-grow px-3 py-2 border rounded-md bg-white text-ggsipu-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ggsipu-500"
                            required
                        />
                        <button type="submit" className="bg-ggsipu-navy text-ggsipu-gold font-bold py-2 px-4 rounded-md hover:bg-opacity-90">Create Class</button>
                    </div>
                </form>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.keys(coordinatorClasses).length > 0 ? Object.entries(coordinatorClasses).map(([id, details]) => (
                    <Card key={id} title={details.name} className="flex flex-col">
                        <div className="flex-grow">
                            <p className="text-sm text-ggsipu-700 mb-4">Students: {details.students.length}</p>
                            <div className="flex items-center gap-2 mb-4">
                                <p className="text-sm font-mono bg-gray-200 px-2 py-1 rounded text-ggsipu-navy">{id}</p>
                                <button onClick={() => copyToClipboard(id)} aria-label="Copy Class ID" className="p-1 text-ggsipu-700 hover:text-ggsipu-gold">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                </button>
                            </div>
                        </div>
                        <button onClick={() => { setSelectedClassId(id); setActiveTab('manageStudents'); }} className="w-full mt-4 bg-ggsipu-gold text-ggsipu-navy font-bold py-2 px-4 rounded-md hover:bg-yellow-300">Manage Students</button>
                    </Card>
                )) : (
                    <div className="md:col-span-2 lg:col-span-3">
                        <EmptyState message="You have not created any classes yet. Create one above to get started." />
                    </div>
                )}
            </div>
        </div>
    );
    
    const renderManageStudents = () => {
        const selectedClass = classes[selectedClassId];
        if (!selectedClass) return null;

        return (
            <div>
                <button onClick={() => setActiveTab('manageClasses')} className="print:hidden mb-6 text-ggsipu-navy font-semibold hover:underline">&larr; Back to All Classes</button>
                <div className="flex justify-between items-center mb-4">
                     <h3 className="text-2xl font-bold text-ggsipu-navy">Manage Students for {selectedClass.name}</h3>
                     <button onClick={() => window.print()} className="print:hidden bg-ggsipu-navy text-ggsipu-gold font-bold py-2 px-4 rounded-md hover:bg-opacity-90 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm7-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        Print Roster
                    </button>
                </div>
                
                <div className="print:hidden grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <Card title="Add New Student">
                        <form onSubmit={handleAddStudent}>
                            <div className="space-y-4">
                                <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Student Name" required className="w-full px-3 py-2 border rounded-md bg-white text-ggsipu-navy placeholder-gray-400" />
                                <input type="text" value={studentEnrollment} onChange={(e) => setStudentEnrollment(e.target.value)} placeholder="Enrollment No." required className="w-full px-3 py-2 border rounded-md bg-white text-ggsipu-navy placeholder-gray-400" />
                                <input type="email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} placeholder="Student Email" required className="w-full px-3 py-2 border rounded-md bg-white text-ggsipu-navy placeholder-gray-400" />
                                <button type="submit" className="w-full bg-ggsipu-navy text-ggsipu-gold font-bold py-2 px-4 rounded-md hover:bg-opacity-90">Add Student</button>
                            </div>
                        </form>
                    </Card>
                    <Card title="Bulk Add Students">
                        <form onSubmit={handleBulkAddStudents}>
                             <textarea
                                value={bulkStudentData}
                                onChange={(e) => setBulkStudentData(e.target.value)}
                                placeholder="Paste student data here. Each line in format: Name,EnrollmentNo,Email"
                                className="w-full h-32 px-3 py-2 border rounded-md bg-white text-ggsipu-navy placeholder-gray-400 mb-4"
                                />
                            <button type="submit" className="w-full bg-ggsipu-navy text-ggsipu-gold font-bold py-2 px-4 rounded-md hover:bg-opacity-90">Add in Bulk</button>
                        </form>
                    </Card>
                </div>
                
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-ggsipu-navy">
                            <tr>
                                <th className="p-4 font-semibold text-white">Name</th>
                                <th className="p-4 font-semibold text-white">Enrollment No.</th>
                                <th className="p-4 font-semibold text-white">Email</th>
                                <th className="p-4 font-semibold text-white print:hidden">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedClass.students.length > 0 ? selectedClass.students.map(student => (
                                editingStudentEnrollment === student.enrollmentNo ? (
                                    <tr key={student.enrollmentNo} className="bg-yellow-50 print:hidden">
                                        <td className="p-2"><input type="text" value={editedStudentData.name} onChange={(e) => setEditedStudentData({...editedStudentData, name: e.target.value})} className="w-full px-2 py-1 border rounded-md bg-white text-ggsipu-navy" /></td>
                                        <td className="p-2 font-mono text-ggsipu-navy">{student.enrollmentNo}</td>
                                        <td className="p-2"><input type="email" value={editedStudentData.email} onChange={(e) => setEditedStudentData({...editedStudentData, email: e.target.value})} className="w-full px-2 py-1 border rounded-md bg-white text-ggsipu-navy" /></td>
                                        <td className="p-2 flex gap-2">
                                            <button onClick={() => handleSaveEdit(student.enrollmentNo)} className="text-green-600 hover:text-green-700 font-semibold">Save</button>
                                            <button onClick={handleCancelEdit} className="text-gray-600 hover:text-gray-700">Cancel</button>
                                        </td>
                                    </tr>
                                ) : (
                                <tr key={student.enrollmentNo} className="border-t">
                                    <td className="p-4 text-ggsipu-navy">{student.name}</td>
                                    <td className="p-4 text-ggsipu-700">{student.enrollmentNo}</td>
                                    <td className="p-4 text-ggsipu-700">{student.email}</td>
                                    <td className="p-4 flex gap-4 print:hidden">
                                        <button onClick={() => handleEditClick(student)} className="text-ggsipu-500 hover:text-ggsipu-700">Edit</button>
                                        <button onClick={() => handleRemoveStudent(student.enrollmentNo)} className="text-red-600 hover:text-red-700">Remove</button>
                                    </td>
                                </tr>
                                )
                            )) : <tr><td colSpan="4" className="p-8 text-center text-ggsipu-700">No students have been added to this class yet.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-ggsipu-surface">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="print:hidden">
                    <h2 className="text-3xl font-bold mb-6 text-ggsipu-navy">Coordinator Dashboard</h2>
                </div>
                {activeTab === 'manageClasses' && renderManageClasses()}
                {activeTab === 'manageStudents' && renderManageStudents()}
            </div>
        </div>
    );
};

export default CoordinatorDashboard;