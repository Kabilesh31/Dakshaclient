import React, { useState, useEffect, useContext } from "react";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
import {
  Block,
  BlockBetween,
  BlockDes,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Icon,
  DataTable,
  Button,
} from "../../../components/Component";

import axios from "axios";
import { Modal, ModalBody } from "reactstrap";
import "./attendance.css";

const UserListCompact = () => {
  const [data, setData] = useState([]);
  const [sm, updateSm] = useState(false);
  const [tablesm, updateTableSm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(10);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [attendance, setAttendance] = useState({});
  const [selected, setSelected] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tempStatus, setTempStatus] = useState(null);
  const [permissionHour, setPermissionHour] = useState({});
  const [onSearch, setonSearch] = useState(true);
  const [onSearchText, setSearchText] = useState("");
  const [spinner, setSpinner] = useState(true);

  useEffect(() => {
    if (data?.length === 0) {
      fetchUserData();
    }
  }, [data]);
  localStorage.setItem("isGridView", false);

  // fetch users list
  const fetchUserData = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_BACKENDURL + "/api/staff");
      setData(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [month, year]);

  const fetchAttendance = async () => {
  try {
    const response = await axios.get(
      process.env.REACT_APP_BACKENDURL + "/api/attendance"
    );

    const attendanceArray = response.data;
    const structuredAttendance = {};

    attendanceArray.forEach((record) => {
      const recordDate = new Date(record.date);
      const year = recordDate.getFullYear();
      const monthIndex = recordDate.getMonth();
      const day = recordDate.getDate();
      const monthName = months[monthIndex];

      if (!structuredAttendance[year]) structuredAttendance[year] = {};
      if (!structuredAttendance[year][monthName])
        structuredAttendance[year][monthName] = {};
      if (!structuredAttendance[year][monthName][record.staffId])
        structuredAttendance[year][monthName][record.staffId] = {};

      // Decide status
      let status = "present";

      if (record.currentStatus === "checked-in") {
        status = "working";
      }

      structuredAttendance[year][monthName][record.staffId][day] = {
        status: status,
        hours: record.totalHours || null,
      };
    });

    setAttendance(structuredAttendance);
    setSpinner(false);
  } catch (err) {
    console.log(err);
  }
};


  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const daysInMonth = Array.from({ length: getDaysInMonth(month, year) }, (_, i) => i + 1);

  const openDialog = (id, day) => {
    setSelected({ id, day });
    setTempStatus(attendance[year]?.[months[month]]?.[id]?.[day] || null);
    setDialogOpen(true);
    setPermissionHour(attendance[year]?.[months[month]]?.[id]?.[`${day}_hours`] || "");
  };

  // const confirmAttendance = async () => {
  //   if (!selected) return;

  //   const attendanceData = {
  //     employeeId: selected.id,
  //     date: `${year}-${month + 1}-${selected.day}`,
  //     status: tempStatus,
  //     hours: tempStatus === "permission" ? permissionHour : null,
  //   };

  //   try {
  //     const response = await axios.post(`${process.env.REACT_APP_BACKENDURL}/api/attendance`, attendanceData);
  //     console.log("Attendance Saved:", response.data);

  //     // Update local state after successful save
  //     setAttendance((prev) => ({
  //       ...prev,
  //       [year]: {
  //         ...prev[year],
  //         [months[month]]: {
  //           ...prev[year]?.[months[month]],
  //           [selected.id]: {
  //             ...prev[year]?.[months[month]]?.[selected.id],
  //             [selected.day]: tempStatus,
  //             [`${selected.day}_hours`]: tempStatus === "permission" ? permissionHour : undefined,
  //           },
  //         },
  //       },
  //     }));

  //     setDialogOpen(false);
  //     setTempStatus(null);
  //     fetchAttendance();
  //     setPermissionHour("");
  //   } catch (error) {
  //     console.error("Error saving attendance:", error);
  //   }
  // };

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Filter Search
  const onFilterChange = (e) => {
    const searchText = e.target.value.toLowerCase();
    setSearchText(searchText);

    const filtered = data.filter(
      (user) => user.name.toLowerCase().includes(searchText) || user.name.toLowerCase().includes(searchText),
    );

    setData(filtered);
  };

  // Get current list, pagination
  const indexOfLastItem = currentPage * itemPerPage;
  const indexOfFirstItem = indexOfLastItem - itemPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  // Change Page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  // function to toggle the search option
  const toggle = () => setonSearch(!onSearch);

  return (
    <React.Fragment>
      <Head title="User List - Compact"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle tag="h3" page>
                Staff Attendance
              </BlockTitle>
              <BlockDes className="text-soft">
                <p>You have total {data?.length} Staffs.</p>
              </BlockDes>
            </BlockHeadContent>
            <BlockHeadContent>
              <div className="toggle-wrap nk-block-tools-toggle">
                <Button
                  className={`btn-icon btn-trigger toggle-expand mr-n1 ${sm ? "active" : ""}`}
                  onClick={() => updateSm(!sm)}
                >
                  <Icon name="menu-alt-r"></Icon>
                </Button>
                <div className="toggle-expand-content" style={{ display: sm ? "block" : "none" }}>
                  <ul className="nk-block-tools g-3">
                    {/* <li>
                      <a
                        href="#export"
                        onClick={(ev) => {
                          ev.preventDefault();
                        }}
                        className="btn btn-white btn-outline-light"
                      >
                        <Icon name="download-cloud"></Icon>
                        <span>Export</span>
                      </a>
                    </li> */}
                  </ul>
                </div>
              </div>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        <Block>
          <DataTable className="card-stretch">
            <div className="card-inner position-relative card-tools-toggle">
              <div className="card-title-group">
                <div className="card-tools">
                  <div className="form-inline flex-nowrap gx-3">
                    <div className="form-wrap"></div>
                  </div>
                </div>

                <div className="card-tools mr-n1">
                  <div className={`card-search search-wrap ${!onSearch && "active"}`}>
                    <div className="card-body">
                      <div className="search-content">
                        <Button
                          className="search-back btn-icon toggle-search active"
                          onClick={() => {
                            setSearchText("");
                            fetchUserData();
                            toggle();
                          }}
                        >
                          <Icon name="arrow-left"></Icon>
                        </Button>
                        <input
                          type="text"
                          className="border-transparent form-focus-none form-control"
                          placeholder="Search by Staff Name"
                          value={onSearchText}
                          onChange={(e) => onFilterChange(e)}
                        />
                        <Button className="search-submit btn-icon">
                          <Icon name="search"></Icon>
                        </Button>
                      </div>
                    </div>
                  </div>
                  <ul className="btn-toolbar gx-1">
                    <li className="mt-1">
                      <a
                        href="#search"
                        onClick={(ev) => {
                          ev.preventDefault();
                          toggle();
                        }}
                        className="btn btn-icon search-toggle toggle-search"
                      >
                        <Icon name="search"></Icon>
                      </a>
                    </li>
                    <li>
                      <select
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {months.map((m, index) => (
                          <option key={m} value={index} disabled={year === currentYear && index > currentMonth}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </li>
                    <li>
                      <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {years.map((y) => (
                          <option key={y} value={y} disabled={y > currentYear}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </li>
                    <li>
                      <div className="toggle-wrap">
                        <Button
                          className={`btn-icon btn-trigger toggle ${tablesm ? "active" : ""}`}
                          onClick={() => updateTableSm(true)}
                        >
                          <Icon name="menu-right"></Icon>
                        </Button>
                        <div className={`toggle-content ${tablesm ? "content-active" : ""}`}>
                          <ul className="btn-toolbar gx-1">
                            <li className="toggle-close">
                              <Button className="btn-icon btn-trigger toggle" onClick={() => updateTableSm(false)}>
                                <Icon name="arrow-left"></Icon>
                              </Button>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div style={{ padding: "16px", maxWidth: "100%", margin: "0 auto", overflowX: "auto" }}>
              <div style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "16px", overflowX: "auto" }}>
                <div
  style={{
    display: "flex",
    gap: "20px",
    marginBottom: "16px",
    alignItems: "center",
    flexWrap: "wrap",
  }}
>
  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
    <div style={{ width: "18px", height: "18px", backgroundColor: "#5DB996", borderRadius: "4px" }}></div>
    <span style={{ fontSize: "14px" }}>Completed Day (Checked-out)</span>
  </div>

  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
    <div style={{ width: "18px", height: "18px", backgroundColor: "#4F46E5", borderRadius: "4px" }}></div>
    <span style={{ fontSize: "14px" }}>Currently Working (Checked-in)</span>
  </div>

  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
    <div style={{ width: "18px", height: "18px", backgroundColor: "#ddd", borderRadius: "4px" }}></div>
    <span style={{ fontSize: "14px" }}>No Attendance (Absent)</span>
  </div>
</div>

                {spinner && (
                  <div
                    style={{ display: "flex", justifyContent: "center" }}
                    class="d-flex align-items-center mt-4 mb-4"
                  >
                    {" "}
                    <div class="spinner-border ms-auto" role="status" aria-hidden="true"></div>
                  </div>
                )}
                <table style={{ width: "100%", borderCollapse: "collapse", whiteSpace: "nowrap" }}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      {daysInMonth.map((day) => (
                        <th key={day}>{day}</th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {currentItems.map((emp) => (
                      <tr key={emp._id}>
                        <td>{emp.name}</td>
                        {daysInMonth.map((day) => {
                          const today = new Date();
                          const currentDay = today.getDate();
                          const currentMonth = today.getMonth();
                          const currentYear = today.getFullYear();

                          const isCurrentMonth = month === currentMonth && year === currentYear;
                          const isFutureDate = isCurrentMonth && day > currentDay;
                          const isPastMonth = month < currentMonth && year <= currentYear;
                          const isFutureMonth = month > currentMonth && year >= currentYear;

                          const status = attendance[year]?.[months[month]]?.[emp._id]?.[day]?.status;
                          const isLocked = status !== null && status !== undefined && day !== currentDay;

                          const shouldDisable = isFutureDate || isPastMonth || isFutureMonth || isLocked;

                          return (
                            <td key={day} style={{ textAlign: "center", position: "relative" }}>
                              <div
                                style={{
                                  cursor: shouldDisable ? "not-allowed" : "pointer",
                                  width: "24px",
                                  height: "24px",
                                  display: "flex",
                                  marginTop: "4px",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  borderRadius: "4px",
                                  backgroundColor:
  status === "present"
    ? "#5DB996"
    : status === "working"
    ? "#4F46E5"
    : "#ddd",

                                  color: status === "absent" ? "white" : "black",
                                  fontWeight: "bold",
                                  position: "relative",
                                  opacity: shouldDisable ? 2 : 1,
                                }}
                                onClick={() => {
                                  if (!shouldDisable) {
                                    openDialog(emp._id, day);
                                  }
                                }}
                              >
                                {status === "absent" ? "X" : ""}
                                {status !== null && status !== undefined && (
                                  <span className="tooltip">
                                    {status === "present"
                                      ? "Present"
                                      : status === "half"
                                        ? "Half Day"
                                        : status === "absent"
                                          ? "Absent"
                                          : status === "permission"
                                            ? `${attendance[year]?.[months[month]]?.[emp._id]?.[day]?.hours} hrs`
                                            : ""}
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Modal
                isOpen={dialogOpen}
                toggle={() => setDialogOpen(false)}
                className="modal-dialog-centered"
                size="sm"
              >
                <ModalBody>
                  <a
                    href="#cancel"
                    onClick={(ev) => {
                      ev.preventDefault();
                      setDialogOpen(false);
                      setTempStatus(null);
                    }}
                    className="close"
                  >
                    <Icon name="cross-sm"></Icon>
                  </a>
                  <div className="p-2">
                    <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "10px" }}>Mark Attendance</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <button
                        onClick={() => setTempStatus("present")}
                        style={{ backgroundColor: "#5DB996", padding: "10px", borderRadius: "4px", color: "white" }}
                      >
                        Full Day Present
                      </button>
                      <button
                        onClick={() => setTempStatus("half")}
                        style={{ backgroundColor: "#FFC145", padding: "8px", borderRadius: "4px", color: "white" }}
                      >
                        Half Day Present
                      </button>
                      <button
                        onClick={() => setTempStatus("absent")}
                        style={{ backgroundColor: "#EB5A3C", padding: "8px", borderRadius: "4px", color: "white" }}
                      >
                        Absent
                      </button>

                      <button
                        onClick={() => setTempStatus("permission")}
                        style={{ backgroundColor: "#D69ADE", padding: "10px", borderRadius: "4px", color: "white" }}
                      >
                        Permission
                      </button>

                      {tempStatus === "permission" && (
                        <input
                          type="number"
                          placeholder="Permission Hour"
                          value={permissionHour}
                          onChange={(e) => {
                            const hour = e.target.value;
                            setPermissionHour(hour);
                            if (hour > 2) {
                              setTempStatus("half");
                              setPermissionHour(null);
                            }
                          }}
                          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc", marginTop: "8px" }}
                        />
                      )}
                      <Button
                        color="primary"
                        className="btn-icon"
                        disabled={!tempStatus}
                       onClick={() => {}}
                        size="md"
                        style={{ marginTop: "40px", display: "flex", justifyContent: "center" }}
                      >
                        Confirm
                      </Button>
                    </div>
                  </div>
                </ModalBody>
              </Modal>
            </div>
          </DataTable>
        </Block>
      </Content>
    </React.Fragment>
  );
};
export default UserListCompact;
