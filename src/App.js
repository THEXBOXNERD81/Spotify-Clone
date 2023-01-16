import 'bootstrap/dist/css/bootstrap.min.css';
import Dashbord from './Dashbord';
import Login from './Login';

const code = new URLSearchParams(window.location.search).get('code')

function App() {
  return (
    code ? <Dashbord code={code}/> : <Login />
  );
}

export default App;
