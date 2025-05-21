export const mockJobData = {
  job_id: '12345',
  metadata: {
    job_description: 'Looking for a fullstack developer with React and Azure experience.',
    rankings: {
      'resume1.pdf': 87,
      'resume2.pdf': 92,
      'resume3.pdf': 40,
      'resume4.pdf': 60,
    }
  },
  resumes: {
    raw: ['resume5.pdf'],
    good_fit: [
      { filename: 'resume1.pdf', score: 87 },
      { filename: 'resume2.pdf', score: 92 }
    ],
    others: [
      { filename: 'resume3.pdf', score: 40 },
      { filename: 'resume4.pdf', score: 60 }
    ]
  }
};
