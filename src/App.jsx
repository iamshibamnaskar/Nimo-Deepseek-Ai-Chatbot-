import { useState, useEffect } from "react";
import Main from "./components/main/Main";
import Sidebar from "./components/sidebar/Sidebar";
import { signInWithGoogle, auth } from "./config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import GoogleButton from "react-google-button";
import { assets } from "./assets/assets";
import { ClimbingBoxLoader } from "react-spinners";

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false)
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      {loading ? (
        <ClimbingBoxLoader style={styles.container} color="#dac013"
        size={25} />
      ) : (
        <>
          {user ? (
            <>
              <Sidebar />
              <Main />
            </>
          ) : (
            <div style={styles.container}>
              <img src={assets.chatbot} alt="Chatbot Logo" style={styles.image} />
              <h3 style={styles.heading}>Signin To Continue with NIMO</h3>
              <GoogleButton onClick={signInWithGoogle} />
            </div>
          )}
        </>
      )}
    </>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    width: "100vw",
  },
  heading: {
    marginBottom: "20px",
    fontSize: "16px",
    color: "#777"
  },
  image: {
    width: "350px", // Adjust as needed
    marginBottom: "20px",
  },
};

export default App;
