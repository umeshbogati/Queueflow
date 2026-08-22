import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchQueues } from "../../store/slices/queueSlice";
import { setCounterNumber } from "../../store/slices/counterSlice";
import { useAdminSocket } from "../../socket/useSocket";

// CounterStaffPage: Staff page for managing customers waiting at their counter
const CounterStaffPage = () => {
  const dispatch = useAppDispatch();
  useAdminSocket();

  useEffect(() => {
    dispatch(fetchQueues());
  }, [dispatch]);
  const counterNumber = useAppSelector(
    (state) => state.counter.currentCounterNumber
  );
  const { queues } = useAppSelector((state) => state.queue);

  const waitingCount = queues.filter((q) => q.status === "waiting").length;

  const [counterInput, setCounterInput] = useState(String(counterNumber));
  const [savedMessage, setSavedMessage] = useState("");

  const handleSaveCounter = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = Number(counterInput);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 999) return;

    dispatch(setCounterNumber(parsed));
    setSavedMessage(`You are now working at Counter ${parsed}.`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="mx-auto max-w-6xl">

        <h1 className="text-3xl font-bold">
          Counter / Staff
        </h1>

        <p className="mt-2 text-gray-600">
          Manage customers waiting at your counter.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-3">

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Current Counter
            </p>

            <h2 className="mt-2 text-4xl font-bold">
              Counter {counterNumber}
            </h2>

            <form onSubmit={handleSaveCounter} className="mt-5 space-y-3">
              <label
                htmlFor="counter-number"
                className="block text-sm font-medium text-gray-700"
              >
                Change your counter number
              </label>
              <input
                id="counter-number"
                type="number"
                min={1}
                max={999}
                value={counterInput}
                onChange={(e) => {
                  setCounterInput(e.target.value);
                  setSavedMessage("");
                }}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
              <button
                type="submit"
                disabled={
                  Number(counterInput) === counterNumber ||
                  !counterInput ||
                  Number(counterInput) < 1 ||
                  Number(counterInput) > 999
                }
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save Counter
              </button>
              {savedMessage && (
                <p className="text-sm font-medium text-green-600">{savedMessage}</p>
              )}
            </form>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Waiting Customers
            </p>

            <h2 className="mt-2 text-4xl font-bold">
              {waitingCount}
            </h2>
          </div>

          <Link
            to="/call-next"
            className="rounded-xl bg-blue-600 p-6 text-white shadow hover:bg-blue-700"
          >
            <p className="text-sm">
              Queue Control
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Call Next →
            </h2>
          </Link>

        </div>
      </div>
    </div>
  );
};

export default CounterStaffPage;
