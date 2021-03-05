import React from "react";

const Profile: React.FC = () => (
  <img className="avatar" src="/images/avatar.jpg" alt="Profile photo" />
);

const NavBar: React.FC = () => (
  <div id="nav">
    <a className="nav-item" href="/posts">
      <h2>Blog</h2>
    </a>
    <a className="nav-item" href="/about.html">
      <h2>About</h2>
    </a>
  </div>
);

const Social: React.FC = () => (
  <div id="social">
    <a className="nav-item" href="https://www.github.com/bfdes">
      <img className="badge" src="/images/github.png" alt="GitHub link" />
    </a>
    <a className="nav-item" href="/feed.rss">
      <img className="badge" src="/images/rss.png" alt="RSS link" />
    </a>
  </div>
);

const Sidebar: React.FC = () => (
  <aside id="sidebar">
    <Profile />
    <NavBar />
    <Social />
  </aside>
);

export default Sidebar;
