import Link from "next/link";

export function Logo() {
  return (
    <Link className="logo" href="/" aria-label="CrowdPulse home">
      <span className="logo-mark" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span>CROWD<span>PULSE</span></span>
    </Link>
  );
}
