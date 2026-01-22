// DeliveryProgress.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const DeliveryProgress = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const res = await axios.get(
      `${process.env.REACT_APP_BACKENDURL}/api/route-assign?date=${today}`
    );
    setData(res.data);
  };

  return (
    <>
      <h5 className="mb-3">Delivery Progress</h5>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>Staff</th>
            <th>Route</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item._id}>
              <td>{item.staffId}</td>
              <td>{item.routeId?.routeName}</td>
              <td>
                <span
                  className={`badge bg-${
                    item.status === "COMPLETED" ? "success" : "warning"
                  }`}
                >
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default DeliveryProgress;
