import React, { useState, useEffect, useContext } from "react";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
import { findUpper } from "../../../utils/Utils";
import { filterRole, filterStatus } from "./UserData";
import { errorToast, successToast, warningToast } from "../../../utils/toaster";
import {
  DropdownMenu,
  DropdownToggle,
  FormGroup,
  UncontrolledDropdown,
  Modal,
  ModalBody,
  DropdownItem,
  Form,
} from "reactstrap";
import {
  Block,
  BlockBetween,
  BlockDes,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Icon,
  Row,
  Col,
  UserAvatar,
  PaginationComponent,
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableItem,
  Button,
  RSelect,
  TooltipComponent,
} from "../../../components/Component";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { UserContext } from "./UserContext";
import { bulkActionOptions } from "../../../utils/Utils";
import axios from "axios";
import DataContext from "../../../utils/DataContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./pagination.css"

// Role options for Add/Edit user
const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "supervisor", label: "Supervisor" },
];

const UserListCompact = () => {
  const { contextData } = useContext(UserContext);
  const [data, setData] = useState([]);
  const { userData } = useContext(DataContext);
  const [sm, updateSm] = useState(false);
  const [tablesm, updateTableSm] = useState(false);
  const [onSearch, setonSearch] = useState(true);
  const [onSearchText, setSearchText] = useState("");
  const [originalData, setOriginalData] = useState([]);
  const [modal, setModal] = useState({
    edit: false,
    add: false,
  });
  const [editId, setEditedId] = useState();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    phone: "",
    status: "",
  });
  const [actionText, setActionText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(10);
  const [sort, setSortState] = useState("");

  useEffect(() => {
    if (data?.length === 0) {
      fetchUserData();
    }
  }, [data]);

  // fetch users list
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const sessionToken = localStorage.getItem("sessionToken");

      if (!token || !sessionToken) {
        console.log("User not authenticated");
        return;
      }

      const response = await axios.get(`${process.env.REACT_APP_BACKENDURL}/api/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "session-token": sessionToken,
        },
      });

      if (response.status === 201) {
        const users = response.data.data || [];

        const reversed = [...users].reverse();

        setOriginalData(reversed);
        setData(reversed);
      }
    } catch (err) {
      console.log("Fetch users error:", err);

      if (err.response) {
        if (err.response.status === 401) {
          console.log(err.response.data?.message || "Session expired. Please login again");

          // optional logout
          localStorage.removeItem("accessToken");
          localStorage.removeItem("sessionToken");

          window.location.href = "/login";
        }
      } else {
        console.log("Network error");
      }
    }
  };

  // Sorting data
  const sortFunc = (order) => {
    let sorted = [...data].sort((a, b) => {
      if (order === "asc") {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });

    setData(sorted);
    setSortState(order);
  };

  localStorage.setItem("isGridView", false);

  // Changing state value when searching name
  useEffect(() => {
    if (onSearchText !== "") {
      const filtered = originalData.filter(
        (item) =>
          item.name.toLowerCase().includes(onSearchText.toLowerCase()) ||
          item.email.toLowerCase().includes(onSearchText.toLowerCase()),
      );
      setData(filtered);
    } else {
      setData(originalData);
    }
  }, [onSearchText, originalData]);

  // onChange function for searching name
  const onFilterChange = (e) => {
    setSearchText(e.target.value);
  };

  // function to reset the form
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "",
      phone: "",
      status: "",
    });
  };

  // function to close the form modal
  const onFormCancel = () => {
    setModal({ edit: false, add: false });
    resetForm();
  };

  // submit function to add a new item
  const onFormSubmit = async (submitData) => {
    const { name, email, role, phone, status } = submitData;

    let submittedData = {
      name: name,
      role: formData.role,
      email: email,
      phone: phone,
      status: formData.status,
      password: phone,
      confirmPassword: phone,
      createdBy: userData._id,
    };

    try {
      const token = localStorage.getItem("accessToken");
      const sessionToken = localStorage.getItem("sessionToken");

      if (!token || !sessionToken) {
        console.log("User not authenticated");
        return;
      }

      const response = await axios.post(`${process.env.REACT_APP_BACKENDURL}/api/user/signup`, submittedData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "session-token": sessionToken,
        },
      });

      if (response.status === 201 || response.status === 200) {
        successToast("User Created Successfully");

        resetForm();
        setModal({ edit: false, add: false });
        fetchUserData();
      } else {
        warningToast();
      }
    } catch (err) {
      console.log("Create user error:", err);

      if (err.response) {
        if (err.response.status === 401) {
          console.log(err.response.data?.message || "Session expired. Please login again");

          localStorage.removeItem("accessToken");
          localStorage.removeItem("sessionToken");

          window.location.href = "/login";
        } else {
          successToast("User Created Successfully");

          resetForm();
          setModal({ edit: false, add: false });
          fetchUserData();
        }
      } else {
        console.log("Network error");
        errorToast("Network error. Please check your connection");
      }
    }
  };

  // submit function to update a new item
  const onEditSubmit = async (submitData) => {
    const { name, phone } = submitData;

    const submittedData = {
      name: name,
      role: formData.role,
      status: formData.status,
      phone: phone,
    };

    try {
      const token = localStorage.getItem("accessToken");
      const sessionToken = localStorage.getItem("sessionToken");

      if (!token || !sessionToken) {
        console.log("User not authenticated");
        return;
      }

      const response = await axios.put(`${process.env.REACT_APP_BACKENDURL}/api/user/${editId}`, submittedData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "session-token": sessionToken,
        },
      });

      if (response.status === 200) {
        successToast("Updated Successfully");

        setModal({ edit: false });

        fetchUserData();
      }
    } catch (err) {
      console.log("Update user error:", err);

      if (err.response) {
        if (err.response.status === 401) {
          console.log(err.response.data?.message || "Session expired. Please login again");

          localStorage.removeItem("accessToken");
          localStorage.removeItem("sessionToken");

          window.location.href = "/login";
        } else {
          errorToast(err.response.data?.message || "Something Went Wrong");
        }
      } else {
        console.log("Network error");
        errorToast("Network error. Please check your connection");
      }
    }
  };
  // function that loads the want to editted data
  const onEditClick = (id) => {
    data.forEach((item) => {
      if (item._id === id) {
        setFormData({
          name: item.name,
          email: item.email,
          status: item.status,
          phone: item.phone,
          role: item.role,
        });
        setModal({ edit: true }, { add: false });
        setEditedId(id);
      }
    });
  };

  // export
  const handleExport = () => {
    const cleanedData = data.map(({ password, createdBy, _v, ...rest }) => rest);

    const worksheet = XLSX.utils.json_to_sheet(cleanedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // Save file
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "export.xlsx");
  };

  // function which fires on applying selected action
  const onActionClick = (e) => {
    if (actionText === "suspend") {
      let newData = data.map((item) => {
        if (item.checked === true) item.status = "Suspend";
        return item;
      });
      setData([...newData]);
    } else if (actionText === "delete") {
      let newData;
      newData = data.filter((item) => item.checked !== true);
      setData([...newData]);
    }
  };

  // function to toggle the search option
  const toggle = () => setonSearch(!onSearch);

  const { errors, register, handleSubmit } = useForm();

  // Get current list, pagination
  const indexOfLastItem = currentPage * itemPerPage;
  const indexOfFirstItem = indexOfLastItem - itemPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  // Change Page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <React.Fragment>
      <Head title="User List - Compact"></Head>
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle tag="h3" page>
                Users Lists
              </BlockTitle>
              <BlockDes className="text-soft">
                <p>You have total {data?.length} users.</p>
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
                    <li>
                      <a
                        href="#export"
                        onClick={(ev) => {
                          ev.preventDefault();
                          handleExport();
                        }}
                        className="btn btn-white btn-outline-light"
                      >
                        <Icon name="download-cloud"></Icon>
                        <span>Export</span>
                      </a>
                    </li>
                    <li className="nk-block-tools-opt">
                      <Button
  className="btn-icon"
  style={{
    backgroundColor: "#644634",
    borderColor: "#800000",
    color: "#fff"
  }}
  onClick={() => setModal({ add: true })}
>
  <Icon name="plus" />
</Button>
                    </li>
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
                    <div className="btn-wrap">
                      <span className="d-md-none">
                        <Button
                          color="light"
                          outline
                          disabled={actionText !== "" ? false : true}
                          className="btn-dim  btn-icon"
                          onClick={(e) => onActionClick(e)}
                        >
                          <Icon name="arrow-left" size="sm" className="text-gray" />
                        </Button>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="card-tools mr-n1">
                  <ul className="btn-toolbar gx-1">
                    <li>
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
                    <li className="btn-toolbar-sep"></li>
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
                            <li>
                              <UncontrolledDropdown>
                                <DropdownToggle tag="a" className="btn btn-trigger btn-icon dropdown-toggle">
                                  <Icon name="setting"></Icon>
                                </DropdownToggle>
                                <DropdownMenu right className="dropdown-menu-xs">
                                  <ul className="link-check">
                                    <li>
                                      <span>Show</span>
                                    </li>
                                    <li className={itemPerPage === 10 ? "active" : ""}>
                                      <DropdownItem
                                        tag="a"
                                        href="#dropdownitem"
                                        onClick={(ev) => {
                                          ev.preventDefault();
                                          setItemPerPage(10);
                                        }}
                                      >
                                        10
                                      </DropdownItem>
                                    </li>
                                    <li className={itemPerPage === 15 ? "active" : ""}>
                                      <DropdownItem
                                        tag="a"
                                        href="#dropdownitem"
                                        onClick={(ev) => {
                                          ev.preventDefault();
                                          setItemPerPage(15);
                                        }}
                                      >
                                        15
                                      </DropdownItem>
                                    </li>
                                  </ul>
                                  <ul className="link-check">
                                    <li>
                                      <span>Order</span>
                                    </li>
                                    <li className={sort === "dsc" ? "active" : ""}>
                                      <DropdownItem
                                        tag="a"
                                        href="#dropdownitem"
                                        onClick={(ev) => {
                                          ev.preventDefault();
                                          setSortState("dsc");
                                          sortFunc("dsc");
                                        }}
                                      >
                                        DESC
                                      </DropdownItem>
                                    </li>
                                    <li className={sort === "asc" ? "active" : ""}>
                                      <DropdownItem
                                        tag="a"
                                        href="#dropdownitem"
                                        onClick={(ev) => {
                                          ev.preventDefault();
                                          setSortState("asc");
                                          sortFunc("asc");
                                        }}
                                      >
                                        ASC
                                      </DropdownItem>
                                    </li>
                                  </ul>
                                </DropdownMenu>
                              </UncontrolledDropdown>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              <div className={`card-search search-wrap ${!onSearch && "active"}`}>
                <div className="card-body">
                  <div className="search-content">
                    <Button
                      className="search-back btn-icon toggle-search active"
                      onClick={() => {
                        setSearchText("");
                        toggle();
                        fetchUserData();
                      }}
                    >
                      <Icon name="arrow-left"></Icon>
                    </Button>
                    <input
                      type="text"
                      className="border-transparent form-focus-none form-control"
                      placeholder="Search by user or email"
                      value={onSearchText}
                      onChange={(e) => onFilterChange(e)}
                    />
                    <Button className="search-submit btn-icon">
                      <Icon name="search"></Icon>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <DataTableBody compact>
              <DataTableHead>
                <DataTableRow className="nk-tb-col-check"></DataTableRow>
                <DataTableRow>
                  <span className="sub-text">User Name</span>
                </DataTableRow>
                <DataTableRow size="md">
                  <span className="sub-text">Role</span>
                </DataTableRow>
                <DataTableRow size="sm">
                  <span className="sub-text">Email</span>
                </DataTableRow>
                <DataTableRow size="md">
                  <span className="sub-text">Phone</span>
                </DataTableRow>
                <DataTableRow>
                  <span className="sub-text">Status</span>
                </DataTableRow>
                <DataTableRow className="nk-tb-col-tools text-right">
                  <span>More</span>
                </DataTableRow>
              </DataTableHead>
              {currentItems.length > 0
                ? currentItems.map((item) => {
                    return (
                      <DataTableItem key={item._id}>
                        <DataTableRow className="nk-tb-col-check"></DataTableRow>
                        <DataTableRow>
                          <div className="user-card">
                            <UserAvatar
                              theme={item.avatarBg}
                              className="xs"
                              text={findUpper(item.name)}
                              image={item.image}
                            ></UserAvatar>
                            <div className="user-info">
                              <span className="tb-lead">{item.name} </span>
                            </div>
                          </div>
                        </DataTableRow>
                        <DataTableRow size="md">
                          <span>{item.role?.charAt(0).toUpperCase() + item.role?.slice(1)}</span>
                        </DataTableRow>
                        <DataTableRow size="sm">
                          <span>{item.email}</span>
                        </DataTableRow>
                        <DataTableRow size="md">
                          <span>{item.phone}</span>
                        </DataTableRow>
                        <DataTableRow>
                         <span
                                className={`badge ${item.status === "active" ? "bg-success" : "bg-danger"}`}
                                style={{ padding: "4px 10px", color: "white", borderRadius: "14px" }}
                              >
                            {item.status === "active" ? "Active" : "Deactive"}
                          </span>
                        </DataTableRow>
                        <DataTableRow className="nk-tb-col-tools">
                          <ul className="nk-tb-actions gx-1">
                            <li>
                              <UncontrolledDropdown>
                                <DropdownToggle tag="a" className="dropdown-toggle btn btn-icon btn-trigger">
                                  <Icon name="more-h"></Icon>
                                </DropdownToggle>
                                <DropdownMenu right>
                                  <ul className="link-list-opt no-bdr">
                                    <li onClick={() => onEditClick(item._id)}>
                                      <DropdownItem
                                        tag="a"
                                        href="#edit"
                                        onClick={(ev) => {
                                          ev.preventDefault();
                                        }}
                                      >
                                        <Icon name="edit"></Icon>
                                        <span>Edit</span>
                                      </DropdownItem>
                                    </li>
                                  </ul>
                                </DropdownMenu>
                              </UncontrolledDropdown>
                            </li>
                          </ul>
                        </DataTableRow>
                      </DataTableItem>
                    );
                  })
                : null}
            </DataTableBody>
            <div className="card-inner">
              {currentItems.length > 0 ? (
                <PaginationComponent
                  itemPerPage={itemPerPage}
                  totalItems={data.length}
                  paginate={paginate}
                  currentPage={currentPage}
                />
              ) : (
                <div className="text-center">
                  <span className="text-silent">No data found</span>
                </div>
              )}
            </div>
          </DataTable>
        </Block>
        <Modal isOpen={modal.add} toggle={() => setModal({ add: false })} className="modal-dialog-centered" size="lg">
          <ModalBody>
            <a
              href="#cancel"
              onClick={(ev) => {
                ev.preventDefault();
                onFormCancel();
              }}
              className="close"
            >
              <Icon name="cross-sm"></Icon>
            </a>
            <div className="p-2">
              <h5 className="title">Add User</h5>
              <div className="mt-4">
                <Form className="row gy-4" onSubmit={handleSubmit(onFormSubmit)}>
                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">Name</label>
                      <input
                        className="form-control"
                        type="text"
                        name="name"
                        defaultValue={formData.name}
                        placeholder="Enter name"
                        onInput={(e) => {
                          e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                          if (e.target.value.length > 0) {
                            e.target.value = e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1);
                          }
                        }}
                        ref={register({
                          required: "This field is required",
                          pattern: {
                            value: /^[A-Za-z\s]+$/,
                            message: "Special characters are not allowed",
                          },
                        })}
                      />
                      {errors.name && <span className="invalid">{errors.name.message}</span>}
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">Email</label>
                      <input
                        className="form-control"
                        type="text"
                        name="email"
                        defaultValue={formData.email}
                        placeholder="Enter email"
                        ref={register({
                          required: "This field is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "invalid email address",
                          },
                        })}
                      />
                      {errors.email && <span className="invalid">{errors.email.message}</span>}
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">Phone</label>
                      <input
                        className="form-control"
                        type="tel"
                        name="phone"
                        placeholder="Enter phone"
                        defaultValue={formData.phone}
                        maxLength={10}
                        onInput={(e) => (e.target.value = e.target.value.replace(/\D/g, ""))}
                        ref={register({
                          required: "This field is required",
                          pattern: {
                            value: /^[0-9]{10}$/,
                            message: "Phone number must be exactly 10 digits",
                          },
                        })}
                      />
                      {errors.phone && <span className="invalid">{errors.phone.message}</span>}
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">Role</label>
                      <div className="form-control-wrap">
                        <RSelect
                          options={roleOptions}
                          onChange={(e) => {
                            setFormData({ ...formData, role: e.value });
                          }}
                        />
                      </div>
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">Status</label>
                      <div className="form-control-wrap">
                        <RSelect
                          options={filterStatus}
                          onChange={(e) => setFormData({ ...formData, status: e.value })}
                        />
                      </div>
                    </FormGroup>
                  </Col>
                  <Col size="12">
                    <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                      <li>
                        <Button  className="btn-icon"
  style={{
    backgroundColor: "#644634",
    borderColor: "#800000",
    color: "#fff",
    padding: "6px 20px"
  }}size="md" type="submit">
                          Add User
                        </Button>
                      </li>
                      <li>
                        <a
                          href="#cancel"
                          onClick={(ev) => {
                            ev.preventDefault();
                            onFormCancel();
                          }}
                          className="link link-light"
                        >
                          Cancel
                        </a>
                      </li>
                    </ul>
                  </Col>
                </Form>
              </div>
            </div>
          </ModalBody>
        </Modal>
        <Modal isOpen={modal.edit} toggle={() => setModal({ edit: false })} className="modal-dialog-centered" size="lg">
          <ModalBody>
            <a
              href="#cancel"
              onClick={(ev) => {
                ev.preventDefault();
                onFormCancel();
              }}
              className="close"
            >
              <Icon name="cross-sm"></Icon>
            </a>
            <div className="p-2">
              <h5 className="title">Update User</h5>
              <div className="mt-4">
                <Form className="row gy-4" onSubmit={handleSubmit(onEditSubmit)}>
                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">Name</label>
                      <input
                        className="form-control"
                        type="text"
                        name="name"
                        defaultValue={formData.name}
                        placeholder="Enter name"
                        ref={register({ required: "This field is required" })}
                      />
                      {errors.name && <span className="invalid">{errors.name.message}</span>}
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">Phone</label>
                      <input
                        className="form-control"
                        type="number"
                        placeholder="Enter phone"
                        name="phone"
                        defaultValue={Number(formData.phone)}
                        ref={register({ required: "This field is required" })}
                      />
                      {errors.phone && <span className="invalid">{errors.phone.message}</span>}
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">Role</label>
                      <div className="form-control-wrap">
                        <RSelect
                          options={roleOptions}
                          disabled
                          defaultValue={{
                            value: formData.role,
                            label:
                              formData.role === "admin"
                                ? "Admin"
                                : formData.role === "manager"
                                ? "Manager"
                                : formData.role === "supervisor"
                                ? "Supervisor"
                                : formData.role,
                          }}
                          onChange={(e) => setFormData({ ...formData, role: e.value })}
                        />
                      </div>
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <label className="form-label">Status</label>
                      <div className="form-control-wrap">
                        <RSelect
                          options={filterStatus}
                          defaultValue={{
                            value: formData.status,
                            label: formData.status === "active" ? "Active" : "Suspend",
                          }}
                          onChange={(e) => setFormData({ ...formData, status: e.value })}
                        />
                      </div>
                    </FormGroup>
                  </Col>
                  <Col size="12">
                    <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                      <li>
                        <Button className="btn-icon"
  style={{
    backgroundColor: "#644634",
    borderColor: "#800000",
    color: "#fff",
    padding: "6px 20px"
  }} size="md" type="submit">
                          Update User
                        </Button>
                      </li>
                      <li>
                        <a
                          href="#cancel"
                          onClick={(ev) => {
                            ev.preventDefault();
                            onFormCancel();
                          }}
                          className="link link-light"
                        >
                          Cancel
                        </a>
                      </li>
                    </ul>
                  </Col>
                </Form>
              </div>
            </div>
          </ModalBody>
        </Modal>
      </Content>
    </React.Fragment>
  );
};
export default UserListCompact;