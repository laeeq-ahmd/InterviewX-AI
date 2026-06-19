import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ServerUrl } from '../App';
import { FaHistory, FaCalendarAlt, FaBriefcase, FaArrowRight } from 'react-icons/fa';

function ResumeVersions() {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const response = await axios.get(`${ServerUrl}/api/resume/versions`, {
          withCredentials: true
        });
        setVersions(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load version history.");
      } finally {
        setLoading(false);
      }
    };
    fetchVersions();
  }, []);

  if (loading) {
    return <div className="py-12 text-center text-gray-500">Loading version history...</div>;
  }

  if (error) {
    return <div className="py-12 text-center text-red-500">{error}</div>;
  }

  if (versions.length === 0) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-4">
          <FaHistory size={24} />
        </div>
        <h3 className="text-xl font-semibold text-gray-700">No History Yet</h3>
        <p className="text-gray-500 mt-2 max-w-sm">
          Resumes you customize will appear here so you can track your tailored applications over time.
        </p>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center gap-3 mb-2'>
        <FaHistory className='text-gray-400' size={20} />
        <h2 className='text-xl font-bold text-gray-800'>Customization History</h2>
      </div>

      <div className='grid grid-cols-1 gap-4'>
        {versions.map((v) => (
          <div key={v._id} className='bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition flex flex-col sm:flex-row justify-between sm:items-center gap-4'>
            <div className='flex-1'>
              <div className='flex items-center gap-2 text-xs text-gray-500 font-medium mb-2'>
                <FaCalendarAlt />
                {new Date(v.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
              <div className='flex items-start gap-3'>
                <div className='mt-1 text-blue-500'>
                  <FaBriefcase />
                </div>
                <p className='text-sm text-gray-700 line-clamp-2'>
                  {v.jobDescription || "No job description provided"}
                </p>
              </div>
            </div>

            <div className='flex items-center gap-4 shrink-0 bg-gray-50 px-4 py-3 rounded-lg border border-gray-100'>
              <div className='text-center'>
                <p className='text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1'>Before</p>
                <p className='font-bold text-red-500'>{v.atsScoreBefore}%</p>
              </div>
              <FaArrowRight className='text-gray-300' />
              <div className='text-center'>
                <p className='text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1'>After</p>
                <p className='font-bold text-green-500'>{v.atsScoreAfter}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ResumeVersions;
