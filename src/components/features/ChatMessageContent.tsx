"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Renders assistant text with markdown links and plain site paths as clickable links.
 * Supports: [label](/path), [label](https://...), and bare /products/... or /#book paths.
 */
export function ChatMessageContent({ content }: { content: string }) {
  const nodes = parseMessage(content);
  return <>{nodes}</>;
}

function parseMessage(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // Match markdown links first, then bare internal paths
  const pattern =
    /\[([^\]]+)\]\((\/[^\s)]+|https?:\/\/[^\s)]+)\)|(\/(?:products\/[a-z0-9-]+|portal(?:\/[a-z0-9-]*)?|#?[a-z0-9-]*)(?:\/[a-z0-9-]*)?)/gi;

  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index));
    }

    if (match[1] && match[2]) {
      const href = match[2];
      const label = match[1];
      nodes.push(
        <MessageLink key={`l-${key++}`} href={href}>
          {label}
        </MessageLink>
      );
    } else if (match[3]) {
      const href = match[3].startsWith("#") ? `/${match[3]}` : match[3];
      nodes.push(
        <MessageLink key={`p-${key++}`} href={href}>
          {match[3]}
        </MessageLink>
      );
    }

    last = match.index + match[0].length;
  }

  if (last < text.length) {
    nodes.push(text.slice(last));
  }

  return nodes.length > 0 ? nodes : [text];
}

function MessageLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const external = href.startsWith("http");
  const className =
    "font-medium text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent";

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
