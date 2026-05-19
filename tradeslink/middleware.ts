export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/bookings/:path*",
    "/messages/:path*",
    "/profile/:path*",
    "/my-jobs/:path*",
    "/find-jobs/:path*",
    "/post-job/:path*",
  ],
};
