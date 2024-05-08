import React from 'react';
import './ContractFunctions.css';

interface Function {
  name: string;
  params: string[];
  isRead: boolean;
  isWrite: boolean;
}

interface ContractFunctionsProps {
  functions: Function[];
}

const ContractFunctions: React.FC<ContractFunctionsProps> = ({ functions }) => {
  return (
    <form id="contractFunctionsForm">
      <h2>Contract Functions</h2>
      {functions.map((func) => (
        <div key={func.name} className="form-group">
          <label htmlFor={func.name}>{func.name}</label>
          {func.params && func.params.length > 0 && (
            <>
              {func.params.map((arg) => (
                <input key={arg} type="text" id={arg} name={arg} placeholder={arg} />
              ))}
            </>
          )}
          <button type="submit" className={func.isRead ? 'read-only' : 'write'}>
            {func.isRead ? 'Read' : 'Write'}
          </button>
        </div>
      ))}
    </form>
  );
};

export default ContractFunctions;