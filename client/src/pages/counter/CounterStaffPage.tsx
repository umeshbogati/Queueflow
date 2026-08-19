import { Link } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";

const CounterStaffPage = () => {
  const counterNumber = useAppSelector(
    (state) => state.counter.currentCounterNumber
  );
  const { queues } = useAppSelector((state) => state.queue);

  const waitingCount = queues.filter((q) => q.status === "waiting").length;

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
