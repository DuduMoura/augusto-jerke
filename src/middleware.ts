export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/game/:path*", "/ranking/:path*", "/history/:path*"],
};
