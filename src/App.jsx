import { useState, useEffect } from 'react';

export default function StudentRecordSystem() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState('teacher');
  const [teachers, setTeachers] = useState([]);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [isSignup, setIsSignup] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState(null);
  const [showTypeSelector, setShowTypeSelector] = useState(true);
  
  const ADMIN_EMAIL = 'admin@scholar.com';
  const ADMIN_PASSWORD = 'admin123';
  
  const [fileStructure, setFileStructure] = useState({});
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [currentStudents, setCurrentStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    branch: 'CSE',
    subject: '',
    marksObtained: '',
    maxMarks: ''
  });
  const [editingId, setEditingId] = useState(null);

  const branches = ['CSE', 'ECE', 'EEE', 'MECH', 'CIV', 'EE'];

  useEffect(() => {
    const saved = localStorage.getItem('teachers-data');
    if (saved) {
      try {
        setTeachers(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading teachers:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && currentTeacher) {
      const saved = localStorage.getItem(`file-structure-${currentTeacher.email}`);
      if (saved) {
        try {
          setFileStructure(JSON.parse(saved));
        } catch (error) {
          setFileStructure({});
        }
      }
      setSelectedBranch(null);
      setSelectedSubject(null);
      setCurrentStudents([]);
    }
  }, [isLoggedIn, currentTeacher]);

  useEffect(() => {
    if (isLoggedIn && currentTeacher) {
      localStorage.setItem(`file-structure-${currentTeacher.email}`, JSON.stringify(fileStructure));
    }
  }, [fileStructure, isLoggedIn, currentTeacher]);

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSignup = () => {
    if (!signupForm.email || !signupForm.password || !signupForm.confirmPassword) {
      alert('Please fill in all fields');
      return;
    }
    if (signupForm.password !== signupForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (teachers.some(t => t.email === signupForm.email)) {
      alert('Email already registered');
      return;
    }
    const newTeacher = { email: signupForm.email, password: signupForm.password };
    const updatedTeachers = [...teachers, newTeacher];
    setTeachers(updatedTeachers);
    localStorage.setItem('teachers-data', JSON.stringify(updatedTeachers));
    alert('Account created successfully! Please login.');
    setSignupForm({ email: '', password: '', confirmPassword: '' });
    setIsSignup(false);
  };

  const handleLogin = () => {
    if (!loginForm.email || !loginForm.password) {
      alert('Please fill in all fields');
      return;
    }

    if (userType === 'admin') {
      if (loginForm.email === ADMIN_EMAIL && loginForm.password === ADMIN_PASSWORD) {
        setIsLoggedIn(true);
        setLoginForm({ email: '', password: '' });
      } else {
        alert('Invalid admin credentials');
      }
    } else {
      const teacher = teachers.find(t => t.email === loginForm.email && t.password === loginForm.password);
      if (teacher) {
        setIsLoggedIn(true);
        setCurrentTeacher(teacher);
        setLoginForm({ email: '', password: '' });
      } else {
        alert('Invalid email or password');
      }
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentTeacher(null);
    setFileStructure({});
    setSelectedBranch(null);
    setSelectedSubject(null);
    setCurrentStudents([]);
    setShowTypeSelector(true);
    setUserType('teacher');
  };

  const calculateGrade = (marks, maxMarks) => {
    const percentage = (marks / maxMarks) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  };

  const calculatePercentage = (marks, maxMarks) => {
    return ((marks / maxMarks) * 100).toFixed(2);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addOrUpdateStudent = () => {
    if (!formData.name || !formData.rollNo || !formData.branch || !formData.subject || !formData.marksObtained || !formData.maxMarks) {
      alert('Please fill in all fields');
      return;
    }
    const marksNum = parseFloat(formData.marksObtained);
    const maxMarksNum = parseFloat(formData.maxMarks);
    if (marksNum < 0 || maxMarksNum < 0) {
      alert('Marks cannot be negative');
      return;
    }
    if (marksNum > maxMarksNum) {
      alert(`⚠️ Obtained marks (${marksNum}) cannot exceed maximum marks (${maxMarksNum}). Please correct the values.`);
      return;
    }
    const grade = calculateGrade(marksNum, maxMarksNum);
    const percentage = calculatePercentage(marksNum, maxMarksNum);
    const newStudent = {
      ...formData,
      id: editingId || Date.now(),
      grade,
      percentage,
      marksObtained: marksNum,
      maxMarks: maxMarksNum
    };
    const newStructure = { ...fileStructure };
    if (!newStructure[formData.branch]) {
      newStructure[formData.branch] = {};
    }
    if (!newStructure[formData.branch][formData.subject]) {
      newStructure[formData.branch][formData.subject] = [];
    }
    if (editingId) {
      const index = newStructure[formData.branch][formData.subject].findIndex(s => s.id === editingId);
      if (index !== -1) {
        newStructure[formData.branch][formData.subject][index] = newStudent;
      }
      setEditingId(null);
    } else {
      newStructure[formData.branch][formData.subject].push(newStudent);
    }
    setFileStructure(newStructure);
    if (selectedBranch === formData.branch && selectedSubject === formData.subject) {
      setCurrentStudents(newStructure[formData.branch][formData.subject]);
    }
    setFormData({ name: '', rollNo: '', branch: 'CSE', subject: '', marksObtained: '', maxMarks: '' });
  };

  const selectBranchAndSubject = (branch, subject) => {
    setSelectedBranch(branch);
    setSelectedSubject(subject);
    setCurrentStudents(fileStructure[branch][subject] || []);
    setEditingId(null);
    setFormData({ name: '', rollNo: '', branch: 'CSE', subject: '', marksObtained: '', maxMarks: '' });
  };

  const deleteStudent = (id) => {
    if (!selectedBranch || !selectedSubject) return;
    const newStructure = { ...fileStructure };
    newStructure[selectedBranch][selectedSubject] = newStructure[selectedBranch][selectedSubject].filter(s => s.id !== id);
    if (newStructure[selectedBranch][selectedSubject].length === 0) {
      delete newStructure[selectedBranch][selectedSubject];
    }
    if (Object.keys(newStructure[selectedBranch]).length === 0) {
      delete newStructure[selectedBranch];
    }
    setFileStructure(newStructure);
    setCurrentStudents(newStructure[selectedBranch][selectedSubject] || []);
  };

  const editStudent = (student) => {
    setFormData({
      name: student.name,
      rollNo: student.rollNo,
      branch: student.branch,
      subject: student.subject,
      marksObtained: student.marksObtained.toString(),
      maxMarks: student.maxMarks.toString()
    });
    setEditingId(student.id);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', rollNo: '', branch: 'CSE', subject: '', marksObtained: '', maxMarks: '' });
  };

  const generatePDF = () => {
    if (currentStudents.length === 0) {
      alert('No student records to download');
      return;
    }
    let htmlContent = `<!DOCTYPE html><html><head><title>Student Records</title><style>body{font-family:Arial,sans-serif;margin:40px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:20px}.container{background:white;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,0.3);overflow:hidden}.header{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:40px;text-align:center}.header h1{margin:0;font-size:32px;font-weight:700}.header p{margin:8px 0;font-size:14px;opacity:0.9}.content{padding:40px}table{width:100%;border-collapse:collapse;margin-top:20px}th{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:15px;text-align:left;font-weight:600}td{padding:12px 15px;border-bottom:1px solid #e0e0e0}tr:hover{background-color:#f5f5f5}.grade{font-weight:bold;font-size:16px;display:inline-block;padding:4px 12px;border-radius:20px}.grade-a{background:#d4edda;color:#155724}.grade-b{background:#d1ecf1;color:#0c5460}.grade-c{background:#fff3cd;color:#856404}.grade-f{background:#f8d7da;color:#721c24}.summary{margin-top:30px;padding:20px;background:linear-gradient(135deg,#667eea15 0%,#764ba215 100%);border-left:4px solid #667eea;border-radius:8px}.footer{text-align:center;margin-top:30px;color:#999;font-size:12px}</style></head><body><div class="container"><div class="header"><h1>📚 Academic Records Report</h1><p><strong>Subject:</strong> ${selectedSubject}</p><p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p></div><div class="content"><table><thead><tr><th>Student Name</th><th>Roll Number</th><th>Marks</th><th>Percentage</th><th>Grade</th></tr></thead><tbody>`;
    
    currentStudents.forEach(student => {
      let gradeClass = 'grade-f';
      if (student.grade === 'A+' || student.grade === 'A') gradeClass = 'grade-a';
      else if (student.grade === 'B+' || student.grade === 'B') gradeClass = 'grade-b';
      else if (student.grade === 'C') gradeClass = 'grade-c';
      htmlContent += `<tr><td>${student.name}</td><td>${student.rollNo}</td><td>${student.marksObtained}/${student.maxMarks}</td><td>${student.percentage}%</td><td><span class="grade ${gradeClass}">${student.grade}</span></td></tr>`;
    });
    
    const avgPercentage = (currentStudents.reduce((sum, s) => sum + parseFloat(s.percentage), 0) / currentStudents.length).toFixed(2);
    htmlContent += `</tbody></table><div class="summary"><strong>Summary:</strong><br>Total Students: ${currentStudents.length}<br>Average: ${avgPercentage}%</div><div class="footer"><p>Official Report - For Records Only</p></div></div></div></body></html>`;
    
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 250);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure? This action cannot be undone.')) {
      setFileStructure({});
      localStorage.removeItem(`file-structure-${currentTeacher.email}`);
      setSelectedBranch(null);
      setSelectedSubject(null);
      setCurrentStudents([]);
    }
  };

  const getGradeColor = (grade) => {
    if (grade === 'A+' || grade === 'A') return 'bg-gradient-to-r from-green-400 to-green-600 text-white';
    if (grade === 'B+' || grade === 'B') return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white';
    if (grade === 'C') return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    return 'bg-gradient-to-r from-red-400 to-red-600 text-white';
  };

  const filteredStudents = currentStudents.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStats = {
    total: filteredStudents.length,
    average: filteredStudents.length > 0 ? (filteredStudents.reduce((sum, s) => sum + parseFloat(s.percentage), 0) / filteredStudents.length).toFixed(2) : 0,
    passed: filteredStudents.filter(s => parseFloat(s.percentage) >= 40).length,
    failed: filteredStudents.filter(s => parseFloat(s.percentage) < 40).length
  };

  // Type Selector Screen
  if (!isLoggedIn && showTypeSelector) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
        </div>
        <div className="relative z-10 w-full max-w-2xl">
          <div className="text-center mb-12">
            <div className="text-7xl mb-4">📚</div>
            <h1 className="text-5xl font-bold text-white mb-2">Scholar</h1>
            <p className="text-white/80 text-lg">Student Record Management System</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button onClick={() => { setShowTypeSelector(false); setUserType('teacher'); }} className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 hover:shadow-3xl transition transform hover:scale-105">
              <div className="text-6xl mb-4">👨‍🏫</div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent mb-2">Teacher Login</h2>
              <p className="text-gray-600">Manage student records and grades</p>
            </button>

            <button onClick={() => { setShowTypeSelector(false); setUserType('admin'); }} className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 hover:shadow-3xl transition transform hover:scale-105">
              <div className="text-6xl mb-4">👨‍💼</div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">Admin Login</h2>
              <p className="text-gray-600">View all registered teachers</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
        </div>
        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">📚</div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent mb-2">Scholar</h1>
              <p className="text-gray-600">{userType === 'admin' ? 'Admin Portal' : 'Student Record System'}</p>
            </div>

            {!isSignup ? (
              <>
                <div className="space-y-4 mb-6">
                  <div className="relative">
                    <input type="email" name="email" placeholder={userType === 'admin' ? 'Admin Email' : 'Email Address'} value={loginForm.email} onChange={handleLoginChange} className="w-full px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 transition pl-12" />
                    <span className="absolute left-4 top-3.5 text-xl">✉️</span>
                  </div>
                  <div className="relative">
                    <input type="password" name="password" placeholder="Password" value={loginForm.password} onChange={handleLoginChange} className="w-full px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 transition pl-12" />
                    <span className="absolute left-4 top-3.5 text-xl">🔐</span>
                  </div>
                </div>
                <button onClick={handleLogin} className="w-full bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transition mb-4">{userType === 'admin' ? 'Admin Login' : 'Login Now'}</button>
                <button onClick={() => { setShowTypeSelector(true); setLoginForm({ email: '', password: '' }); }} className="w-full text-indigo-600 font-bold py-2 hover:underline">← Back</button>
                {userType === 'admin' && <p className="text-center text-gray-600 text-xs mt-4"><strong>Demo Admin:</strong><br/>Email: admin@scholar.com<br/>Password: admin123</p>}
                {userType !== 'admin' && <p className="text-center text-gray-600 mt-4">Don't have an account? <button onClick={() => setIsSignup(true)} className="text-indigo-600 font-bold hover:underline">Sign up</button></p>}
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold text-gray-700 mb-6">Create Account</h2>
                <div className="space-y-4 mb-6">
                  <div className="relative">
                    <input type="email" name="email" placeholder="Email" value={signupForm.email} onChange={handleSignupChange} className="w-full px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 transition pl-12" />
                    <span className="absolute left-4 top-3.5 text-xl">✉️</span>
                  </div>
                  <div className="relative">
                    <input type="password" name="password" placeholder="Password" value={signupForm.password} onChange={handleSignupChange} className="w-full px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 transition pl-12" />
                    <span className="absolute left-4 top-3.5 text-xl">🔐</span>
                  </div>
                  <div className="relative">
                    <input type="password" name="confirmPassword" placeholder="Confirm Password" value={signupForm.confirmPassword} onChange={handleSignupChange} className="w-full px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 transition pl-12" />
                    <span className="absolute left-4 top-3.5 text-xl">✓</span>
                  </div>
                </div>
                <button onClick={handleSignup} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transition mb-4">Create Account</button>
                <p className="text-center text-gray-600">Already have an account? <button onClick={() => setIsSignup(false)} className="text-indigo-600 font-bold hover:underline">Login</button></p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  if (userType === 'admin' && isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">👨‍💼 Admin Dashboard</h1>
              <p className="text-gray-400 mt-1">View all registered teachers and their records</p>
            </div>
            <button onClick={handleLogout} className="bg-gradient-to-r from-red-500 to-pink-600 hover:shadow-lg text-white font-bold py-3 px-8 rounded-xl transition">🚪 Logout</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 shadow-lg text-white">
              <div className="text-3xl mb-2">👨‍🏫</div>
              <div className="text-sm text-blue-200">Total Teachers</div>
              <div className="text-4xl font-bold">{teachers.length}</div>
            </div>
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 shadow-lg text-white">
              <div className="text-3xl mb-2">✅</div>
              <div className="text-sm text-green-200">Active Users</div>
              <div className="text-4xl font-bold">{teachers.length}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 shadow-lg text-white">
              <div className="text-3xl mb-2">📚</div>
              <div className="text-sm text-purple-200">System Status</div>
              <div className="text-4xl font-bold">✓ Online</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-8 py-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3"><span className="text-3xl">📋</span> Registered Teachers</h2>
            </div>

            {teachers.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">🎓</div>
                <p className="text-gray-400 text-lg">No teachers registered yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-800/50">
                      <th className="px-8 py-4 text-left text-white font-semibold">Teacher Email</th>
                      <th className="px-8 py-4 text-left text-white font-semibold">Status</th>
                      <th className="px-8 py-4 text-left text-white font-semibold">Join Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map((teacher, index) => (
                      <tr key={index} className="border-t border-gray-700 hover:bg-gray-700/50 transition">
                        <td className="px-8 py-6 text-white font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold">{teacher.email.charAt(0).toUpperCase()}</div>
                            {teacher.email}
                          </div>
                        </td>
                        <td className="px-8 py-6"><span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">🟢 Active</span></td>
                        <td className="px-8 py-6 text-gray-300">{new Date().toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Teacher Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">📚 Scholar</h1>
            <p className="text-gray-400 mt-1">Welcome, {currentTeacher.email}</p>
          </div>
          <button onClick={handleLogout} className="bg-gradient-to-r from-red-500 to-pink-600 hover:shadow-lg text-white font-bold py-3 px-8 rounded-xl transition">🚪 Logout</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 sticky top-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><span className="text-2xl">📁</span> File System</h2>
              {Object.keys(fileStructure).length === 0 ? (
                <p className="text-gray-400 text-sm">No data yet. Add students to create folders.</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {Object.keys(fileStructure).map(branch => (
                    <div key={branch} className="rounded-lg overflow-hidden border border-gray-700">
                      <div className="bg-gradient-to-r from-indigo-600/50 to-pink-600/50 px-3 py-2 font-semibold text-white text-sm">{branch}</div>
                      <div className="bg-gray-900/50 p-2 space-y-1">
                        {Object.keys(fileStructure[branch]).map(subject => {
                          const count = fileStructure[branch][subject].length;
                          const isSelected = selectedBranch === branch && selectedSubject === subject;
                          return (
                            <button key={subject} onClick={() => selectBranchAndSubject(branch, subject)} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${isSelected ? 'bg-gradient-to-r from-indigo-600 to-pink-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                              <span className="text-lg">📄</span> {subject} <span className="text-xs text-gray-400">({count})</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">{editingId ? '✏️ Edit Student' : '➕ Add New Student'}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <input type="text" name="name" placeholder="Student Name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
                <input type="text" name="rollNo" placeholder="Roll Number" value={formData.rollNo} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
                <select name="branch" value={formData.branch} onChange={handleInputChange} className="px-4 py-3 bg-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition">
                  {branches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <input type="text" name="subject" placeholder="Subject" value={formData.subject} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
                <input type="number" name="marksObtained" placeholder="Marks Obtained" value={formData.marksObtained} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
                <input type="number" name="maxMarks" placeholder="Max Marks" value={formData.maxMarks} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
              </div>
              <div className="flex gap-4 mt-6">
                <button onClick={addOrUpdateStudent} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg text-white font-bold py-3 px-8 rounded-xl transition">{editingId ? '💾 Update' : '➕ Add'}</button>
                {editingId && <button onClick={cancelEdit} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-xl transition">Cancel</button>}
              </div>
            </div>

            {selectedBranch && selectedSubject && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl p-6 shadow-lg text-white">
                  <div className="text-3xl mb-2">👥</div>
                  <div className="text-sm text-indigo-200">Total Students</div>
                  <div className="text-3xl font-bold">{totalStats.total}</div>
                </div>
                <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 shadow-lg text-white">
                  <div className="text-3xl mb-2">✅</div>
                  <div className="text-sm text-green-200">Passed</div>
                  <div className="text-3xl font-bold">{totalStats.passed}</div>
                </div>
                <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-6 shadow-lg text-white">
                  <div className="text-3xl mb-2">❌</div>
                  <div className="text-sm text-red-200">Failed</div>
                  <div className="text-3xl font-bold">{totalStats.failed}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 shadow-lg text-white">
                  <div className="text-3xl mb-2">📊</div>
                  <div className="text-sm text-purple-200">Avg %</div>
                  <div className="text-3xl font-bold">{totalStats.average}%</div>
                </div>
              </div>
            )}

            {selectedBranch && selectedSubject && (
              <input type="text" placeholder="🔍 Search by name or roll number..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full px-4 py-3 bg-gray-800 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition border border-gray-700" />
            )}

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 border border-gray-700">
              <div className="flex gap-3">
                <button onClick={generatePDF} disabled={currentStudents.length === 0} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition">📄 Download PDF</button>
                <button onClick={clearAllData} disabled={Object.keys(fileStructure).length === 0} className="bg-gradient-to-r from-red-600 to-red-700 hover:shadow-lg disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition">🗑️ Clear All</button>
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-12 text-center border border-gray-700">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-400 text-lg">Select a subject or add a new student.</p>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-indigo-600 to-pink-600">
                        <th className="px-6 py-4 text-left text-white font-semibold">Name</th>
                        <th className="px-6 py-4 text-left text-white font-semibold">Roll</th>
                        <th className="px-6 py-4 text-left text-white font-semibold">Marks</th>
                        <th className="px-6 py-4 text-left text-white font-semibold">%</th>
                        <th className="px-6 py-4 text-left text-white font-semibold">Grade</th>
                        <th className="px-6 py-4 text-center text-white font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student, index) => (
                        <tr key={student.id} className={`border-t border-gray-700 transition hover:bg-gray-700 ${index % 2 === 0 ? 'bg-gray-900/50' : 'bg-gray-800/30'}`}>
                          <td className="px-6 py-4 text-white font-medium">{student.name}</td>
                          <td className="px-6 py-4 text-gray-300">{student.rollNo}</td>
                          <td className="px-6 py-4 text-gray-300">{student.marksObtained}/{student.maxMarks}</td>
                          <td className="px-6 py-4 text-gray-300">{student.percentage}%</td>
                          <td className="px-6 py-4"><span className={`px-4 py-2 rounded-full text-sm font-bold ${getGradeColor(student.grade)}`}>{student.grade}</span></td>
                          <td className="px-6 py-4 text-center space-x-2">
                            <button onClick={() => editStudent(student)} className="text-indigo-400 hover:text-indigo-300 font-semibold transition">✏️</button>
                            <button onClick={() => deleteStudent(student.id)} className="text-red-400 hover:text-red-300 font-semibold transition">🗑️</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}