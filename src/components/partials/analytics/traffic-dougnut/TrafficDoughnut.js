import React, { useMemo } from "react";
import { DoughnutExample } from "../../../Component";
import { useHistory } from "react-router-dom";

const TrafficDougnut = ({ selectedDays, selectedFromDate, selectedToDate, data }) => {
  const history = useHistory();

  const handleNavigate = () => {
    history.push("/reports");
  };

  // 🔹 Filter Data by props
  const filteredData = useMemo(() => {
    if (!data) return [];

    if (selectedDays === "All") return data;

    const now = new Date();

    if (selectedDays === "7 Days") {
      const startDate = new Date();
      startDate.setDate(now.getDate() - 7);
      return data.filter((order) => new Date(order.createdAt) >= startDate);
    }

    if (selectedDays === "30 Days") {
      const startDate = new Date();
      startDate.setDate(now.getDate() - 30);
      return data.filter((order) => new Date(order.createdAt) >= startDate);
    }

    if (selectedDays === "Custom" && selectedFromDate && selectedToDate) {
      const from = new Date(selectedFromDate);
      const to = new Date(selectedToDate);
      to.setHours(23, 59, 59, 999);
      return data.filter((order) => {
        const createdAt = new Date(order.createdAt);
        return createdAt >= from && createdAt <= to;
      });
    }

    return data;
  }, [selectedDays, selectedFromDate, selectedToDate, data]);

  // 🔹 Calculate Paid & Unpaid
  const totalOrders = filteredData.length;
  const paidOrders = filteredData.filter((order) => order.isPaid).length;
  const notPaidOrders = totalOrders - paidOrders;

  const paidPercentage = totalOrders ? ((paidOrders / totalOrders) * 100).toFixed(2) : "0";
  const notPaidPercentage = totalOrders ? ((notPaidOrders / totalOrders) * 100).toFixed(2) : "0";

  // 🔹 Chart data (with fallback when no data)
  const chartData =
    paidOrders === 0 && notPaidOrders === 0
      ? {
          labels: ["No Data"],
          datasets: [
            {
              data: [1],
              backgroundColor: ["#e0e0e0"], // grey placeholder
              hoverBackgroundColor: ["#bdbdbd"],
            },
          ],
        }
      : {
          labels: ["Paid", "Not Paid"],
          datasets: [
            {
              data: [paidOrders, notPaidOrders],
              backgroundColor: ["#78B9B5", "#FF7D7D"],
              hoverBackgroundColor: ["#66a7a3", "#e06666"],
            },
          ],
        };

  return (
    <React.Fragment>
      {/* <div className="card-title-group">
        <div className="card-title card-title-sm">
          <h6 className="title">Billing Reports</h6>
        </div>
      </div> */}

      <div className="traffic-channel">
        <div className="traffic-channel-doughnut-ck">
          <DoughnutExample data={chartData} />
        </div>

        

        <div style={{ marginTop: "10px" }}>
          <h6 className="title">Your Total Reports – {totalOrders}</h6>
        </div>
      </div>
    </React.Fragment>
  );
};

export default TrafficDougnut;