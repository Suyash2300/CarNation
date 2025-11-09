import { useState } from "react";
import Select, { type CSSObjectWithLabel } from "react-select";
import { useGetAdminUsersQuery } from "../../services/carApi";
import { Users, Shield, ShieldOff, Mail, Phone } from "lucide-react";

const UserManagement = () => {
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [verifiedFilter, setVerifiedFilter] = useState<string>("");

  const { data, isLoading } = useGetAdminUsersQuery({
    role: roleFilter || undefined,
    verified: verifiedFilter || undefined,
  });

  const users = data?.users || [];

  const roleOptions = [
    { value: "", label: "All Roles" },
    { value: "ADMIN", label: "Admin" },
    { value: "SELLER", label: "Seller" },
    { value: "BUYER", label: "Buyer" },
  ];

  const verifiedOptions = [
    { value: "", label: "All Verification Status" },
    { value: "true", label: "Verified" },
    { value: "false", label: "Not Verified" },
  ];

  const selectMenuPortal =
    typeof window !== "undefined" ? window.document.body : undefined;

  const selectStyles = {
    menuPortal: (base: CSSObjectWithLabel) => ({
      ...base,
      zIndex: 40,
    }),
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading users...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-dark-900">User Management</h2>
        <p className="text-dark-600 mt-1">View and manage all users</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <div className="w-full">
          <Select
            options={roleOptions}
            value={roleOptions.find((opt) => opt.value === roleFilter)}
            onChange={(selected) => setRoleFilter(selected?.value || "")}
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="Filter by role"
            menuPortalTarget={selectMenuPortal}
            styles={selectStyles}
          />
        </div>
        <div className="w-full">
          <Select
            options={verifiedOptions}
            value={verifiedOptions.find((opt) => opt.value === verifiedFilter)}
            onChange={(selected) => setVerifiedFilter(selected?.value || "")}
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="Filter by verification"
            menuPortalTarget={selectMenuPortal}
            styles={selectStyles}
          />
        </div>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-dark-300 mx-auto mb-4" />
          <p className="text-dark-600">No users found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="glass rounded-xl p-6 hover:shadow-xl transition"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-dark-900">
                      {user.name}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === "ADMIN"
                          ? "bg-primary-100 text-primary-700"
                          : user.role === "SELLER"
                          ? "bg-secondary-100 text-secondary-700"
                          : "bg-accent-100 text-accent-700"
                      }`}
                    >
                      {user.role}
                    </span>
                    {user.isAadhaarVerified ? (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-success-100 text-success-700">
                        <Shield className="w-3 h-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-warning-100 text-warning-700">
                        <ShieldOff className="w-3 h-3" />
                        Not Verified
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-dark-500" />
                      <div>
                        <p className="text-dark-600">Email</p>
                        <p className="font-semibold text-dark-900">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-dark-500" />
                      <div>
                        <p className="text-dark-600">Phone</p>
                        <p className="font-semibold text-dark-900">
                          {user.phone || "Not provided"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-dark-600">Joined</p>
                      <p className="font-semibold text-dark-900">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                      {user.aadhaarVerifiedAt && (
                        <p className="text-xs text-success-600 mt-1">
                          Verified:{" "}
                          {new Date(
                            user.aadhaarVerifiedAt
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserManagement;
