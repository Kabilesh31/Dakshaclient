// components/BrandAssign.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment,
  Tooltip,
  Badge,
  Stack,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Edit as EditIcon,
  Store as StoreIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Assignment as AssignmentIcon,
  FilterList as FilterIcon,
  Save as SaveIcon,
  Clear as ClearIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import axios from "axios";

const BrandChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  "& .MuiChip-label": {
    fontWeight: 500,
  },
}));

const BrandAssign = ({ salesStaff, onStaffUpdate }) => {
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [brandSearchTerm, setBrandSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filterStatus, setFilterStatus] = useState("all");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [availableBrands, setAvailableBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localStaff, setLocalStaff] = useState(salesStaff || []);

  // Update local staff when props change
  useEffect(() => {
    setLocalStaff(salesStaff || []);
  }, [salesStaff]);

  const fetchBrandList = async () => {
    const token = localStorage.getItem("accessToken");
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKENDURL}/api/product/brands`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        const brands = response.data.data;
        setAvailableBrands(brands);
      }
    } catch (err) {
      console.log(err);
      setSnackbar({
        open: true,
        message: "Error fetching brands",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrandList();
  }, []);
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);
  // Handle assign button click
  const handleAssignClick = (staff) => {
    setSelectedStaff(staff);
    setSelectedBrands(staff.assignedBrands || []);
    setOpenAssignDialog(true);
  };

  // Handle brand selection
  const handleBrandToggle = (brand) => {
    setSelectedBrands((prev) => (prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]));
  };

  // Save assignments to backend
  const handleSaveAssignments = async () => {
    if (!selectedStaff) return;

    setSaving(true);
    const token = localStorage.getItem("accessToken");

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKENDURL}/api/staff/${selectedStaff._id}/assign-brands`,
        { assignedBrands: selectedBrands },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 200) {
        // Update local staff data
        const updatedStaff = localStaff.map((staff) =>
          staff._id === selectedStaff._id ? { ...staff, assignedBrands: selectedBrands } : staff,
        );

        setLocalStaff(updatedStaff);

        // Notify parent component if callback provided
        if (onStaffUpdate) {
          onStaffUpdate(updatedStaff);
        }

        setOpenAssignDialog(false);

        setSnackbar({
          open: true,
          message: `Brands assigned to ${selectedStaff.name} successfully!`,
          severity: "success",
        });
      }
    } catch (err) {
      console.error("Error saving assignments:", err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Error saving assignments",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle remove brand from staff
  const handleRemoveBrand = async (staffId, brandToRemove) => {
    const token = localStorage.getItem("accessToken");

    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_BACKENDURL}/api/staff/${staffId}/brands/${encodeURIComponent(brandToRemove)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 200) {
        // Update local staff data
        const updatedStaff = localStaff.map((staff) =>
          staff._id === staffId
            ? { ...staff, assignedBrands: staff.assignedBrands.filter((b) => b !== brandToRemove) }
            : staff,
        );

        setLocalStaff(updatedStaff);

        if (onStaffUpdate) {
          onStaffUpdate(updatedStaff);
        }

        setSnackbar({
          open: true,
          message: `Brand "${brandToRemove}" removed successfully!`,
          severity: "success",
        });
      }
    } catch (err) {
      console.error("Error removing brand:", err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Error removing brand",
        severity: "error",
      });
    }
  };

  // Filter staff based on search and status
  const filteredStaff = localStaff.filter((staff) => {
    const matchesSearch =
      (staff.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (staff.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (staff.staffCode?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (staff.assignedBrands || []).some((brand) => (brand || "").toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = filterStatus === "all" || staff.staffStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Filter brands based on search
  const filteredBrands = availableBrands.filter((brand) =>
    brand?.toLowerCase().includes(brandSearchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);

  const paginatedStaff = filteredStaff.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <Box sx={{ p: 0, bgcolor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Search and Filter Bar */}
      <Paper sx={{ p: 2, mb: 2, display: "flex", gap: 2, alignItems: "center" }}>
        <TextField
          size="small"
          placeholder="Search staff or brands..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1 }}
        />

        {/* <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            label="Status"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl> */}

        {/* <Tooltip title="Refresh brands">
          <IconButton onClick={fetchBrandList} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip> */}
      </Paper>

      {/* Staff Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#f8f9fa" }}>
            <TableRow>
              <TableCell>Staff Member</TableCell>
              <TableCell>Assigned Brands</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStaff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="textSecondary">
                    No staff members found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedStaff.map((staff) => (
                <TableRow key={staff._id} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar src={staff.img} alt={staff.name}>
                        {!staff.img && <PersonIcon />}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {staff.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Staff Code - {staff.staffCode}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 0.5 }}>
                      {staff.assignedBrands?.length > 0 ? (
                        staff.assignedBrands.map((brand, index) => (
                          <Tooltip key={index}>
                            <BrandChip label={brand} size="small" color="primary" variant="outlined" />
                          </Tooltip>
                        ))
                      ) : (
                        <Typography variant="caption" color="textSecondary">
                          No brands assigned
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Assign or Remove Brands">
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<AssignmentIcon />}
                        onClick={() => handleAssignClick(staff)}
                        disabled={loading}
                        sx={{ bgcolor: "#9929EA", "&:hover": { bgcolor: "#7e22ce" } }}
                      >
                        Manage
                      </Button>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ p: 2 }}>
        <div className="card-inner">
          <div className="d-flex justify-content-center align-items-center">
            {/* Previous */}
            <button
              className="btn btn-icon btn-sm btn-outline-light mx-1"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              style={{ borderRadius: "6px" }}
            >
              <em className="icon ni ni-chevron-left"></em>
            </button>

            {/* Page Numbers */}
            {[...Array(totalPages)].map((_, index) => {
              const pageNumber = index + 1;

              if (pageNumber === currentPage || pageNumber === currentPage - 1 || pageNumber === currentPage + 1) {
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`btn btn-sm mx-1 ${currentPage === pageNumber ? "btn-primary" : "btn-outline-light"}`}
                    style={{
                      minWidth: "36px",
                      borderRadius: "6px",
                      fontWeight: 500,
                    }}
                  >
                    {pageNumber}
                  </button>
                );
              }
              return null;
            })}

            {/* Next */}
            <button
              className="btn btn-icon btn-sm btn-outline-light mx-1"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              style={{ borderRadius: "6px" }}
            >
              <em className="icon ni ni-chevron-right"></em>
            </button>
          </div>
        </div>
      </Box>
      {/* Brand Assignment Dialog */}
      <Dialog open={openAssignDialog} onClose={() => !saving && setOpenAssignDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ borderBottom: "1px solid #e0e0e0", pb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Assign Brands to Staff
              </Typography>
              {selectedStaff && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                  <Avatar src={selectedStaff.img} sx={{ width: 30, height: 30 }}>
                    <PersonIcon fontSize="small" />
                  </Avatar>
                  <Typography variant="subtitle2">
                    {selectedStaff.name} - {selectedStaff.staffCode}
                  </Typography>
                </Box>
              )}
            </Box>
            <IconButton onClick={() => !saving && setOpenAssignDialog(false)} disabled={saving}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search brands..."
              value={brandSearchTerm}
              onChange={(e) => setBrandSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              disabled={saving}
            />
          </Box>

          {/* Selected Brands Preview */}
          {selectedBrands?.length > 0 && (
            <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: "#f8f9fa" }}>
              <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: "block" }}>
                Currently Selected ({selectedBrands.length}):
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {selectedBrands.map((brand, index) => (
                  <Chip
                    key={index}
                    label={brand}
                    size="small"
                    onDelete={() => !saving && handleBrandToggle(brand)}
                    deleteIcon={<CloseIcon />}
                    color="primary"
                    disabled={saving}
                  />
                ))}
              </Box>
            </Paper>
          )}

          {/* Brands List */}
          <Typography variant="subtitle2" gutterBottom>
            Available Brands ({filteredBrands.length})
          </Typography>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List sx={{ maxHeight: 300, overflow: "auto", border: "1px solid #e0e0e0", borderRadius: 1 }}>
              {filteredBrands.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No brands found" secondary="Try adjusting your search" />
                </ListItem>
              ) : (
                filteredBrands.map((brand, index) => (
                  <ListItem
                    key={index}
                    dense
                    button
                    onClick={() => !saving && handleBrandToggle(brand)}
                    disabled={saving}
                    sx={{
                      "&:hover": { bgcolor: "#f5f5f5" },
                      borderBottom: index < filteredBrands.length - 1 ? "1px solid #f0f0f0" : "none",
                      opacity: saving ? 0.7 : 1,
                    }}
                  >
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={selectedBrands?.includes(brand)}
                        tabIndex={-1}
                        disableRipple
                        disabled={saving}
                      />
                    </ListItemIcon>
                    <ListItemText primary={brand} />
                  </ListItem>
                ))
              )}
            </List>
          )}
        </DialogContent>

        <DialogActions sx={{ borderTop: "1px solid #e0e0e0", p: 2 }}>
          <Button onClick={() => setOpenAssignDialog(false)} variant="outlined" disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveAssignments}
            variant="contained"
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={saving || !selectedStaff}
            sx={{ bgcolor: "#9929EA", "&:hover": { bgcolor: "#7e22ce" } }}
          >
            {saving ? "Saving..." : "Save Assignments"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BrandAssign;
