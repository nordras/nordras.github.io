---
title: 'React Hello World - Getting Started'
description: 'A simple introduction to React with the classic Hello World example.'
pubDate: 'Oct 16 2025'
updatedDate: 'Oct 16 2025'
tags: ['react', 'javascript', 'tutorial', 'beginner']
language: 'en'
---

# React Hello World - Getting Started

Welcome to the world of React! In this tutorial, we'll create our first React component with a classic example: **Hello World**.

## What is React?

React is a JavaScript library for building user interfaces, developed by Facebook. It allows you to create reusable components and manage application state efficiently.

## Creating Your First Component

Let's start with the simplest possible React component:

```jsx
function HelloWorld() {
  return <h1>Hello, World!</h1>;
}
```

This is a **functional component** that returns a simple JSX element. JSX is a syntax extension that allows you to write HTML-like code inside JavaScript.

## Setting Up the Environment

To get started with React, you can use Create React App:

```bash
npx create-react-app my-first-app
cd my-first-app
npm start
```

This will create a new React application and start the development server.

## Understanding JSX

JSX looks like HTML, but it's actually JavaScript. Here are some key differences:

### 1. className instead of class

```jsx
// ❌ HTML
<div class="container">Content</div>

// ✅ JSX
<div className="container">Content</div>
```

### 2. Self-closing tags

```jsx
// ❌ HTML
<img src="image.jpg">
<br>

// ✅ JSX
<img src="image.jpg" />
<br />
```

### 3. JavaScript expressions in curly braces

```jsx
function Greeting() {
  const name = "React";
  return <h1>Hello, {name}!</h1>;
}
```

## Adding Interactivity

Let's make our component interactive by adding state:

```jsx
import { useState } from 'react';

function InteractiveHello() {
  const [name, setName] = useState('World');

  return (
    <div>
      <h1>Hello, {name}!</h1>
      <input 
        type="text" 
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
      />
    </div>
  );
}
```

This component uses the `useState` hook to manage the name state. When the user types in the input field, the heading updates in real-time.

## Props: Passing Data to Components

Components can receive data through props:

```jsx
function Greeting({ name, age }) {
  return (
    <div>
      <h1>Hello, {name}!</h1>
      <p>You are {age} years old.</p>
    </div>
  );
}

// Usage
function App() {
  return (
    <div>
      <Greeting name="Alice" age={25} />
      <Greeting name="Bob" age={30} />
    </div>
  );
}
```

## Event Handling

React makes event handling simple and declarative:

```jsx
function Button() {
  const handleClick = () => {
    alert('Button clicked!');
  };

  const handleMouseOver = () => {
    console.log('Mouse over button');
  };

  return (
    <button 
      onClick={handleClick}
      onMouseOver={handleMouseOver}
    >
      Click me!
    </button>
  );
}
```

## Complete Example

Here's a complete example that puts everything together:

```jsx
import React, { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Hello, React World!</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <label>
          What's your name? 
          <input 
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px' }}
          />
        </label>
        {name && <p>Nice to meet you, {name}!</p>}
      </div>

      <div>
        <h2>Counter: {count}</h2>
        <button 
          onClick={() => setCount(count + 1)}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Increment
        </button>
        <button 
          onClick={() => setCount(count - 1)}
          style={{ 
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Decrement
        </button>
        <button 
          onClick={() => setCount(0)}
          style={{ 
            padding: '10px 20px',
            marginLeft: '10px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export default App;
```

## Key Concepts Learned

1. **Components**: Building blocks of React applications
2. **JSX**: Syntax extension for writing HTML-like code in JavaScript
3. **Props**: Way to pass data to components
4. **State**: Local component data that can change over time
5. **Event Handling**: Responding to user interactions
6. **Hooks**: Functions that let you use state and other React features

## Next Steps

Now that you've created your first React component, you can explore:

- **Component Lifecycle**: Understanding how components mount, update, and unmount
- **State Management**: Using Context API or libraries like Redux
- **Routing**: Adding navigation with React Router
- **Styling**: CSS modules, styled-components, or CSS-in-JS solutions
- **Testing**: Writing tests with Jest and React Testing Library

## Best Practices

1. **Keep components small and focused**
2. **Use descriptive names for components and props**
3. **Extract reusable logic into custom hooks**
4. **Follow the single responsibility principle**
5. **Use TypeScript for better type safety**

React's component-based architecture makes it easy to build complex user interfaces by composing simple, reusable components. Keep practicing and building projects to master these concepts!

---

*This tutorial covers the basics of React development. Continue exploring the React ecosystem to build amazing applications!*