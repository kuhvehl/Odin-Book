import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import { AuthProvider } from "./context/AuthContext";

// Placeholder components
const Home = () => <h1>Home</h1>;
const Profile = () => <h1>Profile</h1>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
