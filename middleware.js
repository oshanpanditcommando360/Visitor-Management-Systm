import { createMiddleware } from "@arcjet/next";
import aj from "@/lib/arcjet";

// Apply Arcjet middleware to all incoming requests
export default createMiddleware(aj);

