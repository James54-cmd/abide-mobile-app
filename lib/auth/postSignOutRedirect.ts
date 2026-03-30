/** When set before `signOut`, `AuthBootstrap` navigates here instead of welcome `/`. */
let pendingHref: string | null = null;

export function setPostSignOutRedirect(href: string) {
  pendingHref = href;
}

export function consumePostSignOutRedirect(): string | null {
  const h = pendingHref;
  pendingHref = null;
  return h;
}
