import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Icon } from "../../../components/Component";

const RouteAssign = () => {
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    const res = await axios.get(`${process.env.REACT_APP_BACKENDURL}/api/routes`);
    setRoutes(res.data.data);
  };

  return (
    <>
      <h5 className="mb-3">Route Assignment</h5>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Route</th>
            <th>Customers</th>
            <th>Assign</th>
          </tr>
        </thead>
        <tbody>
          {routes.map((route) => (
            <tr key={route._id}>
              <td>{route.routeName}</td>
              <td>{route.customerCount}</td>
              <td>
                <Button size="sm" color="primary">
                  Assign
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default RouteAssign;
