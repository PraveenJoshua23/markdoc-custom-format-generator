import './App.css'
import DocFooterGenerator from './components/DocFooter';
import RequestResponseGenerator from './components/RequestResponse';
import ButtonListGenerator from './components/ButtonList';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <DocFooterGenerator />
      <RequestResponseGenerator />
      <ButtonListGenerator />
    </div>
  )
}

export default App
