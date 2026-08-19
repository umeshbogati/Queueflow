import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { callNext, changeQueueStatus } from "../../store/slices/queueSlice";

const CallNextPage = () => {
  const dispatch = useAppDispatch();

  const { currentQueue, saving, error } = useAppSelector(
    (state) => state.queue
  );
  const counterNumber = useAppSelector(
    (state) => state.counter.currentCounterNumber
  );

  const handleCallNext = () => {
    dispatch(callNext(counterNumber));
  };

  const updateStatus = (status: "serving" | "completed" | "cancelled") => {
    if (!currentQueue) return;
    dispatch(
      changeQueueStatus({
        id: currentQueue._id,
        status,
        counterNumber: currentQueue.counterNumber || counterNumber,
      })
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-xl">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Call Next
          </h1>

          <p className="mt-2 text-gray-600">
            Call the next customer in the queue.
          </p>
        </div>

        <div className="rounded-xl bg-white p-8 text-center shadow">

          <div className="mb-6">
            <label className="mb-2 block text-left text-sm font-medium text-gray-700">
              Your Counter Number
            </label>
            <p className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-2xl font-bold">
              {counterNumber}
            </p>
          </div>

          {currentQueue ? (
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                Now Serving
              </p>

              <h2 className="mt-3 text-6xl font-bold text-blue-600">
                {currentQueue.displayNumber}
              </h2>

              <p className="mt-4 text-gray-600">
                Status:{" "}
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                  currentQueue.status === "waiting" ? "bg-yellow-100 text-yellow-700"
                  : currentQueue.status === "serving" ? "bg-blue-100 text-blue-700"
                  : currentQueue.status === "called" ? "bg-purple-100 text-purple-700"
                  : currentQueue.status === "cancelled" ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
                }`}>
                  {currentQueue.status}
                </span>
              </p>

              {currentQueue.branch && (
                <p className="mt-2 text-sm text-gray-500">
                  Branch: <span className="font-medium text-gray-700">{currentQueue.branch.name}</span>
                </p>
              )}

              {currentQueue.department && (
                <p className="mt-1 text-sm text-gray-500">
                  Department: <span className="font-medium text-gray-700">{currentQueue.department.name}</span>
                </p>
              )}

              <p className="mt-1 text-sm text-gray-500">
                Counter: <span className="font-medium text-gray-700">{currentQueue.counterNumber ?? counterNumber}</span>
              </p>

              <div className="mt-6 flex flex-col gap-3">
                {currentQueue.status === "called" && (
                  <button
                    type="button"
                    onClick={() => updateStatus("serving")}
                    disabled={saving}
                    className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Start Serving
                  </button>
                )}

                {currentQueue.status === "serving" && (
                  <button
                    type="button"
                    onClick={() => updateStatus("completed")}
                    disabled={saving}
                    className="w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Complete
                  </button>
                )}

                {(currentQueue.status === "called" || currentQueue.status === "serving") && (
                  <button
                    type="button"
                    onClick={() => updateStatus("cancelled")}
                    disabled={saving}
                    className="w-full rounded-lg border border-red-300 px-4 py-3 font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>
                )}

                {(currentQueue.status === "completed" || currentQueue.status === "cancelled") && (
                  <p className="text-sm text-gray-500">
                    This queue has been {currentQueue.status}.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-500">
                No queue is currently being served.
              </p>
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleCallNext}
            disabled={saving}
            className="mt-8 w-full rounded-lg bg-gray-900 px-4 py-4 text-lg font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Calling..." : "Call Next Customer"}
          </button>

        </div>
      </div>
    </div>
  );
};

export default CallNextPage;
