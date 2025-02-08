import { useEffect, useRef, useState } from "react";
import { assets } from "../../assets/assets";
import "./main.css";
import Markdown from "react-markdown";
import { auth } from "../../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { Copy } from "lucide-react";
import { lucario } from "react-syntax-highlighter/dist/esm/styles/prism";
import { RiseLoader } from "react-spinners";

const Main = () => {
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [result, setResult] = useState(""); // To store the streamed result
  const [data, setData] = useState([])

  const [user, setUser] = useState(null);

  const scrollRef = useRef(null);

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
    let dd = data
    dd.push({
      id: 0,
      msg: input
    })
    setData(dd)
    setInput("")

    // console.log(input);
    setLoading(true);  // Show loader
    setResult("");
    setShowResults(true)

    try {
      const response = await fetch("http://localhost:8000/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
        }),
      });

      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let think = true;
        setLoading(false);
        let final = ""

        // Read the stream and concatenate chunks in real-time
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          const chunk = decoder.decode(value, { stream: true });
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
    } catch (error) {
      // console.error("Error during API call:", error);
      setLoading(false);
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
          <div style={{height:"80vh",overflow:"auto",marginBottom:-120,minWidth:"70vw"}} ref={scrollRef}>
            {
              data.map((d) => (
                <div className="result">
                  {
                    d['id'] == 0 ? (
                      <div className="result-title">
                        <img src={user?.photoURL} alt="" />
                        <p>{d['msg']}</p>
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
                                  <div className="relative group my-4">
                                    <Copy
                                      size={14}
                                      className="absolute top-2 right-2 cursor-pointer text-gray-400 hover:text-white"
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
                                  <code className="bg-gray-700 text-white text-lg px-3 py-1 rounded mx-1">
                                    {children}
                                  </code>
                                );
                              },
                              h1: ({ node, ...props }) => (
                                <h1 className="text-3xl font-bold text-blue-400 mt-6 mb-4">{props.children}</h1>
                              ),
                              h2: ({ node, ...props }) => (
                                <h2 className="text-2xl font-semibold text-blue-300 mt-5 mb-3">{props.children}</h2>
                              ),
                              strong: ({ node, ...props }) => (
                                <strong className="text-yellow-300 font-semibold">{props.children}</strong>
                              ),
                              em: ({ node, ...props }) => (
                                <em className="text-green-300 italic">{props.children}</em>
                              ),
                              p: ({ node, ...props }) => (
                                <p className="text-gray-300 leading-loose my-3">{props.children}</p>
                              ),
                              ul: ({ node, ...props }) => (
                                <ul className="list-disc list-inside text-gray-300 space-y-2 my-3">{props.children}</ul>
                              ),
                              ol: ({ node, ...props }) => (
                                <ol className="list-decimal list-inside text-gray-300 space-y-2 my-3">{props.children}</ol>
                              ),
                              blockquote: ({ node, ...props }) => (
                                <blockquote className="border-l-4 border-blue-500 pl-5 italic text-gray-400 my-4">
                                  {props.children}
                                </blockquote>
                              ),
                            }}
                          >
                            {d['msg']}
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
                  <RiseLoader color="#dac013" size={15} style={{marginTop:30}} />
                ) : (
                  <div>
                    <Markdown
                            components={{
                              code({ inline, className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || "");
                                return !inline && match ? (
                                  <div className="relative group my-4">
                                    <Copy
                                      size={14}
                                      className="absolute top-2 right-2 cursor-pointer text-gray-400 hover:text-white"
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
                                  <code className="bg-gray-700 text-white text-lg px-3 py-1 rounded mx-1">
                                    {children}
                                  </code>
                                );
                              },
                              h1: ({ node, ...props }) => (
                                <h1 className="text-3xl font-bold text-blue-400 mt-6 mb-4">{props.children}</h1>
                              ),
                              h2: ({ node, ...props }) => (
                                <h2 className="text-2xl font-semibold text-blue-300 mt-5 mb-3">{props.children}</h2>
                              ),
                              strong: ({ node, ...props }) => (
                                <strong className="text-yellow-300 font-semibold">{props.children}</strong>
                              ),
                              em: ({ node, ...props }) => (
                                <em className="text-green-300 italic">{props.children}</em>
                              ),
                              p: ({ node, ...props }) => (
                                <p className="text-gray-300 leading-loose my-3">{props.children}</p>
                              ),
                              ul: ({ node, ...props }) => (
                                <ul className="list-disc list-inside text-gray-300 space-y-2 my-3">{props.children}</ul>
                              ),
                              ol: ({ node, ...props }) => (
                                <ol className="list-decimal list-inside text-gray-300 space-y-2 my-3">{props.children}</ol>
                              ),
                              blockquote: ({ node, ...props }) => (
                                <blockquote className="border-l-4 border-blue-500 pl-5 italic text-gray-400 my-4">
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
            />
            <div>
              <img
                src={assets.send_icon}
                alt=""
                onClick={() => {
                  onSent();
                }}
              />
            </div>
          </div>
          <div className="bottom-info">
            <p>
              Nimo sometimes may display inaccurate info, including about people, so double-check its responses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
