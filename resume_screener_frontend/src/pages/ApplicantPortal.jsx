// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import 'bootstrap/dist/css/bootstrap.min.css';

// const ApplicantPortal = () => {
//   const [availableJobs, setAvailableJobs] = useState([]);
//   const [previousApplications, setPreviousApplications] = useState([]);
//   const [resumeFiles, setResumeFiles] = useState({});

//   useEffect(() => {
//     axios.get('http://localhost:8000/applicant/', { withCredentials: true })
//       .then(res => {
//         console.log(res.data)
//         // console.log(res.body)
//         setAvailableJobs(res.data.available_jobs || []);
//         setPreviousApplications(res.data.previous_applications || []);
//       })
//       .catch(err => {
//         console.error("Error fetching applicant data:", err);
//       });
//   }, []);

//   const handleFileChange = (jobId, file) => {
//     setResumeFiles(prev => ({ ...prev, [jobId]: file }));
//   };


//   const handleApply = async (jobId) => {
//   const formData = new FormData();
//   formData.append('file', resumeFiles[jobId]);
//   formData.append('job_id', jobId);  // ✅ send job_id exactly

//   try {
//     await axios.post('http://localhost:8000/applicant/apply/', formData, {
//       withCredentials: true,
//       headers: { 'Content-Type': 'multipart/form-data' },
//     });
//     alert("Application submitted successfully!");
//   } catch (err) {
//     alert("Application failed!");
//     console.error(err);
//   }
// };

  
//   return (
//     <div className="container py-5">
//       <h2 className="mb-4">Available Jobs</h2>
//       <div className="row g-4">
//         {availableJobs.map(job => (
//           <div className="col-md-6" key={job.id}>
//             <div className="card shadow-sm">
//               <div className="card-body">
//                 <h5 className="card-title">{job.title}</h5>
//                 <p className="card-text">Job ID: {job.id}</p>
//                 <input
//                   type="file"
//                   className="form-control mb-2"
//                   onChange={e => handleFileChange(job.id, e.target.files[0])}
//                 />
//                 <button
//                   className="btn btn-primary w-100"
//                   onClick={() => handleApply(job.id)}
//                 >
//                   Apply
//                 </button>
//               </div>
//             </div>
//           </div>
//         ))}
//         {availableJobs.length === 0 && (
//           <div className="text-muted">No active jobs available.</div>
//         )}
//       </div>

//       <hr className="my-5" />

//       <h3 className="mb-3">My Applications</h3>
//       <div className="table-responsive">
//         <table className="table table-bordered">
//           <thead className="table-light">
//             <tr>
//               <th>Job Title</th>
//               <th>Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {previousApplications.length > 0 ? (
//               previousApplications.map((app, idx) => (
//                 <tr key={idx}>
//                   <td>{app.job_id}</td>
//                   <td>
//                     <span className={`badge ${
//                       app.fit_status === 'good_fit' ? 'bg-success'
//                         : app.fit_status === 'others' ? 'bg-danger'
//                         : 'bg-warning text-dark'
//                     }`}>
//                       {app.fit_status.replace('_', ' ')}
//                     </span>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="2" className="text-center text-muted">No applications yet.</td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default ApplicantPortal;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const ApplicantPortal = () => {
  const [availableJobs, setAvailableJobs] = useState([]);
  const [previousApplications, setPreviousApplications] = useState([]);
  const [resumeFiles, setResumeFiles] = useState({});

  useEffect(() => {
    axios.get('http://localhost:8000/applicant/', { withCredentials: true })
      .then(res => {
        console.log(res.data)
        setAvailableJobs(res.data.available_jobs || []);
        setPreviousApplications(res.data.previous_applications || []);
      })
      .catch(err => {
        console.error("Error fetching applicant data:", err);
      });
  }, []);

  const handleFileChange = (jobId, file) => {
    setResumeFiles(prev => ({ ...prev, [jobId]: file }));
  };

  const handleApply = async (jobId) => {
    const formData = new FormData();
    formData.append('file', resumeFiles[jobId]);
    formData.append('job_id', jobId);

    try {
      await axios.post('http://localhost:8000/applicant/apply/', formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert("Application submitted successfully!");
    } catch (err) {
      alert("Application failed!");
      console.error(err);
    }
  };
  
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'good_fit': return 'bg-success';
      case 'others': return 'bg-danger';
      default: return 'bg-warning text-dark';
    }
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4 text-primary">Available Jobs</h2>
      
      {availableJobs.length === 0 ? (
        <div className="alert alert-info">No active jobs available.</div>
      ) : (
        <div className="row g-4">
          {availableJobs.map(job => (
            <div className="col-md-6 col-lg-4" key={job.id}>
              <div className="card h-100 shadow-sm border-0 rounded-3">
                <div className="card-header bg-light py-3">
                  <h5 className="card-title mb-0">{job.title}</h5>
                </div>
                <div className="card-body">
                  <p className="card-text mb-3">
                    <span className="text-muted">Job ID:</span> {job.id}
                  </p>
                  <div className="mb-3">
                    <label htmlFor={`resume-${job.id}`} className="form-label">
                      Upload Resume
                    </label>
                    <input
                      id={`resume-${job.id}`}
                      type="file"
                      className="form-control"
                      onChange={e => handleFileChange(job.id, e.target.files[0])}
                    />
                  </div>
                </div>
                <div className="card-footer bg-white border-top-0">
                  <button
                    className="btn btn-primary w-100"
                    disabled={!resumeFiles[job.id]}
                    onClick={() => handleApply(job.id)}
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <hr className="my-5" />

      <h3 className="mb-4 text-primary">My Applications</h3>
      
      {previousApplications.length === 0 ? (
        <div className="alert alert-info">You haven't submitted any applications yet.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover table-striped border">
            <thead className="table-light">
              <tr>
                <th scope="col" className="px-4 py-3">Job Title</th>
                <th scope="col" className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {previousApplications.map((app, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3">{app.job_id}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${getStatusBadgeClass(app.fit_status)}`}>
                      {app.fit_status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ApplicantPortal;
