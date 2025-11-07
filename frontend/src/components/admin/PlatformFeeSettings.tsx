import { useState } from "react";
import {
  useGetCurrentFeeQuery,
  useGetFeeHistoryQuery,
  useUpdateFeeMutation,
} from "../../services/platformFeesApi";
import { Settings, DollarSign, TrendingUp } from "lucide-react";
import { useToast } from "../common/ToastContainer";
import { useConfirm } from "../common/ConfirmProvider";

const PlatformFeeSettings = () => {
  const [newFeePercentage, setNewFeePercentage] = useState("");
  const { data: currentFeeData } = useGetCurrentFeeQuery();
  const { data: historyData } = useGetFeeHistoryQuery();
  const [updateFee, { isLoading }] = useUpdateFeeMutation();
  const { showSuccess, showError, showWarning } = useToast();
  const confirm = useConfirm();

  const currentFee = currentFeeData?.feePercentage || 5.0;
  const history = historyData?.fees || [];

  const handleUpdateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    const fee = parseFloat(newFeePercentage);

    if (isNaN(fee) || fee < 0 || fee > 100) {
      showWarning("Please enter a valid fee percentage between 0 and 100");
      return;
    }

    const confirmed = await confirm({
      title: "Update Platform Fee",
      message: `Are you sure you want to update the platform fee to ${fee}%?`,
      confirmLabel: "Update Fee",
      cancelLabel: "Cancel",
      variant: "warning",
    });

    if (!confirmed) {
      return;
    }

    try {
      await updateFee({ feePercentage: fee }).unwrap();
      showSuccess("Platform fee updated successfully!");
      setNewFeePercentage("");
    } catch (error) {
      const message =
        (error as { data?: { error?: string } })?.data?.error ||
        "Failed to update platform fee";
      showError(message);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-dark-900">
          Platform Fee Settings
        </h2>
        <p className="text-dark-600 mt-1">
          Configure the commission percentage charged on sales
        </p>
      </div>

      {/* Current Fee */}
      <div className="glass rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-primary-100 p-4 rounded-lg">
            <DollarSign className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-dark-900">
              Current Platform Fee
            </h3>
            <p className="text-3xl font-bold text-primary-600">{currentFee}%</p>
            <p className="text-sm text-dark-600 mt-1">
              This percentage is deducted from each successful sale
            </p>
          </div>
        </div>
      </div>

      {/* Update Fee Form */}
      <div className="glass rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-dark-900 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Update Platform Fee
        </h3>
        <form onSubmit={handleUpdateFee} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-900 mb-2">
              New Fee Percentage (%)
            </label>
            <input
              type="number"
              value={newFeePercentage}
              onChange={(e) => setNewFeePercentage(e.target.value)}
              placeholder={`Current: ${currentFee}%`}
              min="0"
              max="100"
              step="0.1"
              className="w-full px-4 py-2 border border-dark-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-dark-500 mt-1">
              Enter a value between 0 and 100
            </p>
          </div>
          <button
            type="submit"
            disabled={isLoading || !newFeePercentage}
            className="bg-gradient-primary hover:bg-gradient-primary-dark text-white px-6 py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Updating..." : "Update Fee"}
          </button>
        </form>
      </div>

      {/* Fee History */}
      {history.length > 0 && (
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-dark-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Fee History
          </h3>
          <div className="space-y-3">
            {history.map((fee) => (
              <div
                key={fee.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  fee.isActive
                    ? "bg-primary-50 border border-primary-200"
                    : "bg-dark-50"
                }`}
              >
                <div>
                  <p className="font-semibold text-dark-900">
                    {fee.feePercentage}%
                  </p>
                  <p className="text-sm text-dark-600">
                    {new Date(fee.createdAt).toLocaleDateString()} -{" "}
                    {fee.updatedAt !== fee.createdAt
                      ? `Updated: ${new Date(
                          fee.updatedAt
                        ).toLocaleDateString()}`
                      : "Created"}
                  </p>
                </div>
                {fee.isActive && (
                  <span className="px-3 py-1 bg-primary-600 text-white rounded-full text-xs font-semibold">
                    Active
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformFeeSettings;
