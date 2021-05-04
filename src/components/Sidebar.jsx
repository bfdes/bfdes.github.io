import Template from "../template";
import { GitHub, RSS } from "../images";

const Profile = () => (
  <img className="avatar" src="/images/avatar.jpg" alt="Profile photo" />
);

const NavBar = () => (
  <div id="nav">
    <a className="nav-item" href="/posts">
      <h2>Blog</h2>
    </a>
    <a className="nav-item" href="/about.html">
      <h2>About</h2>
    </a>
  </div>
);

const Social = () => (
  <div id="social">
    <a className="nav-item" href="https://www.github.com/bfdes">
      <img className="badge" src={GitHub} alt="GitHub link" />
    </a>
    <a className="nav-item" href="/feed.rss">
      <img className="badge" src={RSS} alt="RSS link" />
    </a>
  </div>
);

const Sidebar = () => (
  <aside id="sidebar">
    <Profile />
    <NavBar />
    <Social />
  </aside>
);

export default Sidebar;
