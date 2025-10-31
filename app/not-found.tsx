// aifa-v2/app/not-found.tsx

import Link from "next/link";

export default function NotFound() {
  
  return (
    <div>
      <h2>Not Found</h2>
      <p>Could not find requested resource</p>
      <p>
        View <Link href="/">all content</Link>
      </p>
    </div>
  );
}
