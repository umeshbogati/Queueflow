import { Card } from "../components/common";

const DashboardPage = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Welcome to your Queueflow dashboard.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-sm text-gray-500">
            Total Branches
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            0
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-500">
            Departments
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            0
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-500">
            Waiting
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            0
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-500">
            Serving
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            0
          </p>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;