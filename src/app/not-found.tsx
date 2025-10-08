import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ textAlign: "center", marginTop: "10vh" }}>
      <h1 style={{ fontSize: "4rem", marginBottom: "1rem" }}>404</h1>
      <h2>Oops! This page wandered off...</h2>
      <p>
        Looks like the page you're looking for took a coffee break or never existed.<br />
        But hey, at least you found this awesome error message!
      </p>
      <img
        src="https://media.giphy.com/media/14uQ3cOFteDaU/giphy.gif"
        alt="Confused Travolta"
        style={{ width: "300px", margin: "2rem auto", display: "block" }}
      />
      <Link href="/" style={{ color: "#0070f3", fontWeight: "bold", fontSize: "1.2rem" }}>
        🏠 Take me back home!
      </Link>
    </div>
  );
}
