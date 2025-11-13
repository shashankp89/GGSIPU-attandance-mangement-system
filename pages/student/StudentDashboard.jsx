import React, { useState, useMemo } from 'react';
import Card from '../../components/Card';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'react-toastify';

const StudentDashboard = () => {
    const { user } = useAuth();
    const { subjects, attendance, marks, assignments, submissions, updateData } = useData();
    const [activeTab, setActiveTab] = useState('overview');
    const [filesToSubmit, setFilesToSubmit] = useState({});

    const studentSubjects = useMemo(() => 
        Object.entries(subjects)
            .filter(([, sub]) => {
                // A student is part of a subject if they are in the main class OR added as an extra student
                const inClass = sub.classId === user.classId;
                const isExtra = sub.extraStudents?.some(s => s.enrollmentNo === user.enrollmentNo);
                return inClass || isExtra;
            })
            .reduce((acc, [id, details]) => ({ ...acc, [id]: details }), {}),
        [subjects, user.classId, user.enrollmentNo]
    );

    const attendanceData = useMemo(() => {
        let totalClasses = 0;
        let attendedClasses = 0;
        const subjectWise = {};

        for (const subId in studentSubjects) {
            const subjectAttendance = attendance[subId] || {};
            const totalLectures = Object.keys(subjectAttendance).length;
            const attendedLectures = Object.values(subjectAttendance).filter(presentList => presentList.includes(user.enrollmentNo)).length;
            
            totalClasses += totalLectures;
            attendedClasses += attendedLectures;

            subjectWise[subId] = {
                name: studentSubjects[subId].name,
                total: totalLectures,
                attended: attendedLectures,
                percentage: totalLectures > 0 ? (attendedLectures / totalLectures * 100).toFixed(2) : 0,
            };
        }
        
        return {
            totalClasses,
            attendedClasses,
            overallPercentage: totalClasses > 0 ? (attendedClasses / totalClasses * 100).toFixed(2) : 0,
            subjectWise
        };
    }, [attendance, studentSubjects, user.enrollmentNo]);

    const marksData = useMemo(() => {
        const subjectWise = {};
        for(const subId in studentSubjects) {
            const subjectMarks = marks[subId] || {};
            subjectWise[subId] = {
                name: studentSubjects[subId].name,
                tests: []
            };
            for(const testName in subjectMarks) {
                if(subjectMarks[testName][user.enrollmentNo] !== undefined) {
                    subjectWise[subId].tests.push({
                        name: testName,
                        score: subjectMarks[testName][user.enrollmentNo]
                    });
                }
            }
        }
        return subjectWise;
    }, [marks, studentSubjects, user.enrollmentNo]);

    const assignmentsData = useMemo(() => {
        const subjectWise = {};
        let summary = { total: 0, pending: 0, submitted: 0, graded: 0 };

        for(const subId in studentSubjects) {
            subjectWise[subId] = {
                name: studentSubjects[subId].name,
                assignments: []
            };
            const subjectAssignments = Object.entries(assignments).filter(([,a]) => a.subjectId === subId);
            
            for(const [asnId, asnDetails] of subjectAssignments) {
                summary.total++;
                const submission = submissions[asnId]?.[user.enrollmentNo];
                let status = 'Pending';
                if (submission?.grade) status = 'Graded';
                else if (submission) status = 'Submitted';
                
                if (status === 'Pending') summary.pending++;
                else if (status === 'Submitted') summary.submitted++;
                else if (status === 'Graded') summary.graded++;

                const isOverdue = new Date(asnDetails.dueDate) < new Date() && !submission;

                subjectWise[subId].assignments.push({
                    id: asnId,
                    ...asnDetails,
                    submission,
                    status,
                    isOverdue,
                });
            }
        }
        return { subjectWise, summary };
    }, [assignments, submissions, studentSubjects, user.enrollmentNo]);
    
    const handleFileChange = (e, assignmentId) => {
        if (e.target.files.length > 0) {
            setFilesToSubmit(prev => ({...prev, [assignmentId]: e.target.files[0]}));
        }
    };

    const handleSubmitAssignment = (assignmentId) => {
        const file = filesToSubmit[assignmentId];
        if (!file) {
            toast.error("Please select a file to submit.");
            return;
        }

        updateData(prev => {
            const newSubmission = {
                submittedAt: new Date().toISOString(),
                fileName: file.name,
                grade: null,
            };
            return {
                ...prev,
                submissions: {
                    ...prev.submissions,
                    [assignmentId]: {
                        ...(prev.submissions[assignmentId] || {}),
                        [user.enrollmentNo]: newSubmission
                    }
                }
            };
        });
        toast.success(`Assignment submitted successfully!`);
        setFilesToSubmit(prev => {
            const newState = {...prev};
            delete newState[assignmentId];
            return newState;
        });
    };

    const renderOverview = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card title="Overall Attendance">
                <div className="flex items-center justify-center h-56">
                    <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                            <Pie
                                data={[{name: 'Attended', value: attendanceData.attendedClasses}, {name: 'Missed', value: attendanceData.totalClasses - attendanceData.attendedClasses}]}
                                cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                <Cell key="cell-0" fill="#22c55e" />
                                <Cell key="cell-1" fill="#ef4444" />
                            </Pie>
                            <Tooltip/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-center font-bold text-2xl">{attendanceData.overallPercentage}%</p>
                <p className="text-center text-gray-500">({attendanceData.attendedClasses} of {attendanceData.totalClasses} classes attended)</p>
            </Card>
             <Card title="Assignments Summary">
                <div className="space-y-3 pt-4 text-center">
                    <p className="text-4xl font-bold">{assignmentsData.summary.total}</p>
                    <p className="text-gray-500">Total Assignments</p>
                    <div className="flex justify-around pt-4">
                        <div>
                            <p className="text-2xl font-bold text-yellow-500">{assignmentsData.summary.pending}</p>
                            <p>Pending</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-blue-500">{assignmentsData.summary.submitted}</p>
                            <p>Submitted</p>
                        </div>
                         <div>
                            <p className="text-2xl font-bold text-green-500">{assignmentsData.summary.graded}</p>
                            <p>Graded</p>
                        </div>
                    </div>
                </div>
            </Card>
            <Card title="Subject-wise Marks" className="md:col-span-2 lg:col-span-1">
                 <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={Object.values(marksData).map(sub => ({name: sub.name, 'Average Score': sub.tests.length ? sub.tests.reduce((acc, t) => acc + parseFloat(t.score || 0), 0) / sub.tests.length : 0}))}>
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={80} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Average Score" fill="#ffd700" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
    
    const renderAttendance = () => (
        <Card title="Attendance Details">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b dark:border-gray-700">
                            <th className="p-2">Subject</th>
                            <th className="p-2">Attended</th>
                            <th className="p-2">Total Classes</th>
                            <th className="p-2">Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.values(attendanceData.subjectWise).map(sub => (
                            <tr key={sub.name} className="border-b dark:border-gray-700">
                                <td className="p-2">{sub.name}</td>
                                <td className="p-2">{sub.attended}</td>
                                <td className="p-2">{sub.total}</td>
                                <td className={`p-2 font-bold ${sub.percentage >= 75 ? 'text-green-500' : 'text-red-500'}`}>{sub.percentage}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
    
    const renderMarks = () => (
        <div className="space-y-6">
            {Object.values(marksData).map(sub => (
                <Card key={sub.name} title={sub.name}>
                    {sub.tests.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b dark:border-gray-700">
                                        <th className="p-2">Test Name</th>
                                        <th className="p-2">Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sub.tests.map(test => (
                                        <tr key={test.name} className="border-b dark:border-gray-700 last:border-b-0">
                                            <td className="p-2">{test.name}</td>
                                            <td className="p-2">{test.score}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : <p>No marks entered for this subject yet.</p>}
                </Card>
            ))}
        </div>
    );

    const renderAssignments = () => {
        const StatusBadge = ({ status, isOverdue }) => {
            if (isOverdue) return <span className="text-xs font-semibold bg-red-200 text-red-800 px-2 py-1 rounded-full">Overdue</span>;
            switch(status) {
                case 'Pending': return <span className="text-xs font-semibold bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">Pending</span>;
                case 'Submitted': return <span className="text-xs font-semibold bg-blue-200 text-blue-800 px-2 py-1 rounded-full">Submitted</span>;
                case 'Graded': return <span className="text-xs font-semibold bg-green-200 text-green-800 px-2 py-1 rounded-full">Graded</span>;
                default: return null;
            }
        };

        return (
             <div className="space-y-6">
                {Object.values(assignmentsData.subjectWise).map(sub => (
                    sub.assignments.length > 0 && (
                        <Card key={sub.name} title={sub.name}>
                            <div className="space-y-4">
                                {sub.assignments.map(asn => (
                                    <div key={asn.id} className="p-4 border dark:border-gray-700 rounded-lg">
                                        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2">
                                            <p className="font-bold">{asn.title}</p>
                                            <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                                <StatusBadge status={asn.status} isOverdue={asn.isOverdue} />
                                                <p className="text-sm text-gray-500">Due: {new Date(asn.dueDate).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{asn.description}</p>
                                        
                                        {asn.status === 'Pending' && !asn.isOverdue && (
                                            <div className="print:hidden flex flex-col sm:flex-row items-center gap-2">
                                                <input type="file" onChange={(e) => handleFileChange(e, asn.id)} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-ggsipu-navy file:text-ggsipu-gold hover:file:bg-opacity-80"/>
                                                <button onClick={() => handleSubmitAssignment(asn.id)} disabled={!filesToSubmit[asn.id]} className="w-full sm:w-auto bg-ggsipu-navy text-ggsipu-gold font-bold py-2 px-4 rounded-md text-sm disabled:opacity-50">Submit</button>
                                            </div>
                                        )}
                                        {asn.status === 'Submitted' && (
                                            <p className="text-sm italic text-blue-500">Submitted on {new Date(asn.submission.submittedAt).toLocaleString()} ({asn.submission.fileName})</p>
                                        )}
                                        {asn.status === 'Graded' && (
                                            <div>
                                                <p className="text-sm italic text-green-500">Graded. Your score is: <span className="font-bold">{asn.submission.grade}</span></p>
                                                <p className="text-sm text-gray-400">Submitted on {new Date(asn.submission.submittedAt).toLocaleString()}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )
                ))}
             </div>
        );
    };

    return (
        <div className="min-h-screen bg-ggsipu-surface">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                 <div className="print:hidden">
                    <h2 className="text-3xl font-bold mb-2 text-ggsipu-navy">Student Dashboard</h2>
                    <p className="mb-6 text-ggsipu-700">Welcome, {user.name} ({user.enrollmentNo})</p>
                </div>
                <div className="flex border-b border-gray-300 mb-6 overflow-x-auto print:hidden">
                    <button onClick={() => setActiveTab('overview')} className={`flex-shrink-0 py-2 px-4 font-semibold ${activeTab === 'overview' ? 'border-b-2 border-ggsipu-gold text-ggsipu-gold' : 'text-ggsipu-700'}`}>Overview</button>
                    <button onClick={() => setActiveTab('attendance')} className={`flex-shrink-0 py-2 px-4 font-semibold ${activeTab === 'attendance' ? 'border-b-2 border-ggsipu-gold text-ggsipu-gold' : 'text-ggsipu-700'}`}>Attendance</button>
                    <button onClick={() => setActiveTab('marks')} className={`flex-shrink-0 py-2 px-4 font-semibold ${activeTab === 'marks' ? 'border-b-2 border-ggsipu-gold text-ggsipu-gold' : 'text-ggsipu-700'}`}>Marks</button>
                    <button onClick={() => setActiveTab('assignments')} className={`flex-shrink-0 py-2 px-4 font-semibold ${activeTab === 'assignments' ? 'border-b-2 border-ggsipu-gold text-ggsipu-gold' : 'text-ggsipu-700'}`}>Assignments</button>
                </div>

                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'attendance' && renderAttendance()}
                {activeTab === 'marks' && renderMarks()}
                {activeTab === 'assignments' && renderAssignments()}
            </div>
        </div>
    );
};

export default StudentDashboard;