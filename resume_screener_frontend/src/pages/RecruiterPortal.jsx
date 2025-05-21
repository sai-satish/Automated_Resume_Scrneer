// import React, { useEffect, useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import 'bootstrap/dist/css/bootstrap.min.css';

// const RecruiterPortal = () => {
//   const navigate = useNavigate();
//   const [jobs, setJobs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   const handleLogout = () => {
//     alert('Logged out!');
//     navigate('/login');
//   };

//   useEffect(() => {
//     const fetchJobs = async () => {
//       try {
//         const response = await fetch('http://localhost:8000/recruiter/list-all-jobs/');
//         if (!response.ok) {
//           throw new Error('Failed to fetch jobs');
//         }
//         const data = await response.json();

//         // The response is an array, so directly set it
//         setJobs(data);
//       } catch (err) {
//         console.error(err);
//         setError('Error fetching jobs');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchJobs();
//   }, []);

//   return (
//     <div className="container py-5">
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <h2>Recruiter Dashboard</h2>
//         <div>
//           <button className="btn btn-outline-danger me-2" onClick={handleLogout}>
//             Logout
//           </button>
//           <Link to="/post-job" className="btn btn-primary">
//             Post New Job
//           </Link>
//         </div>
//       </div>

//       <h4>My Jobs</h4>
//       {loading ? (
//         <p>Loading...</p>
//       ) : error ? (
//         <p className="text-danger">{error}</p>
//       ) : jobs.length === 0 ? (
//         <p>No jobs posted yet.</p>
//       ) : (
//         <div className="list-group">
//           {jobs.map(job => (
//             <Link
//               key={job.id}
//               to={`/jobs/${job.id}`}
//               className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
//             >
//               <span>{job.title}</span>
//               <span>
//                 {job.is_active ? (
//                   <span className="badge bg-success">Active</span>
//                 ) : (
//                   <span className="badge bg-secondary">Inactive</span>
//                 )}
//               </span>
//             </Link>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default RecruiterPortal;

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const RecruiterPortal = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleLogout = () => {
    alert('Logged out!');
    navigate('/login');
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('http://localhost:8000/recruiter/list-all-jobs/');
        if (!response.ok) {
          throw new Error('Failed to fetch jobs');
        }
        const data = await response.json();
        setJobs(data);
      } catch (err) {
        console.error(err);
        setError('Error fetching jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12">
          {/* Header Section */}
          <div className="card bg-light border-0 shadow-sm mb-4">
            <div className="card-body py-4">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                <div className="mb-3 mb-md-0">
                  <h1 className="fw-bold text-primary mb-1">Recruiter Dashboard</h1>
                  <p className="text-muted mb-0">Manage your job postings and review applications</p>
                </div>
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-outline-danger d-flex align-items-center" 
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Logout
                  </button>
                  <Link 
                    to="/post-job" 
                    className="btn btn-primary d-flex align-items-center"
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Post New Job
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Jobs Section */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3 border-bottom">
              <h4 className="mb-0 fw-semibold">My Jobs</h4>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="d-flex justify-content-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              ) : jobs.length === 0 ? (
                <div className="alert alert-info" role="alert">
                  <i className="bi bi-info-circle me-2"></i>
                  You haven't posted any jobs yet. Click "Post New Job" to get started.
                </div>
              ) : (
                <div className="list-group">
                  {jobs.map(job => (
                    <Link
                      key={job.id}
                      to={`/jobs/${job.id}`}
                      className="list-group-item list-group-item-action d-flex flex-column flex-md-row justify-content-between align-items-md-center p-3 border-start-0 border-end-0"
                    >
                      <div className="d-flex flex-column mb-2 mb-md-0">
                        <h5 className="mb-1 fw-semibold">{job.title}</h5>
                        <small className="text-muted">ID: {job.id}</small>
                      </div>
                      <div className="d-flex align-items-center">
                        {job.is_active ? (
                          <span className="badge bg-success rounded-pill px-3 py-2">
                            <i className="bi bi-check-circle me-1"></i>Active
                          </span>
                        ) : (
                          <span className="badge bg-secondary rounded-pill px-3 py-2">
                            <i className="bi bi-dash-circle me-1"></i>Inactive
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Job Stats Summary - This could be expanded in the future */}
          {!loading && !error && jobs.length > 0 && (
            <div className="row mt-4">
              <div className="col-md-4 mb-3">
                <div className="card border-0 shadow-sm bg-primary text-white">
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-0">Total Jobs</h6>
                        <h2 className="mb-0">{jobs.length}</h2>
                      </div>
                      <div className="fs-1">
                        <i className="bi bi-briefcase"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4 mb-3">
                <div className="card border-0 shadow-sm bg-success text-white">
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-0">Active Jobs</h6>
                        <h2 className="mb-0">{jobs.filter(job => job.is_active).length}</h2>
                      </div>
                      <div className="fs-1">
                        <i className="bi bi-check-circle"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4 mb-3">
                <div className="card border-0 shadow-sm bg-secondary text-white">
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-0">Inactive Jobs</h6>
                        <h2 className="mb-0">{jobs.filter(job => !job.is_active).length}</h2>
                      </div>
                      <div className="fs-1">
                        <i className="bi bi-dash-circle"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruiterPortal;