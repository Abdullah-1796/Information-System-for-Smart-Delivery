import React, { useState, useEffect } from 'react';

function AvailableLockers({ city, parcelDetails, onLockerSelect }) {
  const [lockers, setLockers] = useState([]);
  const [selectedLocker, setSelectedLocker] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAvailableLockers = async () => {
      if (city && parcelDetails?.trackingID) {
        setLoading(true);
        try {
          const response = await fetch(
            `http://localhost:4001/availableLockers?trackingID=${parcelDetails.trackingID}`
          );
          
          if (!response.ok) throw new Error('Failed to fetch lockers');
          
          const data = await response.json();
          setLockers(data.rows || []);
          setError('');
        } catch (err) {
          setError(err.message);
          setLockers([]);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAvailableLockers();
  }, [city, parcelDetails]);

  const handleLockerSelection = (e) => {
    const lockerId = e.target.value;
    setSelectedLocker(lockerId);
    onLockerSelect(lockerId); // Notify parent component
  };

  return (
    <div className="available-lockers">
      <h3>Available Lockers in {city}</h3>
      
      {loading && <p>Loading available lockers...</p>}
      {error && <p className="error">Error: {error}</p>}

      {lockers.length > 0 ? (
        <select 
          value={selectedLocker} 
          onChange={handleLockerSelection}
          disabled={loading || !city}
        >
          <option value="">Select a Delivery Box</option>
          {lockers.map((locker) => (
            <option key={locker.lockerid} value={locker.lockerid}>
              {locker.address} (Locker ID: {locker.lockerid})
            </option>
          ))}
        </select>
      ) : (
        !loading && <p>No available lockers found in this city</p>
      )}
    </div>
  );
}

export default AvailableLockers;