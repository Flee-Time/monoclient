import { isRouteErrorResponse, useRouteError, useNavigate } from "react-router-dom";
import { Button } from 'react-bootstrap';
import '../styles/ErrorPage.scss';

function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();
  let errorMessage: string;

  if (isRouteErrorResponse(error)) {
    errorMessage = error.data.message || error.statusText;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    console.error(error);
    errorMessage = 'Unknown error';
  }

  const handleReload = () => {
    navigate('/');
  };

  return (
    <div id="error-page" className="error-page-container">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p id="error-text">
        <i>{errorMessage}</i>
      </p>
      <Button variant="primary" onClick={handleReload} className="mt-3">
        Reload App
      </Button>
    </div>
  );
}

export default ErrorPage;