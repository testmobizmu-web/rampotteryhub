export type Role = "admin" | "accounting" | "sales" | "viewer";

export type Permissions = {
  canViewReports?: boolean;
  canEditInvoices?: boolean;
  canEditPayments?: boolean;
  canVoidInvoices?: boolean;
  canEditStock?: boolean;
  canManageUsers?: boolean;
};

export function normalizeRole(role: any): Role {
  const r = String(role || "").toLowerCase();
  if (r === "admin" || r === "accounting" || r === "sales" || r === "viewer") return r;
  return "viewer";
}

export function isAdmin(user: any) {
  return normalizeRole(user?.role) === "admin";
}

export function hasPerm(user: any, key: keyof Permissions) {
  if (!user) return false;
  if (isAdmin(user)) return true;
  return Boolean(user?.permissions?.[key]);
}

/** Default permission presets (used by UI “Apply preset”) */
export const ROLE_PRESETS: Record<Role, Permissions> = {
  admin: {
    canViewReports: true,
    canEditInvoices: true,
    canEditPayments: true,
    canVoidInvoices: true,
    canEditStock: true,
    canManageUsers: true,
  },
  accounting: {
    canViewReports: true,
    canEditInvoices: true,
    canEditPayments: true,
    canVoidInvoices: true,
    canEditStock: false,
    canManageUsers: false,
  },
  sales: {
    canViewReports: false,
    canEditInvoices: true,
    canEditPayments: false,
    canVoidInvoices: false,
    canEditStock: false,
    canManageUsers: false,
  },
  viewer: {
    canViewReports: true,
    canEditInvoices: false,
    canEditPayments: false,
    canVoidInvoices: false,
    canEditStock: false,
    canManageUsers: false,
  },
};
