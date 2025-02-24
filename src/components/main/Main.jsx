import { useEffect, useRef, useState } from "react";
import { assets } from "../../assets/assets";
import "./main.css";
import Markdown from "react-markdown";
import { auth } from "../../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { Copy } from "lucide-react";
import { lucario } from "react-syntax-highlighter/dist/esm/styles/prism";
import { SyncLoader } from "react-spinners";

const Main = () => {
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [result, setResult] = useState(""); // To store the streamed result
  const [data, setData] = useState([])

  const [user, setUser] = useState(null);

  const scrollRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [extracting, Setextracting] = useState(false);
  const [extext, Setextext] = useState("")

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      uploadImage(file);
    }
  };

  const uploadImage = async (file) => {
    Setextracting(true)
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`https://imgtotxt.shibamnaskar.in/extract_text/`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      Setextracting(false)
      Setextext(result['extracted_markdown'])
      // console.log("API Response:", result);
    } catch (error) {
      Setextracting(false)
      console.error("Upload Error:", error);
    }
  };


  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [result]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // console.log(currentUser)
    });
    return () => unsubscribe();
  }, []);

  const onSent = async () => {
    // console.log(data)
    const imageUrl = selectedFile != null ? URL.createObjectURL(selectedFile) : null;

    let dd = data
    dd.push({
      id: 0,
      msg: input,
      img: imageUrl
    })
    setData(dd)
    setInput("")

    // console.log(input);
    setLoading(true);  // Show loader
    setResult("");
    setShowResults(true)

    try {
      const response = await fetch("https://shibamnaskar.in/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `${extext} ${input}`,
        }),
      });

      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let think = true;

        let final = ""

        // Read the stream and concatenate chunks in real-time
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          const chunk = decoder.decode(value, { stream: true });
          if (chunk != "") {
            setLoading(false);

          }
          if (chunk == "</think>") {
            think = false
            setResult("")
          }
          if (think == false) {
            if (chunk !== "</think>") {

              final = final + chunk
              setResult((prevResult) => prevResult + chunk);
            }
          } else {
            setResult((prevResult) => prevResult + chunk);
          }

          // console.log("Streamed chunk:", chunk);  // Log the chunk to the console
        }
        // console.log(final)
        let dd = data
        dd.push({
          id: 1,
          msg: final
        })
        setData(dd)
        setResult("")
      } else {
        setLoading(false);
        // console.error("Stream failed");
      }
      Setextext("")
      setSelectedFile(null)
    } catch (error) {
      // console.error("Error during API call:", error);
      Setextext("")
      setLoading(false);
      setSelectedFile(null)
    }
  };


  return (
    <div className="main">
      <div className="nav">
        <p>Nimo</p>
        {/* <img src={assets.user} alt="" /> */}
      </div>
      <div className="main-container">
        {!showResults ? (
          <>
            <div className="greet">
              <p>
                <span>Hello , {user?.displayName} </span>
              </p>
              <p>How Can I Help You Today?</p>
            </div>
          </>
        ) : (
          <>
            <div style={{ height: "75vh", overflow: "auto", minWidth: "70vw", scrollbarWidth: 'thin', scrollbarColor: 'inherit' }} ref={scrollRef}>
              {
                data.map((d) => (
                  <div className="result">
                    {
                      d['id'] == 0 ? (
                        <div className="result-title">
                          <img src={user?.photoURL} alt="" />
                          <div>
                            {
                              d['img']!=null &&<img
                              src={d['img']}
                              alt="Uploaded Preview"
                              style={{
                                width: "200px",
                                objectFit: "cover",
                                borderRadius: "10px",
                                backgroundColor: "#f0f0f0",
                                padding: "5px",
                                border: "1px solid #ddd"
                              }}
                            />
                            }

                            <p>{d['msg']}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="result-data">
                          <img style={{ width: 70 }} src={assets.chatbot} alt="" />
                          <div>
                            <Markdown
                              components={{
                                code({ inline, className, children, ...props }) {
                                  const match = /language-(\w+)/.exec(className || "");
                                  return !inline && match ? (
                                    <div style={{ position: "relative", margin: "16px 0" }}>
                                      <Copy
                                        size={14}
                                        style={{
                                          position: "absolute",
                                          top: "8px",
                                          right: "8px",
                                          cursor: "pointer",
                                          color: "#718096", // Dark Gray
                                        }}
                                        onClick={() => navigator.clipboard.writeText(String(children).trim())}
                                      />
                                      <SyntaxHighlighter
                                        style={lucario}
                                        language={match[1]}
                                        PreTag="div"
                                        className="bg-gray-800 text-lg p-5 rounded-lg leading-relaxed"
                                      >
                                        {String(children).trim()}
                                      </SyntaxHighlighter>
                                    </div>
                                  ) : (
                                    <code
                                      style={{
                                        backgroundColor: "#1A202C", // Darker Gray
                                        color: "#E2E8F0", // Lighter Text
                                        fontSize: "16px",
                                        padding: "4px 8px",
                                        borderRadius: "4px",
                                        margin: "0 4px",
                                      }}
                                    >
                                      {children}
                                    </code>
                                  );
                                },
                                h1: ({ node, ...props }) => (
                                  <h1
                                    style={{
                                      fontSize: "2rem",
                                      fontWeight: "bold",
                                      color: "#2C5282", // Dark Blue
                                      marginTop: "24px",
                                      marginBottom: "20px",
                                      lineHeight: "1.5",
                                    }}
                                  >
                                    {props.children}
                                  </h1>
                                ),
                                h2: ({ node, ...props }) => (
                                  <h2
                                    style={{
                                      fontSize: "1.75rem",
                                      fontWeight: "600",
                                      color: "#2B6CB0", // Darker Blue
                                      marginTop: "22px",
                                      marginBottom: "18px",
                                      lineHeight: "1.5",
                                    }}
                                  >
                                    {props.children}
                                  </h2>
                                ),
                                strong: ({ node, ...props }) => (
                                  <strong style={{ color: "#D69E2E", fontWeight: "600" }}>{props.children}</strong> // Dark Yellow
                                ),
                                em: ({ node, ...props }) => (
                                  <em style={{ color: "#2F855A", fontStyle: "italic" }}>{props.children}</em> // Dark Green
                                ),
                                p: ({ node, ...props }) => (
                                  <p
                                    style={{
                                      color: "#56728f",
                                      lineHeight: "1.8", // Increased spacing between lines
                                      marginTop: "14px",
                                      marginBottom: "14px",
                                    }}
                                  >
                                    {props.children}
                                  </p>
                                ),
                                ul: ({ node, ...props }) => (
                                  <ul
                                    style={{
                                      listStyleType: "disc",
                                      paddingLeft: "24px",
                                      color: "#A0AEC0",
                                      marginTop: "14px",
                                      marginBottom: "14px",
                                      lineHeight: "1.8", // Added spacing
                                    }}
                                  >
                                    {props.children}
                                  </ul>
                                ),
                                ol: ({ node, ...props }) => (
                                  <ol
                                    style={{
                                      listStyleType: "decimal",
                                      paddingLeft: "24px",
                                      color: "#5c708a",
                                      marginTop: "14px",
                                      marginBottom: "14px",
                                      lineHeight: "1.8", // Added spacing
                                    }}
                                  >
                                    {props.children}
                                  </ol>
                                ),
                                li: ({ node, ...props }) => (
                                  <li
                                    style={{
                                      marginBottom: "8px", // Extra spacing between list items
                                    }}
                                  >
                                    {props.children}
                                  </li>
                                ),
                                blockquote: ({ node, ...props }) => (
                                  <blockquote
                                    style={{
                                      borderLeft: "4px solid #2C5282", // Dark Blue Border
                                      paddingLeft: "20px",
                                      fontStyle: "italic",
                                      color: "#718096", // Dark Gray Text
                                      marginTop: "18px",
                                      marginBottom: "18px",
                                      lineHeight: "1.8", // Added spacing
                                    }}
                                  >
                                    {props.children}
                                  </blockquote>
                                ),
                              }}
                            >
                              {d["msg"]}
                            </Markdown>




                          </div>
                        </div>
                      )
                    }

                  </div>
                ))
              }
              <div className="result">
                {/* <div className="result-title">
                <img src={assets.user} alt="" />
                <p>{input}</p>
              </div> */}
                <div className="result-data">
                  {result.length > 0 ? (<img src={assets.chatbot} alt="" />) : (<div></div>)}
                  {loading ? (
                    <div style={{ height: 50 }}><SyncLoader color="#f3aa00" size={10} style={{ zIndex: 1 }} /></div>
                  ) : (
                    <div>
                      <Markdown
                        components={{
                          code({ inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || "");
                            return !inline && match ? (
                              <div style={{ position: "relative", margin: "16px 0" }}>
                                <Copy
                                  size={14}
                                  style={{
                                    position: "absolute",
                                    top: "8px",
                                    right: "8px",
                                    cursor: "pointer",
                                    color: "#718096", // Dark Gray
                                  }}
                                  onClick={() => navigator.clipboard.writeText(String(children).trim())}
                                />
                                <SyntaxHighlighter
                                  style={lucario}
                                  language={match[1]}
                                  PreTag="div"
                                  className="bg-gray-800 text-lg p-5 rounded-lg leading-relaxed"
                                >
                                  {String(children).trim()}
                                </SyntaxHighlighter>
                              </div>
                            ) : (
                              <code
                                style={{
                                  backgroundColor: "#1A202C", // Darker Gray
                                  color: "#E2E8F0", // Lighter Text
                                  fontSize: "16px",
                                  padding: "4px 8px",
                                  borderRadius: "4px",
                                  margin: "0 4px",
                                }}
                              >
                                {children}
                              </code>
                            );
                          },
                          h1: ({ node, ...props }) => (
                            <h1
                              style={{
                                fontSize: "2rem",
                                fontWeight: "bold",
                                color: "#2C5282", // Dark Blue
                                marginTop: "24px",
                                marginBottom: "20px",
                                lineHeight: "1.5",
                              }}
                            >
                              {props.children}
                            </h1>
                          ),
                          h2: ({ node, ...props }) => (
                            <h2
                              style={{
                                fontSize: "1.75rem",
                                fontWeight: "600",
                                color: "#2B6CB0", // Darker Blue
                                marginTop: "22px",
                                marginBottom: "18px",
                                lineHeight: "1.5",
                              }}
                            >
                              {props.children}
                            </h2>
                          ),
                          strong: ({ node, ...props }) => (
                            <strong style={{ color: "#D69E2E", fontWeight: "600" }}>{props.children}</strong> // Dark Yellow
                          ),
                          em: ({ node, ...props }) => (
                            <em style={{ color: "#2F855A", fontStyle: "italic" }}>{props.children}</em> // Dark Green
                          ),
                          p: ({ node, ...props }) => (
                            <p
                              style={{
                                color: "#56728f",
                                lineHeight: "1.8", // Increased spacing between lines
                                marginTop: "14px",
                                marginBottom: "14px",
                              }}
                            >
                              {props.children}
                            </p>
                          ),
                          ul: ({ node, ...props }) => (
                            <ul
                              style={{
                                listStyleType: "disc",
                                paddingLeft: "24px",
                                color: "#A0AEC0",
                                marginTop: "14px",
                                marginBottom: "14px",
                                lineHeight: "1.8", // Added spacing
                              }}
                            >
                              {props.children}
                            </ul>
                          ),
                          ol: ({ node, ...props }) => (
                            <ol
                              style={{
                                listStyleType: "decimal",
                                paddingLeft: "24px",
                                color: "#5c708a",
                                marginTop: "14px",
                                marginBottom: "14px",
                                lineHeight: "1.8", // Added spacing
                              }}
                            >
                              {props.children}
                            </ol>
                          ),
                          li: ({ node, ...props }) => (
                            <li
                              style={{
                                marginBottom: "8px", // Extra spacing between list items
                              }}
                            >
                              {props.children}
                            </li>
                          ),
                          blockquote: ({ node, ...props }) => (
                            <blockquote
                              style={{
                                borderLeft: "4px solid #2C5282", // Dark Blue Border
                                paddingLeft: "20px",
                                fontStyle: "italic",
                                color: "#718096", // Dark Gray Text
                                marginTop: "18px",
                                marginBottom: "18px",
                                lineHeight: "1.8", // Added spacing
                              }}
                            >
                              {props.children}
                            </blockquote>
                          ),
                        }}
                      >
                        {result}
                      </Markdown>

                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        <div className="main-bottom">
          <div className="search-box">
            <input
              onChange={(e) => {
                setInput(e.target.value);
              }}
              value={input}
              type="text"
              placeholder="Enter the Prompt Here"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault(); // Prevents new lines in textarea
                  onSent(); // Call onSent() when Enter is pressed
                }
              }}
            />
            <div>
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                id="imageInput"
                onChange={handleFileChange}
              />
              <img
                src={assets.gallery_icon}
                alt="Upload"
                onClick={() => document.getElementById("imageInput").click()}
                style={{ cursor: "pointer" }}
              />
            </div>
            <div>
              {
                extracting ? (<p>Extracting Text..</p>) : (
                  <img
                    src={assets.send_icon}
                    alt=""
                    onClick={() => {
                      onSent();
                    }}
                  />
                )
              }
            </div>

          </div>
          <div className="bottom-info">
            <p>
              Nimo sometimes may display inaccurate info, including about people, so double-check its responses.|| made by shibam @2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
