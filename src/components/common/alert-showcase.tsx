"use client";

import { useState } from "react";
import { Alert, ErrorAlert, SuccessAlert, WarningAlert, InfoAlert } from "@/components/common/alert";

export function AlertShowcase() {
  const [dismissedAlerts, setDismissedAlerts] = useState<{ [key: string]: boolean }>({});

  const toggleAlert = (key: string) => {
    setDismissedAlerts((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="space-y-8 p-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-black dark:text-white">Alert System Showcase</h1>
        <p className="text-gray-600 dark:text-gray-400">Semua varian alert dengan berbagai konfigurasi</p>
      </div>

      {/* Error Alerts */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Error Alerts</h2>

        {!dismissedAlerts["error1"] && (
          <ErrorAlert
            title="Validation Error"
            message="Please fill in all required fields before submitting."
            onClose={() => toggleAlert("error1")}
            dismissible={true}
          />
        )}

        {!dismissedAlerts["error2"] && (
          <ErrorAlert
            title="Operation Failed"
            message="Failed to create time block. Please check your input and try again."
            onClose={() => toggleAlert("error2")}
            dismissible={true}
          />
        )}

        {!dismissedAlerts["error3"] && (
          <ErrorAlert
            title="Connection Error"
            message="Unable to connect to the server. Please check your internet connection."
            onClose={() => toggleAlert("error3")}
            dismissible={true}
          />
        )}

        <button
          onClick={() => setDismissedAlerts({ error1: false, error2: false, error3: false })}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Show All Error Alerts
        </button>
      </div>

      {/* Success Alerts */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">Success Alerts</h2>

        {!dismissedAlerts["success1"] && (
          <SuccessAlert
            title="Created Successfully"
            message="✅ Time block 'Morning Meeting' has been created for today at 9:00 AM."
            onClose={() => toggleAlert("success1")}
            dismissible={true}
            autoClose={true}
            autoCloseDelay={5000}
          />
        )}

        {!dismissedAlerts["success2"] && (
          <SuccessAlert
            title="Updated Successfully"
            message="✅ Your task has been updated and synced with time blocks."
            onClose={() => toggleAlert("success2")}
            dismissible={true}
            autoClose={true}
            autoCloseDelay={5000}
          />
        )}

        {!dismissedAlerts["success3"] && (
          <SuccessAlert
            title="Deleted Successfully"
            message="✅ Time block has been removed from your schedule."
            onClose={() => toggleAlert("success3")}
            dismissible={true}
            autoClose={true}
            autoCloseDelay={5000}
          />
        )}

        <button
          onClick={() => setDismissedAlerts({ success1: false, success2: false, success3: false })}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Show All Success Alerts
        </button>
      </div>

      {/* Warning Alerts */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">Warning Alerts</h2>

        {!dismissedAlerts["warning1"] && (
          <WarningAlert
            title="Unsaved Changes"
            message="You have unsaved changes. Do you want to leave without saving?"
            onClose={() => toggleAlert("warning1")}
            dismissible={true}
          />
        )}

        {!dismissedAlerts["warning2"] && (
          <WarningAlert
            title="Dangerous Action"
            message="Deleting this task cannot be undone. This will also remove all associated time blocks."
            onClose={() => toggleAlert("warning2")}
            dismissible={true}
          />
        )}

        {!dismissedAlerts["warning3"] && (
          <WarningAlert
            title="Time Conflict"
            message="This time block overlaps with another scheduled block. Please adjust the time."
            onClose={() => toggleAlert("warning3")}
            dismissible={true}
          />
        )}

        <button
          onClick={() => setDismissedAlerts({ warning1: false, warning2: false, warning3: false })}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
        >
          Show All Warning Alerts
        </button>
      </div>

      {/* Info Alerts */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Info Alerts</h2>

        {!dismissedAlerts["info1"] && (
          <InfoAlert
            title="Tip"
            message="💡 You can link time blocks directly to your tasks from the Eisenhower Matrix."
            onClose={() => toggleAlert("info1")}
            dismissible={true}
          />
        )}

        {!dismissedAlerts["info2"] && (
          <InfoAlert
            title="New Feature"
            message="🎉 Time blocking now supports syncing with your daily goals. Try it out!"
            onClose={() => toggleAlert("info2")}
            dismissible={true}
          />
        )}

        {!dismissedAlerts["info3"] && (
          <InfoAlert
            title="Status Update"
            message="📊 Your productivity score has been updated. Check your analytics dashboard."
            onClose={() => toggleAlert("info3")}
            dismissible={true}
          />
        )}

        <button
          onClick={() => setDismissedAlerts({ info1: false, info2: false, info3: false })}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Show All Info Alerts
        </button>
      </div>

      {/* Non-Dismissible Alerts */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-black dark:text-white">Non-Dismissible Alerts</h2>

        <ErrorAlert
          title="Critical Error"
          message="A critical error has occurred. Please contact support."
          dismissible={false}
        />

        <WarningAlert
          title="Maintenance"
          message="System maintenance scheduled for tomorrow at 2:00 AM."
          dismissible={false}
        />
      </div>

      {/* With Custom Content */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-black dark:text-white">With Custom Content</h2>

        {!dismissedAlerts["custom1"] && (
          <ErrorAlert
            title="Multiple Issues"
            message={
              <div className="space-y-2">
                <p>The following issues were found:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Invalid time format</li>
                  <li>Task title is empty</li>
                  <li>Duplicate time block detected</li>
                </ul>
              </div>
            }
            onClose={() => toggleAlert("custom1")}
            dismissible={true}
          />
        )}

        <button
          onClick={() => setDismissedAlerts({ custom1: false })}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Show Custom Content Alert
        </button>
      </div>
    </div>
  );
}
