import Link from "next/link";

export default function NotFound() {
  return <main className="not-found"><span>404</span><h1>That moment left the stadium.</h1><p>It may not exist, or the creator has not approved it yet.</p><Link className="button button-primary" href="/dashboard">Back to dashboard</Link></main>;
}
