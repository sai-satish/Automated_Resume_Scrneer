// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import 'bootstrap/dist/css/bootstrap.min.css';

// const ViewApplications = () => {
//   const { jobId } = useParams();

//   const [job, setJob] = useState(null);
//   const [resumes, setResumes] = useState({ good_fit: [], others: [], raw: [] });
//   const [isActive, setIsActive] = useState(true);
//   const [filter, setFilter] = useState('all');
//   const [sortOrder, setSortOrder] = useState('desc');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const fetchJobDetails = async () => {
//       try {
//         const response = await fetch(`http://localhost:8000/recruiter/job/${jobId}/applications/`);
//         if (!response.ok) throw new Error('Failed to fetch job/application data');
//         const data = await response.json();

//         setJob(data.metadata);
//         setResumes(data.resumes);
//         setIsActive(data.metadata.is_active);
//       } catch (err) {
//         console.error(err);
//         setError('Error loading applications.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchJobDetails();
//   }, [jobId]);

//   const getFilteredAndSorted = () => {
//     let list = [];
//     if (filter === 'good') list = resumes.good_fit;
//     else if (filter === 'others') list = resumes.others;
//     else list = [...resumes.good_fit, ...resumes.others];

//     return list.sort((a, b) => sortOrder === 'desc' ? b.score - a.score : a.score - b.score);
//   };

//   const toggleActiveStatus = async () => {
//     try {
//       const newStatus = !isActive;
//       const response = await fetch(`http://localhost:8000/recruiter/job/${jobId}/`, {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ is_active: newStatus }),
//       });

//       if (!response.ok) throw new Error('Failed to update job status');

//       setIsActive(newStatus);
//     } catch (err) {
//       console.error(err);
//       alert('Failed to update job status.');
//     }
//   };

//   if (loading) return <div className="container my-5"><p>Loading...</p></div>;
//   if (error) return <div className="container my-5"><p className="text-danger">{error}</p></div>;

//   return (
//     <div className="container my-5">
//       <div className="card shadow-sm p-4">
//         <div className="d-flex justify-content-between align-items-center mb-3">
//           <h3>{job.title}</h3>
//           <button
//             className={`btn ${isActive ? 'btn-danger' : 'btn-success'}`}
//             onClick={toggleActiveStatus}
//           >
//             {isActive ? 'Stop Accepting Applications' : 'Accept Applications'}
//           </button>
//         </div>

//         <div className="mb-4">
//           <strong>Description:</strong>
//           <p className="mt-2">{job.job_description}</p>
//           <p>
//             <strong>Status:</strong>{' '}
//             <span className={`badge ${isActive ? 'bg-success' : 'bg-secondary'}`}>
//               {isActive ? 'Active' : 'Inactive'}
//             </span>
//           </p>
//         </div>

//         <div className="d-flex gap-3 mb-4 flex-wrap">
//           <select
//             className="form-select w-auto"
//             value={filter}
//             onChange={(e) => setFilter(e.target.value)}
//             aria-label="Filter resumes"
//           >
//             <option value="all">All Resumes</option>
//             <option value="good">Good Fit Only</option>
//             <option value="others">Other Resumes</option>
//           </select>

//           <select
//             className="form-select w-auto"
//             value={sortOrder}
//             onChange={(e) => setSortOrder(e.target.value)}
//             aria-label="Sort resumes"
//           >
//             <option value="desc">Sort by Score: High → Low</option>
//             <option value="asc">Sort by Score: Low → High</option>
//           </select>
//         </div>

//         <div className="table-responsive">
//           <table className="table table-bordered table-striped table-hover align-middle">
//             <thead className="table-light">
//               <tr>
//                 <th>Resume Filename</th>
//                 <th>Relevance Score</th>
//               </tr>
//             </thead>
//             <tbody>
//               {getFilteredAndSorted().map((resume, index) => (
//                 <tr key={index}>
//                   <td>{resume.filename}</td>
//                   <td>{resume.score}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         <h5 className="mt-5 mb-3">Raw Resumes (Unprocessed)</h5>
//         <ul className="list-group w-50">
//           {resumes.raw.map((r, i) => (
//             <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
//               {r}
//               <span className="badge bg-secondary rounded-pill">Raw</span>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default ViewApplications;

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const ViewApplications = () => {
  const { jobId } = useParams();

  const [job, setJob] = useState(null);
  const [resumes, setResumes] = useState({ good_fit: [], others: [], raw: [] });
  const [isActive, setIsActive] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8000/recruiter/job/${jobId}/applications/`);
        if (!response.ok) throw new Error('Failed to fetch job/application data');
        const data = await response.json();

        setJob(data.metadata);
        setResumes(data.resumes);
        setIsActive(data.metadata.is_active);
      } catch (err) {
        console.error(err);
        setError('Error loading applications.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  const getFilteredAndSorted = () => {
    let list = [];
    if (filter === 'good') list = resumes.good_fit;
    else if (filter === 'others') list = resumes.others;
    else list = [...resumes.good_fit, ...resumes.others];

    return list.sort((a, b) => sortOrder === 'desc' ? b.score - a.score : a.score - b.score);
  };

  const toggleActiveStatus = async () => {
    try {
      const newStatus = !isActive;
      const response = await fetch(`http://localhost:8000/recruiter/job/${jobId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update job status');

      setIsActive(newStatus);
    } catch (err) {
      console.error(err);
      alert('Failed to update job status.');
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading application data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          <div>{error}</div>
        </div>
        <Link to="/recruiter" className="btn btn-outline-primary mt-3">
          <i className="bi bi-arrow-left me-2"></i>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const filteredResumes = getFilteredAndSorted();
  const goodFitCount = resumes.good_fit.length;
  const othersCount = resumes.others.length;
  const rawCount = resumes.raw.length;
  const totalCount = goodFitCount + othersCount + rawCount;

  return (
    <div className="container py-5">
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/recruiter" className="text-decoration-none">Dashboard</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">Job Applications</li>
        </ol>
      </nav>

      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        {/* Job Header */}
        <div className="card-header bg-primary text-white p-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
            <div className="mb-3 mb-md-0">
              <h2 className="mb-1">{job.title}</h2>
              <p className="mb-0">Job ID: {jobId}</p>
            </div>
            <button
              className={`btn ${isActive ? 'btn-outline-light' : 'btn-light text-primary'}`}
              onClick={toggleActiveStatus}
            >
              <i className={`bi ${isActive ? 'bi-pause-circle' : 'bi-play-circle'} me-2`}></i>
              {isActive ? 'Stop Accepting Applications' : 'Accept Applications'}
            </button>
          </div>
        </div>

        <div className="card-body p-4">
          {/* Job Description */}
          <div className="mb-4">
            <h5 className="card-title fw-bold mb-3">Job Description</h5>
            <div className="p-3 bg-light rounded mb-3">
              {job.job_description ? (
                <p className="mb-0">{job.job_description}</p>
              ) : (
                <p className="text-muted mb-0">No description available</p>
              )}
            </div>
            <div className="d-flex align-items-center">
              <span className="me-2">Status:</span>
              <span className={`badge ${isActive ? 'bg-success' : 'bg-secondary'} rounded-pill px-3 py-2`}>
                <i className={`bi ${isActive ? 'bi-check-circle' : 'bi-x-circle'} me-1`}></i>
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Application Stats */}
          <div className="row mb-4">
            <div className="col-md-3 col-sm-6 mb-3 mb-md-0">
              <div className="card border-0 bg-primary bg-opacity-10 h-100">
                <div className="card-body text-center">
                  <h3 className="mb-0">{totalCount}</h3>
                  <p className="card-text text-muted">Total Applications</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6 mb-3 mb-md-0">
              <div className="card border-0 bg-success bg-opacity-10 h-100">
                <div className="card-body text-center">
                  <h3 className="mb-0">{goodFitCount}</h3>
                  <p className="card-text text-muted">Good Fit</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6 mb-3 mb-md-0">
              <div className="card border-0 bg-warning bg-opacity-10 h-100">
                <div className="card-body text-center">
                  <h3 className="mb-0">{othersCount}</h3>
                  <p className="card-text text-muted">Others</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="card border-0 bg-secondary bg-opacity-10 h-100">
                <div className="card-body text-center">
                  <h3 className="mb-0">{rawCount}</h3>
                  <p className="card-text text-muted">Unprocessed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="card mb-4 border-0 bg-light">
            <div className="card-body">
              <h5 className="card-title fw-bold mb-3">Filter & Sort</h5>
              <div className="d-flex flex-column flex-md-row gap-3">
                <div className="flex-grow-1">
                  <label className="form-label mb-1">Show Applications</label>
                  <select
                    className="form-select"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    aria-label="Filter resumes"
                  >
                    <option value="all">All Resumes</option>
                    <option value="good">Good Fit Only ({goodFitCount})</option>
                    <option value="others">Other Resumes ({othersCount})</option>
                  </select>
                </div>
                <div className="flex-grow-1">
                  <label className="form-label mb-1">Sort By</label>
                  <select
                    className="form-select"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    aria-label="Sort resumes"
                  >
                    <option value="desc">Score: High → Low</option>
                    <option value="asc">Score: Low → High</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Processed Applications Table */}
          <h5 className="card-title fw-bold mb-3">Processed Applications</h5>
          {filteredResumes.length > 0 ? (
            <div className="table-responsive mb-4">
              <table className="table table-bordered table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th scope="col" className="text-center" style={{ width: "60px" }}>#</th>
                    <th scope="col">Resume Filename</th>
                    <th scope="col" className="text-center" style={{ width: "120px" }}>Score</th>
                    <th scope="col" className="text-center" style={{ width: "120px" }}>Category</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResumes.map((resume, index) => {
                    const isGoodFit = resumes.good_fit.some(r => r.filename === resume.filename);
                    return (
                      <tr key={index}>
                        <td className="text-center">{index + 1}</td>
                        <td>
                          <i className="bi bi-file-earmark-text me-2 text-secondary"></i>
                          {resume.filename}
                        </td>
                        <td className="text-center fw-bold">
                          <span className={`badge ${resume.score > 70 ? 'bg-success' : resume.score > 50 ? 'bg-warning text-dark' : 'bg-danger'}`}>
                            {resume.score}
                          </span>
                        </td>
                        <td className="text-center">
                          {isGoodFit ? (
                            <span className="badge bg-success rounded-pill px-3">Good Fit</span>
                          ) : (
                            <span className="badge bg-warning text-dark rounded-pill px-3">Other</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="alert alert-info mb-4">
              <i className="bi bi-info-circle me-2"></i>
              No processed applications match your current filter.
            </div>
          )}

          {/* Raw Applications */}
          <h5 className="card-title fw-bold mb-3">Unprocessed Applications</h5>
          {resumes.raw.length > 0 ? (
            <div className="card mb-0 border">
              <ul className="list-group list-group-flush">
                {resumes.raw.map((filename, index) => (
                  <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <i className="bi bi-file-earmark me-2 text-secondary"></i>
                      {filename}
                    </div>
                    <span className="badge bg-secondary rounded-pill px-3">Pending</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              No unprocessed applications at this time.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewApplications;