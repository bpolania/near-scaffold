interface ContractFunction {
  name: string;
  kind: string;
  result?: {
    serialization_type: string;
    type_schema: {
      type: string;
    };
  };
  params?: {
    serialization_type: string;
    args: {
      name: string;
      type_schema: {
        type: string;
      };
    }[];
  };
}

interface NearAbi {
  schema_version: string;
  metadata: {
    name: string;
    version: string;
  };
  body: {
    functions: ContractFunction[];
    root_schema: {
      $schema: string;
      title: string;
      type: string;
    };
  };
}

interface AccountFormProps {
  abi: NearAbi | null;
}

const AccountForm = ({ abi }: AccountFormProps) => {
  return (
    <div className="max-w-lg mx-auto bg-white shadow-md rounded-lg p-8">
      <h1 className="text-2xl font-bold mb-6 text-orange-600">NEAR Contract Frontend Generator</h1>
      <h2 className="text-xl font-bold mb-4 text-gray-800">Generated Frontend</h2>
      {abi ? (
        <div>
          <h3 className="text-lg font-bold mb-2 text-gray-800">Contract Metadata</h3>
          <p className="mb-2 text-gray-700">
            <span className="font-bold">Name:</span> {abi.metadata.name}
          </p>
          <p className="mb-4 text-gray-700">
            <span className="font-bold">Version:</span> {abi.metadata.version}
          </p>
          <h3 className="text-lg font-bold mb-2 text-gray-800">Functions</h3>
          {abi.body.functions.map((func, index) => (
            <div key={index} className="mb-6">
              <h4 className="text-xl font-bold mb-2 text-gray-800">{func.name}</h4>
              <p className="mb-2 text-gray-700">
                <span className="font-bold">Kind:</span> {func.kind}
              </p>
              {func.params && (
                <div className="mb-4">
                  <h5 className="text-lg font-bold mb-2 text-gray-800">Parameters</h5>
                  {func.params.args.map((arg, argIndex) => (
                    <div key={argIndex} className="mb-2">
                      <label
                        htmlFor={`${func.name}-${arg.name}`}
                        className="block font-bold mb-1 text-gray-700"
                      >
                        {arg.name}:
                      </label>
                      <input
                        type="text"
                        id={`${func.name}-${arg.name}`}
                        placeholder={arg.type_schema.type}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  ))}
                  <button className="px-4 py-2 font-bold text-white bg-orange-600 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500">
                    Call {func.name}
                  </button>
                </div>
              )}
              {func.result && (
                <div>
                  <h5 className="text-lg font-bold mb-2 text-gray-800">Result</h5>
                  <p className="mb-2 text-gray-700">
                    <span className="font-bold">Serialization Type:</span>{' '}
                    {func.result.serialization_type}
                  </p>
                  <p className="mb-4 text-gray-700">
                    <span className="font-bold">Type Schema:</span>{' '}
                    {func.result.type_schema.type}
                  </p>
                  {!func.params && (
                    <button className="px-4 py-2 font-bold text-white bg-orange-600 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500">
                      Call {func.name}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">Loading ABI...</p>
      )}
    </div>
  );
};

export default AccountForm;