import NextLink from "next/link";
import { useEffect, useMemo, useState } from "react";
import React from "react";

type To = string;

type LinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  to: To;
  replace?: boolean;
};

type RouteProps = {
  path: string;
  element: React.ReactNode;
};

const normalizePath = (path: string) => {
  const pathname = path.split("?")[0]?.split("#")[0] || "/";
  if (pathname.length > 1) {
    return pathname.replace(/\/+$/, "");
  }
  return pathname;
};

const getBrowserPath = () => {
  if (typeof window === "undefined") {
    return "/";
  }
  return normalizePath(window.location.pathname);
};

const routeListeners = new Set<(pathname: string) => void>();

const notifyRouteChange = () => {
  const pathname = getBrowserPath();
  routeListeners.forEach((listener) => listener(pathname));
  window.dispatchEvent(new PopStateEvent("popstate"));
};

const navigateTo = (to: To, replace = false) => {
  if (typeof window === "undefined") {
    return;
  }

  if (replace) {
    window.history.replaceState({}, "", to);
  } else {
    window.history.pushState({}, "", to);
  }
  notifyRouteChange();
};

export function BrowserRouter({ children }: { basename?: string; children: React.ReactNode }) {
  return <>{children}</>;
}

export function Link({ to, replace, onClick, children, ...props }: LinkProps) {
  return (
    <NextLink
      href={to}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (
          event.defaultPrevented ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0 ||
          props.target
        ) {
          return;
        }

        event.preventDefault();
        navigateTo(to, replace);
      }}
    >
      {children}
    </NextLink>
  );
}

export function Navigate({ to, replace }: { to: To; replace?: boolean }) {
  useEffect(() => {
    navigateTo(to, replace);
  }, [replace, to]);

  return null;
}

export function Route(_props: RouteProps) {
  return null;
}

const matchRoute = (pattern: string, pathname: string) => {
  if (pattern === "*") {
    return true;
  }

  const normalizedPattern = normalizePath(pattern);
  const normalizedPathname = normalizePath(pathname);
  const patternParts = normalizedPattern.split("/").filter(Boolean);
  const pathnameParts = normalizedPathname.split("/").filter(Boolean);

  if (patternParts.length !== pathnameParts.length) {
    return false;
  }

  return patternParts.every((part, index) => part.startsWith(":") || part === pathnameParts[index]);
};

export function Routes({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const routes = React.Children.toArray(children) as React.ReactElement<RouteProps>[];
  const route = routes.find((child) => matchRoute(child.props.path, pathname));

  return <>{route?.props.element ?? null}</>;
}

export function useNavigate() {
  return (to: To, options?: { replace?: boolean }) => navigateTo(to, options?.replace);
}

export function useLocation() {
  const [pathname, setPathname] = useState(getBrowserPath);

  useEffect(() => {
    const updatePathname = (nextPathname?: string | PopStateEvent) => {
      setPathname(typeof nextPathname === "string" ? nextPathname : getBrowserPath());
    };
    routeListeners.add(updatePathname);
    window.addEventListener("popstate", updatePathname);
    updatePathname();
    return () => {
      routeListeners.delete(updatePathname);
      window.removeEventListener("popstate", updatePathname);
    };
  }, []);

  return useMemo(() => ({ pathname }), [pathname]);
}

export function useParams() {
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter(Boolean);

  if (parts[0] === "archive" && parts.length === 2) {
    return { id: parts[1] };
  }

  return {};
}
