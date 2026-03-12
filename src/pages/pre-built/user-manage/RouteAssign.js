import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Icon } from "../../../components/Component";

const RouteAssign = () => {
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const sessionToken = localStorage.getItem("sessionToken");

      if (!token || !sessionToken) {
        console.log("User not authenticated");
        setRoutes([]);
        return;
      }

      const res = await axios.get(`${process.env.REACT_APP_BACKENDURL}/api/routes`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "session-token": sessionToken,
        },
      });

      if (res.status === 200) {
        setRoutes(res.data?.data || []);
      }
    } catch (err) {
      console.error("ROUTES FETCH ERROR 👉", err);

      if (err.response) {
        if (err.response.status === 401) {
          console.log(err.response.data?.message || "Session expired. Please login again");

          localStorage.removeItem("accessToken");
          localStorage.removeItem("sessionToken");

          window.location.href = "/login";
        }
      }

      setRoutes([]);
    }
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
