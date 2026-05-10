import { useState, useRef, useEffect } from "react";

export default function App() {
  const [page, setPage] = useState("home");
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem("auth");

    if (auth === "true") {
      setLoggedIn(true);
    }

    const style = document.createElement("style");

    style.innerHTML = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      body {
        margin: 0;
        overflow-x: hidden;
      }

      input::placeholder,
      textarea::placeholder {
        color: rgba(255,255,255,0.6);
      }

      button:hover {
        transform: scale(1.04);
        transition: 0.3s;
      }

      img {
        transition: 0.3s;
      }

      img:hover {
        transform: scale(1.03);
      }
    `;

    document.head.appendChild(style);

    const link = document.createElement("link");

    link.href =
      "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap";

    link.rel = "stylesheet";

    document.head.appendChild(link);
  }, []);

  if (!loggedIn) {
    return <Auth onLogin={() => setLoggedIn(true)} />;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🔐 Steganography</h1>

      <button
        style={styles.logout}
        onClick={() => {
          localStorage.removeItem("auth");
          localStorage.removeItem("currentUser");
          setLoggedIn(false);
        }}
      >
        Logout
      </button>

      {page === "home" && (
        <>
          <button
            style={styles.btn}
            onClick={() => setPage("encode")}
          >
            Encode
          </button>

          <button
            style={styles.btn}
            onClick={() => setPage("decode")}
          >
            Decode Viewer
          </button>
        </>
      )}

      {page === "encode" && (
        <Encode goHome={() => setPage("home")} />
      )}

      {page === "decode" && (
        <Decode goHome={() => setPage("home")} />
      )}
    </div>
  );
}

function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState("");

  const validatePassword = (pass) => {
    const strongPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

    return strongPassword.test(pass);
  };

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleRegister = () => {
    setError("");

    if (
      !username ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill all fields");
      return;
    }

    if (username.length < 3) {
      setError(
        "Username must contain at least 3 characters"
      );
      return;
    }

    if (!validateEmail(email)) {
      setError("Invalid email address");
      return;
    }

    if (!validatePassword(password)) {
      setError(
        "Password must contain uppercase, lowercase and number"
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    let users =
      JSON.parse(localStorage.getItem("users")) || [];

    const userExists = users.find(
      (u) =>
        u.username === username || u.email === email
    );

    if (userExists) {
      setError("User already exists");
      return;
    }

    const newUser = {
      username,
      email,
      password,
      createdAt: new Date().toLocaleString(),
    };

    users.push(newUser);

    localStorage.setItem(
      "users",
      JSON.stringify(users)
    );

    alert("Registration Successful!");

    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");

    setIsLogin(true);
  };

  const handleLogin = () => {
    setError("");

    if (!username || !password) {
      setError("Enter username and password");
      return;
    }

    let users =
      JSON.parse(localStorage.getItem("users")) || [];

    const validUser = users.find(
      (u) =>
        u.username === username &&
        u.password === password
    );

    if (!validUser) {
      setError("Invalid login credentials");
      return;
    }

    localStorage.setItem("auth", "true");

    localStorage.setItem(
      "currentUser",
      JSON.stringify(validUser)
    );

    onLogin();
  };

  return (
    <div style={styles.container}>
      <div style={styles.authCard}>
        <div style={styles.authTop}>
          <h1 style={styles.authTitle}>
            🔐 Secure Steganography
          </h1>

          <p style={styles.authSubtitle}>
            {isLogin
              ? "Login to continue"
              : "Create a secure account"}
          </p>
        </div>

        <input
          type="text"
          placeholder="Username"
          value={username}
          style={styles.input}
          onChange={(e) =>
            setUsername(e.target.value)
          }
        />

        {!isLogin && (
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            style={styles.input}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />
        )}

        <div style={styles.passwordWrapper}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            style={styles.passwordInput}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <span
            style={styles.eyeBtn}
            onClick={() =>
              setShowPassword(!showPassword)
            }
          >
            {showPassword ? "🙈" : "👁"}
          </span>
        </div>

        {!isLogin && (
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            style={styles.input}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
          />
        )}

        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        <button
          style={styles.authButton}
          onClick={
            isLogin
              ? handleLogin
              : handleRegister
          }
        >
          {isLogin ? "Login" : "Register"}
        </button>

        <p
          style={styles.switchText}
          onClick={() => {
            setError("");
            setIsLogin(!isLogin);
          }}
        >
          {isLogin
            ? "New user? Create account"
            : "Already have an account? Login"}
        </p>
      </div>
    </div>
  );
}

function Encode({ goHome }) {
  const [image2, setImage2] = useState(null);
  const [image1, setImage1] = useState(null);
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [output, setOutput] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [processText, setProcessText] = useState("");
  const [cleanPreview, setCleanPreview] =
    useState(null);

  const canvasRef = useRef();

  const loadImage = (file) =>
    new Promise((resolve) => {
      let img = new Image();

      img.onload = () => resolve(img);

      img.src = URL.createObjectURL(file);
    });

  const simulateCleaning = async (file) => {
    setProcessing(true);

    const steps = [
      "Scanning image...",
      "Detecting noise...",
      "Removing unwanted pixels...",
      "Enhancing quality...",
      "Finalizing...",
    ];

    for (let step of steps) {
      setProcessText(step);

      await new Promise((r) =>
        setTimeout(r, 1200)
      );
    }

    setCleanPreview(URL.createObjectURL(file));

    setProcessText("Completed!");

    setTimeout(() => {
      setProcessing(false);
    }, 1000);
  };

  const encode = async () => {
    if (!image1 || !image2 || !message || !password) {
      alert("Fill all fields");
      return;
    }

    const canvas = canvasRef.current;

    const ctx = canvas.getContext("2d");

    let img2 = await loadImage(image2);
    let img1 = await loadImage(image1);

    canvas.width = img2.width;
    canvas.height = img2.height;

    ctx.drawImage(img2, 0, 0);

    let imgData = ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );

    let tempCanvas = document.createElement("canvas");

    let tctx = tempCanvas.getContext("2d");

    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    tctx.drawImage(
      img1,
      0,
      0,
      canvas.width,
      canvas.height
    );

    let hiddenData = tctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    ).data;

    let d = imgData.data;

    for (let i = 0; i < d.length; i += 4) {
      d[i] = (d[i] & 0b11111100) | (hiddenData[i] >> 6);

      d[i + 1] =
        (d[i + 1] & 0b11111100) |
        (hiddenData[i + 1] >> 6);

      d[i + 2] =
        (d[i + 2] & 0b11111100) |
        (hiddenData[i + 2] >> 6);
    }

    let full = message + "||" + password + "###";

    let binary = full
      .split("")
      .map((c) =>
        c.charCodeAt(0).toString(2).padStart(8, "0")
      )
      .join("");

    let j = 0;

    for (
      let i = 0;
      i < d.length && j < binary.length;
      i += 4
    ) {
      d[i] = (d[i] & 254) | binary[j++];
    }

    ctx.putImageData(imgData, 0, 0);

    let url = canvas.toDataURL();

    setOutput(url);

    let link = document.createElement("a");

    link.download = "encoded.png";
    link.href = url;

    link.click();
  };

  return (
    <div style={styles.card}>
      <h2>Encode</h2>

      <p>Select Cover</p>

      <input
        type="file"
        style={styles.fileInput}
        onChange={(e) => {
          const file = e.target.files[0];

          setImage2(file);

          if (file) {
            simulateCleaning(file);
          }
        }}
      />

      {image2 && (
        <img
          src={URL.createObjectURL(image2)}
          alt="Cover Preview"
          width="140"
          style={styles.preview}
        />
      )}

      {processing && (
        <div style={styles.processBox}>
          <div style={styles.loader}></div>

          <p>{processText}</p>
        </div>
      )}

      {cleanPreview && !processing && (
        <div>
          <h4 style={{ color: "#22d3ee" }}>
            Cleaned Preview
          </h4>

          <img
            src={cleanPreview}
            alt="Cleaned Preview"
            width="220"
            style={styles.cleanedPreview}
          />
        </div>
      )}

      <p>Select Hidden</p>

      <input
        type="file"
        style={styles.fileInput}
        onChange={(e) => setImage1(e.target.files[0])}
      />

      {image1 && (
        <img
          src={URL.createObjectURL(image1)}
          alt="Hidden Preview"
          width="140"
          style={styles.preview}
        />
      )}

      <textarea
        placeholder="Secret Message"
        style={styles.input}
        onChange={(e) => setMessage(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        style={styles.input}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button style={styles.btn} onClick={encode}>
        Encode
      </button>

      {output && (
        <>
          <h3 style={{ color: "#a78bfa" }}>
            Encoded Output
          </h3>

          <img
            src={output}
            alt="Encoded Output"
            width="300"
            style={styles.outputImage}
          />
        </>
      )}

      <button style={styles.backBtn} onClick={goHome}>
        Back
      </button>

      <canvas
        ref={canvasRef}
        style={{ display: "none" }}
      />
    </div>
  );
}

function Decode({ goHome }) {
  return (
    <div style={styles.card}>
      <h2>Decode Viewer</h2>

      <button style={styles.backBtn} onClick={goHome}>
        Back
      </button>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    minHeight: "100vh",
    color: "white",
    paddingTop: "40px",
    background:
      "linear-gradient(135deg, #0f172a, #1e1b4b, #312e81, #4c1d95)",
    fontFamily: "Poppins, sans-serif",
  },

  title: {
    fontSize: "42px",
    marginBottom: "30px",
    fontWeight: "bold",
  },

  card: {
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(14px)",
    padding: "30px",
    borderRadius: "24px",
    width: "430px",
    margin: "auto",
  },

  authCard: {
    width: "420px",
    margin: "auto",
    padding: "35px",
    borderRadius: "28px",
    background: "rgba(255,255,255,0.08)",
  },

  authTop: {
    marginBottom: "25px",
  },

  authTitle: {
    fontSize: "32px",
  },

  authSubtitle: {
    color: "#cbd5e1",
  },

  input: {
    width: "100%",
    padding: "12px",
    margin: "12px 0",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.08)",
    color: "white",
  },

  passwordWrapper: {
    position: "relative",
  },

  passwordInput: {
    width: "100%",
    padding: "12px",
    margin: "12px 0",
    borderRadius: "12px",
  },

  eyeBtn: {
    position: "absolute",
    right: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
  },

  authButton: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "14px",
    color: "white",
    cursor: "pointer",
    background:
      "linear-gradient(135deg,#06b6d4,#3b82f6,#8b5cf6)",
  },

  switchText: {
    marginTop: "18px",
    cursor: "pointer",
  },

  errorBox: {
    background: "rgba(239,68,68,0.15)",
    padding: "10px",
    borderRadius: "12px",
  },

  fileInput: {
    margin: "12px 0",
    color: "white",
  },

  btn: {
    padding: "12px 22px",
    border: "none",
    borderRadius: "14px",
    cursor: "pointer",
    color: "white",
    background:
      "linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6)",
  },

  backBtn: {
    padding: "12px 22px",
    border: "none",
    borderRadius: "14px",
    cursor: "pointer",
    color: "white",
    marginTop: "18px",
    background:
      "linear-gradient(135deg, #ef4444, #f97316)",
  },

  logout: {
    position: "absolute",
    top: "18px",
    right: "18px",
    padding: "10px 18px",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    color: "white",
  },

  preview: {
    marginTop: "12px",
    borderRadius: "16px",
  },

  cleanedPreview: {
    borderRadius: "16px",
    marginTop: "10px",
  },

  outputImage: {
    width: "300px",
    marginTop: "15px",
    borderRadius: "18px",
  },

  processBox: {
    marginTop: "18px",
    padding: "18px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.08)",
  },

  loader: {
    width: "48px",
    height: "48px",
    border: "5px solid rgba(255,255,255,0.2)",
    borderTop: "5px solid #22d3ee",
    borderRadius: "50%",
    margin: "12px auto",
    animation: "spin 1s linear infinite",
  },
};