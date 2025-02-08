import "./sidebar.css";
import { assets } from "../../assets/assets";
import { useContext, useEffect, useState } from "react";
import { Context } from "../../context/Context";
import { logOut, auth } from "../../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
const Sidebar = () => {
	const [extended, setExtended] = useState(false);
	const { onSent, prevPrompts, setRecentPrompt, newChat } = useContext(Context);
	const [user, setUser] = useState(null);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
			setUser(currentUser);
			// console.log(currentUser)
		});
		return () => unsubscribe();
	}, []);

	const loadPreviousPrompt = async (prompt) => {
		setRecentPrompt(prompt);
		await onSent(prompt);
	};
	return (
		<div className="sidebar">
			<div className="top">
				<img
					src={assets.menu_icon}
					className="menu"
					alt="menu-icon"
					onClick={() => {
						setExtended((prev) => !prev);
					}}
				/>
				<div className="new-chat">
					<img src={assets.history_icon} alt="" onClick={() => {
						window.location.reload()
					}} />
					{extended ? <p>New Chat</p> : null}
				</div>


				{extended ? (
					<div className="recent">
						{prevPrompts.map((item, index) => {
							return (
								<div onClick={() => {
									loadPreviousPrompt(item)
								}} className="recent-entry">
									<img src={assets.message_icon} alt="" />
									<p>{item.slice(0, 18)}...</p>
								</div>
							);
						})}
					</div>
				) : null}
			</div>
			<div className="bottom">
				<div className="bottom-item recent-entry">
					<img style={{ borderRadius: 50 }} src={user?.photoURL} alt="" />
				</div>

				<div className="bottom-item recent-entry" onClick={logOut}>
					<img src={assets.setting_icon} alt="" />
					{extended ? <p>Log Out</p> : null}
				</div>
			</div>
		</div>
	);
};

export default Sidebar;
