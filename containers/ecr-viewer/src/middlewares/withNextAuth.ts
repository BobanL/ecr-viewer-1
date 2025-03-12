// Adapted from 'next-auth' to work with chained middleware approadh

import { NextRequest } from "next/server";

import { ChainableMiddleware, MiddlewareFactory } from "@/middleware";

/**
 * Middleware for handling next authorization
 * @param next Next middleware in the chain
 * @returns a NextResponse
 */
export const withNextAuth: MiddlewareFactory = (next: ChainableMiddleware) => {
  return async function (request: NextRequest) {
    return next(request);
  };
};
