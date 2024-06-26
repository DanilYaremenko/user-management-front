import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Alert,
  Snackbar,
  Button,
  Container,
  TextField,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Input,
} from "@mui/material";

const App = () => {
  const [token, setToken] = useState(null);
  const [positions, setPositions] = useState([]);
  const [users, setUsers] = useState([]);
  const [userById, setUserById] = useState(null);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    fetchToken();
    fetchPositions();
    fetchUsers(1, 6);
  }, []);

  const fetchToken = async () => {
    try {
      const response = await axios.get("/token");
      setToken(response.data.token);
    } catch (err) {
      handleError(err, "Error fetching token");
    }
  };

  const handleGenerateToken = () => {
    fetchToken();
  };

  const fetchPositions = async () => {
    try {
      const response = await axios.get("/positions");
      setPositions(response.data);
    } catch (err) {
      handleError(err, "Error fetching positions");
    }
  };

  const handleFetchPositions = () => {
    fetchPositions();
  };

  const fetchUsers = async (page, count) => {
    try {
      const response = await axios.get("/users", {
        params: { page, count },
      });
      if (page === 1) {
        setUsers(response.data.users);
      } else {
        setUsers((prevUsers) => [
          ...prevUsers,
          ...response.data.users,
        ]);
      }
    } catch (err) {
      handleError(err, "Error fetching users");
    }
  };

  const fetchUserById = async (id) => {
    try {
      const response = await axios.get(`/users/${id}`);
      setUserById(response.data.user);
    } catch (err) {
      handleError(err, "Error fetching user by ID");
    }
  };

  const handleShowMore = () => {
    const nextPage = page + 1;
    fetchUsers(nextPage, 6);
    setPage(nextPage);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const token = formData.get("token");
    formData.delete("token");

    try {
      const response = await axios.post(
        "/users",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            token,
          },
        }
      );
      alert(`User added: ${response.data.message}`);
      fetchUsers(1, 6);
      setPage(1);
    } catch (err) {
      handleError(err, "Error adding user");
    }
  };

  const handleError = (err, context) => {
    const errorMessage = `
      ${context}:
      ${err.message}
      ${err.response?.status} - ${err.response?.statusText}
      ${
        err.response?.data
          ? JSON.stringify(err.response.data, null, 2)
          : ""
      }
    `;
    setError(errorMessage);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleFileChange = (event) => {
    setFileName(event.target.files[0].name);
  };

  const handleFetchUserById = (event) => {
    event.preventDefault();
    const userId = event.target.elements.userId.value;
    fetchUserById(userId);
  };

  return (
    <Container>
      <Typography variant="h3" gutterBottom>
        API Data
      </Typography>
      <Button
        variant="contained"
        onClick={handleGenerateToken}
      >
        Generate Token
      </Button>
      <Box my={2}>
        <Typography variant="h5">Token</Typography>
        {token && (
          <Box sx={{ maxWidth: "100%", overflowX: "auto" }}>
            <pre>{JSON.stringify(token, null, 2)}</pre>
          </Box>
        )}
      </Box>
      <Box my={2}>
        <Typography variant="h5">Positions</Typography>
        <Button
          variant="contained"
          onClick={handleFetchPositions}
        >
          Get Positions
        </Button>
        {positions.success && positions.positions && (
          <Box sx={{ maxWidth: "100%", overflowX: "auto" }}>
            <pre>
              {JSON.stringify(positions.positions, null, 2)}
            </pre>
          </Box>
        )}
      </Box>
      <Box my={2}>
        <Typography variant="h5">Users</Typography>
        {users.length > 0 && (
          <div>
            <List>
              {users.map((user) => (
                <ListItem key={user.id}>
                  <ListItemText
                    primary={
                      <pre>
                        {JSON.stringify(user, null, 2)}
                      </pre>
                    }
                  />
                </ListItem>
              ))}
            </List>
            <Button
              variant="contained"
              onClick={handleShowMore}
            >
              Show more
            </Button>
          </div>
        )}
      </Box>
      <Box my={2}>
        <Typography variant="h5">Get User by ID</Typography>
        <form onSubmit={handleFetchUserById}>
          <Box my={2}>
            <TextField
              label="User ID"
              name="userId"
              fullWidth
            />
          </Box>
          <Button variant="contained" type="submit">
            Fetch User
          </Button>
        </form>
        {userById && (
          <Box mt={2}>
            <Typography variant="h6">
              User Details
            </Typography>
            <pre>{JSON.stringify(userById, null, 2)}</pre>
          </Box>
        )}
      </Box>
      <Box my={2}>
        <Typography variant="h5">Add New User</Typography>
        <form onSubmit={handleFormSubmit}>
          <Box my={2}>
            <TextField label="Name" name="name" fullWidth />
          </Box>
          <Box my={2}>
            <TextField
              label="Email"
              name="email"
              fullWidth
            />
          </Box>
          <Box my={2}>
            <TextField
              label="Phone"
              name="phone"
              fullWidth
            />
          </Box>
          <Box my={2}>
            <TextField
              label="Position ID"
              name="position_id"
              fullWidth
            />
          </Box>
          <Box my={2}>
            <TextField
              label="Token"
              name="token"
              fullWidth
            />
          </Box>
          <Box my={2}>
            <Input
              accept="image/*"
              id="photo"
              type="file"
              name="photo"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <label htmlFor="photo">
              <Button variant="contained" component="span">
                Upload Photo
              </Button>
            </label>
            {fileName && (
              <Typography>{fileName}</Typography>
            )}
          </Box>
          <Button variant="contained" type="submit">
            Add User
          </Button>
        </form>
      </Box>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert
          onClose={handleClose}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default App;
