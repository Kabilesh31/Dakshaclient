import React, { useEffect, useState } from "react";
import { Icon, TooltipComponent } from "../../../Component";
import { ActiveUserBarChart } from "../../charts/analytics/AnalyticsCharts";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";



const ActiveUser = ({ data, type, currentYearCutomers, currentMonthCustomers, currentWeekCustomers }) => {

  const [monthlyData, setMonthlyData] = useState(new Array(12).fill(0));
  const [weeklyData, setWeeklyData] = useState(new Array(7).fill(0));
  const [barData, setBarData] = useState([])
  const [traffic, setTraffic] = useState("Year");
  const year = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ]
  const week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  const [days, setDays] = useState([]);
  const [lables, setLables] = useState(year)


  useEffect(() => {
    if (traffic === "Year" && currentYearCutomers && currentYearCutomers.length > 0) {
      setMonthlyData(getMonthlyDataCount(currentYearCutomers));
    }
  }, [currentYearCutomers]);

  useEffect(() => {
    if (traffic === "Month" && currentMonthCustomers && currentYearCutomers.length > 0) {
      setMonthlyData(generateDateValues(currentMonthCustomers));
    }
  }, [currentYearCutomers]);

  useEffect(() => {
    if (traffic === "Week" && currentWeekCustomers && currentWeekCustomers.length > 0) {
      setWeeklyData(getWeekDaysDataCount(currentWeekCustomers));
    }
  }, [currentYearCutomers]);

  useEffect(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); 
    const currentYear = currentDate.getFullYear();

    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();

    const daysArray = Array.from({ length: lastDay }, (_, index) => (index + 1).toString().padStart(2, '0'));

    setDays(daysArray);
  }, []);


  function getMonthlyDataCount(dataArray) {
    const yearData = new Array(12).fill(0);
    const currentYear = new Date().getFullYear();

    dataArray.forEach(data => {
      const createdAt = new Date(data.createdAt);
      if (createdAt.getFullYear() === currentYear) {
        const monthIndex = createdAt.getMonth();
        yearData[monthIndex]++;
      }
    });

    return yearData;
  }


  const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();

const generateDateValues = (customers) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // JavaScript months are 0-indexed
  const totalDays = getDaysInMonth(year, month);

  // Initialize an array with 0s for each day
  const dateValues = Array(totalDays).fill(0);

  customers.forEach(({ createdAt }) => {
    const date = new Date(createdAt);
    if (date.getFullYear() === year && date.getMonth() + 1 === month) {
      const day = date.getDate();
      dateValues[day - 1]++; // Increment count for the day
    }
  });

  return dateValues;
};


function getMonthDaysDataCount(dataArray) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0 for Jan, 1 for Feb, etc.

  // Get the number of days in the current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate(); 

  // Initialize an array with the number of days in the month, all set to 0
  const monthDaysData = new Array(daysInMonth).fill(0);

  dataArray.forEach(data => {
      const createdAt = new Date(data.createdAt);
      if (createdAt.getFullYear() === currentYear && createdAt.getMonth() === currentMonth) {
          const dayIndex = createdAt.getDate() - 1; // getDate() returns 1-31, adjust index
          monthDaysData[dayIndex]++;
      }
  });

  return monthDaysData;
}


function getWeekDaysDataCount(dataArray) {
  const today = new Date();
  
  const currentDate = today.getDate();
  const currentDayOfWeek = today.getDay(); 

  // Adjust so that Monday is the first day (ISO Week)
  const weekStart = new Date(today);
  weekStart.setDate(currentDate - (currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1)); // Move back to Monday
  weekStart.setHours(0, 0, 0, 0); // Set time to start of the day

  
  const weekDaysData = new Array(7).fill(0);

  dataArray.forEach(data => {
      const createdAt = new Date(data.createdAt);
      if (createdAt >= weekStart && createdAt <= today) {
          let dayIndex = createdAt.getDay(); // 0 (Sunday) to 6 (Saturday)
          
          // Convert Sunday (0) to the last index (6), shift others
          dayIndex = dayIndex === 0 ? 6 : dayIndex - 1;

          weekDaysData[dayIndex]++;
      }
  });

  return weekDaysData;
}




  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() + (6 - now.getDay())); // End of week (Saturday)
  endOfWeek.setHours(23, 59, 59, 999);

  // Filter counts
  const yearly = data.filter((item) => new Date(item.createdAt).getFullYear() === currentYear).length;
  const monthly = data.filter((item) => {
    const itemDate = new Date(item.createdAt);
    return itemDate.getFullYear() === currentYear && itemDate.getMonth() === currentMonth;
  }).length;
  const weekly = data.filter((item) => {
    const itemDate = new Date(item.createdAt);
    return itemDate >= startOfWeek && itemDate <= endOfWeek;
  }).length;

  useEffect(() => {
    if (traffic === "Month") {
      setLables(days);

    } else if (traffic === "Week"){
      setLables(week);
    }
    else {
      setLables(year)
    }
  }, [traffic]);


  useEffect(() => {
    if (traffic === "Month") {
      setBarData(getMonthDaysDataCount(currentMonthCustomers))

    } else if (traffic === "Week"){
      setBarData(getWeekDaysDataCount(currentWeekCustomers))
    }
    else {
      setBarData(monthlyData)
    }
  }, [currentYearCutomers, currentMonthCustomers, currentWeekCustomers, traffic]);
  

   const analyticAuData = {
    labels: lables,
    dataUnit: "People",
    datasets: [
      {
        label: "Active Users Analytics",
        color: "#9d72ff",
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        backgroundColor: "#FF7D7D",
        data: barData,
      },
    ],
  };

  return (
    <React.Fragment>
      <div className="card-title-group align-start pb-3 g-2">
        <div className="card-title card-title-sm">
          <h6 className="title">{type ? `Customers : ${data?.length}` : "Inactive Customers"}</h6>
        </div>
        
        <UncontrolledDropdown>
          <DropdownToggle className="dropdown-toggle dropdown-indicator btn btn-sm btn-outline-light btn-white">
           This {traffic} 
          </DropdownToggle>
          <DropdownMenu right className="dropdown-menu-xs">
            <ul className="link-list-opt no-bdr">
              {["Year", "Month", "Week"].map((val) => (
                <li key={val} className={traffic === val ? "active" : ""}>
                  <DropdownItem
                    href="#dropdownitem"
                    onClick={(e) => {
                      e.preventDefault();
                      setTraffic(val);
                    }}
                  >
                    <span>This {val} </span>
                  </DropdownItem>
                </li>
              ))}
            </ul>
          </DropdownMenu>
        </UncontrolledDropdown>
        
        {/* <div className="card-tools">
          <TooltipComponent
            iconClass=""
            icon="filter"
            direction="left"
            id="Tooltip-users"
            text="Filter"
          />
        </div> */}
        {/* <h5 className="title">Total {data.length}</h5> */}
      </div>

      <div className="analytic-au">
        <div className="analytic-data-group analytic-au-group g-3">
          <div className="analytic-data analytic-au-data">
            <div className="title">This Year</div>
            <div className="amount">{yearly}</div>
            {/* <div className="change up">
              <Icon name="arrow-long-up" />
              4.63%
            </div> */}
          </div>
          <div className="analytic-data analytic-au-data">
            <div className="title">This Month</div>
            <div className="amount">{monthly}</div>
            {/* <div className="change down">
              <Icon name="arrow-long-down" />
              1.92%
            </div> */}
          </div>
          <div className="analytic-data analytic-au-data">
            <div className="title">This Week</div>
            <div className="amount">{weekly}</div>
            {/* <div className="change up">
              <Icon name="arrow-long-up" />
              3.45%
            </div> */}
          </div>
        </div>
        <div className="analytic-au-ck">
          <ActiveUserBarChart
            traffic={traffic}
            type={type}
            customerData={analyticAuData}
          />
        </div>
        <div className="chart-label-group">
          <div className="chart-label">{traffic === "Year" ? currentYear : traffic === "Month" ? "01" : "Monday"}</div>
          <div className="chart-label">{traffic === "Year" ? null : traffic === "Month" ? days.length : "Sunday"}</div>
        </div>
        <div className=" card-title-sm mt-3">
          {/* <h6 className="title">Total Cutomers : </h6> */}
        </div>
      </div>
    </React.Fragment>
  );
};

export default ActiveUser;