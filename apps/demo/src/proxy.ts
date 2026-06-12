import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // For /docs/* paths that look like page routes (no file extension),
  // rewrite to the index.html that Docusaurus built inside public/docs/.
  const lastSegment = pathname.split("/").pop() ?? "";
  const hasExtension = lastSegment.includes(".");

  if (!hasExtension) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/\/?$/, "/") + "index.html";
    return NextResponse.rewrite(url);
  }
}

export const config = {
  matcher: "/docs/:path*",
};
