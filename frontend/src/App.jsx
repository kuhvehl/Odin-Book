import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Home from "./pages/Home"; // Import the new Home component
import Profile from "./pages/Profile"; // Import the new Profile component
import { AuthProvider } from "./context/AuthContext";

// Placeholder components

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />{" "}
            <Route path="/profile/:userId" element={<Profile />} />{" "}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
