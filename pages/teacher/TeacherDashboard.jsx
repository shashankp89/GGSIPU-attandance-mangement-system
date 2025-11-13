import React, { useState, useMemo, useEffect } from 'react';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { generateUniqueId } from '../../utils/helpers';
import { toast } from 'react-toastify';
import { exportToCsv } from '../../utils/export';

const TeacherDashboard = () => {
    const { user } = useAuth();
    const { classes, subjects, attendance, marks, assignments, submissions, updateData } = useData();
    const [activeTab, setActiveTab] = useState('mySubjects');
    const [selectedSubjectId, setSelectedSubjectId] = useState(null);
    const [view, setView] = useState(null); // 'attendance', 'marks', 'assignments', 'students'

    // Form states
    const [newSubjectName, setNewSubjectName] = useState('');
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10));
    const [presentStudents, setPresentStudents] = useState([]);
    const [testName, setTestName] = useState('');
    const [studentMarks, setStudentMarks] = useState({});
    
    // Extra student form
    const [extraStudentName, setExtraStudentName] = useState('');
    const [extraStudentEnrollment, setExtraStudentEnrollment] = useState('');
    const [extraStudentEmail, setExtraStudentEmail] = useState('');

    // Assignment form
    const [assignmentTitle, setAssignmentTitle] = useState('');
    const [assignmentDesc, setAssignmentDesc] = useState('');
    const [assignmentDueDate, setAssignmentDueDate] = useState('');

    // Grading state
    const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
    const [studentGrades, setStudentGrades] = useState({});

    const teacherSubjects = useMemo(() => Object.entries(subjects)
        .filter(([, sub]) => sub.teacherEmail === user.email && sub.classId === user.classId)
        .reduce((acc, [id, details]) => ({ ...acc, [id]: details }), {}), [subjects, user.email, user.classId]);
    
    const currentClass = classes[user.classId];

    const subjectStudents = useMemo(() => {
        if (!selectedSubjectId || !currentClass) return [];
        const classStudents = currentClass.students || [];
        const extraStudents = subjects[selectedSubjectId]?.extraStudents || [];
        const combined = [...classStudents, ...extraStudents];
        const unique = Array.from(new Set(combined.map(s => s.enrollmentNo)))
            .map(enrollmentNo => combined.find(s => s.enrollmentNo === enrollmentNo));
        return unique;
    }, [selectedSubjectId, currentClass, subjects]);

    useEffect(() => {
        if (view === 'attendance' && selectedSubjectId) {
            const todaysAttendance = attendance[selectedSubjectId]?.[attendanceDate] || [];
            setPresentStudents(todaysAttendance);
        }
    }, [attendanceDate, selectedSubjectId, view, attendance]);

    const handleCreateSubject = (e) => {
        e.preventDefault();
        const subjectId = generateUniqueId('SUB');
        updateData(prev => ({
            ...prev,
            subjects: {
                ...prev.subjects,
                [subjectId]: {
                    name: newSubjectName,
                    teacherEmail: user.email,
                    classId: user.classId,
                    extraStudents: []
                }
            }
        }));
        setNewSubjectName('');
        toast.success(`Subject "${newSubjectName}" created.`);
        setActiveTab('mySubjects');
    };

    const handleAttendanceToggle = (enrollmentNo) => {
        setPresentStudents(prev => 
            prev.includes(enrollmentNo)
                ? prev.filter(id => id !== enrollmentNo)
                : [...prev, enrollmentNo]
        );
    };

    const saveAttendance = () => {
        updateData(prev => ({
            ...prev,
            attendance: {
                ...prev.attendance,
                [selectedSubjectId]: {
                    ...(prev.attendance[selectedSubjectId] || {}),
                    [attendanceDate]: presentStudents
                }
            }
        }));
        toast.success(`Attendance for ${attendanceDate} saved.`);
    };
    
    const handleMarkChange = (enrollmentNo, value) => {
        setStudentMarks(prev => ({ ...prev, [enrollmentNo]: value }));
    };

    const saveMarks = (e) => {
        e.preventDefault();
        if(!testName) {
            toast.error("Please enter a test name.");
            return;
        }
        updateData(prev => ({
            ...prev,
            marks: {
                ...prev.marks,
                [selectedSubjectId]: {
                    ...(prev.marks[selectedSubjectId] || {}),
                    [testName]: {
                        ...((prev.marks[selectedSubjectId] || {})[testName] || {}),
                        ...studentMarks
                    }
                }
            }
        }));
        toast.success(`Marks for test "${testName}" saved.`);
        setTestName('');
        setStudentMarks({});
    };

    const handleAddExtraStudent = (e) => {
        e.preventDefault();
        const newStudent = { name: extraStudentName, enrollmentNo: extraStudentEnrollment, email: extraStudentEmail };
        const isDuplicate = subjectStudents.some(s => s.enrollmentNo === newStudent.enrollmentNo);

        if (isDuplicate) {
            toast.error("A student with this enrollment number already exists.");
            return;
        }

        updateData(prev => {
            const subject = prev.subjects[selectedSubjectId];
            const updatedExtraStudents = [...(subject.extraStudents || []), newStudent];
            return {
                ...prev,
                subjects: {
                    ...prev.subjects,
                    [selectedSubjectId]: { ...subject, extraStudents: updatedExtraStudents }
                }
            };
        });
        toast.success(`${extraStudentName} added as an extra student.`);
        setExtraStudentName('');
        setExtraStudentEnrollment('');
        setExtraStudentEmail('');
    };

    const handleRemoveExtraStudent = (enrollmentNo) => {
        updateData(prev => {
            const subject = prev.subjects[selectedSubjectId];
            const updatedExtraStudents = subject.extraStudents.filter(s => s.enrollmentNo !== enrollmentNo);
            return {
                ...prev,
                subjects: {
                    ...prev.subjects,
                    [selectedSubjectId]: { ...subject, extraStudents: updatedExtraStudents }
                }
            };
        });
        toast.warn("Extra student removed from this subject.");
    };

    const handleCreateAssignment = (e) => {
        e.preventDefault();
        const assignmentId = generateUniqueId('ASN');
        updateData(prev => ({
            ...prev,
            assignments: {
                ...prev.assignments,
                [assignmentId]: {
                    subjectId: selectedSubjectId,
                    title: assignmentTitle,
                    description: assignmentDesc,
                    dueDate: assignmentDueDate
                }
            }
        }));
        toast.success("Assignment created successfully!");
        setAssignmentTitle('');
        setAssignmentDesc('');
        setAssignmentDueDate('');
    };

    const handleGradeChange = (enrollmentNo, grade) => {
        setStudentGrades(prev => ({ ...prev, [enrollmentNo]: { ...prev[enrollmentNo], grade } }));
    };

    const handleSaveGrades = () => {
        updateData(prev => {
            const updatedSubmissions = { ...(prev.submissions[selectedAssignmentId] || {}) };
            for(const enrollmentNo in studentGrades) {
                updatedSubmissions[enrollmentNo] = {
                    ...(updatedSubmissions[enrollmentNo] || {}),
                    grade: studentGrades[enrollmentNo].grade
                };
            }
            return {
                ...prev,
                submissions: {
                    ...prev.submissions,
                    [selectedAssignmentId]: updatedSubmissions
                }
            };
        });
        toast.success("Grades have been saved.");
        setSelectedAssignmentId(null);
        setStudentGrades({});
    };

    const handleExportAttendance = () => {
        const subjectAttendance = attendance[selectedSubjectId] || {};
        const allDates = Object.keys(subjectAttendance).sort();
        
        const rows = subjectStudents.map(student => {
            const row = {
                'Enrollment_No': student.enrollmentNo,
                'Student_Name': student.name,
            };
            allDates.forEach(date => {
                const isPresent = subjectAttendance[date]?.includes(student.enrollmentNo);
                row[date] = isPresent ? 'Present' : 'Absent';
            });
            return row;
        });

        const subjectName = subjects[selectedSubjectId].name.replace(/\s+/g, '_');
        exportToCsv(`${subjectName}_Attendance.csv`, rows);
    };

    const handleExportMarks = () => {
        const subjectMarks = marks[selectedSubjectId] || {};
        const allTests = Object.keys(subjectMarks);

        const rows = subjectStudents.map(student => {
            const row = {
                'Enrollment_No': student.enrollmentNo,
                'Student_Name': student.name,
            };
            allTests.forEach(testName => {
                row[testName] = subjectMarks[testName][student.enrollmentNo] ?? 'N/A';
            });
            return row;
        });
        
        const subjectName = subjects[selectedSubjectId].name.replace(/\s+/g, '_');
        exportToCsv(`${subjectName}_Marks.csv`, rows);
    };


    const renderMySubjects = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.keys(teacherSubjects).length > 0 ? Object.entries(teacherSubjects).map(([id, sub]) => (
                <Card key={id} title={sub.name} className="flex flex-col">
                    <div className="flex-grow">
                        <p className="text-sm text-gray-500 mb-4">Students: {(classes[sub.classId]?.students?.length || 0) + (sub.extraStudents?.length || 0)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                         <button onClick={() => { setSelectedSubjectId(id); setView('students'); }} className="bg-ggsipu-navy text-ggsipu-gold font-bold py-2 px-3 rounded-md hover:bg-opacity-90 text-sm">Students</button>
                         <button onClick={() => { setSelectedSubjectId(id); setView('attendance'); }} className="bg-ggsipu-navy text-ggsipu-gold font-bold py-2 px-3 rounded-md hover:bg-opacity-90 text-sm">Attendance</button>
                         <button onClick={() => { setSelectedSubjectId(id); setView('marks'); }} className="bg-ggsipu-navy text-ggsipu-gold font-bold py-2 px-3 rounded-md hover:bg-opacity-90 text-sm">Marks</button>
                         <button onClick={() => { setSelectedSubjectId(id); setView('assignments'); }} className="bg-ggsipu-navy text-ggsipu-gold font-bold py-2 px-3 rounded-md hover:bg-opacity-90 text-sm">Assignments</button>
                    </div>
                </Card>
            )) : (
                <div className="md:col-span-2 lg:col-span-3">
                    <EmptyState message="You have no subjects. Create one to get started." />
                </div>
            )}
        </div>
    );

        const renderCreateSubject = () => (
        <div className="max-w-xl mx-auto">
            <Card title="Create a New Subject">
                <form onSubmit={handleCreateSubject}>
                    <div className="mb-4">
                        <label className="block text-ggsipu-navy mb-2" htmlFor="subjectName">Subject Name</label>
                        <input
                            type="text"
                            id="subjectName"
                            value={newSubjectName}
                            onChange={(e) => setNewSubjectName(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md bg-white text-ggsipu-navy focus:outline-none focus:ring-2 focus:ring-ggsipu-500"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-ggsipu-navy text-ggsipu-gold font-bold py-2 px-4 rounded-md hover:bg-opacity-90">Create Subject</button>
                </form>
            </Card>
        </div>
    );    const renderSubjectView = () => {
        if (!selectedSubjectId) return null;
        const subject = subjects[selectedSubjectId];

        const SubjectNav = () => (
             <div className="flex border-b border-gray-300 mb-6 overflow-x-auto print:hidden">
                <button onClick={() => setView('students')} className={`flex-shrink-0 py-2 px-4 font-semibold ${view === 'students' ? 'border-b-2 border-ggsipu-gold text-ggsipu-gold' : 'text-ggsipu-700'}`}>Students</button>
                <button onClick={() => setView('attendance')} className={`flex-shrink-0 py-2 px-4 font-semibold ${view === 'attendance' ? 'border-b-2 border-ggsipu-gold text-ggsipu-gold' : 'text-ggsipu-700'}`}>Attendance</button>
                <button onClick={() => setView('marks')} className={`flex-shrink-0 py-2 px-4 font-semibold ${view === 'marks' ? 'border-b-2 border-ggsipu-gold text-ggsipu-gold' : 'text-ggsipu-700'}`}>Marks</button>
                <button onClick={() => setView('assignments')} className={`flex-shrink-0 py-2 px-4 font-semibold ${view === 'assignments' ? 'border-b-2 border-ggsipu-gold text-ggsipu-gold' : 'text-ggsipu-700'}`}>Assignments</button>
            </div>
        );

        const renderStudents = () => {
            const classStudentEnrollments = new Set(currentClass.students.map(s => s.enrollmentNo));
            return (
                <div>
                    <Card title="Add Extra Student" className="mb-6 print:hidden">
                        <form onSubmit={handleAddExtraStudent}>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <input type="text" value={extraStudentName} onChange={e => setExtraStudentName(e.target.value)} placeholder="Student Name" required className="md:col-span-1 w-full px-3 py-2 border rounded-md bg-white text-ggsipu-navy placeholder-gray-400" />
                                <input type="text" value={extraStudentEnrollment} onChange={e => setExtraStudentEnrollment(e.target.value)} placeholder="Enrollment No." required className="md:col-span-1 w-full px-3 py-2 border rounded-md bg-white text-ggsipu-navy placeholder-gray-400" />
                                <input type="email" value={extraStudentEmail} onChange={e => setExtraStudentEmail(e.target.value)} placeholder="Student Email" required className="md:col-span-1 w-full px-3 py-2 border rounded-md bg-white text-ggsipu-navy placeholder-gray-400" />
                                <button type="submit" className="md:col-span-1 w-full bg-ggsipu-navy text-ggsipu-gold font-bold py-2 px-4 rounded-md hover:bg-opacity-90">Add Student</button>
                            </div>
                        </form>
                    </Card>
                     <div className="bg-white rounded-lg shadow overflow-x-auto">
                        <table className="w-full text-left">
                           <thead className="bg-ggsipu-navy">
                                <tr>
                                    <th className="p-4 font-semibold text-white">Name</th>
                                    <th className="p-4 font-semibold text-white">Enrollment No.</th>
                                    <th className="p-4 font-semibold text-white">Type</th>
                                    <th className="p-4 font-semibold text-white print:hidden">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subjectStudents.map(student => {
                                    const isExtra = !classStudentEnrollments.has(student.enrollmentNo);
                                    return (
                                        <tr key={student.enrollmentNo} className="border-t">
                                            <td className="p-4 text-ggsipu-navy">{student.name}</td>
                                            <td className="p-4 font-mono text-ggsipu-700">{student.enrollmentNo}</td>
                                            <td className="p-4 text-ggsipu-700">{isExtra ? <span className="text-xs font-semibold bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">Extra</span> : 'Class'}</td>
                                            <td className="p-4 print:hidden">
                                                {isExtra && <button onClick={() => handleRemoveExtraStudent(student.enrollmentNo)} className="text-red-500 hover:text-red-700">Remove</button>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )
        };
        
        const renderAttendance = () => (
            <Card>
                <div className="flex items-center justify-between flex-wrap gap-4 mb-6 print:hidden">
                    <div className="flex items-center gap-4">
                        <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} className="px-3 py-2 border rounded-md bg-white text-ggsipu-navy" />
                        <button onClick={saveAttendance} className="bg-ggsipu-navy text-ggsipu-gold font-bold py-2 px-4 rounded-md">Save Attendance</button>
                    </div>
                    <button onClick={handleExportAttendance} className="bg-ggsipu-navy text-ggsipu-gold font-bold py-2 px-4 rounded-md hover:bg-opacity-90 flex items-center gap-2">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Export as CSV
                    </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {subjectStudents.map(student => (
                        <div key={student.enrollmentNo} className={`flex items-center gap-2 p-3 rounded-md transition-colors ${presentStudents.includes(student.enrollmentNo) ? 'bg-green-100' : 'bg-gray-100'}`}>
                            <input
                                type="checkbox"
                                id={`att-${student.enrollmentNo}`}
                                checked={presentStudents.includes(student.enrollmentNo)}
                                onChange={() => handleAttendanceToggle(student.enrollmentNo)}
                                className="h-5 w-5 rounded text-ggsipu-navy focus:ring-ggsipu-500 border-gray-300"
                            />
                            <label htmlFor={`att-${student.enrollmentNo}`} className="flex-grow cursor-pointer text-ggsipu-navy text-sm">{student.name}</label>
                        </div>
                    ))}
                </div>
            </Card>
        );

        const renderMarks = () => (
            <Card>
                <form onSubmit={saveMarks}>
                     <div className="flex items-center justify-between flex-wrap gap-4 mb-6 print:hidden">
                        <div className="flex items-center gap-4 flex-grow">
                            <input type="text" value={testName} onChange={e => setTestName(e.target.value)} placeholder="Test Name (e.g., Mid-Term 1)" required className="flex-grow px-3 py-2 border rounded-md bg-white text-ggsipu-navy placeholder-gray-400"/>
                            <button type="submit" className="bg-ggsipu-navy text-ggsipu-gold font-bold py-2 px-4 rounded-md">Save All Marks</button>
                        </div>
                        <button type="button" onClick={handleExportMarks} className="bg-ggsipu-navy text-ggsipu-gold font-bold py-2 px-4 rounded-md hover:bg-opacity-90 flex items-center gap-2">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Export as CSV
                        </button>
                    </div>
                    <div className="space-y-2">
                        {subjectStudents.map(student => (
                            <div key={student.enrollmentNo} className="flex items-center gap-4 p-2 bg-gray-50 rounded-md">
                                <label className="w-1/2 text-ggsipu-navy"><strong>{student.name}</strong> <span className="text-gray-400 text-sm">({student.enrollmentNo})</span></label>
                                <input
                                    type="number"
                                    placeholder="Marks"
                                    value={studentMarks[student.enrollmentNo] || ''}
                                    onChange={e => handleMarkChange(student.enrollmentNo, e.target.value)}
                                    className="w-1/2 px-3 py-1 border rounded-md bg-white text-ggsipu-navy placeholder-gray-400"
                                />
                            </div>
                        ))}
                    </div>
                </form>
            </Card>
        );

        const renderAssignments = () => {
            const subjectAssignments = Object.entries(assignments).filter(([,a]) => a.subjectId === selectedSubjectId);
            
            if (selectedAssignmentId) {
                const assignment = assignments[selectedAssignmentId];
                return (
                    <Card>
                        <button onClick={() => setSelectedAssignmentId(null)} className="mb-4 text-ggsipu-navy font-semibold hover:underline">&larr; Back to Assignments</button>
                        <h4 className="text-xl font-bold mb-1 text-ggsipu-navy">Grade: {assignment.title}</h4>
                        <div className="space-y-2 mt-4">
                            {subjectStudents.map(student => {
                                const submission = submissions[selectedAssignmentId]?.[student.enrollmentNo];
                                return (
                                    <div key={student.enrollmentNo} className="flex items-center gap-4 p-2 bg-gray-50 rounded-md">
                                        <div className="w-1/2">
                                            <span className="text-ggsipu-navy"><strong>{student.name}</strong></span>
                                            <span className={`ml-2 text-xs font-semibold px-2 py-1 rounded-full ${submission ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                                {submission ? 'Submitted' : 'Pending'}
                                            </span>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Grade"
                                            value={studentGrades[student.enrollmentNo]?.grade ?? submission?.grade ?? ''}
                                            onChange={(e) => handleGradeChange(student.enrollmentNo, e.target.value)}
                                            className="w-1/2 px-3 py-1 border rounded-md bg-white text-ggsipu-navy placeholder-gray-400"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                        <button onClick={handleSaveGrades} className="mt-6 bg-ggsipu-navy text-ggsipu-gold font-bold py-2 px-4 rounded-md">Save Grades</button>
                    </Card>
                );
            }

            return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Create New Assignment">
                    <form onSubmit={handleCreateAssignment}>
                        <div className="space-y-4">
                            <input type="text" value={assignmentTitle} onChange={e => setAssignmentTitle(e.target.value)} placeholder="Assignment Title" required className="w-full px-3 py-2 border rounded-md bg-white text-ggsipu-navy placeholder-gray-400" />
                            <textarea value={assignmentDesc} onChange={e => setAssignmentDesc(e.target.value)} placeholder="Description" required className="w-full px-3 py-2 border rounded-md bg-white text-ggsipu-navy placeholder-gray-400" />
                            <input type="date" value={assignmentDueDate} onChange={e => setAssignmentDueDate(e.target.value)} required className="w-full px-3 py-2 border rounded-md bg-white text-ggsipu-navy" />
                            <button type="submit" className="w-full bg-ggsipu-navy text-ggsipu-gold font-bold py-2 px-4 rounded-md">Create Assignment</button>
                        </div>
                    </form>
                </Card>
                 <Card title="Existing Assignments">
                    <div className="space-y-3">
                        {subjectAssignments.length > 0 ? subjectAssignments.map(([id, asn]) => (
                            <div key={id} className="p-3 bg-gray-50 rounded-md flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-ggsipu-navy">{asn.title}</p>
                                    <p className="text-sm text-ggsipu-700">Due: {asn.dueDate}</p>
                                </div>
                                <button onClick={() => setSelectedAssignmentId(id)} className="bg-ggsipu-gold text-ggsipu-navy font-bold py-1 px-3 rounded-md text-sm">Grade</button>
                            </div>
                        )) : <EmptyState message="No assignments created yet." />}
                    </div>
                </Card>
            </div>
            );
        };
        
        return (
            <div>
                <button onClick={() => { setView(null); setSelectedSubjectId(null); }} className="print:hidden mb-4 text-ggsipu-navy font-semibold hover:underline">&larr; Back to All Subjects</button>
                <h3 className="text-2xl font-bold mb-1 text-ggsipu-navy">Managing {subject.name}</h3>
                <SubjectNav />
                {view === 'students' && renderStudents()}
                {view === 'attendance' && renderAttendance()}
                {view === 'marks' && renderMarks()}
                {view === 'assignments' && renderAssignments()}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-ggsipu-surface">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="print:hidden">
                    <h2 className="text-3xl font-bold mb-2 text-ggsipu-navy">Teacher Dashboard</h2>
                    <p className="mb-6 text-ggsipu-700">Class: {currentClass?.name}</p>
                </div>

                {view ? renderSubjectView() : (
                    <>
                        <div className="flex border-b border-gray-300 mb-6 overflow-x-auto print:hidden">
                            <button onClick={() => setActiveTab('mySubjects')} className={`flex-shrink-0 py-2 px-4 font-semibold ${activeTab === 'mySubjects' ? 'border-b-2 border-ggsipu-gold text-ggsipu-gold' : 'text-ggsipu-700'}`}>My Subjects</button>
                            <button onClick={() => setActiveTab('createSubject')} className={`flex-shrink-0 py-2 px-4 font-semibold ${activeTab === 'createSubject' ? 'border-b-2 border-ggsipu-gold text-ggsipu-gold' : 'text-ggsipu-700'}`}>Create Subject</button>
                        </div>
                        {activeTab === 'mySubjects' && renderMySubjects()}
                        {activeTab === 'createSubject' && renderCreateSubject()}
                    </>
                )}
            </div>
        </div>
    );
};

export default TeacherDashboard;