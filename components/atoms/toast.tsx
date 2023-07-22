type ErrorMessageProps = {
  message: string;
  onClose: () => void;
};

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onClose }) => (
  <div className="fixed right-5 bottom-5 bg-red-500 text-white p-4 rounded">
    {message}
    <button
      onClick={onClose}
      className="ml-4 bg-transparent border-none text-white"
    >
      Close
    </button>
  </div>
);

type SuccessMessageProps = {
  message: string;
  onClose: () => void;
};

const SuccessMessage: React.FC<SuccessMessageProps> = ({
  message,
  onClose,
}) => (
  <div className="fixed right-5 bottom-5 bg-green-500 text-white p-4 rounded">
    {message}
    <button
      onClick={onClose}
      className="ml-4 bg-transparent border-none text-white"
    >
      Close
    </button>
  </div>
);

export { ErrorMessage, SuccessMessage };