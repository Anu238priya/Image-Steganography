import { useState, useRef, useEffect } from "react";

export default function App() {
  const [page, setPage] = useState("home");

  useEffect(() => {
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

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>
        🔐 Image Steganography
      </h1>

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

  const [roiBox, setRoiBox] = useState(null);

  const [drawing, setDrawing] = useState(false);

  const [startPoint, setStartPoint] =
    useState(null);

  const canvasRef = useRef();

  const roiRef = useRef();

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

  const startDrawing = (e) => {
    const rect =
      roiRef.current.getBoundingClientRect();

    const x = e.clientX - rect.left;

    const y = e.clientY - rect.top;

    setStartPoint({ x, y });

    setDrawing(true);

    setRoiBox({
      x,
      y,
      width: 0,
      height: 0,
    });
  };

  const drawROI = (e) => {
    if (!drawing) return;

    const rect =
      roiRef.current.getBoundingClientRect();

    const currentX =
      e.clientX - rect.left;

    const currentY =
      e.clientY - rect.top;

    setRoiBox({
      x: Math.min(startPoint.x, currentX),
      y: Math.min(startPoint.y, currentY),
      width: Math.abs(
        currentX - startPoint.x
      ),
      height: Math.abs(
        currentY - startPoint.y
      ),
    });
  };

  const stopDrawing = () => {
    setDrawing(false);
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

    let tempCanvas =
      document.createElement("canvas");

    let tctx =
      tempCanvas.getContext("2d");

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

    // Hide Image
    for (let i = 0; i < d.length; i += 4) {
      d[i] =
        (d[i] & 0b11111100) |
        (hiddenData[i] >> 6);

      d[i + 1] =
        (d[i + 1] & 0b11111100) |
        (hiddenData[i + 1] >> 6);

      d[i + 2] =
        (d[i + 2] & 0b11111100) |
        (hiddenData[i + 2] >> 6);
    }

    // Hide Message
    let full =
      message + "||" + password + "###";

    let binary = full
      .split("")
      .map((c) =>
        c.charCodeAt(0)
          .toString(2)
          .padStart(8, "0")
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

    let link =
      document.createElement("a");

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

          <p style={styles.roiText}>
            Drag Mouse to Select ROI
          </p>

          <div
            ref={roiRef}
            style={styles.roiContainer}
            onMouseDown={startDrawing}
            onMouseMove={drawROI}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          >
            <img
              src={cleanPreview}
              alt="Cleaned Preview"
              width="320"
              style={styles.cleanedPreview}
            />

            {roiBox && (
              <div
                style={{
                  ...styles.roiBox,
                  left: roiBox.x,
                  top: roiBox.y,
                  width: roiBox.width,
                  height: roiBox.height,
                }}
              />
            )}
          </div>

          {roiBox && (
            <p style={styles.selectedText}>
              ROI Selected Successfully
            </p>
          )}
        </div>
      )}

      <p>Select Hidden Image</p>

      <input
        type="file"
        style={styles.fileInput}
        onChange={(e) =>
          setImage1(e.target.files[0])
        }
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
        onChange={(e) =>
          setMessage(e.target.value)
        }
      />

      <input
        type="password"
        placeholder="Password"
        style={styles.input}
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <button
        style={styles.btn}
        onClick={encode}
      >
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

      <button
        style={styles.backBtn}
        onClick={goHome}
      >
        Back
      </button>

      <canvas
        ref={canvasRef}
        style={{ display: "none" }}
      />
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

  const extractData = async (
    file,
    passInput
  ) => {
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

    let [msg, pass] =
      clean.split("||");

    if (pass !== passInput) {
      alert("Wrong Password");
      return;
    }

    setMessage(msg);

    let outCanvas =
      document.createElement("canvas");

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

      o[i + 1] =
        (data[i + 1] & 3) << 6;

      o[i + 2] =
        (data[i + 2] & 3) << 6;

      o[i + 3] = 255;
    }

    octx.putImageData(out, 0, 0);

    setDecodedImage(
      outCanvas.toDataURL()
    );

    setRevealed(true);
  };

  return (
    <div style={styles.card}>
      <h2>Secure Viewer</h2>

      <input
        type="file"
        style={styles.fileInput}
        onChange={(e) =>
          setFile(e.target.files[0])
        }
      />

      {file && (
        <div
          onDoubleClick={() => {
            let pass =
              prompt("Enter Password");

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
            alt="Decoded Output"
            style={styles.outputImage}
          />
        </div>
      )}

      {message && (
        <p style={styles.message}>
          <b>Message:</b> {message}
        </p>
      )}

      <button
        style={styles.backBtn}
        onClick={goHome}
      >
        Back
      </button>

      <canvas
        ref={canvasRef}
        style={{ display: "none" }}
      />
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
  },

  card: {
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(14px)",
    padding: "30px",
    borderRadius: "24px",
    width: "430px",
    margin: "auto",
  },

  input: {
    width: "100%",
    padding: "12px",
    margin: "12px 0",
    borderRadius: "12px",
    border:
      "1px solid rgba(255,255,255,0.15)",
    background:
      "rgba(255,255,255,0.08)",
    color: "white",
    boxSizing: "border-box",
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
    margin: "10px",
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

  preview: {
    marginTop: "12px",
    borderRadius: "16px",
  },

  cleanedPreview: {
    borderRadius: "16px",
    display: "block",
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
    borderRadius: "18px",
    background:
      "rgba(255,255,255,0.08)",
  },

  loader: {
    width: "48px",
    height: "48px",
    border:
      "5px solid rgba(255,255,255,0.2)",
    borderTop: "5px solid #22d3ee",
    borderRadius: "50%",
    margin: "12px auto",
    animation:
      "spin 1s linear infinite",
  },

  message: {
    marginTop: "20px",
    color: "#f8fafc",
    background:
      "rgba(255,255,255,0.08)",
    padding: "12px",
    borderRadius: "12px",
  },

  roiContainer: {
    position: "relative",
    display: "inline-block",
    marginTop: "12px",
    cursor: "crosshair",
    userSelect: "none",
  },

  roiBox: {
    position: "absolute",
    border: "3px dashed #22d3ee",
    background:
      "rgba(34,211,238,0.2)",
    pointerEvents: "none",
    borderRadius: "8px",
  },

  roiText: {
    color: "#c4b5fd",
    marginTop: "10px",
    fontWeight: "500",
  },

  selectedText: {
    color: "#22c55e",
    marginTop: "12px",
    fontWeight: "600",
  },
};