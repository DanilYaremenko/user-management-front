import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import axios from "axios";

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

  const api = axios.create({
    baseURL:
      "https://user-management-api-cvmt.onrender.com",
  });

  const fetchToken = useCallback(async () => {
    try {
      const response = await api.get("/token");
      setToken(response.data.token);
    } catch (err) {
      handleError(err, "Error fetching token");
    }
  }, []);

  const handleGenerateToken = useCallback(() => {
    fetchToken();
  }, [fetchToken]);

  const fetchPositions = useCallback(async () => {
    try {
      const response = await api.get("/positions");
      setPositions(response.data);
    } catch (err) {
      handleError(err, "Error fetching positions");
    }
  }, []);

  const handleFetchPositions = useCallback(() => {
    fetchPositions();
  }, [fetchPositions]);

  const fetchUsers = useCallback(async (page, count) => {
    try {
      const response = await api.get("/users", {
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
  }, []);

  const fetchUserById = useCallback(async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      setUserById(response.data.user);
    } catch (err) {
      handleError(err, "Error fetching user by ID");
    }
  }, []);

  const handleShowMore = useCallback(() => {
    const nextPage = page + 1;
    fetchUsers(nextPage, 6);
    setPage(nextPage);
  }, [fetchUsers, page]);

  const handleFormSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      const formData = new FormData(event.target);
      const token = formData.get("token");
      formData.delete("token");

      try {
        const response = await api.post(
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
    },
    [fetchUsers]
  );

  const handleError = useCallback((err, context) => {
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
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleFileChange = useCallback((event) => {
    setFileName(event.target.files[0].name);
  }, []);

  const handleFetchUserById = useCallback(
    (event) => {
      event.preventDefault();
      const userId = event.target.elements.userId.value;
      fetchUserById(userId);
    },
    [fetchUserById]
  );

  const userList = useMemo(
    () =>
      users.map((user) => (
        <li key={user.id}>
          <pre>{JSON.stringify(user, null, 2)}</pre>
        </li>
      )),
    [users]
  );

  return (
    <div style={{ padding: "20px" }}>
      <h1>API Data</h1>
      <button onClick={handleGenerateToken}>
        Generate Token
      </button>
      <div style={{ margin: "20px 0" }}>
        <h2>Token</h2>
        {token && (
          <div
            style={{ maxWidth: "100%", overflowX: "auto" }}
          >
            <pre>{JSON.stringify(token, null, 2)}</pre>
          </div>
        )}
      </div>
      <div style={{ margin: "20px 0" }}>
        <h2>Positions</h2>
        <button onClick={handleFetchPositions}>
          Get Positions
        </button>
        {positions.success && positions.positions && (
          <div
            style={{ maxWidth: "100%", overflowX: "auto" }}
          >
            <pre>
              {JSON.stringify(positions.positions, null, 2)}
            </pre>
          </div>
        )}
      </div>
      <div style={{ margin: "20px 0" }}>
        <h2>Users</h2>
        {users.length > 0 && (
          <div>
            <ul>{userList}</ul>
            <button onClick={handleShowMore}>
              Show more
            </button>
          </div>
        )}
      </div>
      <div style={{ margin: "20px 0" }}>
        <h2>Get User by ID</h2>
        <form onSubmit={handleFetchUserById}>
          <div style={{ margin: "10px 0" }}>
            <input
              type="text"
              name="userId"
              placeholder="User ID"
              style={{ width: "100%" }}
            />
          </div>
          <button type="submit">Fetch User</button>
        </form>
        {userById && (
          <div style={{ marginTop: "20px" }}>
            <h3>User Details</h3>
            <pre>{JSON.stringify(userById, null, 2)}</pre>
          </div>
        )}
      </div>
      <div style={{ margin: "20px 0" }}>
        <h2>Add New User</h2>
        <form onSubmit={handleFormSubmit}>
          <div style={{ margin: "10px 0" }}>
            <input
              type="text"
              name="name"
              placeholder="Name"
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ margin: "10px 0" }}>
            <input
              type="text"
              name="email"
              placeholder="Email"
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ margin: "10px 0" }}>
            <input
              type="text"
              name="phone"
              placeholder="Phone"
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ margin: "10px 0" }}>
            <input
              type="text"
              name="position_id"
              placeholder="Position ID"
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ margin: "10px 0" }}>
            <input
              type="text"
              name="token"
              placeholder="Token"
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ margin: "10px 0" }}>
            <input
              accept="image/*"
              id="photo"
              type="file"
              name="photo"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <label htmlFor="photo">
              <button
                type="button"
                onClick={() =>
                  document.getElementById("photo").click()
                }
              >
                Upload Photo
              </button>
            </label>
            {fileName && <div>{fileName}</div>}
          </div>
          <button type="submit">Add User</button>
        </form>
      </div>
      {open && (
        <div
          style={{
            background: "red",
            color: "white",
            padding: "10px",
            marginTop: "20px",
          }}
        >
          {error}
          <button onClick={handleClose}>Close</button>
        </div>
      )}
    </div>
  );
};

export default App;
