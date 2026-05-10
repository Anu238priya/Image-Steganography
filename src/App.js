import { useState, useRef, useEffect } from "react";

export default function App() {
  const [page, setPage] = useState("home");
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem("auth");

    if (auth === "true") {
      setLoggedIn(true);
    }

    // Animation Styles
    const style = document.createElement("style");

    style.innerHTML = `
      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }

        100% {
          transform: rotate(360deg);
        }
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

    // Google Font
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

// ================= AUTH =================

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

  // ================= VALIDATION =================

  const validatePassword = (pass) => {
    const strongPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

    return strongPassword.test(pass);
  };

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  // ================= REGISTER =================

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

  // ================= LOGIN =================

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

        {/* USERNAME */}

        <input
          type="text"
          placeholder="Username"
          value={username}
          style={styles.input}
          onChange={(e) =>
            setUsername(e.target.value)
          }
        />

        {/* EMAIL */}

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

        {/* PASSWORD */}

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

        {/* CONFIRM PASSWORD */}

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

        {/* ERROR */}

        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        {/* BUTTON */}

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

        {/* SWITCH */}

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

// ================= ENCODE =================

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

  // ================= IMAGE CLEANING =================

  const simulateCleaning = async (file) => {
    setProcessing(true);

    const steps = [
      "Scanning image...",
      "Detecting noise...",
      "Removing unwanted pixels...",
      "Enhancing image quality...",
      "Finalizing clean image...",
    ];

    for (let step of steps) {
      setProcessText(step);

      await new Promise((r) => setTimeout(r, 1200));
    }

    setCleanPreview(URL.createObjectURL(file));

    setProcessText("Image cleaned successfully!");

    setTimeout(() => {
      setProcessing(false);
    }, 1000);
  };

  // ================= ENCODE =================

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

    tctx.drawImage(img1, 0, 0, canvas.width, canvas.height);

    let hiddenData = tctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    ).data;

    let d = imgData.data;

    // Hide Image

    for (let i = 0; i < d.length; i += 4) {
      d[i] = (d[i] & 0b11111100) | (hiddenData[i] >> 6);

      d[i + 1] =
        (d[i + 1] & 0b11111100) |
        (hiddenData[i + 1] >> 6);

      d[i + 2] =
        (d[i + 2] & 0b11111100) |
        (hiddenData[i + 2] >> 6);
    }

    // Hide Message

    let full = message + "||" + password + "###";

    let binary = full
      .split("")
      .map((c) =>
        c.charCodeAt(0).toString(2).padStart(8, "0")
      )
      .join("");

    let j = 0;

    for (let i = 0; i < d.length && j < binary.length; i += 4) {
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

      <p>Select Cover Image</p>

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
            Cleaned Image Preview
          </h4>

          <img
            src={cleanPreview}
            width="220"
            style={styles.cleanedPreview}
          />
        </div>
      )}

      <p>Select Hidden Image</p>

      <input
        type="file"
        style={styles.fileInput}
        onChange={(e) => setImage1(e.target.files[0])}
      />

      {image1 && (
        <img
          src={URL.createObjectURL(image1)}
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
            width="300"
            style={styles.outputImage}
          />
        </>
      )}

      <button style={styles.backBtn} onClick={goHome}>
        Back
      </button>

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

// ================= DECODE =================

function Decode({ goHome }) {
  const [file, setFile] = useState(null);

  const [decodedImage, setDecodedImage] =
    useState(null);

  const [message, setMessage] = useState("");

  const [revealed, setRevealed] = useState(false);

  const canvasRef = useRef();

  const loadImage = (file) =>
    new Promise((resolve) => {
      let img = new Image();

      img.onload = () => resolve(img);

      img.src = URL.createObjectURL(file);
    });

  const extractData = async (file, passInput) => {
    const canvas = canvasRef.current;

    const ctx = canvas.getContext("2d");

    let img = await loadImage(file);

    canvas.width = img.width;

    canvas.height = img.height;

    ctx.drawImage(img, 0, 0);

    let data = ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    ).data;

    let binary = "";

    let text = "";

    for (let i = 0; i < data.length; i += 4) {
      binary += data[i] & 1;

      if (binary.length % 8 === 0) {
        let char = String.fromCharCode(
          parseInt(binary.slice(-8), 2)
        );

        text += char;

        if (text.includes("###")) break;
      }
    }

    let clean = text.replace("###", "");

    let [msg, pass] = clean.split("||");

    if (pass !== passInput) {
      alert("Wrong Password");
      return;
    }

    setMessage(msg);

    let outCanvas = document.createElement("canvas");

    let octx = outCanvas.getContext("2d");

    outCanvas.width = canvas.width;

    outCanvas.height = canvas.height;

    let out = octx.createImageData(
      canvas.width,
      canvas.height
    );

    let o = out.data;

    for (let i = 0; i < data.length; i += 4) {
      o[i] = (data[i] & 3) << 6;

      o[i + 1] = (data[i + 1] & 3) << 6;

      o[i + 2] = (data[i + 2] & 3) << 6;

      o[i + 3] = 255;
    }

    octx.putImageData(out, 0, 0);

    setDecodedImage(outCanvas.toDataURL());

    setRevealed(true);
  };

  return (
    <div style={styles.card}>
      <h2>Secure Viewer</h2>

      <input
        type="file"
        style={styles.fileInput}
        onChange={(e) => setFile(e.target.files[0])}
      />

      {file && (
        <div
          onDoubleClick={() => {
            let pass = prompt("Enter Password");

            if (pass) {
              extractData(file, pass);
            }
          }}
        >
          <img
            src={
              revealed
                ? decodedImage
                : URL.createObjectURL(file)
            }
            style={styles.outputImage}
          />
        </div>
      )}

      {message && (
        <p style={styles.message}>
          <b>Message:</b> {message}
        </p>
      )}

      <button style={styles.backBtn} onClick={goHome}>
        Back
      </button>

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

// ================= STYLES =================

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
    background:
      "linear-gradient(90deg,#22d3ee,#a78bfa,#f472b6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  card: {
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(14px)",
    padding: "30px",
    borderRadius: "24px",
    width: "430px",
    margin: "auto",
    boxShadow:
      "0 8px 32px rgba(0,0,0,0.35), 0 0 20px rgba(139,92,246,0.25)",
    border: "1px solid rgba(255,255,255,0.12)",
  },

  authCard: {
    width: "420px",
    margin: "auto",
    padding: "35px",
    borderRadius: "28px",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow:
      "0 8px 32px rgba(0,0,0,0.35), 0 0 20px rgba(139,92,246,0.25)",
  },

  authTop: {
    marginBottom: "25px",
  },

  authTitle: {
    fontSize: "32px",
    marginBottom: "8px",
    background:
      "linear-gradient(90deg,#22d3ee,#a78bfa,#f472b6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  authSubtitle: {
    color: "#cbd5e1",
    fontSize: "14px",
  },

  input: {
    width: "100%",
    padding: "12px",
    margin: "12px 0",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.15)",
    outline: "none",
    background: "rgba(255,255,255,0.08)",
    color: "white",
    fontSize: "15px",
    boxSizing: "border-box",
  },

  passwordWrapper: {
    position: "relative",
    width: "100%",
  },

  passwordInput: {
    width: "100%",
    padding: "12px",
    margin: "12px 0",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.15)",
    outline: "none",
    background: "rgba(255,255,255,0.08)",
    color: "white",
    fontSize: "15px",
    boxSizing: "border-box",
  },

  eyeBtn: {
    position: "absolute",
    right: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    fontSize: "18px",
  },

  authButton: {
    width: "100%",
    padding: "14px",
    background:
      "linear-gradient(135deg,#06b6d4,#3b82f6,#8b5cf6)",
    border: "none",
    borderRadius: "14px",
    color: "white",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "10px",
  },

  switchText: {
    marginTop: "18px",
    color: "#cbd5e1",
    cursor: "pointer",
    fontSize: "14px",
  },

  errorBox: {
    background: "rgba(239,68,68,0.15)",
    border: "1px solid rgba(239,68,68,0.4)",
    color: "#fecaca",
    padding: "10px",
    borderRadius: "12px",
    marginTop: "10px",
    fontSize: "14px",
  },

  fileInput: {
    margin: "12px 0",
    color: "white",
  },

  btn: {
    padding: "12px 22px",
    background:
      "linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6)",
    border: "none",
    margin: "10px",
    borderRadius: "14px",
    cursor: "pointer",
    fontWeight: "bold",
    color: "white",
    fontSize: "15px",
  },

  backBtn: {
    padding: "12px 22px",
    background:
      "linear-gradient(135deg, #ef4444, #f97316)",
    border: "none",
    marginTop: "18px",
    borderRadius: "14px",
    cursor: "pointer",
    color: "white",
    fontWeight: "bold",
    fontSize: "15px",
  },

  logout: {
    position: "absolute",
    top: "18px",
    right: "18px",
    padding: "10px 18px",
    background:
      "linear-gradient(135deg,#f59e0b,#ef4444)",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    color: "white",
    fontWeight: "bold",
  },

  preview: {
    marginTop: "12px",
    borderRadius: "16px",
    border: "2px solid rgba(255,255,255,0.15)",
  },

  cleanedPreview: {
    border: "3px solid #22d3ee",
    borderRadius: "16px",
    marginTop: "10px",
  },

  outputImage: {
    width: "300px",
    marginTop: "15px",
    borderRadius: "18px",
    cursor: "pointer",
  },

  processBox: {
    marginTop: "18px",
    padding: "18px",
    background: "rgba(255,255,255,0.08)",
    borderRadius: "18px",
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

  message: {
    marginTop: "20px",
    color: "#f8fafc",
    background: "rgba(255,255,255,0.08)",
    padding: "12px",
    borderRadius: "12px",
  },
};