import React from 'react';
import logo from './logo.svg';
import './App.css';
// import {GetUsersResType, GetCommentsResType, PostCommentsResType} from '../types'

fetch('/api/users?time=' + new Date()).then(response => response.json()).then((res) => {
  console.log(res)
})
fetch('/api/posts/4/comments?time='+ +new Date(), {
  method: "POST",
}).then(response => response.json()).then((res) => {
  console.log(res)
})
fetch('/api/posts/4/comments?time='+ +new Date()).then(response => response.json()).then((res) => {
  console.log(res)
})
fetch('/api/photos/8?time='+ +new Date()).then(response => response.json()).then((res) => {
  console.log(res)
})

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
