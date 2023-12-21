import { useEffect } from 'react'

import './App.css'

function App() {
  useEffect(() => {
    fetch('http://localhost:3000/pr').then((data) => {
      return data.json();
    }).then((data) => {
      console.log({data});
    })
  }, []);
  return (
    <>
      alo
    </>
  )
}

export default App
