const EmptyPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">

        <h1 className="text-4xl font-bold text-gray-700">
          No Data
        </h1>

        <p className="mt-3 text-gray-500">
          There is currently nothing to display.
        </p>

      </div>
    </div>
  );
};

export default EmptyPage;