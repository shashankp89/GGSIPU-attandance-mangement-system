import React from 'react';

const contacts = [
  {
    department: 'Vice Chancellor Office',
    officer: 'Prof. (Dr.) Mahesh Verma',
    title: 'Vice Chancellor',
    phone: '+91-11-25302104, +91-11-25302105',
    fax: '+91-11-28035243',
    email: 'vc@ipu.ac.in'
  },
  {
    department: 'Registrar Office',
    officer: 'Dr. Kamal Pathak',
    title: 'Registrar',
    phone: '+91-11-25302113, +91-11-25302114',
    fax: '+91-11-25302111',
    email: 'registrar@ipu.ac.in'
  },
  {
    department: 'Controller of Finance',
    officer: 'Sh. Surender Kumar',
    title: 'Controller of Finance',
    phone: '+91-11-25302197',
    fax: '',
    email: 'cof@ipu.ac.in'
  },
  {
    department: 'Examinations Branch (COE 1)',
    officer: 'Dr. Gulshan Kumar',
    title: 'COE 1',
    phone: '+91-11-25302252',
    fax: '',
    email: 'coe@ipu.ac.in'
  },
  {
    department: 'Centralized Career Guidance and Placement Cell',
    officer: 'Prof. Udayan Ghose',
    title: 'In-Charge',
    phone: '+91-11-25302739',
    fax: '',
    email: 'cpc@ipu.ac.in'
  },
  {
    department: 'University Library',
    officer: 'Prof. Shruti Aggarwal',
    title: 'In-Charge',
    phone: '+91-11-25302218, +91-11-25302219, +91-11-25302221',
    fax: '',
    email: ''
  }
];

const Contact = () => {
  return (
    <div className="min-h-screen bg-ggsipu-surface">
      <div className="container mx-auto p-8">
        <h2 className="text-3xl font-bold mb-4 text-ggsipu-navy">Contact Us</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-2 text-ggsipu-navy">University Office</h3>
            <p className="text-ggsipu-700">Guru Gobind Singh Indraprastha University<br/>(A State University established by the Government of NCT of Delhi)<br/>Sector - 16C, Dwarka, New Delhi - 110078 (India)</p>
            <p className="text-ggsipu-700 mt-2">Phone: +91-11-25302171<br/>Fax: +91-11-25302111</p>
            <p className="text-ggsipu-700">E-Mail Id: pro@ipu.ac.in</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-2 text-ggsipu-navy">24x7 Anti-Ragging Helpline</h3>
            <p className="text-ggsipu-700">Toll Free: 1800-180-5522<br/>E-Mail: helpline@antiragging.net</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow overflow-auto">
          <h3 className="font-semibold mb-3 text-ggsipu-navy">Department / Officer Directory</h3>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-ggsipu-navy">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Officer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Fax</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">E-mail</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contacts.map((c, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-ggsipu-surface'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ggsipu-navy font-medium">{c.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ggsipu-700">{c.officer}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ggsipu-700">{c.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ggsipu-700">{c.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ggsipu-700">{c.fax || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ggsipu-500 hover:text-ggsipu-700">{c.email ? <a href={`mailto:${c.email}`} className="hover:underline">{c.email}</a> : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-ggsipu-700">This is a curated excerpt. For the complete directory, visit the official IPU site.</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
