import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div>
      <h2>Dashboard</h2>
      {user ? (
        <div>
          <p>Welcome, {user.username}!</p>
          <button onClick={() => { logout(); navigate("/login"); }}>Logout</button>
        </div>
      ) : (
        <p>You are not logged in</p>
      )}
      <br />
      <button onClick={()=>navigate("/protect")}>Protected</button>
    </div>
  );
};

export default Dashboard;
