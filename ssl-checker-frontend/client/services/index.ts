// Export all services for easy importing
export * from "./authService";
export * from "./userService";
export * from "./roleService";
export * from "./sslService";
export * from "./alertService";
export * from "./adminService";

// Re-export commonly used services as default exports
export { authService as auth } from "./authService";
export { userService as user } from "./userService";
export { roleService as role } from "./roleService";
export { sslService as ssl } from "./sslService";
export { alertService as alert } from "./alertService";
export { adminService as admin } from "./adminService";
