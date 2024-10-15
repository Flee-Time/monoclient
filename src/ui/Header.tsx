import "./styles/Header.scss"

function Header() {
  return (
    <header>
      <span>Monolink</span>
      <button
        id="minimize"
        onClick={() => window.electron.sendFrameAction("MINIMIZE")}
      >
      </button>
      <button
        id="maximize"
        onClick={() => window.electron.sendFrameAction("MAXIMIXE")}
      >
      </button>
      <button
        id="close"
        onClick={() => window.electron.sendFrameAction("CLOSE")}
      >
      </button>
    </header>
  );
};

export default Header;
