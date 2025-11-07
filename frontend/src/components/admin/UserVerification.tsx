import { useState } from "react";
import {
  useGetPendingVerificationsQuery,
  useVerifyAadhaarMutation,
  type User,
} from "../../services/carApi";
import { Shield, CheckCircle, XCircle, Eye } from "lucide-react";
import { useToast } from "../common/ToastContainer";
import { useConfirm } from "../common/ConfirmProvider";
import { getApiErrorMessage } from "../../utils/error";

const UserVerification = () => {
  const { data, isLoading, refetch } = useGetPendingVerificationsQuery();
  const [verifyAadhaar, { isLoading: isVerifying }] =
    useVerifyAadhaarMutation();
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const { showSuccess, showError } = useToast();
  const confirm = useConfirm();

  const users = data?.users || [];

  const handleVerify = async (userId: string) => {
    const confirmed = await confirm({
      title: "Verify Aadhaar",
      message: "Are you sure you want to verify this user's Aadhaar?",
      confirmLabel: "Verify",
      cancelLabel: "Cancel",
      variant: "warning",
    });

    if (!confirmed) {
      return false;
    }

    try {
      await verifyAadhaar(userId).unwrap();
      showSuccess("User verified successfully");
      await refetch();
      if (viewingUser?.id === userId) {
        setViewingUser(null);
      }
      return true;
    } catch (error) {
      console.error("Failed to verify Aadhaar:", error);
      const message = getApiErrorMessage(error, "Failed to verify Aadhaar");
      showError(message);
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">Loading pending verifications...</div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-dark-900">
          Aadhaar Verification
        </h2>
        <p className="text-dark-600 mt-1">
          Review and verify user Aadhaar documents
        </p>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-success-600 mx-auto mb-4" />
          <p className="text-dark-600">No pending verifications</p>
          <p className="text-sm text-dark-500 mt-2">All users are verified!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="glass rounded-xl p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-dark-900 mb-2">
                    {user.name}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-dark-600">Email</p>
                      <p className="font-semibold text-dark-900">
                        {user.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-dark-600">Phone</p>
                      <p className="font-semibold text-dark-900">
                        {user.phone || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-dark-600">Aadhaar Number</p>
                      <p className="font-semibold text-dark-900">
                        {user.aadhaarNumber
                          ? `****${user.aadhaarNumber.slice(-4)}`
                          : "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-dark-600">Submitted</p>
                      <p className="font-semibold text-dark-900">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {(user.aadhaarFrontImage || user.aadhaarBackImage) && (
                    <button
                      onClick={() => setViewingUser(user)}
                      className="flex items-center justify-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-lg font-semibold hover:bg-primary-200 transition"
                    >
                      <Eye className="w-4 h-4" />
                      View Documents
                    </button>
                  )}
                  <button
                    onClick={() => {
                      void handleVerify(user.id);
                    }}
                    disabled={isVerifying}
                    className="flex items-center justify-center gap-2 bg-success-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-success-700 transition disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Verify Aadhaar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Documents Modal */}
      {viewingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-dark-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-dark-900">
                Aadhaar Documents - {viewingUser.name}
              </h2>
              <button
                onClick={() => setViewingUser(null)}
                className="text-dark-500 hover:text-dark-900 transition"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {viewingUser.aadhaarFrontImage && (
                <div>
                  <h3 className="font-semibold text-dark-900 mb-2">
                    Front Side
                  </h3>
                  <img
                    src={viewingUser.aadhaarFrontImage}
                    alt="Aadhaar Front"
                    className="w-full rounded-lg border border-dark-200"
                  />
                </div>
              )}
              {viewingUser.aadhaarBackImage && (
                <div>
                  <h3 className="font-semibold text-dark-900 mb-2">
                    Back Side
                  </h3>
                  <img
                    src={viewingUser.aadhaarBackImage}
                    alt="Aadhaar Back"
                    className="w-full rounded-lg border border-dark-200"
                  />
                </div>
              )}
            </div>
            <div className="p-6 border-t border-dark-200 flex justify-end gap-3">
              <button
                onClick={() => setViewingUser(null)}
                className="px-6 py-2 rounded-lg border border-dark-300 text-dark-700 font-semibold hover:bg-dark-50 transition"
              >
                Close
              </button>
              <button
                onClick={async () => {
                  const success = await handleVerify(viewingUser.id);
                  if (success) {
                    setViewingUser(null);
                  }
                }}
                className="px-6 py-2 bg-success-600 text-white rounded-lg font-semibold hover:bg-success-700 transition"
              >
                Verify Aadhaar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserVerification;
