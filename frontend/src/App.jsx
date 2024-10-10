import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

// Placeholder components (we'll create these later)
const Home = () => <h1>Home</h1>;
const Profile = () => <h1>Profile</h1>;
const SignIn = () => <h1>Sign In</h1>;
const SignUp = () => <h1>Sign Up</h1>;

function App() {
  return (
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
  );
}

export default App;
